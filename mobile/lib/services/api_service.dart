import 'dart:convert';
import 'dart:typed_data';
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

  // --- ONBOARDING & PROFILE SETUP ---
  Future<UserProfile> completeOnboarding({
    required String campus,
    required String faculty,
    required String department,
    required String level,
    required String datingIntentions,
    required String gateQuestion,
    required String vibeTag,
    String? bio,
    required Map<String, int> dimensionScores,
    String? photoUrl,
  }) async {
    // 1. Update Profile (Identity, Academic, Intention, Gate Question, Vibe Tag)
    final profilePayload = <String, dynamic>{
      'campus': campus,
      'faculty': faculty,
      'department': department,
      'level': level,
      'dating_intentions': datingIntentions,
      'gate_question': gateQuestion,
      'vibe_tag': vibeTag,
      if (bio != null && bio.isNotEmpty) 'bio': bio,
    };
    UserProfile updated = await updateProfile(profilePayload);

    // 2. Update Lifestyle Dimensions
    final lifestyleMap = <String, double>{};
    dimensionScores.forEach((k, v) {
      lifestyleMap[k] = v.toDouble();
    });
    try {
      await updateLifestyle(lifestyleMap);
    } catch (_) {}

    // 3. Register Primary Photo if provided
    if (photoUrl != null && photoUrl.isNotEmpty) {
      try {
        await addPhoto(photoUrl, true);
      } catch (_) {}
    }

    // 4. Return refreshed profile from server
    try {
      final me = await getMe();
      if (me.containsKey('profile') && me['profile'] != null) {
        return UserProfile.fromJson(me['profile']);
      }
    } catch (_) {}
    return updated;
  }

  // --- PHOTO UPLOAD (MULTIPART) ---
  Future<String> uploadPhoto(Uint8List bytes, String filename) async {
    final uri = Uri.parse('$_baseUrl/media/photo');
    final request = http.MultipartRequest('POST', uri);
    if (_token != null && _token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $_token';
    }
    final safeName = filename.isNotEmpty ? filename : 'portrait.jpg';
    request.files.add(
      http.MultipartFile.fromBytes(
        'photo',
        bytes,
        filename: safeName,
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final rawUrl = data is Map ? (data['url']?.toString() ?? '') : '';
      if (rawUrl.isEmpty) {
        throw Exception(data is Map && data['error'] != null
            ? data['error'].toString()
            : 'Server did not return photo URL');
      }
      if (rawUrl.startsWith('http')) {
        return rawUrl;
      }
      final hostRoot = _baseUrl.replaceAll(RegExp(r'/api/?$'), '');
      return '$hostRoot$rawUrl';
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err is Map && err['error'] != null
          ? err['error'].toString()
          : 'Failed to upload photo (${response.statusCode})');
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
    final url = Uri.parse('$_baseUrl/sparks/inbox');
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
    final action = (status.toLowerCase() == 'accepted' || status.toLowerCase() == 'accept') ? 'accept' : 'pass';
    final url = Uri.parse('$_baseUrl/sparks/$sparkId/$action');
    final response = await http.post(
      url,
      headers: _headers(),
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
    final url = Uri.parse('$_baseUrl/conversations/messages/$messageId/reactions');
    await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({'emoji': emoji}),
    );
  }

  // --- CO-OP CORNER GAMES ---
  Future<CoopGame?> getActiveCoopGame(String conversationId) async {
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/games/active');
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
    final url = Uri.parse('$_baseUrl/conversations/$conversationId/games');
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
    final url = Uri.parse('$_baseUrl/games/$gameId/answer');
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
      final data = jsonDecode(response.body);
      final profileJson = (data is Map && data.containsKey('profile') && data['profile'] != null)
          ? data['profile']
          : data;
      return UserProfile.fromJson(profileJson);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err is Map && err['error'] != null
          ? err['error'].toString()
          : 'Failed to update profile (${response.statusCode})');
    }
  }

  Future<UserProfile> updateCuriosity(Map<String, dynamic> body) async {
    final url = Uri.parse('$_baseUrl/profile/curiosity');
    final response = await http.put(url, headers: _headers(), body: jsonEncode(body));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = jsonDecode(response.body);
      final profileJson = (data is Map && data.containsKey('profile') && data['profile'] != null)
          ? data['profile']
          : data;
      return UserProfile.fromJson(profileJson);
    } else {
      final err = jsonDecode(response.body);
      throw Exception(err is Map && err['error'] != null
          ? err['error'].toString()
          : 'Failed to update curiosity (${response.statusCode})');
    }
  }

  Future<void> updateLifestyle(Map<String, double> lifestyle, [List<double>? valuesVector, int? cgpaTier]) async {
    final url = Uri.parse('$_baseUrl/profile/lifestyle');
    final body = {
      'lifestyle': lifestyle,
      if (valuesVector != null) 'values_vector': valuesVector,
      if (cgpaTier != null) 'cgpa_tier': cgpaTier,
    };
    final response = await http.put(url, headers: _headers(), body: jsonEncode(body));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final err = jsonDecode(response.body);
      throw Exception(err['error'] ?? 'Failed to update lifestyle');
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
  Future<Map<String, dynamic>> verifyStudent({
    required String method, // 'nin', 'jamb', 'rrr'
    required String identifier,
    required String campus,
  }) async {
    Uri url;
    Map<String, dynamic> payload;

    final cleanId = identifier.trim();
    final lowerMethod = method.toLowerCase();

    if (lowerMethod == 'rrr' || lowerMethod == 'remita') {
      url = Uri.parse('$_baseUrl/verify/remita');
      payload = {'rrr': cleanId.replaceAll('-', '').replaceAll(' ', '')};
    } else if (lowerMethod == 'jamb') {
      url = Uri.parse('$_baseUrl/verify/jamb');
      payload = {'jamb_reg_no': cleanId.toUpperCase()};
    } else if (lowerMethod == 'nin') {
      url = Uri.parse('$_baseUrl/verify/nin-slip');
      payload = {'nin': cleanId.replaceAll(' ', ''), 'match_score': 0.85};
    } else {
      throw Exception('Unsupported verification method: $method');
    }

    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode(payload),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final err = jsonDecode(response.body);
        throw Exception(err['error'] ?? 'Verification check failed');
      } catch (e) {
        if (e is Exception && !e.toString().contains('FormatException')) rethrow;
        throw Exception('Verification check failed (status ${response.statusCode})');
      }
    }

    try {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return {'success': true, 'message': 'Verification approved!'};
    }
  }

  Future<Map<String, dynamic>> vouchPeer({
    required String targetUsername,
    required String campus,
    String? note,
  }) async {
    final url = Uri.parse('$_baseUrl/verify/vouch');
    final cleanHandle = targetUsername.trim().toLowerCase().replaceAll('@', '');
    final response = await http.post(
      url,
      headers: _headers(),
      body: jsonEncode({
        'target_username': cleanHandle,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final err = jsonDecode(response.body);
        throw Exception(err['error'] ?? 'Peer vouch failed');
      } catch (e) {
        if (e is Exception && !e.toString().contains('FormatException')) rethrow;
        throw Exception('Peer vouch failed (status ${response.statusCode})');
      }
    }

    try {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return {'success': true, 'message': 'Vouch recorded successfully.'};
    }
  }
}
