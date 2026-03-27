import express from 'express';
import { config } from './config';
import { handleWebhook } from './handlers/webhook';
import {
  handleGetPending,
  handleGetMetrics,
  handleApprove,
  handleReject,
} from './handlers/review-api';

const app = express();
app.use(express.json());

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

app.listen(config.server.port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║       Reamaze CX Automation Server           ║
╠══════════════════════════════════════════════╣
║  Port:            ${config.server.port}                        ║
║  Tier 2 Mode:     ${config.tier2.mode.padEnd(25)}║
║  Business Hours:  ${config.businessHours.start}:00 - ${config.businessHours.end}:00 ${config.businessHours.timezone}  ║
╚══════════════════════════════════════════════╝

Webhook URL: http://localhost:${config.server.port}/webhook/reamaze
Review Queue: http://localhost:${config.server.port}/api/queue/pending
  `);
});
