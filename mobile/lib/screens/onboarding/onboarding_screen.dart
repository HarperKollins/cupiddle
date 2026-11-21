import 'package:flutter/material.dart';
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
  int _currentStep = 0; // 0..4
  final int _totalSteps = 5;

  // Step 1: Prompts
  final TextEditingController _rabbitHoleCtrl = TextEditingController();
  final TextEditingController _defendTakeCtrl = TextEditingController();
  final TextEditingController _teachMeCtrl = TextEditingController();

  // Step 2: World Tags
  final List<String> _worldTags = ['Afrobeats', 'Indie Film', 'Tech Startups', 'Philosophy'];
  final TextEditingController _tagInputCtrl = TextEditingController();

  // Step 3: 10 Dimensions Values (0..100)
  final Map<String, int> _dimensions = {
    'Late Night Owl vs Early Morning': 75,
    'Deep Intellectual vs Playful Banter': 60,
    'Spontaneous vs Structured Plans': 50,
    'Social Butterfly vs Cozy Corner': 40,
    'Nerd Passion vs Chill Flow': 80,
  };

  // Step 4: Campus & Gate Question
  late String _campus;
  String _level = '300L';
  final TextEditingController _facultyCtrl = TextEditingController();
  final TextEditingController _gateQuestionCtrl = TextEditingController(
    text: 'What\'s an unconventional belief you hold?',
  );
  String _vibeTag = NigerianCampuses.moodTags[0];

  // Step 5: Portrait photo
  final TextEditingController _photoUrlCtrl = TextEditingController();
  String _selectedPhotoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _campus = widget.profile.campus ?? 'EBSU';
    _rabbitHoleCtrl.text = widget.profile.rabbitHole ?? '';
    _defendTakeCtrl.text = widget.profile.defendTake ?? '';
    _teachMeCtrl.text = widget.profile.teachMe ?? '';
    if (widget.profile.myWorldTags.isNotEmpty) {
      _worldTags.clear();
      _worldTags.addAll(widget.profile.myWorldTags);
    }
    if (widget.profile.photos.isNotEmpty) {
      _selectedPhotoUrl = widget.profile.primaryPhotoUrl;
    }
  }

  @override
  void dispose() {
    _rabbitHoleCtrl.dispose();
    _defendTakeCtrl.dispose();
    _teachMeCtrl.dispose();
    _tagInputCtrl.dispose();
    _facultyCtrl.dispose();
    _gateQuestionCtrl.dispose();
    _photoUrlCtrl.dispose();
    super.dispose();
  }

  void _addTag() {
    final t = _tagInputCtrl.text.trim();
    if (t.isNotEmpty && !_worldTags.contains(t)) {
      setState(() {
        _worldTags.add(t);
        _tagInputCtrl.clear();
      });
    }
  }

  Future<void> _handleComplete() async {
    setState(() => _isLoading = true);

    try {
      final updated = await ApiService().completeOnboarding(
        rabbitHole: _rabbitHoleCtrl.text.trim(),
        defendTake: _defendTakeCtrl.text.trim(),
        teachMe: _teachMeCtrl.text.trim(),
        myWorldTags: _worldTags,
        dimensionScores: _dimensions,
        campus: _campus,
        level: _level,
        faculty: _facultyCtrl.text.trim().isNotEmpty ? _facultyCtrl.text.trim() : 'General',
        gateQuestion: _gateQuestionCtrl.text.trim(),
        vibeTag: _vibeTag,
        photoUrl: _selectedPhotoUrl,
      );

      widget.onCompleted(updated);
    } catch (err: any) {
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
            // Top Bar & Progress
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
                      Text(
                        'Step ${_currentStep + 1} of $_totalSteps',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.rose),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
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

            // Step Content
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                child: _buildCurrentStep(),
              ),
            ),

            // Bottom Navigation CTA
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: GlowButton(
                text: _currentStep == _totalSteps - 1 ? 'Launch Campus Profile' : 'Continue',
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
        return _buildStep1Prompts();
      case 1:
        return _buildStep2WorldTags();
      case 2:
        return _buildStep3ValuesSliders();
      case 3:
        return _buildStep4CampusAndGate();
      case 4:
        return _buildStep5PortraitUpload();
      default:
        return const SizedBox();
    }
  }

  // --- Step 1: Curiosity Prompts ---
  Widget _buildStep1Prompts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Curiosity Prompts',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Cupiddle is idea-first. People connect through your obsessions and candid takes.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        _buildPromptInput(
          title: 'MY RABBIT HOLE',
          subtitle: 'What late night obsession keeps you awake?',
          hint: 'e.g. Nigerian indie cinema grammar, cellular automata, quantum computing...',
          controller: _rabbitHoleCtrl,
        ),
        const SizedBox(height: 16),

        _buildPromptInput(
          title: 'DEFEND THIS TAKE',
          subtitle: 'An unfiltered opinion you are willing to defend.',
          hint: 'e.g. Streaming algorithms flattened musical bravery...',
          controller: _defendTakeCtrl,
        ),
        const SizedBox(height: 16),

        _buildPromptInput(
          title: 'TEACH ME SOMETHING',
          subtitle: 'What could you talk about for hours with zero notes?',
          hint: 'e.g. How CRISPR gene editing works; why sourdough is an ecosystem...',
          controller: _teachMeCtrl,
        ),
      ],
    );
  }

  Widget _buildPromptInput({
    required String title,
    required String subtitle,
    required String hint,
    required TextEditingController controller,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardSecondary,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderRose, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          TextField(
            controller: controller,
            maxLines: 2,
            style: const TextStyle(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: hint,
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
    );
  }

  // --- Step 2: World Tags ---
  Widget _buildStep2WorldTags() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'My World Tags',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Books, films, anime, subgenres, programming languages, and creators you love.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _worldTags.map((tag) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.rose.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.borderRose),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(tag, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTap: () => setState(() => _worldTags.remove(tag)),
                    child: const Icon(Icons.close, size: 14, color: AppColors.rose),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _tagInputCtrl,
                onSubmitted: (_) => _addTag(),
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Add a tag (e.g. Dune, Rust, Nollywood)...',
                  hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                  filled: true,
                  fillColor: AppColors.cardSecondary,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 10),
            GestureDetector(
              onTap: _addTag,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Text('Add', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // --- Step 3: Values Sliders ---
  Widget _buildStep3ValuesSliders() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '10-Dim Lifestyle & Values',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Powers our campus matching formula without relying on arbitrary swipe algorithms.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        ..._dimensions.keys.map((dim) {
          final val = _dimensions[dim]!;
          return Container(
            margin: const EdgeInsets.only(bottom: 16),
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
                      child: Text(dim, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white)),
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

  // --- Step 4: Campus & Gate Question ---
  Widget _buildStep4CampusAndGate() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Campus Vibe & Gate Question',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Protect your inbox. Candidates must answer your gate question before sparking.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 20),

        // Live Campus Mood Selector
        const Text('WHAT ARE YOU IN THE MOOD FOR TODAY?', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
        const SizedBox(height: 8),
        MoodTagSelector(selectedTag: _vibeTag, onSelectTag: (tag) => setState(() => _vibeTag = tag)),
        const SizedBox(height: 20),

        // Connection Gate Question Box
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
                  Text('YOUR CONNECTION GATE QUESTION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Only candidates who submit an honest answer can connect to your chat.',
                style: TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: _gateQuestionCtrl,
                maxLines: 2,
                style: const TextStyle(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g. Which 300L lecturer tests hardest? / Are you a night owl or morning reader?',
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
        const SizedBox(height: 20),

        // Level & Faculty
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ACADEMIC LEVEL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
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
                        value: _level,
                        isExpanded: true,
                        dropdownColor: AppColors.cardSecondary,
                        icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.rose),
                        items: ['100L', '200L', '300L', '400L', '500L', 'PG'].map((l) {
                          return DropdownMenuItem(value: l, child: Text(l, style: const TextStyle(fontSize: 13, color: Colors.white)));
                        }).toList(),
                        onChanged: (val) => setState(() => _level = val ?? '300L'),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('FACULTY / DEPT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _facultyCtrl,
                    style: const TextStyle(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'e.g. Law, CS, Med',
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
      ],
    );
  }

  // --- Step 5: Portrait Photo ---
  Widget _buildStep5PortraitUpload() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Portrait',
          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white),
        ),
        const SizedBox(height: 6),
        Text(
          'Choose a portrait that represents you authentically.',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 24),

        Center(
          child: Container(
            width: 220,
            height: 280,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: AppColors.borderRose, width: 2),
              image: DecorationImage(
                image: NetworkImage(_selectedPhotoUrl),
                fit: BoxFit.cover,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.rose.withOpacity(0.25),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Photo URL input option
        TextField(
          controller: _photoUrlCtrl,
          style: const TextStyle(fontSize: 13, color: Colors.white),
          decoration: InputDecoration(
            hintText: 'Paste image link (Unsplash, Cloudinary, etc.)...',
            hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
            filled: true,
            fillColor: AppColors.cardSecondary,
            suffixIcon: IconButton(
              icon: const Icon(Icons.check, color: AppColors.rose),
              onPressed: () {
                if (_photoUrlCtrl.text.trim().isNotEmpty) {
                  setState(() => _selectedPhotoUrl = _photoUrlCtrl.text.trim());
                }
              },
            ),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.border)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.rose)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}
