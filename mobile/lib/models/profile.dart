class ProfilePhoto {
  final String id;
  final String url;
  final bool isPrimary;
  final int order;

  ProfilePhoto({
    required this.id,
    required this.url,
    this.isPrimary = false,
    this.order = 0,
  });

  factory ProfilePhoto.fromJson(dynamic json) {
    if (json is! Map) {
      return ProfilePhoto(
        id: '',
        url: json?.toString() ?? '',
        isPrimary: false,
        order: 0,
      );
    }
    return ProfilePhoto(
      id: json['id']?.toString() ?? '',
      url: json['url']?.toString() ?? '',
      isPrimary: json['is_primary'] == true,
      order: json['sort_order'] is int
          ? json['sort_order']
          : (json['order'] is int ? json['order'] : 0),
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
  final String verificationBadge;
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
    this.verificationBadge = '',
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

  factory UserProfile.fromJson(dynamic json) {
    if (json is! Map) {
      return UserProfile(
        id: '',
        userId: '',
        displayName: 'Student',
        age: 20,
      );
    }

    final map = Map<String, dynamic>.from(json as Map);

    List<ProfilePhoto> parsedPhotos = [];
    if (map['photos'] is List) {
      for (final p in (map['photos'] as List)) {
        if (p is Map) {
          parsedPhotos.add(ProfilePhoto.fromJson(Map<String, dynamic>.from(p)));
        } else if (p != null) {
          parsedPhotos.add(ProfilePhoto.fromJson(p));
        }
      }
    }

    List<String> parsedTags = [];
    if (map['my_world_tags'] is List) {
      for (final t in (map['my_world_tags'] as List)) {
        if (t != null) {
          parsedTags.add(t.toString());
        }
      }
    }

    return UserProfile(
      id: map['id']?.toString() ?? map['user_id']?.toString() ?? '',
      userId: map['user_id']?.toString() ?? map['id']?.toString() ?? '',
      displayName: map['display_name']?.toString() ?? 'Curious Student',
      username: map['username']?.toString(),
      age: map['age'] is int ? map['age'] : (int.tryParse(map['age']?.toString() ?? '20') ?? 20),
      gender: map['gender']?.toString(),
      bio: map['bio']?.toString(),
      city: map['city']?.toString() ?? 'Nigeria',
      campus: map['campus']?.toString() ?? 'EBSU',
      faculty: map['faculty']?.toString(),
      department: map['department']?.toString(),
      level: map['level']?.toString(),
      isStudentVerified: map['is_student_verified'] == true || map['is_verified'] == true,
      verificationBadge: map['verification_badge']?.toString() ?? '',
      vibeTag: map['vibe_tag']?.toString(),
      gateQuestion: map['gate_question']?.toString(),
      datingIntentions: map['dating_intentions']?.toString(),
      rabbitHole: map['rabbit_hole']?.toString(),
      defendTake: map['defend_take']?.toString(),
      teachMe: map['teach_me']?.toString(),
      myWorldTags: parsedTags,
      photos: parsedPhotos,
      dimensionScores: map['dimension_scores'] is Map ? Map<String, dynamic>.from(map['dimension_scores'] as Map) : null,
      matchPercentage: map['match_percentage'] is num ? (map['match_percentage'] as num).toDouble() : null,
      distanceKm: map['distance_km'] is num ? (map['distance_km'] as num).toDouble() : null,
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
