import dotenv from 'dotenv';
dotenv.config();

export const config = {
  reamaze: {
    apiToken: process.env.REAMAZE_API_TOKEN!,
    brand: process.env.REAMAZE_BRAND!,
    email: process.env.REAMAZE_EMAIL!,
    webhookSecret: process.env.REAMAZE_WEBHOOK_SECRET,
    baseUrl: `https://${process.env.REAMAZE_BRAND}.reamaze.com/api/v1`,
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    tier1Model: process.env.OLLAMA_TIER1_MODEL || 'mistral',
    tier2Model: process.env.OLLAMA_TIER2_MODEL || 'mistral',
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
  },
  businessHours: {
    start: parseInt(process.env.BUSINESS_HOURS_START || '11', 10),
    end: parseInt(process.env.BUSINESS_HOURS_END || '19', 10),
    timezone: process.env.TIMEZONE || 'America/Bogota',
  },
  tier2: {
    mode: (process.env.TIER2_MODE || 'review') as 'review' | 'auto',
    trustThreshold: parseInt(process.env.TRUST_THRESHOLD || '98', 10),
  },
};
