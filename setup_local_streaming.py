#!/usr/bin/env python3
"""
Setup script for configuring OpenHands with local LLM streaming.
This script helps you configure OpenHands to work with your local LLM server.
"""

import sys
from pathlib import Path


def create_config(llm_type: str, base_url: str, model_name: str, api_key: str = "no-key"):
    """Create a configuration file for local LLM streaming."""

    config_content = f"""# OpenHands Configuration with Local LLM Streaming
# Generated configuration for {llm_type}

[llm]
model = "{model_name}"
base_url = "{base_url}"
api_key = "{api_key}"
enable_streaming = true
temperature = 0.0
timeout = 120

[core]
workspace_base = "./workspace"
persist_sandbox = true

[agent]
name = "CodeActAgent"

[security]
confirmation_mode = false
"""

    config_path = Path("config.toml")
    with open(config_path, "w") as f:
        f.write(config_content)

    print(f"✅ Created config.toml for {llm_type}")
    print(f"📍 Base URL: {base_url}")
    print(f"🤖 Model: {model_name}")
    print(f"🚀 Streaming: Enabled")


def main():
    print("🔧 OpenHands Local LLM Streaming Setup")
    print("=" * 50)

    print("\nSelect your local LLM setup:")
    print("1. Ollama (default: localhost:11434)")
    print("2. OpenAI-compatible API (text-generation-webui, etc.)")
    print("3. llama.cpp server")
    print("4. vLLM server")
    print("5. Custom setup")

    try:
        choice = input("\nEnter your choice (1-5): ").strip()

        if choice == "1":
            # Ollama setup
            model = input("Enter Ollama model name (e.g., llama3.1:8b): ").strip()
            if not model:
                model = "llama3.1:8b"

            port = input("Enter Ollama port (default: 11434): ").strip()
            if not port:
                port = "11434"

            base_url = f"http://localhost:{port}"
            create_config("Ollama", base_url, f"ollama/{model}")

        elif choice == "2":
            # OpenAI-compatible API
            port = input("Enter API port (default: 5000): ").strip()
            if not port:
                port = "5000"

            model = input("Enter model name (default: local-model): ").strip()
            if not model:
                model = "local-model"

            base_url = f"http://localhost:{port}/v1"
            create_config("OpenAI-compatible API", base_url, model, "sk-no-key-required")

        elif choice == "3":
            # llama.cpp server
            port = input("Enter llama.cpp server port (default: 8080): ").strip()
            if not port:
                port = "8080"

            base_url = f"http://localhost:{port}/v1"
            create_config("llama.cpp server", base_url, "local")

        elif choice == "4":
            # vLLM server
            port = input("Enter vLLM server port (default: 8000): ").strip()
            if not port:
                port = "8000"

            model = input("Enter model name/path: ").strip()
            if not model:
                model = "meta-llama/Llama-3.1-8B-Instruct"

            base_url = f"http://localhost:{port}/v1"
            create_config("vLLM server", base_url, model, "token-abc123")

        elif choice == "5":
            # Custom setup
            base_url = input("Enter your LLM server URL (e.g., http://localhost:8000/v1): ").strip()
            model = input("Enter model name: ").strip()
            api_key = input("Enter API key (or press Enter for 'no-key'): ").strip()

            if not api_key:
                api_key = "no-key"

            create_config("Custom LLM", base_url, model, api_key)

        else:
            print("❌ Invalid choice. Please run the script again.")
            return 1

        print("\n🎉 Configuration complete!")
        print("\n📋 Next steps:")
        print("1. Make sure your local LLM server is running")
        print("2. Start OpenHands: python -m openhands.cli.main")
        print("3. Enjoy streaming responses in the UI!")
        print("\n💡 Tip: Check config_local_llm_examples.toml for more configuration options")

        return 0

    except KeyboardInterrupt:
        print("\n\n👋 Setup cancelled.")
        return 0
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
