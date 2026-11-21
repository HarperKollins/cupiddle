import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../constants/app_colors.dart';
import '../../constants/campuses.dart';
import '../../models/profile.dart';
import '../../services/api_service.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';
import '../../widgets/mood_tag_selector.dart';

class OnboardingScreen extends StatefulWidget {
  final UserProfile profile;
  final Function(UserProfile updated) onCompleted;

  const OnboardingScreen({
    super.key,
    required this.profile,
    required this.onCompleted,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 0;
  final int _totalSteps = 5;

  // Step 1: Campus & Academic Identity
  late String _campus;
  String _level = '300L';
  final TextEditingController _facultyCtrl = TextEditingController(text: 'Law');
  final TextEditingController _deptCtrl = TextEditingController(text: 'Public & Private Law');
  final TextEditingController _bioCtrl = TextEditingController();

  // Step 2: Campus Intention Walls (Section 3.2)
  String _selectedIntention = 'Companionship';
  final List<Map<String, String>> _intentions = [
    {
      'id': 'Study Buddy',
      'icon': '📚',
      'title': 'Study Buddy',
      'subtitle': 'Exam prep, nocturnal reading lock-ins & academic collaboration.',
    },
    {
      'id': 'Companionship',
      'icon': '☕',
      'title': 'Companionship',
      'subtitle': 'Genuine campus friendships, hostel chill, gist & laughter.',
    },
    {
      'id': 'Campus Spark',
      'icon': '⚡',
      'title': 'Campus Spark',
      'subtitle': 'Intentional dating, romantic chemistry & finding your campus person.',
    },
    {
      'id': 'Mutual Intimacy',
      'icon': '🔥',
      'title': 'Mutual Intimacy',
      'subtitle': 'Consensual chemistry, late nights, zero drama & mutual respect.',
    },
  ];

  // Step 3: Live Campus Vibe & Connection Gate Question (Section 4)
  String _vibeTag = NigerianCampuses.moodTags[0];
  final TextEditingController _gateQuestionCtrl = TextEditingController(
    text: 'What\'s an unconventional belief you hold?',
  );
  final List<String> _suggestedQuestions = [
    'Which lecturer has the hardest exam on campus?',
    'Are you a nocturnal reader or early bird?',
    '2 truths and a lie about you — go!',
    'Best spot for food near campus?',
    'What\'s the most overrated thing about university life?',
  ];

  // Step 4: 10-Dimension Lifestyle Values (Section 3.3)
  final Map<String, int> _dimensions = {
    'Late Night Owl vs Early Morning': 75,
    'Deep Intellectual vs Playful Banter': 65,
    'Spontaneous vs Structured Plans': 50,
    'Campus Butterfly vs Cozy Corner': 40,
    'Grindset Hustle vs Easygoing Flow': 80,
    'Spiritual & Faith Weight': 60,
  };

  // Step 5: Portrait Photo Upload
  final ImagePicker _picker = ImagePicker();
  Uint8List? _pickedPhotoBytes;
  String? _selectedPhotoUrl;
  bool _isUploadingPhoto = false;

  final List<String> _presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  ];

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _campus = widget.profile.campus ?? 'EBSU';
    if (widget.profile.level != null && widget.profile.level!.isNotEmpty) {
      _level = widget.profile.level!;
    }
    if (widget.profile.faculty != null && widget.profile.faculty!.isNotEmpty) {
      _facultyCtrl.text = widget.profile.faculty!;
    }
    if (widget.profile.department != null && widget.profile.department!.isNotEmpty) {
      _deptCtrl.text = widget.profile.department!;
    }
    if (widget.profile.bio != null && widget.profile.bio!.isNotEmpty) {
      _bioCtrl.text = widget.profile.bio!;
    }
    if (widget.profile.datingIntentions != null && widget.profile.datingIntentions!.isNotEmpty) {
      _selectedIntention = widget.profile.datingIntentions!;
    }
    if (widget.profile.gateQuestion != null && widget.profile.gateQuestion!.isNotEmpty) {
      _gateQuestionCtrl.text = widget.profile.gateQuestion!;
    }
    if (widget.profile.vibeTag != null && widget.profile.vibeTag!.isNotEmpty) {
      _vibeTag = widget.profile.vibeTag!;
    }
    if (widget.profile.photos.isNotEmpty) {
      _selectedPhotoUrl = widget.profile.primaryPhotoUrl;
    } else {
      _selectedPhotoUrl = _presetAvatars[0];
    }
  }

