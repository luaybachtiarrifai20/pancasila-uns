import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:url_launcher/url_launcher.dart';

class CaseStudyScreen extends StatefulWidget {
  const CaseStudyScreen({super.key});

  @override
  State<CaseStudyScreen> createState() => _CaseStudyScreenState();
}

class _CaseStudyScreenState extends State<CaseStudyScreen> {
  final _commentController = TextEditingController();
  String? _selectedCaseId;
  Map<String, dynamic>? _selectedCaseData;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final text = _commentController.text.trim();
    if (text.isEmpty || _selectedCaseId == null) return;

    setState(() => _isSubmitting = true);

    final user = FirebaseAuth.instance.currentUser;
    final userEmail = user?.email ?? 'mahasiswa@kampus.ac.id';
    final userName = userEmail.split('@')[0];

    try {
      // 1. Add comment to subcollection
      await FirebaseFirestore.instance
          .collection('cases')
          .doc(_selectedCaseId)
          .collection('comments')
          .add({
        'user': userName,
        'text': text,
        'likes': 0,
        'timestamp': DateTime.now().toIso8601String(),
      });

      // 2. Add submission for grading
      await FirebaseFirestore.instance.collection('submissions').add({
        'userId': userEmail,
        'userName': userName,
        'title': 'Studi Kasus: ${_selectedCaseData?['title'] ?? 'Diskusi'}',
        'type': 'tugas',
        'answerText': text,
        'score': 0,
        'status': 'Belum Dinilai',
        'timestamp': DateTime.now().toIso8601String(),
      });

      _commentController.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Analisis Anda berhasil dikirim!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mengirim: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _handleLike(String commentId, int currentLikes) async {
    if (_selectedCaseId == null) return;
    try {
      await FirebaseFirestore.instance
          .collection('cases')
          .doc(_selectedCaseId)
          .collection('comments')
          .doc(commentId)
          .update({'likes': currentLikes + 1});
    } catch (e) {
      debugPrint("Error liking comment: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: const Text(
          'Diskusi & Studi Kasus',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        scrolledUnderElevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xFFE2E8F0),
            height: 1.0,
          ),
        ),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('cases').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
          }

          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: Text(
                  'Studi kasus belum tersedia.\nSilakan hubungi dosen Anda.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                ),
              ),
            );
          }

          final casesList = snapshot.data!.docs;

          // Select first case if none is selected yet
          if (_selectedCaseId == null) {
            _selectedCaseId = casesList[0].id;
            _selectedCaseData = casesList[0].data() as Map<String, dynamic>;
          } else {
            // Update selectedCaseData if Firestore data changed
            final currentDoc = casesList.firstWhere((doc) => doc.id == _selectedCaseId);
            _selectedCaseData = currentDoc.data() as Map<String, dynamic>;
          }

          return CustomScrollView(
            slivers: [
              // Case Study horizontal list selector
              SliverToBoxAdapter(
                child: Container(
                  height: 90,
                  margin: const EdgeInsets.only(top: 16, bottom: 8),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: casesList.length,
                    itemBuilder: (context, idx) {
                      final cDoc = casesList[idx];
                      final cData = cDoc.data() as Map<String, dynamic>;
                      final isSelected = cDoc.id == _selectedCaseId;

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCaseId = cDoc.id;
                            _selectedCaseData = cData;
                          });
                        },
                        child: Container(
                          width: 180,
                          margin: const EdgeInsets.only(right: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFF0FDFA) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF0D9488) : const Color(0xFFE2E8F0),
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                cData['category'] ?? 'Sila',
                                style: TextStyle(
                                  color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF64748B),
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                cData['title'] ?? 'Diskusi',
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  color: isSelected ? const Color(0xFF0F766E) : const Color(0xFF1E293B),
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),

              // Selected Case details & submissions form
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0F172A).withOpacity(0.03),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        )
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Metadata Tag
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF0FDFA),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                _selectedCaseData?['category']?.toUpperCase() ?? 'KASUS',
                                style: const TextStyle(
                                  color: Color(0xFF0D9488),
                                  fontSize: 9,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text('•', style: TextStyle(color: Colors.grey)),
                            const SizedBox(width: 8),
                            const Icon(Icons.public_rounded, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(
                              _selectedCaseData?['domain'] ?? 'Umum',
                              style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Title
                        Text(
                          _selectedCaseData?['title'] ?? 'Judul Kasus',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Skenario Kasus
                        Text(
                          _selectedCaseData?['content'] ?? '',
                          style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF475569)),
                          textAlign: TextAlign.justify,
                        ),
                        if (_selectedCaseData?['imageUrl'] != null && _selectedCaseData!['imageUrl'].toString().isNotEmpty) ...[
                          const SizedBox(height: 20),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              _selectedCaseData!['imageUrl'],
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                            ),
                          ),
                        ],
                        if (_selectedCaseData?['videoUrl'] != null && _selectedCaseData!['videoUrl'].toString().isNotEmpty) ...[
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final url = Uri.parse(_selectedCaseData!['videoUrl']);
                                if (await canLaunchUrl(url)) {
                                  await launchUrl(url);
                                } else {
                                  if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Tidak dapat membuka link video.')),
                                    );
                                  }
                                }
                              },
                              icon: const Icon(Icons.play_circle_fill_rounded, color: Color(0xFFE11D48)),
                              label: const Text('Tonton Video Studi Kasus', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold)),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                side: const BorderSide(color: Color(0xFFFECDD3), width: 1.5),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                backgroundColor: const Color(0xFFFFF1F2),
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 28),
                        const Divider(color: Color(0xFFE2E8F0)),
                        const SizedBox(height: 20),

                        // Form Label
                        const Text(
                          'Tulis Analisis Anda:',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Textfield
                        TextField(
                          controller: _commentController,
                          maxLines: 6,
                          decoration: InputDecoration(
                            hintText: 'Ketik analisis kritis Anda di sini...',
                            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            contentPadding: const EdgeInsets.all(18),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20),
                              borderSide: const BorderSide(color: Color(0xFF0D9488), width: 2),
                            ),
                          ),
                          style: const TextStyle(fontSize: 13, color: Color(0xFF1E293B)),
                        ),
                        const SizedBox(height: 20),

                        // Submit button
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton.icon(
                            onPressed: _isSubmitting ? null : _handleSubmit,
                            icon: _isSubmitting
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Icon(Icons.send_rounded, color: Colors.white, size: 16),
                            label: const Text(
                              'Kirim Analisis',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0D9488),
                              disabledBackgroundColor: Colors.teal.shade200,
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),

              // Live comments header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(left: 20, right: 20, top: 24, bottom: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.forum_outlined, color: Color(0xFF0D9488), size: 20),
                      const SizedBox(width: 8),
                      const Text(
                        'Diskusi Live Mahasiswa',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                      ),
                    ],
                  ),
                ),
              ),

              // Live Comments list
              StreamBuilder<QuerySnapshot>(
                stream: FirebaseFirestore.instance
                    .collection('cases')
                    .doc(_selectedCaseId)
                    .collection('comments')
                    .orderBy('timestamp', descending: true)
                    .snapshots(),
                builder: (context, commentSnap) {
                  if (commentSnap.connectionState == ConnectionState.waiting) {
                    return const SliverToBoxAdapter(
                      child: Center(child: Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator(color: Color(0xFF0D9488)))),
                    );
                  }

                  final comments = commentSnap.data?.docs ?? [];

                  if (comments.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 32.0),
                        child: Text(
                          'Belum ada tanggapan. Jadilah yang pertama memberikan analisis!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF94A3B8), fontStyle: FontStyle.italic, fontSize: 12),
                        ),
                      ),
                    );
                  }

                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, idx) {
                        final cDoc = comments[idx];
                        final cData = cDoc.data() as Map<String, dynamic>;
                        final commentId = cDoc.id;
                        final userInitial = cData['user'] != null && cData['user'].toString().isNotEmpty
                            ? cData['user'].toString().substring(0, 1).toUpperCase()
                            : 'M';
                        final likesCount = cData['likes'] as int? ?? 0;

                        return Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: const Color(0xFFE0F2FE),
                                    radius: 18,
                                    child: Text(
                                      userInitial,
                                      style: const TextStyle(color: Color(0xFF0369A1), fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        cData['user'] ?? 'Mahasiswa',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                                      ),
                                      const Text(
                                        'Baru saja',
                                        style: TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.w500),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                cData['text'] ?? '',
                                style: const TextStyle(fontSize: 13, height: 1.5, color: Color(0xFF475569)),
                              ),
                              const SizedBox(height: 14),
                              GestureDetector(
                                onTap: () => _handleLike(commentId, likesCount),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.thumb_up_alt_outlined, size: 14, color: Color(0xFF64748B)),
                                    const SizedBox(width: 6),
                                    Text(
                                      '$likesCount Suka',
                                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                      childCount: comments.length,
                    ),
                  );
                },
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 40)),
            ],
          );
        },
      ),
    );
  }
}
