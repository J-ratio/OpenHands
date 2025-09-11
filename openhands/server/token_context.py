"""
Centralized access token management for OpenHands backend.

This module provides thread-local storage for the current request's access token,
allowing it to be accessed from anywhere in the backend without passing request objects.
"""

import threading
from typing import Optional

from pydantic import SecretStr

# Thread-local storage for the current request's access token
_local = threading.local()


def set_current_access_token(token: Optional[SecretStr]) -> None:
    """Set the access token for the current request/thread.

    Args:
        token: The access token to store, or None to clear
    """
    _local.access_token = token


def get_current_access_token() -> Optional[SecretStr]:
    """Get the access token for the current request/thread.

    Returns:
        The current access token, or None if not set
    """
    return getattr(_local, 'access_token', None)


def clear_current_access_token() -> None:
    """Clear the access token for the current request/thread."""
    if hasattr(_local, 'access_token'):
        delattr(_local, 'access_token')
