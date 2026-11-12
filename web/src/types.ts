export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
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
  latitude: number;
  longitude: number;
  bio: string;
  dating_intentions: string;
  target_genders?: string[];
  age_min: number;
  age_max: number;
  max_distance_km: number;
  is_paused: boolean;
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
  created_at: string;
  updated_at: string;
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
  target_type: 'rabbit_hole' | 'defend_take' | 'teach_me' | 'photo' | 'community_post' | 'general';
  target_content: string;
  comment: string;
  status: 'pending' | 'accepted' | 'passed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_type: 'text' | 'voice' | 'image';
  media_url?: string;
  read_at?: string;
  reactions?: Record<string, string>;
  created_at: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  spark_id?: string;
  user1_id: string;
  user2_id: string;
  partner?: Profile;
  origin_spark?: Spark;
  last_message_at: string;
  last_message?: Message;
  unread_count: number;
  created_at: string;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  member_count: number;
  post_count: number;
  is_member: boolean;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  author?: Profile;
  title: string;
  content: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  author?: Profile;
  content: string;
  created_at: string;
}

export interface CoopGame {
  id: string;
  conversation_id: string;
  game_type: string;
  initiator_id: string;
  partner_id: string;
  title: string;
  prompt_data: string;
  user1_answer: string;
  user2_answer: string;
  status: 'in_progress' | 'completed';
  result_summary?: string;
  created_at: string;
  completed_at?: string;
}
