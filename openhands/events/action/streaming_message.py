from dataclasses import dataclass
from typing import Any

from openhands.core.schema import ActionType
from openhands.events.action.action import Action, ActionSecurityRisk


@dataclass
class StreamingMessageAction(Action):
    """Action for streaming message chunks from the agent to the UI."""

    content: str
    is_complete: bool = False  # True when the streaming is finished
    stream_id: str | None = None  # Unique ID to group streaming chunks
    action: str = ActionType.STREAMING_MESSAGE
    security_risk: ActionSecurityRisk = ActionSecurityRisk.UNKNOWN

    @property
    def message(self) -> str:
        return self.content

    def __str__(self) -> str:
        status = "COMPLETE" if self.is_complete else "STREAMING"
        ret = f'**StreamingMessageAction** (source={self.source}, status={status})\n'
        ret += f'CONTENT: {self.content}'
        if self.stream_id:
            ret += f'\nSTREAM_ID: {self.stream_id}'
        return ret
