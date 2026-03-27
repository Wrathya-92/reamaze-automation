import { Request, Response } from 'express';
import {
  getPendingResponses,
  getResponse,
  approveResponse,
  rejectResponse,
  correctResponse,
  getMetrics,
} from '../queue/review-queue';

export function handleGetPending(_req: Request, res: Response) {
  const pending = getPendingResponses();
  res.json({ count: pending.length, responses: pending });
}

export function handleGetMetrics(_req: Request, res: Response) {
  res.json(getMetrics());
}

export async function handleApprove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { reviewedBy } = req.body;
    await approveResponse(id, reviewedBy || 'anonymous');
    res.json({ status: 'approved', id });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export async function handleCorrect(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { reviewedBy, correctedResponse } = req.body;
    if (!correctedResponse) {
      return res.status(400).json({ error: 'correctedResponse is required' });
    }
    await correctResponse(id, reviewedBy || 'anonymous', correctedResponse);
    res.json({ status: 'corrected', id });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}

export function handleReject(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { reviewedBy } = req.body;
    rejectResponse(id, reviewedBy || 'anonymous');
    res.json({ status: 'rejected', id });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
}
