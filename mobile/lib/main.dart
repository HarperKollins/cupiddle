import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'constants/app_colors.dart';
import 'models/profile.dart';
import 'models/user.dart';
import 'services/api_service.dart';
import 'services/websocket_service.dart';
import 'screens/landing/app_welcome_screen.dart';
import 'screens/onboarding/onboarding_screen.dart';
import 'screens/main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI navigation bar & status bar to match Midnight Burgundy
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppColors.canvas,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final api = ApiService();
  await api.init();

  runApp(const CupiddleApp());
}

class CupiddleApp extends StatefulWidget {
  const CupiddleApp({super.key});

  @override
  State<CupiddleApp> createState() => _CupiddleAppState();
}

class _CupiddleAppState extends State<CupiddleApp> {
  User? _currentUser;
  UserProfile? _currentProfile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkExistingSession();
  }

  Future<void> _checkExistingSession() async {
    final token = ApiService().token;
    if (token != null && token.isNotEmpty) {
      try {
        final me = await ApiService().getMe();
        setState(() {
          _currentUser = User.fromJson(me['user']);
          _currentProfile = UserProfile.fromJson(me['profile']);
          _isLoading = false;
        });
        return;
      } catch (_) {
        await ApiService().setToken(null);
      }
    }

    setState(() => _isLoading = false);
  }

  void _handleAuthenticated(AuthResponse auth) {
    setState(() {
      _currentUser = auth.user;
      _currentProfile = auth.profile;
    });
  }

  void _handleLogout() async {
    WebSocketService().disconnect();
    await ApiService().setToken(null);
    setState(() {
      _currentUser = null;
      _currentProfile = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cupiddle',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.canvas,
        primaryColor: AppColors.rose,
        colorScheme: const ColorScheme.dark(
          primary: AppColors.rose,
          secondary: AppColors.burgundy,
          surface: AppColors.card,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          ThemeData.dark().textTheme,
        ).apply(
          bodyColor: AppColors.textPrimary,
          displayColor: AppColors.textPrimary,
        ),
      ),
      builder: (context, child) {
        return LayoutBuilder(
          builder: (context, constraints) {
            // On mobile / small screens, render 100% full-screen native edge-to-edge
            if (constraints.maxWidth <= 650) {
              return child ?? const SizedBox.shrink();
            }

            // On desktop / tablet, render inside a luxury mobile smartphone mockup frame
            return Container(
              color: const Color(0xFF080406),
              alignment: Alignment.center,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Smartphone Chassis
                      Container(
                        width: 395,
                        height: 830,
                        decoration: BoxDecoration(
                          color: AppColors.canvas,
                          borderRadius: BorderRadius.circular(46),
                          border: Border.all(
                            color: const Color(0xFF2E1C24),
                            width: 6,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.rose.withOpacity(0.2),
                              blurRadius: 40,
                              spreadRadius: 2,
                            ),
                            BoxShadow(
                              color: Colors.black.withOpacity(0.85),
                              blurRadius: 60,
                              offset: const Offset(0, 20),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(40),
                          child: Stack(
                            children: [
                              child ?? const SizedBox.shrink(),
                              // Subtle Camera Punch Hole / Dynamic Island
                              Positioned(
                                top: 10,
                                left: 0,
                                right: 0,
                                child: Center(
                                  child: Container(
                                    width: 90,
                                    height: 22,
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF1A1A2E),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      // Desktop Info Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.cardSecondary,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.phone_android_rounded, size: 16, color: AppColors.rose),
                            SizedBox(width: 8),
                            Text(
                              'Mobile Simulator • Press F12 > Ctrl+Shift+M for Mobile Emulation',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: AppColors.textMuted,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
      home: _isLoading
          ? const Scaffold(
              backgroundColor: AppColors.canvas,
              body: Center(
                child: CircularProgressIndicator(color: AppColors.rose),
              ),
            )
          : _currentUser == null
              ? AppWelcomeScreen(
                  onAuthenticated: _handleAuthenticated,
                )
              : !_currentUser!.hasCompletedOnboarding
                  ? OnboardingScreen(
                      profile: _currentProfile!,
                      onCompleted: (updatedProfile) {
                        setState(() {
                          _currentProfile = updatedProfile;
                          _currentUser = User(
                            id: _currentUser?.id ?? updatedProfile.userId,
                            email: _currentUser?.email ?? '',
                            role: _currentUser?.role ?? 'user',
                            isEmailVerified: _currentUser?.isEmailVerified ?? false,
                            hasCompletedOnboarding: true,
                            createdAt: _currentUser?.createdAt ?? '',
                          );
                        });
                      },
                    )
                  : MainShell(
                      user: _currentUser!,
                      initialProfile: _currentProfile!,
                      onLogout: _handleLogout,
                    ),
    );
  }
}
