export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Profile {
  user_id: string;
  display_name: string;
  birthdate: string;
  age: number;
  gender: string;
  pronouns?: string;
  city: string;
  country: string;
  bio: string;
  dating_intentions: string;
  is_verified: boolean;
  verification_badge?: string;
  audio_intro_url?: string;
  audio_intro_duration?: number;
  rabbit_hole: string;
  defend_take: string;
  teach_me: string;
  my_world_tags: string[];
  interests: string[];
  photos?: Photo[];
}

export interface DiscoveryCandidate {
  profile: Profile;
  distance_km: number;
  shared_interests: string[];
  match_score: number;
}

export interface Spark {
  id: string;
  sender_id: string;
  sender_profile?: Profile;
  receiver_id: string;
  target_type: string;
  target_content: string;
  comment: string;
  status: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  partner?: Profile;
  last_message_at: string;
  last_message?: { content: string };
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_type: string;
  created_at: string;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  member_count: number;
  post_count: number;
  is_member: boolean;
}

