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
        return Container(
          color: AppColors.canvas,
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: child ?? const SizedBox.shrink(),
            ),
          ),
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
