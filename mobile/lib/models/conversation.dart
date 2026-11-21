import 'profile.dart';
import 'spark.dart';

class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String content;
  final String messageType;
  final String createdAt;
  final Map<String, String>? reactions;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    this.messageType = 'text',
    required this.createdAt,
    this.reactions,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    Map<String, String> parsedRx = {};
    if (json['reactions'] is Map) {
      (json['reactions'] as Map).forEach((k, v) {
        parsedRx[k.toString()] = v.toString();
      });
    }

    return Message(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversation_id']?.toString() ?? '',
      senderId: json['sender_id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      messageType: json['message_type']?.toString() ?? 'text',
      createdAt: json['created_at']?.toString() ?? '',
      reactions: parsedRx,
    );
  }
}

class CoopGame {
  final String id;
  final String conversationId;
  final String gameType;
  final String title;
  final String promptData;
  final String status;
  final String? user1Answer;
  final String? user2Answer;
  final String? currentTurnUserId;

  CoopGame({
    required this.id,
    required this.conversationId,
    required this.gameType,
    required this.title,
    required this.promptData,
    required this.status,
    this.user1Answer,
    this.user2Answer,
    this.currentTurnUserId,
  });

  factory CoopGame.fromJson(Map<String, dynamic> json) {
    return CoopGame(
      id: json['id']?.toString() ?? '',
      conversationId: json['conversation_id']?.toString() ?? '',
      gameType: json['game_type']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Co-op Challenge',
      promptData: json['prompt_data']?.toString() ?? '',
      status: json['status']?.toString() ?? 'in_progress',
      user1Answer: json['user1_answer']?.toString(),
      user2Answer: json['user2_answer']?.toString(),
      currentTurnUserId: json['current_turn_user_id']?.toString(),
    );
  }
}

class Conversation {
  final String id;
  final String matchId;
  final int unreadCount;
  final Message? lastMessage;
  final UserProfile? partner;
  final Spark? originSpark;

  Conversation({
    required this.id,
    required this.matchId,
    this.unreadCount = 0,
    this.lastMessage,
    this.partner,
    this.originSpark,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id']?.toString() ?? '',
      matchId: json['match_id']?.toString() ?? '',
      unreadCount: json['unread_count'] is int ? json['unread_count'] : 0,
      lastMessage: json['last_message'] != null
          ? Message.fromJson(json['last_message'] as Map<String, dynamic>)
          : null,
      partner: json['partner'] != null
          ? UserProfile.fromJson(json['partner'] as Map<String, dynamic>)
          : null,
      originSpark: json['origin_spark'] != null
          ? Spark.fromJson(json['origin_spark'] as Map<String, dynamic>)
          : null,
    );
  }
}
