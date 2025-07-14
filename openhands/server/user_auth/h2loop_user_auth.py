from dataclasses import dataclass
from typing import Optional
import httpx
from fastapi import Request, HTTPException, status
from pydantic import SecretStr

from openhands.integrations.provider import PROVIDER_TOKEN_TYPE
from openhands.server import shared
from openhands.server.settings import Settings
from openhands.server.user_auth.user_auth import UserAuth, AuthType
from openhands.storage.data_models.user_secrets import UserSecrets
from openhands.storage.secrets.secrets_store import SecretsStore
from openhands.storage.settings.settings_store import SettingsStore


@dataclass
class H2LoopUserAuth(UserAuth):
    """Custom user authentication that integrates with external auth API"""

    _settings: Settings | None = None
    _settings_store: SettingsStore | None = None
    _secrets_store: SecretsStore | None = None
    _user_secrets: UserSecrets | None = None
    _user_id: Optional[str] = None
    _user_email: Optional[str] = None
    _access_token: Optional[SecretStr] = None

    async def _extract_token_from_request(self, request: Request) -> Optional[str]:
        """Extract access token from Authorization header"""
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]  # Remove "Bearer " prefix
        return None

    async def _get_user_info_from_auth_api(self, token: str) -> dict:
        """Get user info from your authentication API"""
        auth_api_url = "https://coreapi.h2loop.ai/api/v1/auth/me"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                auth_api_url,
                headers={"Authorization": f"Bearer {token}"}
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid access token"
                )

    async def get_user_id(self) -> str | None:
        """Get user ID from the validated token"""
        if self._user_id is None and self._access_token:
            try:
                user_data = await self._get_user_info_from_auth_api(
                    self._access_token.get_secret_value()
                )
                self._user_id = str(user_data.get("id"))
                self._user_email = user_data.get("email")
            except Exception:
                return None
        return self._user_id

    async def get_user_email(self) -> str | None:
        """Get user email from the validated token"""
        if self._user_email is None and self._access_token:
            await self.get_user_id()
        return self._user_email

    async def get_access_token(self) -> SecretStr | None:
        """Get the access token from the request"""
        return self._access_token

    async def get_user_settings_store(self) -> SettingsStore:
        """Get per-user settings store"""
        settings_store = self._settings_store
        if settings_store:
            return settings_store

        user_id = await self.get_user_id()
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated"
            )

        settings_store = await shared.SettingsStoreImpl.get_instance(
            shared.config, user_id
        )
        if settings_store is None:
            raise ValueError('Failed to get settings store instance')

        self._settings_store = settings_store
        return settings_store

    async def get_user_settings(self) -> Settings | None:
        """Get per-user settings"""
        settings = self._settings
        if settings:
            return settings

        settings_store = await self.get_user_settings_store()
        settings = await settings_store.load()
        self._settings = settings
        return settings

    async def get_secrets_store(self) -> SecretsStore:
        """Get per-user secrets store"""
        secrets_store = self._secrets_store
        if secrets_store:
            return secrets_store

        user_id = await self.get_user_id()
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated"
            )

        secret_store = await shared.SecretsStoreImpl.get_instance(
            shared.config, user_id
        )
        if secret_store is None:
            raise ValueError('Failed to get secrets store instance')

        self._secrets_store = secret_store
        return secret_store

    async def get_user_secrets(self) -> UserSecrets | None:
        """Get per-user secrets"""
        user_secrets = self._user_secrets
        if user_secrets:
            return user_secrets

        secrets_store = await self.get_secrets_store()
        user_secrets = await secrets_store.load()
        self._user_secrets = user_secrets
        return user_secrets

    async def get_provider_tokens(self) -> PROVIDER_TOKEN_TYPE | None:
        """Get per-user provider tokens"""
        user_secrets = await self.get_user_secrets()
        if user_secrets is None:
            return None
        return user_secrets.provider_tokens

    def get_auth_type(self) -> AuthType | None:
        """Return the auth type"""
        return AuthType.BEARER

    @classmethod
    async def get_instance(cls, request: Request) -> UserAuth:
        """Create instance and extract token from request"""
        instance = cls()

        token = await instance._extract_token_from_request(request)
        if token:
            instance._access_token = SecretStr(token)

        return instance
