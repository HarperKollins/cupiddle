import { User, Profile, DiscoveryCandidate, Spark, Conversation, Message, Community } from '../types';

// Default to local server address; on Android emulator this is 10.0.2.2 or localhost on iOS
const API_BASE = 'http://10.0.2.2:8080/api';

class MobileApiClient {
  private token: string | null = null;

  setToken(t: string | null) {
    this.token = t;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Network error');
    }

    return data as T;
  }

  async login(body: { email: string; password: string }) {
    const res = await this.request<{ token: string; user: User; profile: Profile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  }

  async register(body: any) {
    const res = await this.request<{ token: string; user: User; profile: Profile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request<{ user: User; profile: Profile }>('/auth/me');
  }

  async getDiscoveryFeed() {
    return this.request<{ candidates: DiscoveryCandidate[]; count: number }>('/discovery/feed?limit=10');
  }

  async sendSpark(data: { receiver_id: string; target_type: string; target_content: string; comment: string }) {
    return this.request<Spark>('/sparks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIncomingSparks() {
    return this.request<{ sparks: Spark[]; count: number }>('/sparks/inbox');
  }

  async acceptSpark(sparkId: string) {
    return this.request<{ message: string; match_id: string; conversation_id: string }>(`/sparks/${sparkId}/accept`, {
      method: 'POST',
    });
  }

  async passSpark(sparkId: string) {
    return this.request(`/sparks/${sparkId}/pass`, { method: 'POST' });
  }

  async getConversations() {
    return this.request<{ conversations: Conversation[]; count: number }>('/conversations');
  }

  async getMessages(convId: string) {
    return this.request<{ messages: Message[]; count: number }>(`/conversations/${convId}/messages`);
  }

  async sendMessage(convId: string, content: string) {
    return this.request<Message>(`/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getCommunities() {
    return this.request<{ communities: Community[]; count: number }>('/communities');
  }
}

export const mobileApi = new MobileApiClient();
