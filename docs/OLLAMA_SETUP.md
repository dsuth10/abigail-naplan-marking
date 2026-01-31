# Ollama Setup for AI Grading

The AI-powered NAPLAN marking feature uses a local Ollama server so grading works offline. Follow these steps to set up Ollama on the teacher machine.

## Installation

1. Download Ollama from [https://ollama.ai](https://ollama.ai).
2. Install for your OS (Windows / macOS / Linux).
3. Open a terminal and pull the default model:

   ```bash
   ollama pull mistral
   ```

## Starting Ollama

Run in a terminal (and keep it open while using AI grading):

```bash
ollama serve
```

On many systems Ollama runs as a service after install; if so, you do not need to run `ollama serve` manually.

## Verifying Setup

Check that Ollama is running and the model is available:

```bash
curl http://localhost:11434/api/tags
```

You should see a list of models including `mistral` (or the model name you use).

## Configuration

Optional environment variables in `backend/.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

- **OLLAMA_BASE_URL**: Ollama API base URL (default: `http://localhost:11434`).
- **OLLAMA_MODEL**: Model to use for grading (default: `mistral`).

## Recommended Models

- **mistral** (default): Good balance of quality and speed for NAPLAN-style assessment.
- **llama3**: Higher quality, slower.
- **gemma**: Lightweight, faster.

Change the model by setting `OLLAMA_MODEL` in `backend/.env` and ensuring that model is pulled (e.g. `ollama pull llama3`).

## Troubleshooting

- **"Ollama service not available"**: Start Ollama (`ollama serve`) and ensure no firewall is blocking port 11434.
- **Model not found**: Run `ollama pull mistral` (or the model you set in `OLLAMA_MODEL`).
- **Grading times out**: Use a smaller/faster model (e.g. `gemma`) or increase the timeout in the backend if needed.
