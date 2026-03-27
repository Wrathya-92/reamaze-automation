import express from 'express';
import path from 'path';
import { config } from './config';
import { handleWebhook } from './handlers/webhook';
import {
  handleGetPending,
  handleGetMetrics,
  handleApprove,
  handleReject,
  handleCorrect,
} from './handlers/review-api';
import {
  handleAcquireSession,
  handlePingSession,
  handleReleaseSession,
} from './handlers/session';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Reamaze webhook endpoint
app.post('/webhook/reamaze', handleWebhook);

// Review queue API
app.get('/api/queue/pending', handleGetPending);
app.get('/api/queue/metrics', handleGetMetrics);
app.post('/api/queue/:id/approve', handleApprove);
app.post('/api/queue/:id/reject', handleReject);
app.post('/api/queue/:id/correct', handleCorrect);

// Session management
app.post('/api/session/acquire', handleAcquireSession);
app.post('/api/session/ping', handlePingSession);
app.post('/api/session/release', handleReleaseSession);

app.listen(config.server.port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║       Reamaze CX Automation Server           ║
╠══════════════════════════════════════════════╣
║  Port:            ${config.server.port}                        ║
║  Tier 2 Mode:     ${config.tier2.mode.padEnd(25)}║
║  Business Hours:  ${config.businessHours.start}:00 - ${config.businessHours.end}:00 ${config.businessHours.timezone}  ║
╚══════════════════════════════════════════════╝

Review UI:    http://localhost:${config.server.port}
Webhook URL:  http://localhost:${config.server.port}/webhook/reamaze
  `);
});
