"""Ollama client for local LLM inference (AI grading)."""

import os
import requests
from typing import Optional


class OllamaClient:
    """Client for communicating with a local Ollama server."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 300,
    ):
        self.base_url = (base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "mistral")
        self.timeout = timeout

    def generate(self, prompt: str, system: str = "", stream: bool = False) -> str:
        """Send a prompt to Ollama and return the full response text."""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream,
        }
        if system:
            payload["system"] = system

        response = requests.post(
            f"{self.base_url}/api/generate",
            json=payload,
            timeout=self.timeout,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")

    def check_health(self) -> bool:
        """Check if Ollama is running and the model is available."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                return False
            data = response.json()
            models = [m.get("name", "") for m in data.get("models", [])]
            # Model may be listed as "mistral" or "mistral:latest"
            return any(self.model in m for m in models)
        except Exception:
            return False
