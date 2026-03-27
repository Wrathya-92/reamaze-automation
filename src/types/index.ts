export interface ReamazeMessage {
  id: string;
  body: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  conversation: {
    slug: string;
    subject: string;
    category?: string;
  };
}

export interface ReamazeWebhookPayload {
  event: string;
  message: ReamazeMessage;
}

export interface QueuedResponse {
  id: string;
  conversationSlug: string;
  customerMessage: string;
  tier1Response: string;
  tier2Response: string;
  status: 'pending_review' | 'approved' | 'sent' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface KnowledgeDocument {
  name: string;
  content: string;
  category: string;
}

export interface ResponseMetrics {
  totalResponses: number;
  approvedResponses: number;
  rejectedResponses: number;
  trustRate: number;
}
