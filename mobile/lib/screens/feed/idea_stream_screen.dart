import 'dart:ui';
import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/profile.dart';
import '../../services/api_service.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/mood_tag_selector.dart';
import '../../widgets/spark_modal.dart';

class IdeaStreamScreen extends StatefulWidget {
  final UserProfile currentProfile;
  final VoidCallback onOpenProfile;

  const IdeaStreamScreen({
    super.key,
    required this.currentProfile,
    required this.onOpenProfile,
  });

  @override
  State<IdeaStreamScreen> createState() => _IdeaStreamScreenState();
}

class _IdeaStreamScreenState extends State<IdeaStreamScreen> {
  List<UserProfile> _profiles = [];
  bool _isLoading = true;
  String? _selectedVibe;
  bool _blurPortraits = false; // Silhouette blur mode

  @override
  void initState() {
    super.initState();
    _loadStream();
  }

  Future<void> _loadStream() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService().getDiscoveryStream(vibeTag: _selectedVibe);
      // Filter out self
      setState(() {
        _profiles = list.where((p) => p.userId != widget.currentProfile.userId).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _handleSpark(UserProfile target, String targetType, String targetId, String targetContent) {
    SparkModal.show(
      context,
      profile: target,
      targetType: targetType,
      targetId: targetId,
      targetContent: targetContent,
      onSendSpark: (comment, gateAnswer) async {
        try {
          await ApiService().sendSpark(
            receiverId: target.userId,
            targetType: targetType,
            targetId: targetId,
            targetContent: targetContent,
            comment: comment,
            gateAnswer: gateAnswer,
          );
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Spark sent to ${target.displayName}!'),
                backgroundColor: AppColors.rose,
              ),
            );
            // Move to next card
            setState(() {
              _profiles.removeWhere((p) => p.id == target.id);
            });
          }
        } catch (err: any) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(err.toString().replaceAll('Exception: ', '')),
                backgroundColor: AppColors.error,
              ),
            );
          }
        }
      },
    );
  }

  void _handlePass(UserProfile target) {
    setState(() {
      _profiles.removeWhere((p) => p.id == target.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  const CupiddleLogo(size: 26, showText: true),
                  const Spacer(),
                  // Silhouette blur toggle
                  GestureDetector(
                    onTap: () => setState(() => _blurPortraits = !_blurPortraits),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _blurPortraits ? AppColors.rose.withOpacity(0.18) : AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _blurPortraits ? AppColors.rose : AppColors.border),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _blurPortraits ? Icons.visibility_off : Icons.visibility,
                            size: 14,
                            color: _blurPortraits ? AppColors.rose : AppColors.textMuted,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _blurPortraits ? 'Silhouette' : 'Unblurred',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: _blurPortraits ? AppColors.rose : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Campus Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.rose.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderRose),
                    ),
                    child: Text(
                      widget.currentProfile.campus ?? 'EBSU',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose),
                    ),
                  ),
                ],
              ),
            ),

            // Campus Vibe Quick Filter
            Padding(
              padding: const EdgeInsets.only(left: 20, bottom: 12),
              child: MoodTagSelector(
                selectedTag: _selectedVibe,
                onSelectTag: (vibe) {
                  setState(() => _selectedVibe = _selectedVibe == vibe ? null : vibe);
                  _loadStream();
                },
              ),
            ),

            // Card Deck Stream
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.rose),
                    )
                  : _profiles.isEmpty
                      ? _buildEmptyState()
                      : ListView.separated(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                          itemCount: _profiles.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 24),
                          itemBuilder: (context, index) {
                            final target = _profiles[index];
                            return _buildProfileCard(target);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.borderRose, width: 1.2),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CupiddleLogo(size: 40),
              const SizedBox(height: 14),
              const Text(
                'All Campus Sparks Explored',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'You\'ve seen all current campus profiles matching your criteria. Check back soon or change your vibe filter!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
              ),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: () {
                  setState(() => _selectedVibe = null);
                  _loadStream();
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Text('Refresh Discovery Feed', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(UserProfile target) {
    final matchScore = target.matchPercentage != null ? (target.matchPercentage! * 100).round() : 88;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.borderRose, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Hero Portrait with Silhouette Blur Support
          Stack(
            children: [
              Container(
                height: 380,
                width: double.infinity,
                decoration: BoxDecoration(
                  image: DecorationImage(
                    image: NetworkImage(target.primaryPhotoUrl),
                    fit: BoxFit.cover,
                  ),
                ),
                child: _blurPortraits
                    ? BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                        child: Container(color: Colors.black.withOpacity(0.2)),
                      )
                    : null,
              ),

              // Bottom gradient shadow
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: AppColors.heroOverlayGradient,
                  ),
                ),
              ),

              // Match Percentage Badge (Top Left)
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(color: AppColors.rose.withOpacity(0.4), blurRadius: 10),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt, size: 12, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        '$matchScore% Match',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),

              // Campus Identity (Top Right)
              Positioned(
                top: 16,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.65),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        target.campus ?? 'EBSU',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                      if (target.isStudentVerified) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.verified, size: 13, color: AppColors.rose),
                      ],
                    ],
                  ),
                ),
              ),

              // Name, Age & Location (Bottom of Portrait)
              Positioned(
                bottom: 16,
                left: 20,
                right: 20,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '${target.displayName}, ${target.age}',
                          style: const TextStyle(
                            fontFamily: 'Playfair Display',
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                        if (target.username != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            '@${target.username}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.rose),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${target.level ?? 'Student'} • ${target.faculty ?? 'Campus'} • ${target.city ?? 'Nigeria'}',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Body Content
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Live Vibe Tag (if set)
                if (target.vibeTag != null && target.vibeTag!.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.rose.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.borderRose),
                    ),
                    child: Text(
                      target.vibeTag!,
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.rose),
                    ),
                  ),
                  const SizedBox(height: 14),
                ],

                // Bio
                if (target.bio != null && target.bio!.isNotEmpty) ...[
                  Text(
                    target.bio!,
                    style: const TextStyle(fontSize: 14, color: Colors.white, height: 1.45),
                  ),
                  const SizedBox(height: 16),
                ],

                // Connection Gate Question Challenge
                if (target.gateQuestion != null && target.gateQuestion!.isNotEmpty) ...[
                  GestureDetector(
                    onTap: () => _handleSpark(target, 'gate_question', target.id, target.gateQuestion!),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderRose, width: 1.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.lock_outline, size: 14, color: AppColors.rose),
                              SizedBox(width: 6),
                              Text(
                                'CONNECTION GATE QUESTION',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            target.gateQuestion!,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Tap to answer & spark connection →',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.rose),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Rabbit Hole Prompt
                if (target.rabbitHole != null && target.rabbitHole!.isNotEmpty) ...[
                  _buildPromptTile(
                    title: 'MY RABBIT HOLE',
                    content: target.rabbitHole!,
                    onTap: () => _handleSpark(target, 'rabbit_hole', target.id, target.rabbitHole!),
                  ),
                  const SizedBox(height: 12),
                ],

                // Defend This Take
                if (target.defendTake != null && target.defendTake!.isNotEmpty) ...[
                  _buildPromptTile(
                    title: 'DEFEND THIS TAKE',
                    content: target.defendTake!,
                    onTap: () => _handleSpark(target, 'defend_take', target.id, target.defendTake!),
                  ),
                  const SizedBox(height: 12),
                ],

                // Teach Me Something
                if (target.teachMe != null && target.teachMe!.isNotEmpty) ...[
                  _buildPromptTile(
                    title: 'TEACH ME SOMETHING',
                    content: target.teachMe!,
                    onTap: () => _handleSpark(target, 'teach_me', target.id, target.teachMe!),
                  ),
                  const SizedBox(height: 12),
                ],

                // World Tags
                if (target.myWorldTags.isNotEmpty) ...[
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: target.myWorldTags.map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.cardSecondary,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          tag,
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),
                ],

                // Action Bar: Pass (X) vs Spark (Flame)
                Row(
                  children: [
                    // Pass Button
                    Expanded(
                      flex: 1,
                      child: GestureDetector(
                        onTap: () => _handlePass(target),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: AppColors.cardSecondary,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Center(
                            child: Icon(Icons.close, color: AppColors.textMuted, size: 20),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Spark Button
                    Expanded(
                      flex: 2,
                      child: GestureDetector(
                        onTap: () => _handleSpark(target, 'profile', target.id, target.bio ?? target.displayName),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(color: AppColors.rose.withOpacity(0.35), blurRadius: 14, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.bolt, color: Colors.white, size: 18),
                              SizedBox(width: 6),
                              Text('Spark Take Free', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPromptTile({
    required String title,
    required String content,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.cardSecondary,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
                const Text('Spark this take →', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.rose)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              content,
              style: const TextStyle(fontSize: 13, color: Colors.white, height: 1.4, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
