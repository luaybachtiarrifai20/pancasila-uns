import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:url_launcher/url_launcher.dart';

class DosenKelolaKasusDetailScreen extends StatefulWidget {
  final String caseId;
  const DosenKelolaKasusDetailScreen({Key? key, required this.caseId}) : super(key: key);

  @override
  State<DosenKelolaKasusDetailScreen> createState() => _DosenKelolaKasusDetailScreenState();
}

class _DosenKelolaKasusDetailScreenState extends State<DosenKelolaKasusDetailScreen> {
  // Helper to build case info once we have the document data
  Widget _buildCaseDetail(Map<String, dynamic> data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tags
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDFA),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                (data['category']?.toString().toUpperCase() ?? 'KASUS'),
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
              data['domain'] ?? 'Umum',
              style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 20),
        // Title
        Text(
          data['title'] ?? 'Judul Kasus',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w900,
            color: Color(0xFF1E293B),
          ),
        ),
        const SizedBox(height: 12),
        // Content
        Text(
          data['content'] ?? '',
          style: const TextStyle(fontSize: 14, height: 1.6, color: Color(0xFF475569)),
          textAlign: TextAlign.justify,
        ),
        if (data['imageUrl'] != null && data['imageUrl'].toString().isNotEmpty) ...[
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              data['imageUrl'],
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
            ),
          ),
        ],
        if (data['videoUrl'] != null && data['videoUrl'].toString().isNotEmpty) ...[
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                final url = Uri.parse(data['videoUrl']);
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
      ],
    );
  }

  // Build list of student submissions for this case
  Widget _buildSubmissionsList(String caseTitle) {
    final submissionsQuery = FirebaseFirestore.instance
        .collection('submissions')
        .where('title', isEqualTo: 'Studi Kasus: $caseTitle')
        .orderBy('timestamp', descending: true)
        .snapshots();

    return StreamBuilder<QuerySnapshot>(
      stream: submissionsQuery,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
        }
        if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
          return const Center(
            child: Text('Belum ada jawaban mahasiswa.', style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic)),
          );
        }
        final submissions = snapshot.data!.docs;
        return ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: submissions.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, idx) {
            final data = submissions[idx].data() as Map<String, dynamic>;
            final studentName = data['userName'] ?? data['userId'] ?? 'Mahasiswa';
            final answer = data['answerText'] ?? '';
            final status = data['status'] ?? 'Belum Dinilai';
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0F172A).withOpacity(0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(studentName, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
                  const SizedBox(height: 6),
                  Text(answer, style: const TextStyle(color: Color(0xFF475569))),
                  const SizedBox(height: 6),
                  Text('Status: $status', style: const TextStyle(color: Color(0xFF0D9488), fontWeight: FontWeight.w600)),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final caseDoc = FirebaseFirestore.instance.collection('cases').doc(widget.caseId).snapshots();
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Detail Studi Kasus', style: TextStyle(color: Color(0xFF1E293B), fontSize: 16, fontWeight: FontWeight.w900)),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
        ),
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: caseDoc,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF0D9488)));
          }
          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(child: Text('Studi kasus tidak ditemukan.', style: TextStyle(color: Color(0xFF64748B))));
          }
          final caseData = snapshot.data!.data() as Map<String, dynamic>;
          final caseTitle = caseData['title'] ?? '';
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Case detail card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withOpacity(0.03),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: _buildCaseDetail(caseData),
                ),
                const SizedBox(height: 24),
                const Text('Jawaban Mahasiswa', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                const SizedBox(height: 12),
                _buildSubmissionsList(caseTitle),
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }
}
