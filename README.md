# Reamaze CX Automation

Two-tier automated customer support system powered by local AI (Ollama).

## How it works

```
Customer message → Reamaze webhook → This server
                                        ├── Tier 1: Instant reply (24/7)
                                        └── Tier 2: Elaborated reply (business hours)
                                              ├── Review mode: queued for human approval
                                              └── Auto mode: sent directly (once trust ≥ 98%)
```

**Tier 1** — Immediate, helpful acknowledgment sent within seconds. Runs 24/7.

**Tier 2** — Detailed, knowledge-backed response using your SOPs, guidelines, and docs. During business hours (11am-7pm Bogota time). Starts in review mode, switches to auto once response quality trust rate exceeds 98%.

## Quick Install

### macOS (MacBook Air)

```bash
git clone https://github.com/Wrathya-92/reamaze-automation.git
cd reamaze-automation
./setup.sh
```

### Windows 11

```powershell
git clone https://github.com/Wrathya-92/reamaze-automation.git
cd reamaze-automation
powershell -ExecutionPolicy Bypass -File setup.ps1
```

Both setup scripts will automatically:
- Install Ollama (if not present)
- Pull the AI model (Mistral)
- Install Node.js (if not present)
- Install dependencies and build
- Create `.env` from template

Then edit `.env` with your credentials and start:

```bash
# macOS
./start.sh

# Windows
powershell -File start.ps1
```

The start scripts ensure Ollama is running before launching the server.

## Manual Setup

1. Install [Ollama](https://ollama.com) and pull a model: `ollama pull mistral`
2. Copy `.env.example` to `.env` and fill in your credentials
3. Add your SOPs and docs to `knowledge-base/` as `.md` or `.txt` files
4. Configure the Reamaze webhook to point to `https://your-server/webhook/reamaze`

```bash
npm install
npm run dev    # Development
npm run build  # Build for production
npm start      # Production
```

## Review Queue API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/queue/pending` | GET | List pending responses |
| `/api/queue/metrics` | GET | Approval rate & trust metrics |
| `/api/queue/:id/approve` | POST | Approve & send a response |
| `/api/queue/:id/reject` | POST | Reject a response |
| `/health` | GET | Health check |

## Configuration

| Env Var | Description |
|---------|-------------|
| `REAMAZE_API_TOKEN` | Reamaze API token |
| `REAMAZE_BRAND` | Your Reamaze brand slug |
| `REAMAZE_EMAIL` | Reamaze login email |
| `OLLAMA_BASE_URL` | Ollama URL (default: http://localhost:11434) |
| `OLLAMA_TIER1_MODEL` | Model for instant replies (default: mistral) |
| `OLLAMA_TIER2_MODEL` | Model for elaborated replies (default: mistral) |
| `TIER2_MODE` | `review` (default) or `auto` |
| `TRUST_THRESHOLD` | % threshold to suggest auto mode (default: 98) |
| `BUSINESS_HOURS_START` | Start hour in local tz (default: 11) |
| `BUSINESS_HOURS_END` | End hour in local tz (default: 19) |
| `TIMEZONE` | Business hours timezone (default: America/Bogota) |
