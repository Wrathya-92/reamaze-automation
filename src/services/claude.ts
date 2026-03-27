import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const TIER1_SYSTEM_PROMPT = `You are a friendly and professional customer support assistant.
Your role is to provide an immediate, helpful response to customer inquiries.

Guidelines:
- Be warm, empathetic, and professional
- Acknowledge the customer's concern
- Provide a helpful initial response based on common knowledge
- If the issue requires detailed investigation, let them know the team will follow up with a thorough response during business hours
- Keep responses concise but reassuring
- Never make up policies or specific details you're unsure about
- Do not promise specific timelines unless you're certain
- Sign off warmly`;

const TIER2_SYSTEM_PROMPT = `You are an expert customer support specialist crafting a thorough, detailed response.
You have access to internal documentation, SOPs, and guidelines to provide the most accurate and helpful response.

Guidelines:
- Use the provided knowledge base context to give accurate, policy-aligned answers
- Be thorough but clear — avoid unnecessary jargon
- Reference specific policies or procedures when relevant (without sharing internal document names)
- Provide actionable next steps for the customer
- If the issue requires escalation, clearly state that
- Maintain a professional yet approachable tone
- Structure longer responses with clear sections if needed`;

export async function generateTier1Response(
  customerMessage: string,
  conversationHistory: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: TIER1_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Conversation history:\n${conversationHistory}\n\nLatest customer message:\n${customerMessage}\n\nProvide a quick, helpful initial response.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export async function generateTier2Response(
  customerMessage: string,
  conversationHistory: string,
  knowledgeContext: string,
  tier1Response: string
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: TIER2_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `## Internal Knowledge Base Context
${knowledgeContext}

## Conversation History
${conversationHistory}

## Latest Customer Message
${customerMessage}

## Initial Response Already Sent
${tier1Response}

---
Craft a thorough follow-up response that builds on the initial reply. Use the knowledge base to provide accurate, detailed guidance. Do not repeat what was already said in the initial response — add value with specifics, next steps, and policy-backed answers.`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}
