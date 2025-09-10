import os
from typing import Any, Dict, List, Optional

import httpx

from openhands.core.logger import openhands_logger as logger
from openhands.server.user_auth.h2loop_user_auth import H2LoopUserAuth

from collections import defaultdict

class ChunksService:
    @staticmethod
    async def get_chunks_from_files(
        attached_files: List[Dict[str, Any]],
        query: str,
        user_id: Optional[str] = None,
        limit: int = 5,
    ) -> Dict[str, Any]:

        # Get API token from user cache or fallback to environment variable
        api_token = None
        if user_id:
            cached_token = H2LoopUserAuth.get_cached_access_token(user_id)
            if cached_token:
                api_token = cached_token.get_secret_value()

        if not api_token:
            api_token = os.getenv('H2LOOP_API_TOKEN')

        if not api_token:
            logger.warning('No API token available, skipping chunk fetching')
            return {}

        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }

        all_chunks = []

        for file_obj in attached_files:
            if isinstance(file_obj, dict) and 'id' in file_obj:
                file_id = file_obj['id']
                try:
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        response = await client.get(
                            f"https://coreapi.h2loop.ai/api/v1/data-sources/{file_id}/chunks",
                            params={
                                'query': query,
                                'limit': limit
                            },
                            headers=headers
                        )

                        if response.status_code == 200:
                            data = response.json()
                            if 'chunks' in data:
                                all_chunks.extend(data['chunks'])
                        else:
                            logger.warning(
                                f'Failed to fetch chunks for file {file_id}: '
                                f'HTTP {response.status_code} - {response.text}'
                            )

                except Exception as e:
                    logger.warning(f'Error fetching chunks for file {file_id}: {e}')

        return {
            'chunks': all_chunks,
            'total_chunks': len(all_chunks)
        }
