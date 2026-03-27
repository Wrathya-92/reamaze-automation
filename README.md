# Reamaze CX Automation

Two-tier automated customer support system powered by Claude AI.

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

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Add your SOPs and docs to `knowledge-base/` as `.md` or `.txt` files
3. Configure the Reamaze webhook to point to `https://your-server/webhook/reamaze`

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
| `ANTHROPIC_API_KEY` | Claude API key |
| `TIER2_MODE` | `review` (default) or `auto` |
| `TRUST_THRESHOLD` | % threshold to suggest auto mode (default: 98) |
| `BUSINESS_HOURS_START` | Start hour in local tz (default: 11) |
| `BUSINESS_HOURS_END` | End hour in local tz (default: 19) |
| `TIMEZONE` | Business hours timezone (default: America/Bogota) |
