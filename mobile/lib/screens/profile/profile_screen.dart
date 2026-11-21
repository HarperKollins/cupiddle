import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/campuses.dart';
import '../../models/profile.dart';
import '../../services/api_service.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';
import '../../widgets/mood_tag_selector.dart';

class ProfileScreen extends StatefulWidget {
  final UserProfile profile;
  final Function(UserProfile updated) onProfileUpdated;
  final VoidCallback onLogout;

  const ProfileScreen({
    super.key,
    required this.profile,
    required this.onProfileUpdated,
    required this.onLogout,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late TextEditingController _displayNameCtrl;
  late TextEditingController _bioCtrl;
  late TextEditingController _gateQuestionCtrl;
  late TextEditingController _rabbitHoleCtrl;
  late TextEditingController _defendTakeCtrl;
  late TextEditingController _teachMeCtrl;
  late String _campus;
  late String _level;
  late String _vibeTag;
  late String _datingIntentions;

  bool _isSaving = false;
  bool _savedSuccess = false;

  // Student verification state
  String _verifyMethod = 'nin';
  final TextEditingController _verifyIdCtrl = TextEditingController();
  final TextEditingController _peerHandleCtrl = TextEditingController();
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _displayNameCtrl = TextEditingController(text: widget.profile.displayName);
    _bioCtrl = TextEditingController(text: widget.profile.bio ?? '');
    _gateQuestionCtrl = TextEditingController(text: widget.profile.gateQuestion ?? '');
    _rabbitHoleCtrl = TextEditingController(text: widget.profile.rabbitHole ?? '');
    _defendTakeCtrl = TextEditingController(text: widget.profile.defendTake ?? '');
    _teachMeCtrl = TextEditingController(text: widget.profile.teachMe ?? '');
    _campus = widget.profile.campus ?? 'EBSU';
    _level = widget.profile.level ?? '300L';
    _vibeTag = widget.profile.vibeTag ?? NigerianCampuses.moodTags[0];
    _datingIntentions = widget.profile.datingIntentions ?? '✨ Mutual Intimacy';
  }

  @override
  void dispose() {
    _displayNameCtrl.dispose();
    _bioCtrl.dispose();
    _gateQuestionCtrl.dispose();
    _rabbitHoleCtrl.dispose();
    _defendTakeCtrl.dispose();
    _teachMeCtrl.dispose();
    _verifyIdCtrl.dispose();
    _peerHandleCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveAll() async {
    setState(() => _isSaving = true);
    try {
      final updated = await ApiService().updateProfile({
        'display_name': _displayNameCtrl.text.trim(),
        'bio': _bioCtrl.text.trim(),
        'campus': _campus,
        'level': _level,
        'dating_intentions': _datingIntentions,
        'gate_question': _gateQuestionCtrl.text.trim(),
        'vibe_tag': _vibeTag,
      });

      await ApiService().updateCuriosity({
        'rabbit_hole': _rabbitHoleCtrl.text.trim(),
        'defend_take': _defendTakeCtrl.text.trim(),
        'teach_me': _teachMeCtrl.text.trim(),
      });

      widget.onProfileUpdated(updated);
      setState(() {
        _isSaving = false;
        _savedSuccess = true;
      });

      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _savedSuccess = false);
      });
    } catch (err) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(err.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  void _showVerificationDialog() {
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            backgroundColor: AppColors.card,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: AppColors.borderRose)),
            title: const Text('Student ID Verification (₦0)', style: TextStyle(fontFamily: 'Playfair Display', color: Colors.white)),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Exclusive to Nigerian Universities. 100% Free.', style: TextStyle(fontSize: 12, color: AppColors.rose)),
                  const SizedBox(height: 14),

                  // Method Selection Chips
                  Row(
                    children: [
                      _buildVerifyTab('nin', 'NIN', setDialogState),
                      const SizedBox(width: 6),
                      _buildVerifyTab('jamb', 'JAMB', setDialogState),
                      const SizedBox(width: 6),
                      _buildVerifyTab('rrr', 'Remita', setDialogState),
                      const SizedBox(width: 6),
                      _buildVerifyTab('vouch', 'Peer', setDialogState),
                    ],
                  ),
                  const SizedBox(height: 16),

