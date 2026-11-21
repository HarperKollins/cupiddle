import 'profile.dart';

class Spark {
  final String id;
  final String senderId;
  final String receiverId;
  final String targetType; // 'prompt', 'photo', 'profile', 'community_post'
  final String targetId;
  final String targetContent;
  final String comment;
  final String? gateAnswer;
  final String status; // 'pending', 'accepted', 'rejected'
  final String createdAt;
  final UserProfile? sender;
  final UserProfile? receiver;

  Spark({
    required this.id,
    required this.senderId,
    required this.receiverId,
    required this.targetType,
    required this.targetId,
    required this.targetContent,
    required this.comment,
    this.gateAnswer,
    required this.status,
    required this.createdAt,
    this.sender,
    this.receiver,
  });

  factory Spark.fromJson(Map<String, dynamic> json) {
    return Spark(
      id: json['id']?.toString() ?? '',
      senderId: json['sender_id']?.toString() ?? '',
      receiverId: json['receiver_id']?.toString() ?? '',
      targetType: json['target_type']?.toString() ?? 'profile',
      targetId: json['target_id']?.toString() ?? '',
      targetContent: json['target_content']?.toString() ?? '',
      comment: json['comment']?.toString() ?? '',
      gateAnswer: json['gate_answer']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      createdAt: json['created_at']?.toString() ?? '',
      sender: json['sender'] != null ? UserProfile.fromJson(json['sender'] as Map<String, dynamic>) : null,
      receiver: json['receiver'] != null ? UserProfile.fromJson(json['receiver'] as Map<String, dynamic>) : null,
    );
  }
}
