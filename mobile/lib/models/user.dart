import 'profile.dart';

class User {
  final String id;
  final String email;
  final String role;
  final bool isEmailVerified;
  final bool hasCompletedOnboarding;
  final String createdAt;

  User({
    required this.id,
    required this.email,
    this.role = 'user',
    this.isEmailVerified = false,
    this.hasCompletedOnboarding = false,
    required this.createdAt,
  });

  factory User.fromJson(dynamic json) {
    if (json is! Map) {
      return User(
        id: '',
        email: '',
        role: 'user',
        isEmailVerified: false,
        hasCompletedOnboarding: false,
        createdAt: '',
      );
    }
    final map = Map<String, dynamic>.from(json as Map);
    return User(
      id: map['id']?.toString() ?? '',
      email: map['email']?.toString() ?? '',
      role: map['role']?.toString() ?? 'user',
      isEmailVerified: map['email_verified'] == true || map['is_email_verified'] == true,
      hasCompletedOnboarding: map['has_completed_onboarding'] == true ||
          (map['campus'] != null && map['campus'].toString().isNotEmpty && map['faculty'] != null && map['faculty'].toString().isNotEmpty),
      createdAt: map['created_at']?.toString() ?? '',
    );
  }
}

class AuthResponse {
  final String token;
  final User user;
  final UserProfile profile;

  AuthResponse({
    required this.token,
    required this.user,
    required this.profile,
  });

  factory AuthResponse.fromJson(dynamic json) {
    if (json is! Map) {
      return AuthResponse(
        token: '',
        user: User.fromJson(null),
        profile: UserProfile.fromJson(null),
      );
    }
    final map = Map<String, dynamic>.from(json as Map);
    return AuthResponse(
      token: map['token']?.toString() ?? '',
      user: User.fromJson(map['user']),
      profile: UserProfile.fromJson(map['profile']),
    );
  }
}
