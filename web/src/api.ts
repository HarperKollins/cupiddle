import { User, Profile, DiscoveryCandidate, Spark, Conversation, Message, Community, CommunityPost, PostComment, CoopGame } from './types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;
  private ws: WebSocket | null = null;
  private wsListeners: ((event: { type: string; payload: any }) => void)[] = [];

  constructor() {
    this.token = localStorage.getItem('cupiddle_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('cupiddle_token', token);
      this.connectWebSocket();
    } else {
      localStorage.removeItem('cupiddle_token');
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }
  }

  getToken(): string | null {
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
      throw new Error(data.error || 'Network request failed');
    }

    return data as T;
  }

  // Auth
  async register(body: {
    email: string;
    password: string;
    display_name: string;
    birthdate: string;
    gender: string;
    city: string;
    country?: string;
  }): Promise<{ token: string; user: User; profile: Profile }> {
    const res = await this.request<{ token: string; user: User; profile: Profile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  }

  async login(body: { email: string; password: string }): Promise<{ token: string; user: User; profile?: Profile }> {
    const res = await this.request<{ token: string; user: User; profile?: Profile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User; profile: Profile }> {
    return this.request<{ user: User; profile: Profile }>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Profiles & Curiosity
  async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateCuriosity(curiosity: {
    rabbit_hole?: string;
    defend_take?: string;
    teach_me?: string;
    my_world_tags?: string[];
    interests?: string[];
  }): Promise<Profile> {
    return this.request<Profile>('/profile/curiosity', {
      method: 'PUT',
      body: JSON.stringify(curiosity),
    });
  }

  async addPhoto(url: string, is_primary: boolean = false) {
    return this.request('/profile/photos', {
      method: 'POST',
      body: JSON.stringify({ url, is_primary }),
    });
  }

  async deletePhoto(photoId: string) {
    return this.request(`/profile/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // Discovery (Idea Stream)
  async getDiscoveryFeed(limit = 10): Promise<{ candidates: DiscoveryCandidate[]; count: number }> {
    return this.request<{ candidates: DiscoveryCandidate[]; count: number }>(`/discovery/feed?limit=${limit}`);
  }

  async passProfile(targetUserId: string) {
    return this.request('/discovery/pass', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
  }

  async resetPasses() {
    return this.request('/discovery/reset', { method: 'POST' });
  }

  // Sparks
  async sendSpark(data: {
    receiver_id: string;
    target_type: string;
    target_content: string;
    comment: string;
  }): Promise<Spark> {
    return this.request<Spark>('/sparks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIncomingSparks(): Promise<{ sparks: Spark[]; count: number }> {
    return this.request<{ sparks: Spark[]; count: number }>('/sparks/inbox');
  }

  async acceptSpark(sparkId: string): Promise<{ message: string; match_id: string; conversation_id: string }> {
    return this.request<{ message: string; match_id: string; conversation_id: string }>(`/sparks/${sparkId}/accept`, {
      method: 'POST',
    });
  }

  async passSpark(sparkId: string) {
    return this.request(`/sparks/${sparkId}/pass`, { method: 'POST' });
  }

  // Conversations & Chat
  async getConversations(): Promise<{ conversations: Conversation[]; count: number }> {
    return this.request<{ conversations: Conversation[]; count: number }>('/conversations');
  }

  async getMessages(convId: string, limit = 50): Promise<{ messages: Message[]; count: number }> {
    return this.request<{ messages: Message[]; count: number }>(`/conversations/${convId}/messages?limit=${limit}`);
  }

  async sendMessage(convId: string, content: string, mediaType = 'text', mediaUrl = ''): Promise<Message> {
    return this.request<Message>(`/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, media_type: mediaType, media_url: mediaUrl }),
    });
  }

  async addReaction(messageId: string, emoji: string) {
    return this.request(`/conversations/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async getConversationRadar(convId: string): Promise<{ shared_interests: string[]; shared_tags: string[]; suggestions: string[] }> {
    return this.request<{ shared_interests: string[]; shared_tags: string[]; suggestions: string[] }>(`/conversations/${convId}/radar`);
  }

  // Co-op Corner
  async startCoopGame(convId: string, gameType: string): Promise<CoopGame> {
    return this.request<CoopGame>(`/conversations/${convId}/games`, {
      method: 'POST',
      body: JSON.stringify({ game_type: gameType }),
    });
  }

  async getActiveCoopGame(convId: string): Promise<{ active_game: CoopGame | null }> {
    return this.request<{ active_game: CoopGame | null }>(`/conversations/${convId}/games/active`);
  }

  async submitCoopAnswer(gameId: string, answer: string): Promise<CoopGame> {
    return this.request<CoopGame>(`/games/${gameId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Communities
  async getCommunities(): Promise<{ communities: Community[]; count: number }> {
    return this.request<{ communities: Community[]; count: number }>('/communities');
  }

  async getCommunityPosts(slug: string): Promise<{ posts: CommunityPost[]; count: number }> {
    return this.request<{ posts: CommunityPost[]; count: number }>(`/communities/${slug}/posts`);
  }

  async joinCommunity(slug: string) {
    return this.request(`/communities/${slug}/join`, { method: 'POST' });
  }

  async leaveCommunity(slug: string) {
    return this.request(`/communities/${slug}/leave`, { method: 'POST' });
  }

  async createPost(slug: string, title: string, content: string, tags: string[] = []): Promise<CommunityPost> {
    return this.request<CommunityPost>(`/communities/${slug}/posts`, {
      method: 'POST',
      body: JSON.stringify({ title, content, tags }),
    });
  }

  async getPostComments(postId: string): Promise<{ comments: PostComment[]; count: number }> {
    return this.request<{ comments: PostComment[]; count: number }>(`/posts/${postId}/comments`);
  }

  async addComment(postId: string, content: string): Promise<PostComment> {
    return this.request<PostComment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Safety
  async blockUser(targetUserId: string) {
    return this.request('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
  }

  async reportUser(reportedUserId: string, reason: string, details: string) {
    return this.request('/safety/report', {
      method: 'POST',
      body: JSON.stringify({ reported_user_id: reportedUserId, reason, details }),
    });
  }

  // WebSocket Manager
  connectWebSocket() {
    if (!this.token) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws?token=${this.token}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.wsListeners.forEach((listener) => listener(data));
      } catch (e) {
        console.error('WS Parse Error', e);
      }
    };

    this.ws.onclose = () => {
      // Reconnect after 3s if still authenticated
      if (this.token) {
        setTimeout(() => this.connectWebSocket(), 3000);
      }
    };
  }

  onWebSocketEvent(listener: (event: { type: string; payload: any }) => void) {
    this.wsListeners.push(listener);
    return () => {
      this.wsListeners = this.wsListeners.filter((l) => l !== listener);
    };
  }
}

export const api = new ApiClient();
