import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/config.dart';
import '../models/user.dart';
import '../models/profile.dart';
import '../models/spark.dart';
import '../models/conversation.dart';
import '../models/community.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String _baseUrl = AppConfig.defaultBaseUrl;
  String? _token;

  String get baseUrl => _baseUrl;
  String? get token => _token;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<void> setToken(String? token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    if (token != null) {
      await prefs.setString('auth_token', token);
    } else {
      await prefs.remove('auth_token');
    }
  }

  Map<String, String> _headers([bool isJson = true]) {
    final headers = <String, String>{};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  // --- AUTHENTICATION ---
  Future<AuthResponse> register({
    required String email,
    required String password,
    required String displayName,
    required String birthdate,
    required String campus,
    String? username,
    String? city,
  }) async {
    final url = Uri.parse('$_baseUrl/auth/register');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'email': email.trim().toLowerCase(),
        'password': password,
        'display_name': displayName.trim(),
        'birthdate': birthdate,
        'campus': campus,
        if (username != null && username.isNotEmpty) 'username': username.trim().toLowerCase(),
        if (city != null && city.isNotEmpty) 'city': city,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final auth = AuthResponse.fromJson(data);
      await setToken(auth.token);
      return auth;
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Registration failed (${response.statusCode})');
    }
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse('$_baseUrl/auth/login');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'email': email.trim().toLowerCase(),
        'password': password,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final auth = AuthResponse.fromJson(data);
      await setToken(auth.token);
      return auth;
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Login failed (${response.statusCode})');
    }
  }

  Future<Map<String, dynamic>> getMe() async {
    final url = Uri.parse('$_baseUrl/auth/me');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } else {
      throw Exception('Failed to fetch user session');
    }
  }

  // --- ONBOARDING ---
  Future<UserProfile> completeOnboarding({
    required String rabbitHole,
    required String defendTake,
    required String teachMe,
    required List<String> myWorldTags,
    required Map<String, int> dimensionScores,
    required String campus,
    required String level,
    required String faculty,
    required String gateQuestion,
    required String vibeTag,
    String? photoUrl,
  }) async {
    final url = Uri.parse('$_baseUrl/onboarding/complete');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'rabbit_hole': rabbitHole,
        'defend_take': defendTake,
        'teach_me': teachMe,
        'my_world_tags': myWorldTags,
        'dimension_scores': dimensionScores,
        'campus': campus,
        'level': level,
        'faculty': faculty,
        'gate_question': gateQuestion,
        'vibe_tag': vibeTag,
        if (photoUrl != null) 'photo_url': photoUrl,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      return UserProfile.fromJson(data['profile'] as Map<String, dynamic>);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Onboarding failed');
    }
  }

  // --- FEED & DISCOVERY ---
  Future<List<UserProfile>> getDiscoveryStream({String? vibeTag}) async {
    String endpoint = '$_baseUrl/feed';
    if (vibeTag != null && vibeTag.isNotEmpty) {
      endpoint += '?vibe=${Uri.encodeComponent(vibeTag)}';
    }
    final url = Uri.parse(endpoint);
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['profiles'] as List? ?? [];
      return list.map((p) => UserProfile.fromJson(p as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  // --- SPARKS ---
  Future<Spark> sendSpark({
    required String receiverId,
    required String targetType,
    required String targetId,
    required String targetContent,
    required String comment,
    String? gateAnswer,
  }) async {
    final url = Uri.parse('$_baseUrl/sparks');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'receiver_id': receiverId,
        'target_type': targetType,
        'target_id': targetId,
        'target_content': targetContent,
        'comment': comment,
        if (gateAnswer != null) 'gate_answer': gateAnswer,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      return Spark.fromJson(data['spark'] as Map<String, dynamic>);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to send spark');
    }
  }

  Future<List<Spark>> getReceivedSparks() async {
    final url = Uri.parse('$_baseUrl/sparks/received');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['sparks'] as List? ?? [];
      return list.map((s) => Spark.fromJson(s as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<void> respondSpark(String sparkId, String status) async {
    final url = Uri.parse('$_baseUrl/sparks/$sparkId/respond');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'status': status}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to respond to spark');
    }
  }

  // --- CONVERSATIONS & CHAT ---
  Future<List<Conversation>> getConversations() async {
    final url = Uri.parse('$_baseUrl/conversations');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['conversations'] as List? ?? [];
      return list.map((c) => Conversation.fromJson(c as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<List<Message>> getMessages(String conversationId) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/messages');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['messages'] as List? ?? [];
      return list.map((m) => Message.fromJson(m as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<Message> sendMessage(String conversationId, String content) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/messages');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'content': content}),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      return Message.fromJson(data['message'] as Map<String, dynamic>);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to send message');
    }
  }

  Future<void> addReaction(String messageId, String emoji) async {
    final url = Uri.parse('$_baseUrl/messages/$messageId/reactions');
    await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'emoji': emoji}),
    );
  }

  // --- CO-OP CORNER GAMES ---
  Future<CoopGame?> getActiveCoopGame(String conversationId) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/coop-game');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      if (data['active_game'] != null) {
        return CoopGame.fromJson(data['active_game'] as Map<String, dynamic>);
      }
    }
    return null;
  }

  Future<CoopGame> startCoopGame(String conversationId, String gameType) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/coop-game');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'game_type': gameType}),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      return CoopGame.fromJson(data['game'] as Map<String, dynamic>);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to start co-op challenge');
    }
  }

  Future<CoopGame> submitCoopAnswer(String gameId, String answer) async {
    final url = Uri.parse('$_baseUrl/coop-games/$gameId/turn');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'answer': answer}),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      return CoopGame.fromJson(data['game'] as Map<String, dynamic>);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to submit turn');
    }
  }

  // --- RADAR SUGGESTIONS ---
  Future<Map<String, dynamic>?> getConversationRadar(String conversationId) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/radar');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    return null;
  }

  // --- COMMUNITIES (RABBIT HOLES) ---
  Future<List<Community>> getCommunities() async {
    final url = Uri.parse('$_baseUrl/communities');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['communities'] as List? ?? [];
      return list.map((c) => Community.fromJson(c as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<List<CommunityPost>> getCommunityPosts(String slug) async {
    final url = Uri.parse('$_baseUrl/communities/$slug/posts');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['posts'] as List? ?? [];
      return list.map((p) => CommunityPost.fromJson(p as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<Community> createCommunity({
    required String name,
    required String description,
    required String category,
  }) async {
    final url = Uri.parse('$_baseUrl/communities');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'name': name.trim(),
        'description': description.trim(),
        'category': category.trim(),
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Community.fromJson(jsonDecode(response.body));
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to create community');
    }
  }

  Future<CommunityPost> createPost(String slug, String title, String content) async {
    final url = Uri.parse('$_baseUrl/communities/$slug/posts');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'title': title.trim(),
        'content': content.trim(),
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return CommunityPost.fromJson(jsonDecode(response.body));
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to create post');
    }
  }

  Future<void> joinCommunity(String slug) async {
    final url = Uri.parse('$_baseUrl/communities/$slug/join');
    await http.post(url, headers: _headers());
  }

  Future<void> leaveCommunity(String slug) async {
    final url = Uri.parse('$_baseUrl/communities/$slug/leave');
    await http.post(url, headers: _headers());
  }

  Future<List<PostComment>> getPostComments(String postId) async {
    final url = Uri.parse('$_baseUrl/posts/$postId/comments');
    final response = await http.get(url, headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final list = data['comments'] as List? ?? [];
      return list.map((c) => PostComment.fromJson(c as Map<String, dynamic>)).toList();
    } else {
      return [];
    }
  }

  Future<PostComment> addComment(String postId, String content) async {
    final url = Uri.parse('$_baseUrl/posts/$postId/comments');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'content': content.trim()}),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return PostComment.fromJson(jsonDecode(response.body));
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to post reply');
    }
  }

  // --- PROFILE MANAGEMENT ---
  Future<UserProfile> updateProfile(Map<String, dynamic> body) async {
    final url = Uri.parse('$_baseUrl/profile');
    final response = await http.put(url, headers: _headers(), body: jsonEncode(body));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return UserProfile.fromJson(jsonDecode(response.body)['profile']);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to update profile');
    }
  }

  Future<UserProfile> updateCuriosity(Map<String, dynamic> body) async {
    final url = Uri.parse('$_baseUrl/profile/curiosity');
    final response = await http.put(url, headers: _headers(), body: jsonEncode(body));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return UserProfile.fromJson(jsonDecode(response.body)['profile']);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to update curiosity');
    }
  }

  Future<void> addPhoto(String url, [bool isPrimary = false]) async {
    final target = Uri.parse('$_baseUrl/profile/photos');
    await http.post(
      target,
      headers: _headers(),
      body: jsonEncode({'url': url, 'is_primary': isPrimary}),
    );
  }

  Future<void> deletePhoto(String photoId) async {
    final target = Uri.parse('$_baseUrl/profile/photos/$photoId');
    await http.delete(target, headers: _headers());
  }

  // --- VERIFICATION (₦0 NIGERIAN CAMPUS) ---
  Future<void> verifyStudent({
    required String method, // 'nin', 'jamb', 'rrr'
    required String identifier,
    required String campus,
  }) async {
    final url = Uri.parse('$_baseUrl/student-verification/verify');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'method': method,
        'identifier': identifier.trim(),
        'campus': campus,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Verification check failed');
    }
  }

  Future<void> vouchPeer({
    required String targetUsername,
    required String campus,
    String? note,
  }) async {
    final url = Uri.parse('$_baseUrl/student-verification/vouch');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'target_username': targetUsername.trim().toLowerCase(),
        'campus': campus,
        'note': note ?? 'Verified coursemate',
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Peer vouch failed');
    }
  }
}
