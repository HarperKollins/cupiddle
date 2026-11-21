import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../constants/app_colors.dart';
import '../../constants/campuses.dart';
import '../../models/user.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';
import '../auth/auth_modal.dart';

class AppWelcomeScreen extends StatefulWidget {
  final Function(AuthResponse auth) onAuthenticated;

  const AppWelcomeScreen({
    super.key,
    required this.onAuthenticated,
  });

  @override
  State<AppWelcomeScreen> createState() => _AppWelcomeScreenState();
}

class _AppWelcomeScreenState extends State<AppWelcomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _pulseAnimation;
  late PageController _pageCtrl;
  Timer? _carouselTimer;
  int _currentPage = 0;
  String _selectedCampus = 'EBSU';

  final List<Map<String, dynamic>> _features = [
    {
      'badge': '100% CAMPUS EXCLUSIVE',
      'title': 'Your Campus Circle',
      'description':
          'Connect with verified students from your university, faculty, and level. Zero outsiders.',
      'icon': Icons.school_rounded,
      'accent': AppColors.rose,
    },
    {
      'badge': 'INTRIGUE BEFORE REVELATION',
      'title': 'Minds Before Faces',
      'description':
          'Silhouette mode reveals thoughts, music taste, and vibe compatibility before photos unlock.',
      'icon': Icons.visibility_off_rounded,
      'accent': AppColors.burgundy,
    },
    {
      'badge': 'SKIP GENERIC SMALL TALK',
      'title': 'Connection Gates',
      'description':
          'No boring "hey" messages. Candidates must pass your unique question before entering your inbox.',
      'icon': Icons.lock_open_rounded,
      'accent': AppColors.rose,
    },
    {
      'badge': 'CRYSTAL CLEAR VIBES',
      'title': 'Campus Intention Walls',
      'description':
          'From study partners to late-night desire and mutual intimacy—know what each other wants upfront.',
      'icon': Icons.local_fire_department_rounded,
      'accent': AppColors.gold,
    },
  ];

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    )..repeat(reverse: true);

    _pulseAnimation = CurvedAnimation(
      parent: _animCtrl,
      curve: Curves.easeInOutSine,
    );

    _pageCtrl = PageController();
    _startAutoPlay();
  }

  void _startAutoPlay() {
    _carouselTimer?.cancel();
    _carouselTimer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      final nextPage = (_currentPage + 1) % _features.length;
      _pageCtrl.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 650),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _carouselTimer?.cancel();
    _pageCtrl.dispose();
    _animCtrl.dispose();
    super.dispose();
  }

  void _openAuth({required bool isSignUp}) {
    AuthModal.show(
      context,
      isSignUp: isSignUp,
      initialCampus: _selectedCampus,
      onSuccess: widget.onAuthenticated,
    );
  }

  void _showCampusPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        String searchQuery = '';
        return StatefulBuilder(
          builder: (context, setSheetState) {
            final filtered = NigerianCampuses.all.where((c) {
              return c.code.toLowerCase().contains(searchQuery.toLowerCase()) ||
                  c.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
                  c.state.toLowerCase().contains(searchQuery.toLowerCase());
            }).toList();

            return Container(
              height: MediaQuery.of(ctx).size.height * 0.72,
              decoration: const BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                border: Border(
                  top: BorderSide(color: AppColors.borderRose, width: 1.5),
                ),
              ),
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              child: Column(
                children: [
                  // Drag Handle
                  Container(
                    width: 44,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 18),

                  Row(
                    children: [
                      const Icon(Icons.school_rounded, color: AppColors.rose, size: 22),
                      const SizedBox(width: 10),
                      Text(
                        'Select Your Campus',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Search Field
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.cardSecondary,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: TextField(
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: const InputDecoration(
                        icon: Icon(Icons.search, color: AppColors.textMuted, size: 20),
                        hintText: 'Search campus, state or abbreviation...',
                        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                        border: InputBorder.none,
                      ),
                      onChanged: (val) {
                        setSheetState(() => searchQuery = val);
                      },
                    ),
                  ),
                  const SizedBox(height: 14),

                  Expanded(
                    child: ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      itemCount: filtered.length,
                      itemBuilder: (context, idx) {
                        final campus = filtered[idx];
                        final isSelected = campus.code == _selectedCampus;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.rose.withOpacity(0.12)
                                : AppColors.cardSecondary.withOpacity(0.4),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? AppColors.rose : AppColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            title: Text(
                              campus.name,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                            subtitle: Text(
                              '${campus.code} • ${campus.state} State',
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                            trailing: isSelected
                                ? const Icon(Icons.check_circle_rounded, color: AppColors.rose, size: 22)
                                : const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textMuted, size: 14),
                            onTap: () {
                              setState(() => _selectedCampus = campus.code);
                              Navigator.pop(ctx);
                            },
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          final pulse = _pulseAnimation.value;
          return Stack(
            children: [
              // 1. Atmospheric Ambient Radial Glows
              Positioned(
                top: -80,
                left: -60,
                child: Container(
                  width: 320 + (pulse * 40),
                  height: 320 + (pulse * 40),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        AppColors.burgundy.withOpacity(0.5 + (0.15 * pulse)),
                        AppColors.rose.withOpacity(0.15 * pulse),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),

              Positioned(
                bottom: -40,
                right: -60,
                child: Container(
                  width: 340 + (pulse * 50),
                  height: 340 + (pulse * 50),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        AppColors.rose.withOpacity(0.22 + (0.1 * pulse)),
                        AppColors.burgundy.withOpacity(0.12),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),

              // Ambient overlay vignette
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.canvas.withOpacity(0.2),
                      Colors.transparent,
                      AppColors.canvas.withOpacity(0.85),
                      AppColors.canvas,
                    ],
                    stops: const [0.0, 0.35, 0.75, 1.0],
                  ),
                ),
              ),

              // 2. Main Native App Content (No web scrolling, pure mobile layout)
              SafeArea(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return SingleChildScrollView(
                      physics: const ClampingScrollPhysics(),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: IntrinsicHeight(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            child: Column(
                              children: [
                                // Top Row: Campus Selector Pill & Quick Enter
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    // Status dot
                                    Row(
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: AppColors.success,
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppColors.success.withOpacity(0.6),
                                                blurRadius: 6,
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          'CAMPUS LIVE',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 1.2,
                                            color: AppColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),

                                    // Campus Selector Pill
                                    GestureDetector(
                                      onTap: _showCampusPicker,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: AppColors.cardSecondary.withOpacity(0.8),
                                          borderRadius: BorderRadius.circular(20),
                                          border: Border.all(color: AppColors.borderRose, width: 1.2),
                                          boxShadow: [
                                            BoxShadow(
                                              color: AppColors.rose.withOpacity(0.1),
                                              blurRadius: 10,
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            const Icon(Icons.school_rounded, color: AppColors.rose, size: 14),
                                            const SizedBox(width: 6),
                                            Text(
                                              _selectedCampus,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w800,
                                                color: Colors.white,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                            const Icon(Icons.keyboard_arrow_down_rounded,
                                                color: AppColors.textMuted, size: 16),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),

                                const Spacer(flex: 1),

                                // Center Hero: Glowing Animated Brand Mark
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: RadialGradient(
                                      colors: [
                                        AppColors.rose.withOpacity(0.25 + (0.15 * pulse)),
                                        AppColors.burgundy.withOpacity(0.15),
                                        Colors.transparent,
                                      ],
                                    ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.rose.withOpacity(0.3 * pulse),
                                        blurRadius: 36,
                                        spreadRadius: 6,
                                      ),
                                    ],
                                  ),
                                  child: Transform.scale(
                                    scale: 1.0 + (0.04 * pulse),
                                    child: const CupiddleLogo(size: 68, showText: false),
                                  ),
                                ),
                                const SizedBox(height: 16),

                                // App Title
                                Text(
                                  'Cupiddle',
                                  style: TextStyle(
                                    fontFamily: 'Playfair Display',
                                    fontSize: 42,
                                    fontWeight: FontWeight.w900,
                                    color: AppColors.textPrimary,
                                    letterSpacing: -1.0,
                                    shadows: [
                                      Shadow(
                                        color: AppColors.rose.withOpacity(0.4),
                                        blurRadius: 20,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'NIGERIAN CAMPUS ROMANCE & INTIMACY',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 2.2,
                                    color: AppColors.gold,
                                  ),
                                ),

                                const Spacer(flex: 1),

                                // Interactive Micro-Carousel (Value Prop Cards)
                                SizedBox(
                                  height: 140,
                                  child: PageView.builder(
                                    controller: _pageCtrl,
                                    onPageChanged: (idx) {
                                      setState(() => _currentPage = idx);
                                    },
                                    itemCount: _features.length,
                                    itemBuilder: (context, idx) {
                                      final item = _features[idx];
                                      return Container(
                                        margin: const EdgeInsets.symmetric(horizontal: 4),
                                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                        decoration: BoxDecoration(
                                          color: AppColors.card.withOpacity(0.85),
                                          borderRadius: BorderRadius.circular(22),
                                          border: Border.all(
                                            color: (item['accent'] as Color).withOpacity(0.3),
                                            width: 1.2,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.3),
                                              blurRadius: 15,
                                              offset: const Offset(0, 6),
                                            ),
                                          ],
                                        ),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                              decoration: BoxDecoration(
                                                color: (item['accent'] as Color).withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(20),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(
                                                    item['icon'] as IconData,
                                                    size: 13,
                                                    color: item['accent'] as Color,
                                                  ),
                                                  const SizedBox(width: 5),
                                                  Text(
                                                    item['badge'] as String,
                                                    style: GoogleFonts.plusJakartaSans(
                                                      fontSize: 9.5,
                                                      fontWeight: FontWeight.w800,
                                                      letterSpacing: 1.1,
                                                      color: item['accent'] as Color,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            Text(
                                              item['title'] as String,
                                              style: GoogleFonts.plusJakartaSans(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w800,
                                                color: Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 5),
                                            Text(
                                              item['description'] as String,
                                              textAlign: TextAlign.center,
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 12.5,
                                                color: AppColors.textMuted,
                                                height: 1.35,
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(height: 14),

                                // Carousel Indicators
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: List.generate(_features.length, (idx) {
                                    final isSelected = idx == _currentPage;
                                    return AnimatedContainer(
                                      duration: const Duration(milliseconds: 300),
                                      margin: const EdgeInsets.symmetric(horizontal: 3),
                                      width: isSelected ? 24 : 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: isSelected ? AppColors.rose : AppColors.border,
                                        borderRadius: BorderRadius.circular(3),
                                        boxShadow: isSelected
                                          ? [
                                              BoxShadow(
                                                color: AppColors.rose.withOpacity(0.6),
                                                blurRadius: 8,
                                              ),
                                            ]
                                          : null,
                                      ),
                                    );
                                  }),
                                ),

                                const Spacer(flex: 2),

                                // 3. Thumb-Zone Mobile Action Buttons
                                GlowButton(
                                  text: 'Create Account',
                                  height: 54,
                                  width: double.infinity,
                                  icon: const Icon(Icons.flash_on_rounded, color: Colors.white, size: 20),
                                  onPressed: () => _openAuth(isSignUp: true),
                                ),
                                const SizedBox(height: 12),

                                GlowButton(
                                  text: 'I Have an Account  •  Sign In',
                                  height: 50,
                                  width: double.infinity,
                                  isSecondary: true,
                                  onPressed: () => _openAuth(isSignUp: false),
                                ),
                                const SizedBox(height: 16),

                                // Subtle Fine Print / Campus Code
                                Text(
                                  'By continuing, you verify you are 18+ and accept the Nigerian Campus Code.',
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 10.5,
                                    color: AppColors.textMuted.withOpacity(0.8),
                                    height: 1.4,
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
