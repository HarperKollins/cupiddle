import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/spark.dart';
import '../../services/api_service.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';

class SparksInboxScreen extends StatefulWidget {
  final VoidCallback onRefreshCount;
  final Function(String conversationId)? onOpenChat;

  const SparksInboxScreen({
    super.key,
    required this.onRefreshCount,
    this.onOpenChat,
  });

  @override
  State<SparksInboxScreen> createState() => _SparksInboxScreenState();
}

class _SparksInboxScreenState extends State<SparksInboxScreen> {
  List<Spark> _sparks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSparks();
  }

  Future<void> _loadSparks() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService().getReceivedSparks();
      setState(() {
        _sparks = list.where((s) => s.status == 'pending').toList();
        _isLoading = false;
      });
      widget.onRefreshCount();
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleRespond(Spark spark, String status) async {
    try {
      await ApiService().respondSpark(spark.id, status);
      setState(() {
        _sparks.removeWhere((s) => s.id == spark.id);
      });
      widget.onRefreshCount();

      if (status == 'accepted') {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Connected with ${spark.sender?.displayName ?? 'Match'}! Conversation unlocked in Chat.'),
              backgroundColor: AppColors.rose,
            ),
          );
        }
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvas,
      body: SafeArea(
        child: Column(
          children: [
            // Top Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              child: Row(
                children: [
                  const CupiddleLogo(size: 24),
                  const SizedBox(width: 8),
                  const Text(
                    'Sparks Inbox',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.rose.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderRose),
                    ),
                    child: Text(
                      '${_sparks.length} Pending',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose),
                    ),
                  ),
                ],
              ),
            ),

            // Content List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.rose))
                  : _sparks.isEmpty
                      ? _buildEmptyState()
                      : ListView.separated(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          itemCount: _sparks.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 16),
                          itemBuilder: (context, index) {
                            final spark = _sparks[index];
                            return _buildSparkCard(spark);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.mark_email_read_outlined, size: 40, color: AppColors.rose),
              const SizedBox(height: 14),
              const Text(
                'Inbox Zero',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'When students on campus answer your gate questions or spark your takes, they appear here.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: AppColors.textMuted, height: 1.4),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSparkCard(Spark spark) {
    final sender = spark.sender;
    final photoUrl = sender?.primaryPhotoUrl ??
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.borderRose, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author Header
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundImage: NetworkImage(photoUrl),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '${sender?.displayName ?? 'Student'}, ${sender?.age ?? 20}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                        ),
                        if (sender?.username != null) ...[
                          const SizedBox(width: 6),
                          Text(
                            '@${sender!.username}',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.rose),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${sender?.campus ?? 'Campus'} • ${sender?.city ?? 'Nigeria'}',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.rose.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text('Sparked', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.rose)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Sparked Content Reference
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.cardSecondary,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.format_quote, size: 16, color: AppColors.rose),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    spark.targetContent,
                    style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.textSecondary),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Sender's Comment
          Text(
            '"${spark.comment}"',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white, height: 1.4),
          ),
          const SizedBox(height: 12),

          // Candidate's Gate Answer (if present)
          if (spark.gateAnswer != null && spark.gateAnswer!.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.cardTertiary,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderRose, width: 1.1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.lock_open, size: 13, color: AppColors.rose),
                      SizedBox(width: 6),
                      Text('THEIR GATE QUESTION ANSWER', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.rose, letterSpacing: 0.5)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    spark.gateAnswer!,
                    style: const TextStyle(fontSize: 13, color: Colors.white, height: 1.4, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Actions Row: Pass vs Accept
          Row(
            children: [
              Expanded(
                flex: 1,
                child: GestureDetector(
                  onTap: () => _handleRespond(spark, 'rejected'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.cardSecondary,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: const Center(
                      child: Text('Pass', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: GlowButton(
                  height: 44,
                  text: 'Connect & Chat',
                  onPressed: () => _handleRespond(spark, 'accepted'),
                  icon: const Icon(Icons.chat_bubble_outline, size: 16, color: Colors.white),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