                  if (_verifyMethod == 'vouch') ...[
                    TextField(
                      controller: _peerHandleCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        prefixText: '@',
                        hintText: 'coursemate_handle (e.g. amina)',
                        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                        helperText: 'Requires 2 verified coursemates to vouch for you.',
                        helperStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        filled: true,
                        fillColor: AppColors.cardSecondary,
                      ),
                    ),
                  ] else ...[
                    TextField(
                      controller: _verifyIdCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: _verifyMethod == 'nin'
                            ? '11-digit NIN (e.g. 12345678901)'
                            : _verifyMethod == 'jamb'
                                ? 'JAMB Reg No (e.g. 10234567AB)'
                                : '12-digit Remita RRR (e.g. 123456789012)',
                        hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                        helperText: _verifyMethod == 'nin'
                            ? 'Instant verification via 11-digit NIN.'
                            : _verifyMethod == 'jamb'
                                ? 'Instant admission verification via JAMB.'
                                : 'Instant verification via 12-digit tuition RRR.',
                        helperStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        filled: true,
                        fillColor: AppColors.cardSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
              GlowButton(
                width: 130,
                height: 38,
                isLoading: _isVerifying,
                text: 'Verify',
                onPressed: () async {
                  setDialogState(() => _isVerifying = true);
                  try {
                    Map<String, dynamic> res;
                    if (_verifyMethod == 'vouch') {
                      res = await ApiService().vouchPeer(targetUsername: _peerHandleCtrl.text.trim(), campus: _campus);
                    } else {
                      res = await ApiService().verifyStudent(method: _verifyMethod, identifier: _verifyIdCtrl.text.trim(), campus: _campus);
                    }
                    Navigator.of(ctx).pop();
                    final me = await ApiService().getMe();
                    final updatedProfile = UserProfile.fromJson(me['profile']);
                    widget.onProfileUpdated(updatedProfile);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(res['message']?.toString() ?? 'Verification check passed!'),
                        backgroundColor: AppColors.success,
                      ),
                    );
                  } catch (err) {
                    setDialogState(() => _isVerifying = false);
                    final msg = err.toString().replaceAll('Exception: ', '');
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(msg), backgroundColor: AppColors.error),
                    );
                  }
                },
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildVerifyTab(String method, String label, StateSetter setDialogState) {
    final isSelected = _verifyMethod == method;
    return GestureDetector(
      onTap: () => setDialogState(() => _verifyMethod = method),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.rose : AppColors.cardSecondary,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: isSelected ? Colors.white : AppColors.textMuted)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Bar
              Row(
                children: [
                  const CupiddleLogo(size: 26, showText: false),
                  const SizedBox(width: 8),
                  const Text('My Campus Profile', style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white)),
                  const Spacer(),
                  if (_savedSuccess)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.success.withOpacity(0.18), borderRadius: BorderRadius.circular(12)),
                      child: const Row(
                        children: [
                          Icon(Icons.check, size: 12, color: AppColors.success),
                          SizedBox(width: 4),
                          Text('Saved', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success)),
                        ],
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 20),

              // Hero Portrait Card
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.borderRose, width: 2),
                        image: DecorationImage(
                          image: NetworkImage(widget.profile.primaryPhotoUrl),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    if (widget.profile.isStudentVerified)
                      Positioned(
                        bottom: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: AppColors.card, shape: BoxShape.circle),
                          child: const Icon(Icons.verified, color: AppColors.rose, size: 22),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Student Verification Status Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: widget.profile.isStudentVerified ? AppColors.success.withOpacity(0.4) : AppColors.borderRose),
                ),
                child: Row(
                  children: [
                    Icon(
                      widget.profile.isStudentVerified ? Icons.verified : Icons.shield_outlined,
                      color: widget.profile.isStudentVerified ? AppColors.success : AppColors.rose,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.profile.isStudentVerified ? 'Verified Student @ $_campus' : 'Unverified Student Profile',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
                          ),
                          Text(
                            widget.profile.isStudentVerified ? '100% Free verification badge active' : 'Verify for free via JAMB, NIN, or coursemate vouch',
                            style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    if (!widget.profile.isStudentVerified)
                      GestureDetector(
                        onTap: _showVerificationDialog,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(10)),
                          child: const Text('Verify (₦0)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white)),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Campus Intention Wall
              const Text('CAMPUS INTENTION WALL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  '✨ Mutual Intimacy',
                  '🔥 Campus Spark',
                  '📚 Study Buddy',
                  '🥂 Companionship',
                ].map((intent) {
                  final isSelected = _datingIntentions == intent;
                  return GestureDetector(
                    onTap: () => setState(() => _datingIntentions = intent),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.rose.withOpacity(0.2) : AppColors.cardSecondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: isSelected ? AppColors.rose : AppColors.border,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Text(
                        intent,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.textMuted,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // Live Campus Vibe Selector
              const Text('BROADCAST CAMPUS VIBE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              MoodTagSelector(selectedTag: _vibeTag, onSelectTag: (v) => setState(() => _vibeTag = v)),
              const SizedBox(height: 20),

              // Connection Gate Question
              const Text('YOUR CONNECTION GATE QUESTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              TextField(
                controller: _gateQuestionCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Candidates must answer this question before sparking you...',
                  hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.cardSecondary,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                ),
              ),
              const SizedBox(height: 20),

              // Campus Dating Prompts
              const Text('CAMPUS DATING PROMPTS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              _buildEditorInput('Late-Night Campus Confession', _rabbitHoleCtrl),
              const SizedBox(height: 10),
              _buildEditorInput('Best Way to Spend Free Period', _defendTakeCtrl),
              const SizedBox(height: 10),
              _buildEditorInput('My Biggest Campus Green Flag', _teachMeCtrl),
              const SizedBox(height: 20),

              // Identity Fields
              const Text('BASIC IDENTITY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
              const SizedBox(height: 8),
              _buildEditorInput('Display Name', _displayNameCtrl),
              const SizedBox(height: 10),
              _buildEditorInput('Bio / Introduction', _bioCtrl, maxLines: 3),
              const SizedBox(height: 24),

              // Save Button
              GlowButton(
                text: 'Save Profile Changes',
                isLoading: _isSaving,
                onPressed: _saveAll,
                icon: const Icon(Icons.check, color: Colors.white, size: 16),
              ),
              const SizedBox(height: 16),

              // Logout Action
              Center(
                child: TextButton(
                  onPressed: widget.onLogout,
                  child: const Text('Log Out of Cupiddle', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.error)),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEditorInput(String label, TextEditingController ctrl, {int maxLines = 2}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
        const SizedBox(height: 4),
        TextField(
          controller: ctrl,
          maxLines: maxLines,
          style: const TextStyle(fontSize: 13, color: Colors.white),
          decoration: InputDecoration(
            filled: true,
            fillColor: AppColors.cardSecondary,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
            contentPadding: const EdgeInsets.all(12),
          ),
        ),
      ],
    );
  }
}
