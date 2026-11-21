import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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

class _IdeaStreamScreenState extends State<IdeaStreamScreen>
    with SingleTickerProviderStateMixin {
  List<UserProfile> _profiles = [];
  bool _isLoading = true;
  String? _selectedVibe;
  bool _blurPortraits = false; // Silhouette blur mode
  int _currentPhotoIndex = 0;

  // Animation for card swipe / dismissal
  late AnimationController _cardAnimCtrl;
  late Animation<Offset> _cardSlideAnim;
  late Animation<double> _cardRotateAnim;
  late Animation<double> _cardOpacityAnim;
  bool _isDismissing = false;

  @override
  void initState() {
    super.initState();
    _cardAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );

    _cardSlideAnim = Tween<Offset>(
      begin: Offset.zero,
      end: const Offset(1.2, 0.0),
    ).animate(CurvedAnimation(parent: _cardAnimCtrl, curve: Curves.easeOutCubic));

    _cardRotateAnim = Tween<double>(begin: 0.0, end: 0.15)
        .animate(CurvedAnimation(parent: _cardAnimCtrl, curve: Curves.easeOutCubic));

    _cardOpacityAnim = Tween<double>(begin: 1.0, end: 0.0)
        .animate(CurvedAnimation(parent: _cardAnimCtrl, curve: Curves.easeOut));

    _loadStream();
  }

  @override
  void dispose() {
    _cardAnimCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadStream() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService().getDiscoveryStream(vibeTag: _selectedVibe);
      setState(() {
        _profiles = list.where((p) => p.userId != widget.currentProfile.userId).toList();
        _isLoading = false;
        _currentPhotoIndex = 0;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  void _triggerDismiss({required bool isSpark, required UserProfile target}) async {
    if (_isDismissing || _profiles.isEmpty) return;
    _isDismissing = true;

    // Set slide direction: Right for spark, Left for pass
    _cardSlideAnim = Tween<Offset>(
      begin: Offset.zero,
      end: Offset(isSpark ? 1.4 : -1.4, 0.1),
    ).animate(CurvedAnimation(parent: _cardAnimCtrl, curve: Curves.easeOutCubic));

    _cardRotateAnim = Tween<double>(
      begin: 0.0,
      end: isSpark ? 0.2 : -0.2,
    ).animate(CurvedAnimation(parent: _cardAnimCtrl, curve: Curves.easeOutCubic));

    await _cardAnimCtrl.forward();

    if (mounted) {
      setState(() {
        _profiles.removeWhere((p) => p.id == target.id);
        _currentPhotoIndex = 0;
      });
      _cardAnimCtrl.reset();
      _isDismissing = false;
    }
  }

  void _handlePass(UserProfile target) {
    _triggerDismiss(isSpark: false, target: target);
  }

  void _handleSpark(UserProfile target, {String? targetType, String? targetId, String? targetContent}) {
    SparkModal.show(
      context,
      profile: target,
      targetType: targetType ?? 'profile',
      targetId: targetId ?? target.id,
      targetContent: targetContent ?? (target.bio ?? target.displayName),
      onSendSpark: (comment, gateAnswer) async {
        try {
          await ApiService().sendSpark(
            receiverId: target.userId,
            targetType: targetType ?? 'profile',
            targetId: targetId ?? target.id,
            targetContent: targetContent ?? (target.bio ?? target.displayName),
            comment: comment,
            gateAnswer: gateAnswer,
          );
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.local_fire_department_rounded, color: Colors.white, size: 20),
                    const SizedBox(width: 8),
                    Text('Spark sent to ${target.displayName}!'),
                  ],
                ),
                backgroundColor: AppColors.rose,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            );
            _triggerDismiss(isSpark: true, target: target);
          }
        } catch (err) {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Top Dating Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              child: Row(
                children: [
                  const CupiddleLogo(size: 28, showText: true, subtitle: 'CAMPUS'),
                  const Spacer(),

                  // Silhouette Mystery Mode Toggle
                  GestureDetector(
                    onTap: () => setState(() => _blurPortraits = !_blurPortraits),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _blurPortraits ? AppColors.rose.withOpacity(0.18) : AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: _blurPortraits ? AppColors.rose : AppColors.border,
                          width: 1.2,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _blurPortraits ? Icons.visibility_off_rounded : Icons.visibility_rounded,
                            size: 15,
                            color: _blurPortraits ? AppColors.rose : AppColors.textMuted,
                          ),
                          const SizedBox(width: 5),
                          Text(
                            _blurPortraits ? 'Silhouette' : 'Revealed',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: _blurPortraits ? AppColors.rose : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Campus Indicator Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.cardSecondary,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppColors.borderRose, width: 1.2),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.school_rounded, color: AppColors.rose, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          widget.currentProfile.campus ?? 'EBSU',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Live Campus Vibe Filter Strip
            SizedBox(
              height: 42,
              child: MoodTagSelector(
                selectedTag: _selectedVibe,
                onSelectTag: (vibe) {
                  setState(() => _selectedVibe = _selectedVibe == vibe ? null : vibe);
                  _loadStream();
                },
              ),
            ),
            const SizedBox(height: 6),

            // Card Stack Area
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(color: AppColors.rose),
                    )
                  : _profiles.isEmpty
                      ? _buildCampusRadarEmpty()
                      : Stack(
                          alignment: Alignment.center,
                          children: [
                            // Background next card preview (adds authentic 3D deck depth)
                            if (_profiles.length > 1)
                              Transform.scale(
                                scale: 0.94,
                                child: Opacity(
                                  opacity: 0.5,
                                  child: _buildDatingCard(_profiles[1], isTopCard: false),
                                ),
                              ),

                            // Top active card with animated gesture dismissal
                            AnimatedBuilder(
                              animation: _cardAnimCtrl,
                              builder: (context, child) {
                                return Transform.translate(
                                  offset: Offset(
                                    _cardSlideAnim.value.dx * MediaQuery.of(context).size.width,
                                    _cardSlideAnim.value.dy * MediaQuery.of(context).size.height,
                                  ),
                                  child: Transform.rotate(
                                    angle: _cardRotateAnim.value,
                                    child: Opacity(
                                      opacity: _cardOpacityAnim.value,
                                      child: _buildDatingCard(_profiles[0], isTopCard: true),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
            ),

            // Pinned Floating Dating Action Controls (Only when profiles exist)
            if (_profiles.isNotEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 10, 24, 14),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // 1. Pass Button (X)
                    GestureDetector(
                      onTap: () => _handlePass(_profiles[0]),
                      child: Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          color: AppColors.cardSecondary.withOpacity(0.95),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF3A1A22), width: 1.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.5),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.close_rounded, color: Color(0xFFFF5252), size: 28),
                      ),
                    ),
                    const SizedBox(width: 20),

                    // 2. Connection Gate Prompt Answer Button
                    if (_profiles[0].gateQuestion != null && _profiles[0].gateQuestion!.isNotEmpty)
                      GestureDetector(
                        onTap: () => _handleSpark(
                          _profiles[0],
                          targetType: 'gate_question',
                          targetId: _profiles[0].id,
                          targetContent: _profiles[0].gateQuestion!,
                        ),
                        child: Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.cardSecondary.withOpacity(0.95),
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.gold.withOpacity(0.8), width: 1.5),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.gold.withOpacity(0.25),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: const Icon(Icons.lock_open_rounded, color: AppColors.gold, size: 22),
                        ),
                      ),
                    if (_profiles[0].gateQuestion != null && _profiles[0].gateQuestion!.isNotEmpty)
                      const SizedBox(width: 20),

                    // 3. Primary Spark / Like Button
                    GestureDetector(
                      onTap: () => _handleSpark(_profiles[0]),
                      child: Container(
                        width: 68,
                        height: 68,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Color(0xFFFF1B6B),
                              Color(0xFFE60045),
                            ],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.rose.withOpacity(0.45),
                              blurRadius: 22,
                              spreadRadius: 2,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.local_fire_department_rounded, color: Colors.white, size: 36),
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

  // Authentic Tinder/Bumble Dating Card
  Widget _buildDatingCard(UserProfile target, {required bool isTopCard}) {
    final photoList = target.photos.isNotEmpty ? target.photos : [ProfilePhoto(id: '0', url: target.primaryPhotoUrl, isPrimary: true, order: 0)];
    final safePhotoIndex = _currentPhotoIndex.clamp(0, photoList.length - 1);
    final activePhotoUrl = photoList[safePhotoIndex].url;
    final matchScore = target.matchPercentage != null ? (target.matchPercentage! * 100).round() : 91;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.borderRose, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.65),
            blurRadius: 26,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        children: [
          // 1. Full-Bleed High-Res Image
          Positioned.fill(
            child: Image.network(
              activePhotoUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: AppColors.cardSecondary,
                child: const Icon(Icons.person_rounded, size: 80, color: AppColors.border),
              ),
            ),
          ),

          // 2. Silhouette Blur Filter (if enabled)
          if (_blurPortraits)
            Positioned.fill(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  color: Colors.black.withOpacity(0.35),
                ),
              ),
            ),

          // 3. Cinematic Dark Vignette Gradient
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.3),
                    Colors.transparent,
                    Colors.black.withOpacity(0.65),
                    Colors.black.withOpacity(0.96),
                  ],
                  stops: const [0.0, 0.35, 0.65, 1.0],
                ),
              ),
            ),
          ),

          // 4. Story Photo Segment Indicators (Top)
          if (photoList.length > 1)
            Positioned(
              top: 12,
              left: 14,
              right: 14,
              child: Row(
                children: List.generate(photoList.length, (idx) {
                  final isActive = idx == safePhotoIndex;
                  return Expanded(
                    child: Container(
                      height: 3,
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        color: isActive ? Colors.white : Colors.white.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(2),
                        boxShadow: isActive ? [BoxShadow(color: Colors.white.withOpacity(0.8), blurRadius: 4)] : null,
                      ),
                    ),
                  );
                }),
              ),
            ),

          // 5. Left / Right Photo Tap Navigation (Instagram / Tinder touch zones)
          if (isTopCard && photoList.length > 1)
            Positioned.fill(
              child: Row(
                children: [
                  // Tap left -> Previous photo
                  Expanded(
                    flex: 1,
                    child: GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      onTap: () {
                        if (_currentPhotoIndex > 0) {
                          setState(() => _currentPhotoIndex--);
                        }
                      },
                    ),
                  ),
                  // Middle 20% -> Info trigger
                  Expanded(
                    flex: 1,
                    child: const SizedBox.shrink(),
                  ),
                  // Tap right -> Next photo
                  Expanded(
                    flex: 1,
                    child: GestureDetector(
                      behavior: HitTestBehavior.translucent,
                      onTap: () {
                        if (_currentPhotoIndex < photoList.length - 1) {
                          setState(() => _currentPhotoIndex++);
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),

          // 6. Match Score Badge (Top Left under indicators)
          Positioned(
            top: photoList.length > 1 ? 26 : 14,
            left: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: AppColors.rose.withOpacity(0.4), blurRadius: 10),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.bolt, size: 12, color: Colors.white),
                  const SizedBox(width: 3),
                  Text(
                    '$matchScore% SPARK',
                    style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),

          // 7. Identity & Campus Information Overlay (Bottom)
          Positioned(
            bottom: 16,
            left: 18,
            right: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Name, Age & Verified Badge
                Row(
                  children: [
                    Text(
                      '${target.displayName}, ${target.age}',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (target.isStudentVerified)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.success, width: 1.2),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_rounded, size: 12, color: AppColors.success),
                            SizedBox(width: 4),
                            Text(
                              'VERIFIED',
                              style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.success),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),

                // Faculty, Department & Campus
                Text(
                  '${target.level ?? 'Student'} • ${target.department ?? target.faculty ?? 'Campus'} • ${target.campus ?? 'EBSU'}',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 10),

                // Campus Intention Wall & Live Vibe Badges
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    if (target.datingIntentions != null && target.datingIntentions!.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.rose.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.rose, width: 1.2),
                        ),
                        child: Text(
                          target.datingIntentions!,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                      ),

                    if (target.vibeTag != null && target.vibeTag!.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          target.vibeTag!,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.gold),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),

                // Connection Gate Question Box
                if (target.gateQuestion != null && target.gateQuestion!.isNotEmpty)
                  GestureDetector(
                    onTap: isTopCard
                        ? () => _handleSpark(
                              target,
                              targetType: 'gate_question',
                              targetId: target.id,
                              targetContent: target.gateQuestion!,
                            )
                        : null,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.cardSecondary.withOpacity(0.92),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderRose, width: 1.2),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.lock_outline_rounded, size: 16, color: AppColors.rose),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'CONNECTION GATE QUESTION',
                                  style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  target.gateQuestion!,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: Colors.white),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.rose),
                        ],
                      ),
                    ),
                  ),

                // Bio
                if (target.bio != null && target.bio!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    target.bio!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary, height: 1.35),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Campus Radar Empty State
  Widget _buildCampusRadarEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Concentric Radar Rings
            Container(
              width: 110,
              height: 110,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.rose.withOpacity(0.2),
                    AppColors.burgundy.withOpacity(0.1),
                    Colors.transparent,
                  ],
                ),
                border: Border.all(color: AppColors.borderRose, width: 1.5),
              ),
              child: Center(
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.cardSecondary,
                    border: Border.all(color: AppColors.rose, width: 2),
                  ),
                  child: const Icon(Icons.radar_rounded, color: AppColors.rose, size: 30),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Text(
              'All Campus Sparks Explored',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'You have seen all current student profiles matching your vibe in ${widget.currentProfile.campus ?? 'your university'}. Check back tonight or expand your vibe filter!',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.45),
            ),
            const SizedBox(height: 22),

            GestureDetector(
              onTap: () {
                setState(() => _selectedVibe = null);
                _loadStream();
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: AppColors.rose.withOpacity(0.35), blurRadius: 16),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.refresh_rounded, color: Colors.white, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Refresh Campus Radar',
                      style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
