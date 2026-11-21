import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../models/community.dart';
import '../../models/profile.dart';
import '../../services/api_service.dart';
import '../../widgets/cupiddle_logo.dart';
import '../../widgets/glow_button.dart';
import '../../widgets/spark_modal.dart';

class CommunitiesScreen extends StatefulWidget {
  final UserProfile currentProfile;

  const CommunitiesScreen({super.key, required this.currentProfile});

  @override
  State<CommunitiesScreen> createState() => _CommunitiesScreenState();
}

class _CommunitiesScreenState extends State<CommunitiesScreen> {
  List<Community> _communities = [];
  String? _selectedSlug;
  List<CommunityPost> _posts = [];
  bool _isLoading = true;
  bool _isLoadingPosts = false;

  final TextEditingController _commNameCtrl = TextEditingController();
  final TextEditingController _commDescCtrl = TextEditingController();
  String _commCategory = 'Curiosity';

  final TextEditingController _postTitleCtrl = TextEditingController();
  final TextEditingController _postContentCtrl = TextEditingController();

  final TextEditingController _commentCtrl = TextEditingController();
  String? _expandedPostId;
  List<PostComment> _comments = [];

  @override
  void initState() {
    super.initState();
    _loadCommunities();
  }

  @override
  void dispose() {
    _commNameCtrl.dispose();
    _commDescCtrl.dispose();
    _postTitleCtrl.dispose();
    _postContentCtrl.dispose();
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadCommunities() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService().getCommunities();
      setState(() {
        _communities = list;
        if (list.isNotEmpty && _selectedSlug == null) {
          _selectedSlug = list.first.slug;
        }
        _isLoading = false;
      });
      if (_selectedSlug != null) {
        _loadPosts(_selectedSlug!);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadPosts(String slug) async {
    setState(() => _isLoadingPosts = true);
    try {
      final posts = await ApiService().getCommunityPosts(slug);
      setState(() {
        _posts = posts;
        _isLoadingPosts = false;
      });
    } catch (e) {
      setState(() => _isLoadingPosts = false);
    }
  }

  Future<void> _createCommunity() async {
    if (_commNameCtrl.text.trim().isEmpty) return;
    try {
      final created = await ApiService().createCommunity(
        name: _commNameCtrl.text.trim(),
        description: _commDescCtrl.text.trim(),
        category: _commCategory,
      );
      setState(() {
        _communities.insert(0, created);
        _selectedSlug = created.slug;
      });
      Navigator.of(context).pop();
      _commNameCtrl.clear();
      _commDescCtrl.clear();
      _loadPosts(created.slug);
    } catch (err: any) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(err.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _createPost() async {
    if (_postTitleCtrl.text.trim().isEmpty || _selectedSlug == null) return;
    try {
      final post = await ApiService().createPost(
        _selectedSlug!,
        _postTitleCtrl.text.trim(),
        _postContentCtrl.text.trim(),
      );
      setState(() => _posts.insert(0, post));
      Navigator.of(context).pop();
      _postTitleCtrl.clear();
      _postContentCtrl.clear();
    } catch (err: any) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(err.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _toggleComments(String postId) async {
    if (_expandedPostId == postId) {
      setState(() => _expandedPostId = null);
      return;
    }
    setState(() {
      _expandedPostId = postId;
      _comments = [];
    });
    try {
      final cmts = await ApiService().getPostComments(postId);
      setState(() => _comments = cmts);
    } catch (e) {
      // Ignored
    }
  }

  Future<void> _addComment(String postId) async {
    final text = _commentCtrl.text.trim();
    if (text.isEmpty) return;
    try {
      final comment = await ApiService().addComment(postId, text);
      setState(() {
        _comments.add(comment);
        _commentCtrl.clear();
      });
    } catch (err) {
      // Ignored
    }
  }

  void _sparkAuthor(CommunityPost post) {
    if (post.author == null) return;
    SparkModal.show(
      context,
      profile: post.author!,
      targetType: 'community_post',
      targetId: post.id,
      targetContent: post.title,
      onSendSpark: (comment, gateAnswer) async {
        try {
          await ApiService().sendSpark(
            receiverId: post.userId,
            targetType: 'community_post',
            targetId: post.id,
            targetContent: post.title,
            comment: comment,
            gateAnswer: gateAnswer,
          );
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Spark sent to ${post.author?.displayName}!'), backgroundColor: AppColors.rose),
            );
          }
        } catch (err: any) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(err.toString()), backgroundColor: AppColors.error),
            );
          }
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentComm = _communities.firstWhere(
      (c) => c.slug == _selectedSlug,
      orElse: () => Community(id: '', name: 'Rabbit Holes', slug: '', description: '', category: ''),
    );

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
                    'Rabbit Holes',
                    style: TextStyle(fontFamily: 'Playfair Display', fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: _showCreateCommunityDialog,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.rose.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.borderRose),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.add, size: 14, color: AppColors.rose),
                          SizedBox(width: 4),
                          Text('New Hole', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.rose)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Communities Horizontal Filter Tabs
            if (_communities.isNotEmpty)
              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _communities.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final comm = _communities[index];
                    final isSelected = comm.slug == _selectedSlug;

                    return GestureDetector(
                      onTap: () {
                        setState(() => _selectedSlug = comm.slug);
                        _loadPosts(comm.slug);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.rose : AppColors.cardSecondary,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: isSelected ? AppColors.rose : AppColors.border),
                        ),
                        child: Center(
                          child: Text(
                            comm.name,
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
            const SizedBox(height: 12),

            // Community Hero Banner
            if (_selectedSlug != null && currentComm.id.isNotEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.borderRose, width: 1.1),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(currentComm.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                            const SizedBox(height: 4),
                            Text(
                              currentComm.description,
                              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: _showCreatePostDialog,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.edit, size: 12, color: Colors.white),
                              SizedBox(width: 4),
                              Text('Post', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 12),

            // Posts Feed
            Expanded(
              child: _isLoadingPosts
                  ? const Center(child: CircularProgressIndicator(color: AppColors.rose))
                  : _posts.isEmpty
                      ? _buildEmptyPosts()
                      : ListView.separated(
                          physics: const BouncingScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                          itemCount: _posts.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 14),
                          itemBuilder: (context, index) {
                            final post = _posts[index];
                            return _buildPostCard(post);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyPosts() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.forum_outlined, size: 36, color: AppColors.rose),
          const SizedBox(height: 10),
          const Text('No Discussions Yet', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
          const SizedBox(height: 4),
          Text('Be the first curious voice in this hole.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
          const SizedBox(height: 14),
          GlowButton(
            width: 160,
            height: 38,
            text: 'Start Thread',
            onPressed: _showCreatePostDialog,
          ),
        ],
      ),
    );
  }

  Widget _buildPostCard(CommunityPost post) {
    final isExpanded = _expandedPostId == post.id;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author Row & Spark Author
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.rose.withOpacity(0.2),
                child: Text(
                  (post.author?.displayName ?? 'M')[0].toUpperCase(),
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.rose),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  '${post.author?.displayName ?? 'Student'}, ${post.author?.campus ?? 'Campus'}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                ),
              ),
              if (post.userId != widget.currentProfile.userId)
                GestureDetector(
                  onTap: () => _sparkAuthor(post),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.rose.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderRose),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.bolt, size: 12, color: AppColors.rose),
                        SizedBox(width: 2),
                        Text('Spark Author', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.rose)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Post Title
          Text(
            post.title,
            style: const TextStyle(fontFamily: 'Playfair Display', fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white),
          ),
          const SizedBox(height: 6),

          // Post Content
          Text(
            post.content,
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.45),
          ),
          const SizedBox(height: 12),

          // Footer & Comments Trigger
          Row(
            children: [
              GestureDetector(
                onTap: () => _toggleComments(post.id),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.cardSecondary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.chat_bubble_outline, size: 12, color: AppColors.rose),
                      const SizedBox(width: 4),
                      Text(
                        '${post.commentCount} Replies',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Expanded Comments Drawer
          if (isExpanded) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.canvas,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderRose),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ..._comments.map((c) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text.rich(
                          TextSpan(
                            text: '${c.author?.displayName ?? 'Student'}: ',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.rose),
                            children: [
                              TextSpan(
                                text: c.content,
                                style: const TextStyle(fontWeight: FontWeight.w400, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      )),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _commentCtrl,
                          style: const TextStyle(fontSize: 12, color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'Add a curious reply...',
                            hintStyle: TextStyle(fontSize: 11, color: AppColors.textMuted),
                            filled: true,
                            fillColor: AppColors.cardSecondary,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () => _addComment(post.id),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(10)),
                          child: const Text('Reply', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showCreateCommunityDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.borderRose)),
        title: const Text('Create a Rabbit Hole', style: TextStyle(fontFamily: 'Playfair Display', color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _commNameCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Community Name (e.g. Afrobeats Theory)',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppColors.cardSecondary,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _commDescCtrl,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'What kind of ideas live here?',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppColors.cardSecondary,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
          GlowButton(width: 120, height: 38, text: 'Create', onPressed: _createCommunity),
        ],
      ),
    );
  }

  void _showCreatePostDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: AppColors.borderRose)),
        title: const Text('Start Discussion', style: TextStyle(fontFamily: 'Playfair Display', color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _postTitleCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Title or Question...',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppColors.cardSecondary,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _postContentCtrl,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Elaborate on your inquiry...',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppColors.cardSecondary,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted))),
          GlowButton(width: 120, height: 38, text: 'Publish', onPressed: _createPost),
        ],
      ),
    );
  }
}
