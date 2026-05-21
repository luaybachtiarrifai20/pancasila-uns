import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class DosenKelolaKuisScreen extends StatefulWidget {
  const DosenKelolaKuisScreen({super.key});

  @override
  State<DosenKelolaKuisScreen> createState() => _DosenKelolaKuisScreenState();
}

class _DosenKelolaKuisScreenState extends State<DosenKelolaKuisScreen> {
  Map<String, String> _moduleTitles = {};

  @override
  void initState() {
    super.initState();
    _loadModules();
  }

  Future<void> _loadModules() async {
    try {
      final snap = await FirebaseFirestore.instance.collection('modules').get();
      final Map<String, String> temp = {};
      for (var doc in snap.docs) {
        temp[doc.id] = doc.data()['title'] ?? doc.id;
      }
      if (mounted) {
        setState(() {
          _moduleTitles = temp;
        });
      }
    } catch (e) {
      debugPrint("Error loading modules: $e");
    }
  }

  Future<void> _handleDelete(String quizId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Hapus Kuis', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin menghapus kuis ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await FirebaseFirestore.instance.collection('quizzes').doc(quizId).delete();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Kuis berhasil dihapus!')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal menghapus: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: const Text(
          'Kelola Kuis Mandiri',
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
        stream: FirebaseFirestore.instance.collection('quizzes').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF9333EA)));
          }
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(
              child: Text(
                'Belum ada daftar kuis.\nKlik + untuk membuat baru.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFF64748B), fontStyle: FontStyle.italic),
              ),
            );
          }

          final docs = snapshot.data!.docs;

          return ListView.builder(
            padding: const EdgeInsets.all(20.0),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final doc = docs[index];
              final data = doc.data() as Map<String, dynamic>;
              final quizId = doc.id;
              final moduleId = data['moduleId'] ?? '';
              final questionsList = data['questions'] as List? ?? [];
              final modTitle = _moduleTitles[moduleId] ?? 'ID Modul: $moduleId';

              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFF1F5F9)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            quizId.replaceFirst('quiz_', '').toUpperCase(),
                            style: const TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            modTitle,
                            style: const TextStyle(
                              color: Color(0xFF64748B),
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFAF5FF),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFF3E8FF)),
                            ),
                            child: Text(
                              '${questionsList.length} Pertanyaan',
                              style: const TextStyle(
                                color: Color(0xFF9333EA),
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit_rounded, color: Color(0xFF2563EB)),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => QuizEditorScreen(
                                  quizId: quizId,
                                  moduleId: moduleId,
                                  questions: questionsList.map((e) => Map<String, dynamic>.from(e)).toList(),
                                ),
                              ),
                            );
                          },
                          tooltip: 'Edit Soal',
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444)),
                          onPressed: () => _handleDelete(quizId),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const QuizEditorScreen(),
            ),
          );
        },
        backgroundColor: const Color(0xFF9333EA), // purple-600
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.add_rounded, color: Colors.white, size: 28),
      ),
    );
  }
}

// ----------------------------------------------------
// FULL-FEATURED INTERACTIVE QUIZ EDITOR SCREEN
// ----------------------------------------------------
class QuizEditorScreen extends StatefulWidget {
  final String? quizId;
  final String? moduleId;
  final List<Map<String, dynamic>>? questions;

  const QuizEditorScreen({
    super.key,
    this.quizId,
    this.moduleId,
    this.questions,
  });

  @override
  State<QuizEditorScreen> createState() => _QuizEditorScreenState();
}

