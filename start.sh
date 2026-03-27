#!/bin/bash
# Reamaze CX Automation - macOS/Linux Start Script
# Ensures Ollama is running, then starts the server

echo "Starting Reamaze CX Automation..."

# Ensure Ollama is running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
  echo "Starting Ollama service..."
  ollama serve &> /dev/null &
  sleep 3
fi

npm start
