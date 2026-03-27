import { QueuedResponse, ResponseMetrics } from '../types';
import { config } from '../config';
import { ReamazeClient } from '../services/reamaze';

// In-memory queue for now. Can be replaced with Redis/DB later.
const queue: Map<string, QueuedResponse> = new Map();
const reamaze = new ReamazeClient();

let metrics: ResponseMetrics = {
  totalResponses: 0,
  approvedResponses: 0,
  rejectedResponses: 0,
  trustRate: 0,
};

export function enqueueResponse(response: QueuedResponse): void {
  queue.set(response.id, response);
  console.log(`[Queue] Enqueued response ${response.id} for conversation ${response.conversationSlug}`);
}

export function getPendingResponses(): QueuedResponse[] {
  return Array.from(queue.values()).filter((r) => r.status === 'pending_review');
}

export function getResponse(id: string): QueuedResponse | undefined {
  return queue.get(id);
}

export async function approveResponse(id: string, reviewedBy: string): Promise<void> {
  const response = queue.get(id);
  if (!response) throw new Error(`Response ${id} not found`);

  response.status = 'approved';
  response.reviewedAt = new Date();
  response.reviewedBy = reviewedBy;

  // Send the tier 2 response via Reamaze
  await reamaze.sendMessage(response.conversationSlug, response.tier2Response);
  response.status = 'sent';

  metrics.totalResponses++;
  metrics.approvedResponses++;
  metrics.trustRate = (metrics.approvedResponses / metrics.totalResponses) * 100;

  console.log(`[Queue] Approved & sent response ${id}. Trust rate: ${metrics.trustRate.toFixed(1)}%`);
}

export function rejectResponse(id: string, reviewedBy: string): void {
  const response = queue.get(id);
  if (!response) throw new Error(`Response ${id} not found`);

  response.status = 'rejected';
  response.reviewedAt = new Date();
  response.reviewedBy = reviewedBy;

  metrics.totalResponses++;
  metrics.rejectedResponses++;
  metrics.trustRate = (metrics.approvedResponses / metrics.totalResponses) * 100;

  console.log(`[Queue] Rejected response ${id}. Trust rate: ${metrics.trustRate.toFixed(1)}%`);
}

export function getMetrics(): ResponseMetrics {
  return { ...metrics };
}

export function shouldAutoSend(): boolean {
  if (config.tier2.mode === 'auto') return true;
  // Suggest switching to auto if trust rate is high enough and we have enough data
  if (metrics.totalResponses >= 50 && metrics.trustRate >= config.tier2.trustThreshold) {
    console.log(`[Queue] Trust rate ${metrics.trustRate.toFixed(1)}% exceeds threshold. Consider switching TIER2_MODE=auto`);
  }
  return false;
}
