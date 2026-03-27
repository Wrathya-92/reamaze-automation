import { Request, Response } from 'express';
import crypto from 'crypto';
import { ReamazeWebhookPayload } from '../types';
import { ReamazeClient } from '../services/reamaze';
import { generateTier1Response, generateTier2Response } from '../services/llm';
import { KnowledgeBase } from '../services/knowledge-base';
import { isBusinessHours } from '../services/scheduler';
import { enqueueResponse, shouldAutoSend } from '../queue/review-queue';
import { config } from '../config';

const reamaze = new ReamazeClient();
const knowledgeBase = new KnowledgeBase();

// Load knowledge base on startup
knowledgeBase.load();

export async function handleWebhook(req: Request, res: Response) {
  try {
    // Verify webhook signature if configured
    if (config.reamaze.webhookSecret) {
      const signature = req.headers['x-reamaze-signature'] as string;
      if (signature) {
        const expected = crypto
          .createHmac('sha256', config.reamaze.webhookSecret)
          .update(JSON.stringify(req.body))
          .digest('hex');
        if (signature !== expected) {
          console.warn('[Webhook] Invalid signature, rejecting');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }
    }

    const payload: ReamazeWebhookPayload = req.body;

    // Only process new customer messages (not staff replies)
    if (payload.event !== 'message.created') {
      return res.status(200).json({ status: 'ignored', reason: 'not a new message event' });
    }

    const { message } = payload;
    const conversationSlug = message.conversation.slug;
    const customerMessage = message.body;

    console.log(`[Webhook] New message in conversation ${conversationSlug}`);

    // Get conversation history for context
    let conversationHistory = '';
    try {
      const messages = await reamaze.getConversationMessages(conversationSlug);
      conversationHistory = messages
        .slice(-10) // Last 10 messages for context
        .map((m: any) => `${m.user?.name || 'Unknown'}: ${m.body}`)
        .join('\n');
    } catch (err) {
      console.warn('[Webhook] Could not fetch conversation history:', err);
    }

    // TIER 1: Generate and send instant response
    console.log(`[Tier1] Generating instant response...`);
    const tier1Response = await generateTier1Response(customerMessage, conversationHistory);
    await reamaze.sendMessage(conversationSlug, tier1Response);
    console.log(`[Tier1] Sent instant response`);

    // TIER 2: Generate elaborated response
    if (isBusinessHours()) {
      console.log(`[Tier2] Business hours — generating elaborated response...`);
      const knowledgeContext = knowledgeBase.getRelevantContext(customerMessage);
      const tier2Response = await generateTier2Response(
        customerMessage,
        conversationHistory,
        knowledgeContext,
        tier1Response
      );

      if (shouldAutoSend()) {
        // Auto mode: send directly
        await reamaze.sendMessage(conversationSlug, tier2Response);
        console.log(`[Tier2] Auto-sent elaborated response`);
      } else {
        // Review mode: queue for human review, add as internal note
        const queueId = `${conversationSlug}-${Date.now()}`;
        enqueueResponse({
          id: queueId,
          conversationSlug,
          customerMessage,
          tier1Response,
          tier2Response,
          status: 'pending_review',
          createdAt: new Date(),
        });
        await reamaze.addNote(
          conversationSlug,
          `🤖 **AI Draft Response (Pending Review)**\n\n${tier2Response}\n\n---\n_Review at: /api/queue/pending | ID: ${queueId}_`
        );
        console.log(`[Tier2] Queued for review (${queueId})`);
      }
    } else {
      console.log(`[Tier2] Outside business hours — tier 2 will be generated during business hours`);
      // Optionally queue for next business hours processing
      await reamaze.addNote(
        conversationSlug,
        `⏰ Message received outside business hours. Tier 1 auto-reply sent. Tier 2 follow-up pending for next business hours window.`
      );
    }

    return res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
