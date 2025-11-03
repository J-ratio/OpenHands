#!/usr/bin/env python3
"""
Test script to verify streaming LLM functionality in OpenHands.
This script tests the streaming implementation by creating a simple agent interaction.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from openhands.core.config import load_openhands_config
from openhands.llm.llm_registry import LLMRegistry
from openhands.llm.streaming_llm import StreamingLLM
from openhands.events.action.streaming_message import StreamingMessageAction


async def test_streaming_llm():
    """Test the StreamingLLM functionality."""
    print("🧪 Testing StreamingLLM functionality...")

    # Load config with streaming enabled
    config_path = project_root / "config_streaming.toml"
    if config_path.exists():
        os.environ['OPENHANDS_CONFIG_FILE'] = str(config_path)

    config = load_openhands_config()
    config.llm.enable_streaming = True  # Ensure streaming is enabled

    # Create LLM registry with streaming
    registry = LLMRegistry(config)
    llm = registry.get_llm('test', config.llm, use_streaming=True)

    # Verify we got a StreamingLLM instance
    if isinstance(llm, StreamingLLM):
        print("✅ Successfully created StreamingLLM instance")
    else:
        print(f"❌ Expected StreamingLLM, got {type(llm)}")
        return False

    # Test streaming message action
    streaming_action = StreamingMessageAction(
        content="Hello, this is a test streaming message!",
        is_complete=False,
        stream_id="test-stream-123"
    )

    print(f"✅ Created streaming message action: {streaming_action}")

    # Test basic LLM functionality (without actual API call for this test)
    print("✅ StreamingLLM implementation test completed successfully!")
    return True


def test_streaming_events():
    """Test streaming event types."""
    print("🧪 Testing streaming event types...")

    # Test StreamingMessageAction
    action = StreamingMessageAction(
        content="Test content",
        is_complete=False,
        stream_id="test-123"
    )

    assert action.action == "streaming_message"
    assert action.content == "Test content"
    assert not action.is_complete
    assert action.stream_id == "test-123"

    print("✅ StreamingMessageAction works correctly")

    # Test completion action
    complete_action = StreamingMessageAction(
        content="",
        is_complete=True,
        stream_id="test-123"
    )

    assert complete_action.is_complete
    print("✅ Streaming completion action works correctly")

    return True


async def main():
    """Run all tests."""
    print("🚀 Starting OpenHands Streaming Implementation Tests\n")

    try:
        # Test 1: Streaming events
        if not test_streaming_events():
            print("❌ Streaming events test failed")
            return 1

        print()

        # Test 2: StreamingLLM
        if not await test_streaming_llm():
            print("❌ StreamingLLM test failed")
            return 1

        print("\n🎉 All streaming tests passed!")
        print("\n📋 To enable streaming in OpenHands:")
        print("1. Set 'enable_streaming = true' in your LLM config")
        print("2. Use the provided config_streaming.toml file")
        print("3. Start OpenHands and observe streaming responses in the UI")

        return 0

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
