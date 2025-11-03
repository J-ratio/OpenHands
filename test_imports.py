#!/usr/bin/env python3
"""
Test script to verify that all imports work correctly after the streaming implementation.
"""

try:
    print("Testing imports...")

    # Test streaming message action import
    from openhands.events.action.streaming_message import StreamingMessageAction
    print("✅ StreamingMessageAction import successful")

    # Test action type import
    from openhands.core.schema.action import ActionType
    print("✅ ActionType import successful")

    # Test that STREAMING_MESSAGE is in ActionType
    assert hasattr(ActionType, 'STREAMING_MESSAGE')
    print("✅ STREAMING_MESSAGE action type exists")

    # Test CodeAct agent import (this was failing before)
    from openhands.agenthub.codeact_agent.codeact_agent import CodeActAgent
    print("✅ CodeActAgent import successful")

    # Test LLM registry import
    from openhands.llm.llm_registry import LLMRegistry
    print("✅ LLMRegistry import successful")

    # Test streaming LLM import
    from openhands.llm.streaming_llm import StreamingLLM
    print("✅ StreamingLLM import successful")

    print("\n🎉 All imports successful! The streaming implementation is ready.")
    print("\n📋 Next steps:")
    print("1. Update your config.toml with your local LLM endpoint")
    print("2. Set enable_streaming = true in the [llm] section")
    print("3. Run: python -m openhands.cli.main")

except ImportError as e:
    print(f"❌ Import error: {e}")
    exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    exit(1)
