#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════╗"
echo "║   Reamaze CX Automation - Setup Script       ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Detect OS
OS="$(uname -s)"
echo "[1/6] Detected OS: $OS"

# Install Ollama if not present
if ! command -v ollama &> /dev/null; then
  echo "[2/6] Installing Ollama..."
  if [ "$OS" = "Darwin" ]; then
    brew install ollama
  elif [ "$OS" = "Linux" ]; then
    curl -fsSL https://ollama.com/install.sh | sh
  else
    echo "ERROR: Unsupported OS. Please install Ollama manually: https://ollama.com"
    exit 1
  fi
else
  echo "[2/6] Ollama already installed ✓"
fi

# Start Ollama service if not running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
  echo "[3/6] Starting Ollama service..."
  ollama serve &> /dev/null &
  sleep 3
else
  echo "[3/6] Ollama service already running ✓"
fi

# Pull the model
MODEL="${OLLAMA_TIER1_MODEL:-mistral}"
echo "[4/6] Pulling model: $MODEL (this may take a few minutes on first run)..."
ollama pull "$MODEL"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "[5/6] Installing Node.js..."
  if [ "$OS" = "Darwin" ]; then
    brew install node
  elif [ "$OS" = "Linux" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
else
  echo "[5/6] Node.js already installed ✓ ($(node -v))"
fi

# Install dependencies and build
echo "[6/6] Installing dependencies and building..."
npm install
npm run build

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env from .env.example"
  echo "   Please edit .env with your Reamaze credentials:"
  echo "   - REAMAZE_API_TOKEN"
  echo "   - REAMAZE_BRAND"
  echo "   - REAMAZE_EMAIL"
else
  echo ".env already exists ✓"
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Setup complete!                             ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Start with:  npm start                      ║"
echo "║   Dev mode:    npm run dev                     ║"
echo "╚══════════════════════════════════════════════╝"
