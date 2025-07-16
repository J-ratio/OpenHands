import os

from fastapi import Depends
from pydantic import SecretStr
from openhands.server.user_auth.h2loop_user_auth import H2LoopUserAuth
from openhands.utils.import_utils import get_impl
from openhands.server.user_auth import get_user_id


class ConversationValidator:
    """Abstract base class for validating conversation access.

    This is an extension point in OpenHands that allows applications to customize how
    conversation access is validated. Applications can substitute their own implementation by:
    1. Creating a class that inherits from ConversationValidator
    2. Implementing the validate method
    3. Setting OPENHANDS_CONVERSATION_VALIDATOR_CLS environment variable to the fully qualified name of the class

    The class is instantiated via get_impl() in create_conversation_validator().

    The default implementation performs no validation and returns None, None.
    """

    async def validate(
        self,
        conversation_id: str,
        cookies_str: str,
        authorization_header: str | None = None,
    ) -> str | None:
        user_auth = H2LoopUserAuth(_access_token=SecretStr(authorization_header))
        user_id = await user_auth.get_user_id()
        return user_id


def create_conversation_validator() -> ConversationValidator:
    conversation_validator_cls = os.environ.get(
        'OPENHANDS_CONVERSATION_VALIDATOR_CLS',
        'openhands.storage.conversation.conversation_validator.ConversationValidator',
    )
    ConversationValidatorImpl = get_impl(
        ConversationValidator, conversation_validator_cls
    )
    return ConversationValidatorImpl()
