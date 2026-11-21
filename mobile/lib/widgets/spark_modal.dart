import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/profile.dart';
import 'cupiddle_logo.dart';
import 'glow_button.dart';

class SparkModal extends StatefulWidget {
  final UserProfile profile;
  final String targetType;
  final String targetId;
  final String targetContent;
  final Function(String comment, String? gateAnswer) onSendSpark;

  const SparkModal({
    super.key,
    required this.profile,
    required this.targetType,
    required this.targetId,
    required this.targetContent,
    required this.onSendSpark,
  });

  static Future<void> show(
    BuildContext context, {
    required UserProfile profile,
    required String targetType,
    required String targetId,
    required String targetContent,
    required Function(String comment, String? gateAnswer) onSendSpark,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: SparkModal(
          profile: profile,
          targetType: targetType,
          targetId: targetId,
          targetContent: targetContent,
          onSendSpark: onSendSpark,
        ),
      ),
    );
  }

  @override
  State<SparkModal> createState() => _SparkModalState();
}

class _SparkModalState extends State<SparkModal> {
  final TextEditingController _commentCtrl = TextEditingController();
  final TextEditingController _gateCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentCtrl.dispose();
    _gateCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    final comment = _commentCtrl.text.trim();
    final hasGate = widget.profile.gateQuestion != null && widget.profile.gateQuestion!.trim().isNotEmpty;

    if (hasGate && _gateCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please answer their gate question to unlock this connection.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if (comment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please add a curious thought or question.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    widget.onSendSpark(comment, hasGate ? _gateCtrl.text.trim() : null);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final hasGate = widget.profile.gateQuestion != null && widget.profile.gateQuestion!.trim().isNotEmpty;

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

          // Header
          Row(
            children: [
              const CupiddleLogo(size: 24),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Spark ${widget.profile.displayName}',
                  style: const TextStyle(
                    fontFamily: 'Playfair Display',
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                  ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close, color: AppColors.textMuted, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Candor, humor, or intellectual intrigue beats generic compliments.',
            style: TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),

          // Target Content Quote Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.cardSecondary,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              '"${widget.targetContent}"',
              style: const TextStyle(
                fontSize: 13,
                fontStyle: FontStyle.italic,
                color: AppColors.textSecondary,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(height: 14),

          // Gate Question Box (if required)
          if (hasGate) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.cardTertiary,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderRose, width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.lock_outline, size: 14, color: AppColors.rose),
                      const SizedBox(width: 6),
                      Text(
                        'GATE QUESTION (REQUIRED)',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.rose,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    widget.profile.gateQuestion!,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _gateCtrl,
                    style: const TextStyle(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Answer their gate challenge...',
                      hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
                      filled: true,
                      fillColor: AppColors.canvas,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: AppColors.rose),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Comment / Thought Field
          TextField(
            controller: _commentCtrl,
            maxLines: 3,
            style: const TextStyle(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'What caught your curiosity? Share a perspective or question...',
              hintStyle: TextStyle(fontSize: 12, color: AppColors.textMuted),
              filled: true,
              fillColor: AppColors.cardSecondary,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: AppColors.rose),
              ),
              contentPadding: const EdgeInsets.all(14),
            ),
          ),
          const SizedBox(height: 18),

          // Submit Action
          GlowButton(
            text: 'Send Spark (₦0 Free)',
            isLoading: _isSubmitting,
            onPressed: _submit,
            icon: const Icon(Icons.bolt, color: Colors.white, size: 18),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}
