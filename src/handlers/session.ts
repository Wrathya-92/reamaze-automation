import { Request, Response } from 'express';
import crypto from 'crypto';

interface ActiveSession {
  token: string;
  acquiredAt: Date;
  lastPing: Date;
}

let activeSession: ActiveSession | null = null;
const SESSION_TIMEOUT_MS = 60_000; // 60 seconds without ping = stale

function isSessionStale(): boolean {
  if (!activeSession) return true;
  return Date.now() - activeSession.lastPing.getTime() > SESSION_TIMEOUT_MS;
}

export function handleAcquireSession(req: Request, res: Response) {
  const { token: existingToken } = req.body;

  // If caller already owns the session, renew it
  if (activeSession && existingToken && activeSession.token === existingToken) {
    activeSession.lastPing = new Date();
    return res.json({ status: 'acquired', token: activeSession.token });
  }

  // If session is active and not stale, reject
  if (activeSession && !isSessionStale()) {
    return res.json({ status: 'locked' });
  }

  // Grant new session
  const token = crypto.randomBytes(16).toString('hex');
  activeSession = {
    token,
    acquiredAt: new Date(),
    lastPing: new Date(),
  };

  res.json({ status: 'acquired', token });
}

export function handlePingSession(req: Request, res: Response) {
  const { token } = req.body;

  if (!activeSession || activeSession.token !== token) {
    return res.json({ status: 'invalid' });
  }

  activeSession.lastPing = new Date();
  res.json({ status: 'ok' });
}

export function handleReleaseSession(req: Request, res: Response) {
  const { token } = req.body;

  if (activeSession && activeSession.token === token) {
    activeSession = null;
  }

  res.json({ status: 'released' });
}
