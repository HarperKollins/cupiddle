import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/conversation.dart';
import '../../models/profile.dart';
import '../../services/api_service.dart';
import '../../services/safety_guard.dart';
import '../../widgets/cupiddle_logo.dart';

class ChatRoomScreen extends StatefulWidget {
  final UserProfile currentProfile;
  final String? initialConversationId;

  const ChatRoomScreen({
    super.key,
    required this.currentProfile,
    this.initialConversationId,
  });

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  List<Conversation> _conversations = [];
  String? _selectedConvId;
  List<Message> _messages = [];
  CoopGame? _activeGame;
  Map<String, dynamic>? _radarData;

  bool _isLoadingConvs = true;
  bool _isLoadingMessages = false;
  String? _safetyError;

  final TextEditingController _messageCtrl = TextEditingController();
  final TextEditingController _gameAnswerCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _selectedConvId = widget.initialConversationId;
    _loadConversations().then((_) {
      if (_selectedConvId != null) {
        _selectConversation(_selectedConvId!);
      }
    });
  }

  @override
  void dispose() {
    _messageCtrl.dispose();
    _gameAnswerCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadConversations() async {
    setState(() => _isLoadingConvs = true);
    try {
      final list = await ApiService().getConversations();
      setState(() {
        _conversations = list;
        _isLoadingConvs = false;
      });
    } catch (e) {
      setState(() => _isLoadingConvs = false);
    }
  }

  Future<void> _selectConversation(String convId) async {
    setState(() {
      _selectedConvId = convId;
      _isLoadingMessages = true;
      _safetyError = null;
    });

    try {
      final msgs = await ApiService().getMessages(convId);
      final game = await ApiService().getActiveCoopGame(convId);
      final radar = await ApiService().getConversationRadar(convId);

      setState(() {
        _messages = msgs;
        _activeGame = game;
        _radarData = radar;
        _isLoadingMessages = false;
      });

      _scrollToBottom();
    } catch (e) {
      setState(() => _isLoadingMessages = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOutCubic,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageCtrl.text.trim();
    if (text.isEmpty || _selectedConvId == null) return;

    // Safety guard verification
    final check = SafetyGuard.scanMessage(text);
    if (check.blocked) {
      setState(() => _safetyError = check.reason);
      return;
    }

    setState(() => _safetyError = null);
    _messageCtrl.clear();

    try {
      final newMsg = await ApiService().sendMessage(_selectedConvId!, text);
      setState(() {
        _messages.add(newMsg);
      });
      _scrollToBottom();
    } catch (err) {
      setState(() {
        _safetyError = err.toString().replaceAll('Exception: ', '');
      });
    }
  }

  Future<void> _submitGameAnswer() async {
    if (_activeGame == null || _gameAnswerCtrl.text.trim().isEmpty) return;
    try {
      final updated = await ApiService().submitCoopAnswer(_activeGame!.id, _gameAnswerCtrl.text.trim());
      setState(() {
        _activeGame = updated;
        _gameAnswerCtrl.clear();
      });
    } catch (err) {
      // Ignored
    }
  }

  Future<void> _startGame(String gameType) async {
    if (_selectedConvId == null) return;
    try {
      final game = await ApiService().startCoopGame(_selectedConvId!, gameType);
      setState(() => _activeGame = game);
    } catch (err) {
      // Ignored
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedConvId != null) {
      return _buildActiveThread();
    }
    return _buildConversationsList();
  }

  // --- View 1: Matches / Conversations List ---
  Widget _buildConversationsList() {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                children: [
                  const CupiddleLogo(size: 24),
                  const SizedBox(width: 8),
                  const Text(
                    'Conversations',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppColors.textMuted, size: 20),
                    onPressed: _loadConversations,
                  ),
                ],
              ),
            ),
            Expanded(
              child: _isLoadingConvs
                  ? const Center(child: CircularProgressIndicator(color: AppColors.rose))
                  : _conversations.isEmpty
                      ? _buildEmptyConversations()
                      : ListView.separated(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: _conversations.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final conv = _conversations[index];
                            final partner = conv.partner;
                            final photoUrl = partner?.primaryPhotoUrl ??
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

                            return GestureDetector(
                              onTap: () => _selectConversation(conv.id),
                              child: Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.card,
                                  borderRadius: BorderRadius.circular(18),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 26,
                                          backgroundImage: NetworkImage(photoUrl),
                                        ),
                                        Positioned(
                                          bottom: 1,
                                          right: 1,
                                          child: Container(
                                            width: 12,
                                            height: 12,
                                            decoration: BoxDecoration(
                                              color: AppColors.success,
                                              shape: BoxShape.circle,
                                              border: Border.all(color: AppColors.card, width: 2),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(
                                                '${partner?.displayName ?? 'Match'}, ${partner?.age ?? 20}',
                                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                                              ),
                                              if (conv.unreadCount > 0)
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.rose,
                                                    borderRadius: BorderRadius.circular(10),
                                                  ),
                                                  child: Text(
                                                    '${conv.unreadCount}',
                                                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                                                  ),
                                                ),
                                            ],
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            conv.lastMessage?.content ?? 'Spark connected! Say hello.',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: conv.unreadCount > 0 ? Colors.white : AppColors.textMuted,
                                              fontWeight: conv.unreadCount > 0 ? FontWeight.w600 : FontWeight.w400,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyConversations() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CupiddleLogo(size: 38),
              const SizedBox(height: 14),
              const Text(
                'No Conversations Yet',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Spark intriguing takes in Discovery or accept pending sparks in your inbox to unlock 1-on-1 connections.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- View 2: Active 1-on-1 Thread ---
  Widget _buildActiveThread() {
    final conv = _conversations.firstWhere((c) => c.id == _selectedConvId, orElse: () => _conversations.first);
    final partner = conv.partner;
    final photoUrl = partner?.primaryPhotoUrl ??
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Active Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                color: AppColors.card,
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => setState(() => _selectedConvId = null),
                    icon: const Icon(Icons.arrow_back, color: AppColors.rose, size: 22),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 12),
                  CircleAvatar(radius: 20, backgroundImage: NetworkImage(photoUrl)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${partner?.displayName ?? 'Match'}, ${partner?.age ?? 20}',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        Text(
                          '${partner?.campus ?? 'Campus'} • Active now',
                          style: TextStyle(fontSize: 11, color: AppColors.success, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),

                  // Co-op Launcher Menu
                  PopupMenuButton<String>(
                    icon: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.rose.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.borderRose),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.videogame_asset, size: 14, color: AppColors.rose),
                          SizedBox(width: 4),
                          Text('Co-op', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose)),
                        ],
                      ),
                    ),
                    color: AppColors.cardSecondary,
                    onSelected: _startGame,
                    itemBuilder: (ctx) => [
                      const PopupMenuItem(value: 'logic_riddle', child: Text('🧩 Logic Riddle', style: TextStyle(color: Colors.white, fontSize: 13))),
                      const PopupMenuItem(value: 'would_you_rather', child: Text('⚖️ Would You Rather?', style: TextStyle(color: Colors.white, fontSize: 13))),
                      const PopupMenuItem(value: 'two_truths_lie', child: Text('🎭 Two Truths & a Lie', style: TextStyle(color: Colors.white, fontSize: 13))),
                      const PopupMenuItem(value: 'ai_or_human', child: Text('🤖 AI or Human Prose', style: TextStyle(color: Colors.white, fontSize: 13))),
                    ],
                  ),
                ],
              ),
            ),

            // Spark Origin Context Banner
            if (conv.originSpark != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppColors.burgundy.withOpacity(0.4),
                child: Text(
                  'Spark: "${conv.originSpark!.comment}"',
                  style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                ),
              ),

            // Radar Topic Suggestion Banner
            if (_radarData != null && (_radarData!['suggestions'] as List?)?.isNotEmpty == true)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                color: AppColors.cardSecondary,
                child: Row(
                  children: [
                    const Icon(Icons.explore_outlined, size: 13, color: AppColors.rose),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Radar Suggestion: ${(_radarData!['suggestions'] as List).first}',
                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

            // Co-op Game Box (if active)
            if (_activeGame != null && _activeGame!.status == 'in_progress')
              Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.cardTertiary,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderRose, width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('🎮 CO-OP: ${_activeGame!.title}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose)),
                        Text('Turn in progress', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _activeGame!.promptData,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _gameAnswerCtrl,
                            style: const TextStyle(fontSize: 12, color: Colors.white),
                            decoration: InputDecoration(
                              hintText: 'Submit your answer...',
                              hintStyle: TextStyle(fontSize: 11, color: AppColors.textMuted),
                              filled: true,
                              fillColor: AppColors.canvas,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: _submitGameAnswer,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text('Send', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

            // Messages List
            Expanded(
              child: _isLoadingMessages
                  ? const Center(child: CircularProgressIndicator(color: AppColors.rose))
                  : ListView.builder(
                      controller: _scrollCtrl,
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length,
                      itemBuilder: (context, index) {
                        final msg = _messages[index];
                        final isMine = msg.senderId == widget.currentProfile.userId;

                        return Align(
                          alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                            decoration: BoxDecoration(
                              gradient: isMine ? AppColors.primaryGradient : null,
                              color: isMine ? null : AppColors.cardSecondary,
                              borderRadius: BorderRadius.only(
                                topLeft: const Radius.circular(18),
                                topRight: const Radius.circular(18),
                                bottomLeft: Radius.circular(isMine ? 18 : 4),
                                bottomRight: Radius.circular(isMine ? 4 : 18),
                              ),
                              border: isMine ? null : Border.all(color: AppColors.borderRose.withOpacity(0.4)),
                            ),
                            child: Text(
                              msg.content,
                              style: const TextStyle(fontSize: 14, color: Colors.white, height: 1.4),
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Safety Alert Error Banner
            if (_safetyError != null)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.shield, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _safetyError!,
                        style: const TextStyle(fontSize: 11, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),

            // Message Input Dock
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                color: AppColors.card,
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _messageCtrl,
                      onSubmitted: (_) => _sendMessage(),
                      style: const TextStyle(fontSize: 14, color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'Share a late night thought...',
                        hintStyle: TextStyle(fontSize: 13, color: AppColors.textMuted),
                        filled: true,
                        fillColor: AppColors.cardSecondary,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(20), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _sendMessage,
                    child: Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(Icons.send, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