class _QuizEditorScreenState extends State<QuizEditorScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _idController;
  String _selectedModuleId = '';
  List<Map<String, dynamic>> _questionsList = [];
  List<Map<String, dynamic>> _modulesList = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _idController = TextEditingController(text: widget.quizId ?? '');
    _selectedModuleId = widget.moduleId ?? '';
    _questionsList = widget.questions != null
        ? List<Map<String, dynamic>>.from(widget.questions!.map((e) => {
              'q': e['q'] ?? '',
              'options': List<String>.from(e['options'] ?? ['', '', '', '']),
              'a': e['a'] ?? 0,
            }))
        : [
            {
              'q': '',
              'options': ['', '', '', ''],
              'a': 0
            }
          ];

    _fetchModules();
  }

  @override
  void dispose() {
    _idController.dispose();
    super.dispose();
  }

  Future<void> _fetchModules() async {
    try {
      final snap = await FirebaseFirestore.instance.collection('modules').orderBy('order').get();
      final list = snap.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
      setState(() {
        _modulesList = list;
        if (_selectedModuleId.isEmpty && list.isNotEmpty) {
          _selectedModuleId = list[0]['id'];
        }
      });
    } catch (e) {
      debugPrint("Error fetching modules: $e");
    }
  }

  void _addQuestion() {
    setState(() {
      _questionsList.add({
        'q': '',
        'options': ['', '', '', ''],
        'a': 0
      });
    });
  }

  void _removeQuestion(int index) {
    if (_questionsList.length <= 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kuis harus memiliki minimal 1 pertanyaan!')),
      );
      return;
    }
    setState(() {
      _questionsList.removeAt(index);
    });
  }

  Future<void> _saveQuiz() async {
    if (!_formKey.currentState!.validate()) return;

    // Check empty inputs
    for (int i = 0; i < _questionsList.length; i++) {
      final q = _questionsList[i];
      if (q['q'].toString().trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pertanyaan ke-${i + 1} tidak boleh kosong!')),
        );
        return;
      }
      final opts = q['options'] as List;
      for (int j = 0; j < 4; j++) {
        if (opts[j].toString().trim().isEmpty) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Pilihan pada Pertanyaan ke-${i + 1} tidak boleh kosong!')),
          );
          return;
        }
      }
    }

    final quizId = _idController.text.trim();
    if (quizId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('ID Kuis tidak boleh kosong!')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await FirebaseFirestore.instance.collection('quizzes').doc(quizId).set({
        'moduleId': _selectedModuleId,
        'questions': _questionsList,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Kuis berhasil disimpan!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menyimpan kuis: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditMode = widget.quizId != null;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          isEditMode ? 'Edit Kuis Interaktif' : 'Buat Kuis Baru',
          style: const TextStyle(
            color: Color(0xFF1E293B),
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        actions: [
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0),
              child: Center(child: CircularProgressIndicator(color: Color(0xFF9333EA))),
            )
          else
            IconButton(
              icon: const Icon(Icons.save_rounded, color: Color(0xFF9333EA), size: 26),
              onPressed: _saveQuiz,
              tooltip: 'Simpan Kuis',
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20.0),
          children: [
            // Quiz ID Field
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'ID Kuis (Harus Unik)',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _idController,
                    enabled: !isEditMode,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'Contoh: quiz_bab2',
                      filled: true,
                      fillColor: isEditMode ? const Color(0xFFF1F5F9) : const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty ? 'ID Kuis wajib diisi' : null,
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'Pilih Bab Modul',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  if (_modulesList.isEmpty)
                    const LinearProgressIndicator(color: Color(0xFF9333EA))
                  else
                    DropdownButtonFormField<String>(
                      value: _selectedModuleId.isEmpty ? null : _selectedModuleId,
                      items: _modulesList.map((m) {
                        return DropdownMenuItem<String>(
                          value: m['id'] as String,
                          child: Text(m['title'] as String),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _selectedModuleId = val;
                          });
                        }
                      },
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Questions Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Daftar Pertanyaan (${_questionsList.length})',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF1E293B)),
                ),
                TextButton.icon(
                  onPressed: _addQuestion,
                  icon: const Icon(Icons.add, size: 18, color: Color(0xFF9333EA)),
                  label: const Text('Tambah Soal', style: TextStyle(color: Color(0xFF9333EA), fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Questions List
            ...List.generate(_questionsList.length, (qIdx) {
              final q = _questionsList[qIdx];
              final options = q['options'] as List<String>;
              final correctAns = q['a'] as int;

              return Container(
                margin: const EdgeInsets.only(bottom: 20),
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
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFAF5FF),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'Soal #${qIdx + 1}',
                            style: const TextStyle(color: Color(0xFF9333EA), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete_sweep_rounded, color: Color(0xFFEF4444)),
                          onPressed: () => _removeQuestion(qIdx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Pertanyaan:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      initialValue: q['q'],
                      onChanged: (val) => _questionsList[qIdx]['q'] = val,
                      decoration: InputDecoration(
                        hintText: 'Ketik isi pertanyaan...',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Options A, B, C, D
                    const Text(
                      'Pilihan Jawaban:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 8),
                    GridTextFields(
                      options: options,
                      onOptionChanged: (optIdx, val) {
                        setState(() {
                          _questionsList[qIdx]['options'][optIdx] = val;
                        });
                      },
                    ),
                    const SizedBox(height: 20),

                    // Correct Answer Selector
                    const Text(
                      'Jawaban Benar:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: correctAns,
                      items: const [
                        DropdownMenuItem(value: 0, child: Text('Pilihan A', style: TextStyle(color: Color(0xFF10B981)))),
                        DropdownMenuItem(value: 1, child: Text('Pilihan B', style: TextStyle(color: Color(0xFF10B981)))),
                        DropdownMenuItem(value: 2, child: Text('Pilihan C', style: TextStyle(color: Color(0xFF10B981)))),
                        DropdownMenuItem(value: 3, child: Text('Pilihan D', style: TextStyle(color: Color(0xFF10B981)))),
                      ],
                      onChanged: (val) {
                        if (val != null) {
                          setState(() {
                            _questionsList[qIdx]['a'] = val;
                          });
                        }
                      },
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class GridTextFields extends StatelessWidget {
  final List<String> options;
  final Function(int, String) onOptionChanged;

  const GridTextFields({
    super.key,
    required this.options,
    required this.onOptionChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(4, (idx) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: TextFormField(
            initialValue: options[idx],
            onChanged: (v) => onOptionChanged(idx, v),
            decoration: InputDecoration(
              labelText: 'Pilihan ${String.fromCharCode(65 + idx)}',
              filled: true,
              fillColor: const Color(0xFFF8FAFC),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            ),
          ),
        );
      }),
    );
  }
}
