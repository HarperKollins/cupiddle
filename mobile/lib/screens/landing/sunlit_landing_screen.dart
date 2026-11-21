import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/campuses.dart';
import '../../models/user.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';
import '../auth/auth_modal.dart';

class SunlitLandingScreen extends StatefulWidget {
  final Function(AuthResponse auth) onAuthenticated;

  const SunlitLandingScreen({
    super.key,
    required this.onAuthenticated,
  });

  @override
  State<SunlitLandingScreen> createState() => _SunlitLandingScreenState();
}

class _SunlitLandingScreenState extends State<SunlitLandingScreen> {
  String _selectedCampus = 'EBSU';
  int _currentCarouselIndex = 0;
  final PageController _pageController = PageController();

  final List<Map<String, String>> _carouselSlides = [
    {
      'image': 'assets/images/desire_late_night_1795196440905.jpg',
      'title': '2:00 AM Conversations',
      'subtitle': 'The conversations you remember are never about small talk.',
    },
    {
      'image': 'assets/images/desire_tension_1795196442130.jpg',
      'title': 'Intrigue Before Revelation',
      'subtitle': 'Silhouette blur mode reveals minds and takes before photos.',
    },
    {
      'image': 'assets/images/desire_secret_1795196442185.jpg',
      'title': 'Connection Gatekeepers',
      'subtitle': 'Candidates must answer your gate question before entering your inbox.',
    },
  ];

  void _openAuth({required bool isSignUp}) {
    AuthModal.show(
      context,
      isSignUp: isSignUp,
      initialCampus: _selectedCampus,
      onSuccess: widget.onAuthenticated,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Sticky-style Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Row(
                  children: [
                    const CupiddleLogo(size: 28, showText: true),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.rose.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderRose),
                      ),
                      child: Text(
                        _selectedCampus,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.rose,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => _openAuth(isSignUp: false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.cardSecondary,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Text(
                          'Enter',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Hero Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.rose.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.borderRose),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.bolt, color: AppColors.rose, size: 12),
                          SizedBox(width: 4),
                          Text(
                            'NIGERIAN UNIVERSITY CONNECTION PLATFORM',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppColors.rose,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    const Text(
                      'Where Late Night Thoughts Become Sparks.',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.8,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      'No endless swiping. No ghosting. Spark genuine connections on Nigerian campuses through unfiltered takes, late-night obsessions, and mutual curiosity.',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Campus Selector Bar
                    const Text(
                      'CHOOSE YOUR CAMPUS CIRCLE',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),

                    SizedBox(
                      height: 38,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        itemCount: NigerianCampuses.all.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          final campus = NigerianCampuses.all[index];
                          final isSelected = campus.code == _selectedCampus;

                          return GestureDetector(
                            onTap: () => setState(() => _selectedCampus = campus.code),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? AppColors.rose : AppColors.cardSecondary,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected ? AppColors.rose : AppColors.border,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  campus.code,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                    color: isSelected ? Colors.white : AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Dual CTAs
                    GlowButton(
                      text: 'Join $_selectedCampus Circle Free',
                      onPressed: () => _openAuth(isSignUp: true),
                      icon: const Icon(Icons.sparkles, color: Colors.white, size: 16),
                    ),
                    const SizedBox(height: 10),

                    GlowButton(
                      text: 'Already on Cupiddle? Enter',
                      isSecondary: true,
                      onPressed: () => _openAuth(isSignUp: false),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Visual Editorial Atmosphere Carousel
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  height: 360,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.borderRose, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.5),
                        blurRadius: 24,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    children: [
                      PageView.builder(
                        controller: _pageController,
                        itemCount: _carouselSlides.length,
                        onPageChanged: (idx) => setState(() => _currentCarouselIndex = idx),
                        itemBuilder: (context, index) {
                          final slide = _carouselSlides[index];
                          return Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.asset(
                                slide['image']!,
                                fit: BoxFit.cover,
                              ),
                              Container(
                                decoration: const BoxDecoration(
                                  gradient: AppColors.heroOverlayGradient,
                                ),
                              ),
                              Positioned(
                                bottom: 24,
                                left: 20,
                                right: 20,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      slide['title']!,
                                      style: const TextStyle(
                                        fontFamily: 'Playfair Display',
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                        letterSpacing: -0.3,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      slide['subtitle']!,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppColors.textSecondary,
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          );
                        },
                      ),

                      // Carousel Indicators
                      Positioned(
                        top: 16,
                        right: 16,
                        child: Row(
                          children: List.generate(_carouselSlides.length, (idx) {
                            final isActive = idx == _currentCarouselIndex;
                            return Container(
                              width: isActive ? 20 : 6,
                              height: 6,
                              margin: const EdgeInsets.only(left: 4),
                              decoration: BoxDecoration(
                                color: isActive ? AppColors.rose : Colors.white.withOpacity(0.4),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            );
                          }),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 36),

              // 3 Pillars Section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'BUILT FOR CAMPUS CURIOSITY',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.rose,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Why Nigerian Students Spark Here',
                      style: TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 18),

                    _buildPillarCard(
                      icon: Icons.chat_bubble_outline,
                      title: 'Contextual Idea Sparks',
                      desc: 'People don\'t swipe blindly. They spark specific answers, rabbit holes, and hot takes.',
                    ),
                    const SizedBox(height: 12),
                    _buildPillarCard(
                      icon: Icons.verified_user_outlined,
                      title: '100% Free Campus Verification',
                      desc: 'Zero paid subscriptions. Instant verification via JAMB, NIN, Remita RRR, or peer vouches.',
                    ),
                    const SizedBox(height: 12),
                    _buildPillarCard(
                      icon: Icons.videogame_asset_outlined,
                      title: 'Co-op Corner & Logic Riddles',
                      desc: 'Break the awkward small talk ice with collaborative async riddles and debate dilemmas.',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 36),

              // Bottom CTA Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.borderRose, width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.rose.withOpacity(0.15),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const CupiddleLogo(size: 36),
                      const SizedBox(height: 14),
                      const Text(
                        'Step Into Your Campus Circle',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Your late night thoughts are magnetic to the right minds.',
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 20),
                      GlowButton(
                        text: 'Enter Cupiddle Now (₦0)',
                        onPressed: () => _openAuth(isSignUp: true),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 48),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPillarCard({
    required IconData icon,
    required String title,
    required String desc,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.rose.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.rose, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
