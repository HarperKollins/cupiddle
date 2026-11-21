import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/profile.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';
import 'feed/idea_stream_screen.dart';
import 'communities/communities_screen.dart';
import 'sparks/sparks_inbox_screen.dart';
import 'chat/chat_room_screen.dart';
import 'profile/profile_screen.dart';

class MainShell extends StatefulWidget {
  final User user;
  final UserProfile initialProfile;
  final VoidCallback onLogout;

  const MainShell({
    super.key,
    required this.user,
    required this.initialProfile,
    required this.onLogout,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  late UserProfile _currentProfile;
  int _pendingSparksCount = 0;
  int _unreadMessagesCount = 0;

  @override
  void initState() {
    super.initState();
    _currentProfile = widget.initialProfile;
    _refreshBadges();

    // Connect WebSocket for real-time notifications
    final token = ApiService().token;
    if (token != null) {
      WebSocketService().connect(token);
      WebSocketService().events.listen((event) {
        if (event.type == 'new_message' || event.type == 'new_spark') {
          _refreshBadges();
        }
      });
    }
  }

  Future<void> _refreshBadges() async {
    try {
      final sparks = await ApiService().getReceivedSparks();
      final convs = await ApiService().getConversations();

      if (mounted) {
        setState(() {
          _pendingSparksCount = sparks.where((s) => s.status == 'pending').length;
          _unreadMessagesCount = convs.fold<int>(0, (sum, c) => sum + c.unreadCount);
        });
      }
    } catch (_) {
      // Ignored
    }
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      IdeaStreamScreen(
        currentProfile: _currentProfile,
        onOpenProfile: () => setState(() => _currentIndex = 4),
      ),
      CommunitiesScreen(
        currentProfile: _currentProfile,
      ),
      SparksInboxScreen(
        onRefreshCount: _refreshBadges,
        onOpenChat: (convId) => setState(() => _currentIndex = 3),
      ),
      ChatRoomScreen(
        currentProfile: _currentProfile,
      ),
      ProfileScreen(
        profile: _currentProfile,
        onProfileUpdated: (updated) => setState(() => _currentProfile = updated),
        onLogout: widget.onLogout,
      ),
    ];

    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.card,
          border: const Border(
            top: BorderSide(color: AppColors.border, width: 1.0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.local_fire_department_outlined, Icons.local_fire_department_rounded, 'Discover'),
                _buildNavItem(1, Icons.explore_outlined, Icons.explore_rounded, 'Campus'),
                _buildNavItem(2, Icons.bolt_outlined, Icons.bolt_rounded, 'Matches', badgeCount: _pendingSparksCount),
                _buildNavItem(3, Icons.chat_bubble_outline, Icons.chat_bubble_rounded, 'Chats', badgeCount: _unreadMessagesCount),
                _buildNavItem(4, Icons.person_outline, Icons.person_rounded, 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData unselectedIcon, IconData selectedIcon, String label, {int badgeCount = 0}) {
    final isSelected = _currentIndex == index;

    return GestureDetector(
      onTap: () {
        setState(() => _currentIndex = index);
        _refreshBadges();
      },
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.rose.withOpacity(0.18) : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    isSelected ? selectedIcon : unselectedIcon,
                    color: isSelected ? AppColors.rose : AppColors.textMuted,
                    size: 22,
                  ),
                ),
                if (badgeCount > 0)
                  Positioned(
                    top: -2,
                    right: -2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.rose,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '$badgeCount',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                color: isSelected ? AppColors.rose : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