  @override
  void dispose() {
    _facultyCtrl.dispose();
    _deptCtrl.dispose();
    _bioCtrl.dispose();
    _gateQuestionCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto(ImageSource source) async {
    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1350,
        imageQuality: 85,
      );
      if (file == null) return;

      final bytes = await file.readAsBytes();
      setState(() {
        _pickedPhotoBytes = bytes;
        _isUploadingPhoto = true;
      });

      final safeName = file.name.isNotEmpty ? file.name : 'portrait.jpg';
      final uploadedUrl = await ApiService().uploadPhoto(bytes, safeName);
      if (mounted) {
        setState(() {
          _selectedPhotoUrl = uploadedUrl;
          _isUploadingPhoto = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Portrait uploaded successfully! ✦'),
            backgroundColor: AppColors.success,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (err) {
      if (mounted) {
        setState(() => _isUploadingPhoto = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: ${err.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _handleComplete() async {
    setState(() => _isLoading = true);

    try {
      final updated = await ApiService().completeOnboarding(
        campus: _campus,
        faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : 'General Studies',
        department: _deptCtrl.text.trim().isNotEmpty ? _deptCtrl.text.trim() : 'General',
        level: _level,
        datingIntentions: _selectedIntention,
        gateQuestion: _gateQuestionCtrl.text.trim().isNotEmpty
            ? _gateQuestionCtrl.text.trim()
            : 'What\'s an unconventional belief you hold?',
        vibeTag: _vibeTag,
        bio: _bioCtrl.text.trim(),
        dimensionScores: _dimensions,
        photoUrl: _selectedPhotoUrl,
      );

      widget.onCompleted(updated);
    } catch (err) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(err.toString().replaceAll('Exception: ', '')),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _nextStep() {
    if (_currentStep < _totalSteps - 1) {
      setState(() => _currentStep++);
    } else {
      _handleComplete();
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Top Navigation & Progress Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Column(
                children: [
                  Row(
                    children: [
                      if (_currentStep > 0)
                        IconButton(
                          onPressed: _prevStep,
                          icon: const Icon(Icons.arrow_back, color: AppColors.textMuted, size: 20),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      if (_currentStep > 0) const SizedBox(width: 12),
                      const CupiddleLogo(size: 24, showText: true),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.cardSecondary,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Text(
                          'Step ${_currentStep + 1} of $_totalSteps',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.rose,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  // Progress Track
                  Row(
                    children: List.generate(_totalSteps, (idx) {
                      final isPassed = idx <= _currentStep;
                      return Expanded(
                        child: Container(
                          height: 4,
                          margin: EdgeInsets.only(right: idx < _totalSteps - 1 ? 6 : 0),
                          decoration: BoxDecoration(
                            color: isPassed ? AppColors.rose : AppColors.cardSecondary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),

            // Step Content Area
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                child: _buildCurrentStep(),
              ),
            ),

            // Bottom Navigation Action
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: GlowButton(
                text: _currentStep == _totalSteps - 1 ? 'Launch Campus Profile 🚀' : 'Continue',
                isLoading: _isLoading,
                onPressed: _nextStep,
                icon: Icon(
                  _currentStep == _totalSteps - 1 ? Icons.rocket_launch : Icons.arrow_forward,
                  color: Colors.white,
                  size: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_currentStep) {
      case 0:
        return _buildStep1CampusIdentity();
      case 1:
        return _buildStep2Intentions();
      case 2:
        return _buildStep3VibeAndGate();
      case 3:
        return _buildStep4LifestyleSliders();
      case 4:
        return _buildStep5PortraitUpload();
      default:
        return const SizedBox();
    }
  }

  // --- Step 1: Campus & Academic Circle ---
  Widget _buildStep1CampusIdentity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Campus Circle',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Cupiddle is campus-first. Lock your university to connect with verified undergraduates.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 24),

        // Campus Dropdown
        const Text(
          'YOUR UNIVERSITY / CAMPUS',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
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
              value: _campus,
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
                if (val != null) setState(() => _campus = val);
              },
            ),
          ),
        ),
        const SizedBox(height: 18),

        // Academic Level Pills
        const Text(
          'ACADEMIC LEVEL',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ['100L', '200L', '300L', '400L', '500L', 'PG'].map((lvl) {
            final isSelected = _level == lvl;
            return GestureDetector(
              onTap: () => setState(() => _level = lvl),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.rose : AppColors.cardSecondary,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isSelected ? AppColors.rose : AppColors.border),
                ),
                child: Text(
                  lvl,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 18),

        // Faculty & Department
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'FACULTY',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _facultyCtrl,
                    style: const TextStyle(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'e.g. Law, Medicine',
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
                  const Text(
                    'DEPARTMENT',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _deptCtrl,
                    style: const TextStyle(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'e.g. Public Law, CS',
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
        const SizedBox(height: 18),

        // Short Campus Bio
        const Text(
          'CAMPUS HEADLINE / BIO (OPTIONAL)',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: _bioCtrl,
          maxLines: 2,
          style: const TextStyle(fontSize: 13, color: Colors.white),
          decoration: InputDecoration(
            hintText: 'e.g. 300L Law student · Moot Court advocate & Afrobeats lover.',
            hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
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

  // --- Step 2: Campus Intention Walls ---
  Widget _buildStep2Intentions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What\'s Your Campus Intention?',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Hard-walled matching: you only meet students whose intentions overlap with yours.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        ..._intentions.map((intent) {
          final isSelected = _selectedIntention == intent['id'];
          return GestureDetector(
            onTap: () => setState(() => _selectedIntention = intent['id']!),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.rose.withOpacity(0.12) : AppColors.cardSecondary,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isSelected ? AppColors.rose : AppColors.border,
                  width: isSelected ? 1.5 : 1.0,
                ),
              ),
              child: Row(
                children: [
                  Text(intent['icon']!, style: const TextStyle(fontSize: 28)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          intent['title']!,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          intent['subtitle']!,
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected ? AppColors.rose : Colors.transparent,
                      border: Border.all(
                        color: isSelected ? AppColors.rose : AppColors.border,
                        width: 2,
                      ),
                    ),
                    child: isSelected
                        ? const Icon(Icons.check, size: 12, color: Colors.white)
                        : null,
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  // --- Step 3: Live Campus Vibe & Connection Gate Question ---
  Widget _buildStep3VibeAndGate() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Vibe & Gate Question',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Protect your inbox. Candidates must answer your gate question before sparking.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        // Live Campus Mood Selector
        const Text(
          'WHAT ARE YOU IN THE MOOD FOR TODAY?',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 8),
        MoodTagSelector(
          selectedTag: _vibeTag,
          onSelectTag: (tag) => setState(() => _vibeTag = tag),
        ),
        const SizedBox(height: 24),

        // Connection Gate Question Container
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.cardSecondary,
            borderRadius: BorderRadius.circular(18),
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
                    'YOUR CONNECTION GATE QUESTION',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Only candidates who submit an honest answer can connect to your chat.',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _gateQuestionCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g. Which 300L lecturer tests hardest? / Are you a nocturnal reader or early bird?',
                  hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.canvas,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.rose)),
                  contentPadding: const EdgeInsets.all(12),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Suggested Prompts
        const Text(
          'TAP FOR QUICK INSPIRATION:',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: _suggestedQuestions.map((q) {
            return GestureDetector(
              onTap: () => setState(() => _gateQuestionCtrl.text = q),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.cardSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(
                  q,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // --- Step 4: Campus Lifestyle & Values Sliders ---
  Widget _buildStep4LifestyleSliders() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Campus Lifestyle & Values',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Powers our mathematical compatibility formula without relying on superficial swiping.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        ..._dimensions.keys.map((dim) {
          final val = _dimensions[dim]!;
          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
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
                    Expanded(
                      child: Text(
                        dim,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ),
                    Text('$val%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.rose)),
                  ],
                ),
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: AppColors.rose,
                    inactiveTrackColor: AppColors.border,
                    thumbColor: Colors.white,
                    overlayColor: AppColors.rose.withOpacity(0.2),
                    trackHeight: 3,
                  ),
                  child: Slider(
                    value: val.toDouble(),
                    min: 0,
                    max: 100,
                    onChanged: (newVal) => setState(() => _dimensions[dim] = newVal.round()),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  // --- Step 5: Portrait Photo Upload (Native File & Camera) ---
  Widget _buildStep5PortraitUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Campus Portrait',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Upload a real photo. In Discovery, photos are protected with a 40px blur until a mutual Spark is accepted.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 24),

        // Main Portrait Display Frame
        Center(
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 220,
                height: 280,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.borderRose, width: 2),
                  color: AppColors.cardSecondary,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.rose.withOpacity(0.25),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(22),
                  child: _pickedPhotoBytes != null
                      ? Image.memory(
                          _pickedPhotoBytes!,
                          fit: BoxFit.cover,
                          width: 220,
                          height: 280,
                        )
                      : (_selectedPhotoUrl != null && _selectedPhotoUrl!.isNotEmpty)
                          ? Image.network(
                              _selectedPhotoUrl!,
                              fit: BoxFit.cover,
                              width: 220,
                              height: 280,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Icon(Icons.person, size: 64, color: AppColors.textMuted),
                              ),
                            )
                          : const Center(
                              child: Icon(Icons.add_a_photo, size: 48, color: AppColors.textMuted),
                            ),
                ),
              ),

              // Uploading overlay
              if (_isUploadingPhoto)
                Container(
                  width: 220,
                  height: 280,
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: AppColors.rose),
                      SizedBox(height: 12),
                      Text(
                        'Uploading portrait...',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                    ],
                  ),
                ),

              // Verified Check Badge
              if (!_isUploadingPhoto && (_pickedPhotoBytes != null || (_selectedPhotoUrl != null && _selectedPhotoUrl!.isNotEmpty)))
                Positioned(
                  bottom: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.success,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.success.withOpacity(0.4),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 12, color: Colors.white),
                        SizedBox(width: 4),
                        Text(
                          'Ready',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Action Buttons: Camera & Gallery
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _isUploadingPhoto ? null : () => _pickPhoto(ImageSource.camera),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cardSecondary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppColors.border),
                  ),
                ),
                icon: const Icon(Icons.camera_alt, color: AppColors.rose, size: 18),
                label: const Text(
                  'Take Selfie',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _isUploadingPhoto ? null : () => _pickPhoto(ImageSource.gallery),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.cardSecondary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                    side: const BorderSide(color: AppColors.borderRose),
                  ),
                ),
                icon: const Icon(Icons.photo_library, color: AppColors.rose, size: 18),
                label: const Text(
                  'Choose Photo',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Preset Avatars for fast testing
        const Text(
          'OR PICK A CAMPUS PRESET:',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: _presetAvatars.map((url) {
            final isSelected = _selectedPhotoUrl == url && _pickedPhotoBytes == null;
            return GestureDetector(
              onTap: () {
                setState(() {
                  _pickedPhotoBytes = null;
                  _selectedPhotoUrl = url;
                });
              },
              child: Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? AppColors.rose : AppColors.border,
                    width: isSelected ? 2.5 : 1.0,
                  ),
                  image: DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}
