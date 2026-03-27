import { config } from '../config';

export class ReamazeClient {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = config.reamaze.baseUrl;
    const credentials = Buffer.from(
      `${config.reamaze.email}:${config.reamaze.apiToken}`
    ).toString('base64');
    this.authHeader = `Basic ${credentials}`;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: this.authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Reamaze API error ${response.status}: ${text}`);
    }

    return response.json();
  }

  async getConversation(slug: string) {
    return this.request(`/conversations/${slug}`);
  }

  async getConversationMessages(slug: string) {
    const data = (await this.request(`/conversations/${slug}/messages`)) as any;
    return data.messages || [];
  }

  async sendMessage(conversationSlug: string, body: string) {
    return this.request(`/conversations/${conversationSlug}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: {
          body,
        },
      }),
    });
  }

  async addNote(conversationSlug: string, body: string) {
    return this.request(`/conversations/${conversationSlug}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: {
          body,
          visibility: 1, // internal note
        },
      }),
    });
  }
}
