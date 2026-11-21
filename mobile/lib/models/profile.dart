class ProfilePhoto {
  final String id;
  final String url;
  final bool isPrimary;
  final int order;

  ProfilePhoto({
    required this.id,
    required this.url,
    required this.isPrimary,
    required this.order,
  });

  factory ProfilePhoto.fromJson(Map<String, dynamic> json) {
    return ProfilePhoto(
      id: json['id']?.toString() ?? '',
      url: json['url']?.toString() ?? '',
      isPrimary: json['is_primary'] == true,
      order: json['order'] is int ? json['order'] : 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'url': url,
    'is_primary': isPrimary,
    'order': order,
  };
}

class UserProfile {
  final String id;
  final String userId;
  final String displayName;
  final String? username;
  final int age;
  final String? gender;
  final String? bio;
  final String? city;
  final String? campus;
  final String? faculty;
  final String? department;
  final String? level;
  final bool isStudentVerified;
  final String? vibeTag;
  final String? gateQuestion;
  final String? datingIntentions;
  final String? rabbitHole;
  final String? defendTake;
  final String? teachMe;
  final List<String> myWorldTags;
  final List<ProfilePhoto> photos;
  final Map<String, dynamic>? dimensionScores;
  final double? matchPercentage;
  final double? distanceKm;

  UserProfile({
    required this.id,
    required this.userId,
    required this.displayName,
    this.username,
    required this.age,
    this.gender,
    this.bio,
    this.city,
    this.campus,
    this.faculty,
    this.department,
    this.level,
    this.isStudentVerified = false,
    this.vibeTag,
    this.gateQuestion,
    this.datingIntentions,
    this.rabbitHole,
    this.defendTake,
    this.teachMe,
    this.myWorldTags = const [],
    this.photos = const [],
    this.dimensionScores,
    this.matchPercentage,
    this.distanceKm,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    List<ProfilePhoto> parsedPhotos = [];
    if (json['photos'] is List) {
      parsedPhotos = (json['photos'] as List)
          .map((p) => ProfilePhoto.fromJson(p as Map<String, dynamic>))
          .toList();
    }

    List<String> parsedTags = [];
    if (json['my_world_tags'] is List) {
      parsedTags = (json['my_world_tags'] as List).map((t) => t.toString()).toList();
    }

    return UserProfile(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      displayName: json['display_name']?.toString() ?? 'Curious Student',
      username: json['username']?.toString(),
      age: json['age'] is int ? json['age'] : (int.tryParse(json['age']?.toString() ?? '20') ?? 20),
      gender: json['gender']?.toString(),
      bio: json['bio']?.toString(),
      city: json['city']?.toString() ?? 'Nigeria',
      campus: json['campus']?.toString() ?? 'EBSU',
      faculty: json['faculty']?.toString(),
      department: json['department']?.toString(),
      level: json['level']?.toString(),
      isStudentVerified: json['is_student_verified'] == true,
      vibeTag: json['vibe_tag']?.toString(),
      gateQuestion: json['gate_question']?.toString(),
      datingIntentions: json['dating_intentions']?.toString(),
      rabbitHole: json['rabbit_hole']?.toString(),
      defendTake: json['defend_take']?.toString(),
      teachMe: json['teach_me']?.toString(),
      myWorldTags: parsedTags,
      photos: parsedPhotos,
      dimensionScores: json['dimension_scores'] is Map<String, dynamic> ? json['dimension_scores'] : null,
      matchPercentage: json['match_percentage'] is num ? (json['match_percentage'] as num).toDouble() : null,
      distanceKm: json['distance_km'] is num ? (json['distance_km'] as num).toDouble() : null,
    );
  }

  String get primaryPhotoUrl {
    if (photos.isNotEmpty) {
      final hero = photos.firstWhere((p) => p.isPrimary, orElse: () => photos.first);
      return hero.url;
    }
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  }
}
