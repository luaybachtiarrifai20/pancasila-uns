import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'post_module_quiz_screen.dart';

class ModuleDetailScreen extends StatefulWidget {
  final String moduleId;
  final String title;
  final String subtitle;
  final Color color;
  final String content;
  final int order;
  final String duration;

  const ModuleDetailScreen({
    super.key,
    required this.moduleId,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.content,
    required this.order,
    required this.duration,
  });

  @override
  State<ModuleDetailScreen> createState() => _ModuleDetailScreenState();
}

class _ModuleDetailScreenState extends State<ModuleDetailScreen> {
  bool _isDosen = false;
  bool _isEditing = false;

  late final TextEditingController _titleController;
  late final TextEditingController _subtitleController;
  late final TextEditingController _contentController;

  String _currentTitle = '';
  String _currentSubtitle = '';
  String _currentContent = '';

  @override
  void initState() {
    super.initState();
    _currentTitle = widget.title;
    _currentSubtitle = widget.subtitle;
    _currentContent = widget.content;

    _titleController = TextEditingController(text: widget.title);
    _subtitleController = TextEditingController(text: widget.subtitle);
    _contentController = TextEditingController(text: widget.content);

    // Check role
    final user = FirebaseAuth.instance.currentUser;
    if (user != null && user.email != null && user.email!.contains('dosen')) {
      _isDosen = true;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _subtitleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    try {
      final user = FirebaseAuth.instance.currentUser;
      final currentDosenId = user?.email ?? 'unknown_dosen';
      await FirebaseFirestore.instance.collection('modules').doc(widget.moduleId).update({
        'title': _titleController.text,
        'subtitle': _subtitleController.text,
        'content': _contentController.text,
        'dosenId': currentDosenId,
      });

      setState(() {
        _currentTitle = _titleController.text;
        _currentSubtitle = _subtitleController.text;
        _currentContent = _contentController.text;
        _isEditing = false;
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Materi berhasil diperbarui!')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal menyimpan: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: const Text(
          'Materi Pembelajaran',
          style: TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        actions: [
          if (_isDosen && !_isEditing)
            IconButton(
              icon: const Icon(Icons.edit_note_rounded, color: Color(0xFFB91C1C), size: 28),
              onPressed: () {
                setState(() {
                  _isEditing = true;
                });
              },
              tooltip: 'Edit Materi',
            ),
        ],
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Container(
          width: double.infinity,
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
          child: _isEditing
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Mode Edit Materi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFFB91C1C)),
                    ),
                    const SizedBox(height: 20),
                    TextField(
                      controller: _titleController,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                      decoration: InputDecoration(
                        labelText: 'Judul Bab',
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFB91C1C), width: 2)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _subtitleController,
                      style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: Color(0xFF64748B)),
                      decoration: InputDecoration(
                        labelText: 'Sub Judul',
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFB91C1C), width: 2)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _contentController,
                      maxLines: 12,
                      style: const TextStyle(fontSize: 13, height: 1.6, color: Color(0xFF475569)),
                      decoration: InputDecoration(
                        labelText: 'Konten Materi',
                        labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: const BorderSide(color: Color(0xFFB91C1C), width: 2)),
                      ),
                    ),
                    const SizedBox(height: 28),
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: OutlinedButton(
                              onPressed: () {
                                setState(() {
                                  _titleController.text = _currentTitle;
                                  _subtitleController.text = _currentSubtitle;
                                  _contentController.text = _currentContent;
                                  _isEditing = false;
                                });
                              },
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                              ),
                              child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 48,
                            child: ElevatedButton(
                              onPressed: _handleSave,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFB91C1C),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ],
                    )
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Meta Tag Row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'PANCASILA DIGITAL',
                            style: TextStyle(
                              color: Color(0xFFB91C1C),
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text('•', style: TextStyle(color: Colors.grey)),
                        const SizedBox(width: 8),
                        const Icon(Icons.access_time_rounded, size: 14, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          widget.duration,
                          style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Title
                    Text(
                      _currentTitle,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1E293B),
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Subtitle with left red border
                    Container(
                      padding: const EdgeInsets.only(left: 16, top: 4, bottom: 4),
                      decoration: const BoxDecoration(
                        border: Border(
                          left: BorderSide(
                            color: Color(0xFFB91C1C),
                            width: 4,
                          ),
                        ),
                      ),
                      child: Text(
                        '"$_currentSubtitle"',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF64748B),
                          fontStyle: FontStyle.italic,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 20),

                    // Dynamic Main Content
                    Text(
                      _currentContent,
                      style: const TextStyle(
                        fontSize: 14,
                        height: 1.6,
                        color: Color(0xFF475569),
                      ),
                      textAlign: TextAlign.justify,
                    ),
                    const SizedBox(height: 24),

                    // Detailed Subsections depending on Bab Order
                    if (widget.order == 1) ...[
                      const Text(
                        'Urgensi Pembelajaran',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Pancasila merupakan dasar negara dan ideologi bangsa Indonesia yang memiliki '
                        'peran sangat penting dalam mengatur kehidupan berbangsa dan bernegara. '
                        'Dalam modul ini, kita akan membahas lebih dalam mengenai esensi dan urgensi '
                        'Pancasila sesuai dengan perkembangan zaman.',
                        style: TextStyle(fontSize: 14, height: 1.5, color: Color(0xFF475569)),
                      ),
                      const SizedBox(height: 20),

                      // Points Box matching web red-50
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: const Color(0xFFFEE2E2)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.bookmark_rounded, color: Color(0xFFB91C1C), size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Poin Penting:',
                                  style: TextStyle(
                                    color: Color(0xFFB91C1C),
                                    fontWeight: FontWeight.w900,
                                    fontSize: 13,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildPointItem('Memperkuat Pancasila sebagai dasar falsafah negara.'),
                            _buildPointItem('Memberikan pemahaman dan penghayatan atas jiwa luhur bangsa.'),
                            _buildPointItem('Meningkatkan kemandirian belajar melalui literasi digital.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],

                    const Text(
                      'Internalisasi Nilai',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Sebagai mahasiswa, kemandirian belajar sangat dibutuhkan untuk dapat mengeksplorasi '
                      'berbagai sumber literasi guna memperdalam pemahaman tentang Pancasila. '
                      'Nilai-nilai seperti Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, dan Keadilan '
                      'harus diinternalisasi dan diimplementasikan dalam kehidupan sehari-hari.',
                      style: TextStyle(fontSize: 14, height: 1.5, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 36),

                    // Bottom Button Row
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFD1FAE5)),
                          ),
                          child: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 24),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Materi Selesai?',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                              ),
                              Text(
                                'Tandai progres Anda',
                                style: TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => PostModuleQuizScreen(
                                moduleTitle: _currentTitle,
                                themeColor: widget.color,
                              ),
                            ),
                          );
                        },
                        icon: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                        label: const Text(
                          'Mulai Ujian Pemahaman',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFB91C1C), // red-700
                          elevation: 4,
                          shadowColor: const Color(0xFFB91C1C).withOpacity(0.2),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildPointItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Color(0xFFB91C1C), fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: Color(0xFF991B1B),
                fontSize: 12,
                fontWeight: FontWeight.bold,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
