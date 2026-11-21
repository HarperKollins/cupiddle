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

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
      isEmailVerified: json['is_email_verified'] == true,
      hasCompletedOnboarding: json['has_completed_onboarding'] == true,
      createdAt: json['created_at']?.toString() ?? '',
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

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token']?.toString() ?? '',
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      profile: UserProfile.fromJson(json['profile'] as Map<String, dynamic>),
    );
  }
}
