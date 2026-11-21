import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/campuses.dart';
import '../../services/api_service.dart';
import '../../models/user.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';

class AuthModal extends StatefulWidget {
  final bool initialIsSignUp;
  final String? initialCampus;
  final Function(AuthResponse auth) onSuccess;

  const AuthModal({
    super.key,
    this.initialIsSignUp = true,
    this.initialCampus,
    required this.onSuccess,
  });

  static Future<void> show(
    BuildContext context, {
    bool isSignUp = true,
    String? initialCampus,
    required Function(AuthResponse auth) onSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: AuthModal(
          initialIsSignUp: isSignUp,
          initialCampus: initialCampus,
          onSuccess: onSuccess,
        ),
      ),
    );
  }

  @override
  State<AuthModal> createState() => _AuthModalState();
}

class _AuthModalState extends State<AuthModal> {
  late bool _isSignUp;
  late String _selectedCampus;

  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _passwordCtrl = TextEditingController();
  final TextEditingController _displayNameCtrl = TextEditingController();
  final TextEditingController _usernameCtrl = TextEditingController();
  final TextEditingController _ageCtrl = TextEditingController(text: '20');

  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _isSignUp = widget.initialIsSignUp;
    _selectedCampus = widget.initialCampus ?? 'EBSU';
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _displayNameCtrl.dispose();
    _usernameCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Please enter both email and password.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      AuthResponse auth;
      if (_isSignUp) {
        final displayName = _displayNameCtrl.text.trim();
        final username = _usernameCtrl.text.trim();
        final age = int.tryParse(_ageCtrl.text.trim()) ?? 20;

        if (displayName.isEmpty) {
          setState(() {
            _errorMessage = 'Display name is required.';
            _isLoading = false;
          });
          return;
        }

        auth = await ApiService().register(
          email: email,
          password: password,
          displayName: displayName,
          age: age,
          campus: _selectedCampus,
          username: username.isNotEmpty ? username : null,
        );
      } else {
        auth = await ApiService().login(email: email, password: password);
      }

      if (mounted) {
        Navigator.of(context).pop();
        widget.onSuccess(auth);
      }
    } catch (err: any) {
      setState(() {
        _errorMessage = err.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: AppColors.borderRose, width: 1.5),
          left: BorderSide(color: AppColors.border, width: 1),
          right: BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header Row
            Row(
              children: [
                const CupiddleLogo(size: 26, showText: true),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Toggle Tabs: Sign Up vs Login
            Container(
              decoration: BoxDecoration(
                color: AppColors.cardSecondary,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isSignUp = true),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _isSignUp ? AppColors.rose : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            'Create Profile',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: _isSignUp ? FontWeight.w700 : FontWeight.w500,
                              color: _isSignUp ? Colors.white : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _isSignUp = false),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: !_isSignUp ? AppColors.rose : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(
                          child: Text(
                            'Enter App',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: !_isSignUp ? FontWeight.w700 : FontWeight.w500,
                              color: !_isSignUp ? Colors.white : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Error alert
            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withOpacity(0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(fontSize: 12, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Sign Up Extra Fields
            if (_isSignUp) ...[
              // Campus Picker
              const Text('CAMPUS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.cardSecondary,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedCampus,
                    isExpanded: true,
                    dropdownColor: AppColors.cardSecondary,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.rose),
                    items: NigerianCampuses.all.map((c) {
                      return DropdownMenuItem<String>(
                        value: c.code,
                        child: Text(
                          '${c.name} (${c.code})',
                          style: const TextStyle(fontSize: 13, color: Colors.white),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedCampus = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 14),

              // Display Name & Age Row
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('FIRST NAME / ALIAS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _displayNameCtrl,
                          style: const TextStyle(fontSize: 13, color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'e.g. Amaka, Tunde',
                            hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            filled: true,
                            fillColor: AppColors.cardSecondary,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('AGE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _ageCtrl,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(fontSize: 13, color: Colors.white),
                          decoration: InputDecoration(
                            hintText: '20',
                            hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                            filled: true,
                            fillColor: AppColors.cardSecondary,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Username (@handle)
              const Text('@USERNAME (OPTIONAL)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              TextField(
                controller: _usernameCtrl,
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  prefixText: '@',
                  prefixStyle: const TextStyle(fontSize: 13, color: AppColors.rose, fontWeight: FontWeight.w700),
                  hintText: 'campus_writer',
                  hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.cardSecondary,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Email Field
            const Text('CAMPUS OR PERSONAL EMAIL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
            const SizedBox(height: 6),
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                hintText: 'student@ebsu.edu.ng or gmail...',
                hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.cardSecondary,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 14),

            // Password Field
            const Text('PASSWORD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
            const SizedBox(height: 6),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              style: const TextStyle(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                hintText: '••••••••',
                hintStyle: TextStyle(fontSize: 14, color: AppColors.textMuted),
                filled: true,
                fillColor: AppColors.cardSecondary,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
            const SizedBox(height: 22),

            // Submit Button
            GlowButton(
              text: _isSignUp ? 'Join $_selectedCampus Circle Free' : 'Sign In',
              isLoading: _isLoading,
              onPressed: _handleSubmit,
              icon: Icon(_isSignUp ? Icons.sparkles : Icons.arrow_forward, color: Colors.white, size: 16),
            ),
            const SizedBox(height: 10),

            Center(
              child: Text(
                '100% Free for Nigerian Students • Zero Subscriptions',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}
