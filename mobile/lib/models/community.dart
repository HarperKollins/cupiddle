import 'profile.dart';

class PostComment {
  final String id;
  final String postId;
  final String userId;
  final String content;
  final String createdAt;
  final UserProfile? author;

  PostComment({
    required this.id,
    required this.postId,
    required this.userId,
    required this.content,
    required this.createdAt,
    this.author,
  });

  factory PostComment.fromJson(Map<String, dynamic> json) {
    return PostComment(
      id: json['id']?.toString() ?? '',
      postId: json['post_id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      createdAt: json['created_at']?.toString() ?? '',
      author: json['author'] != null ? UserProfile.fromJson(json['author'] as Map<String, dynamic>) : null,
    );
  }
}

class CommunityPost {
  final String id;
  final String communityId;
  final String userId;
  final String title;
  final String content;
  final int commentCount;
  final String createdAt;
  final UserProfile? author;

  CommunityPost({
    required this.id,
    required this.communityId,
    required this.userId,
    required this.title,
    required this.content,
    this.commentCount = 0,
    required this.createdAt,
    this.author,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    return CommunityPost(
      id: json['id']?.toString() ?? '',
      communityId: json['community_id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      commentCount: json['comment_count'] is int ? json['comment_count'] : 0,
      createdAt: json['created_at']?.toString() ?? '',
      author: json['author'] != null ? UserProfile.fromJson(json['author'] as Map<String, dynamic>) : null,
    );
  }
}

class Community {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String category;
  final int memberCount;
  final int postCount;
  final bool isMember;

  Community({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.category,
    this.memberCount = 0,
    this.postCount = 0,
    this.isMember = false,
  });

  factory Community.fromJson(Map<String, dynamic> json) {
    return Community(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      category: json['category']?.toString() ?? 'Curiosity',
      memberCount: json['member_count'] is int ? json['member_count'] : 0,
      postCount: json['post_count'] is int ? json['post_count'] : 0,
      isMember: json['is_member'] == true,
    );
  }
}
