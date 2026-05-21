import 'package:flutter/material.dart';

class PostModuleQuizScreen extends StatefulWidget {
  final String moduleTitle;
  final Color themeColor;

  const PostModuleQuizScreen({
    super.key,
    required this.moduleTitle,
    required this.themeColor,
  });

  @override
  State<PostModuleQuizScreen> createState() => _PostModuleQuizScreenState();
}

class _PostModuleQuizScreenState extends State<PostModuleQuizScreen> {
  int _currentQuestionIndex = 0;
  String? _selectedAnswer;
  bool _isSubmitted = false;

  late final List<Map<String, dynamic>> _questions;

  @override
  void initState() {
    super.initState();
    _questions = [
      {
        'question': 'Apa intisari dari materi ${widget.moduleTitle} yang baru saja Anda pelajari?',
        'options': [
          'Hanya menghafal sejarah saja',
          'Mengamalkan nilai-nilai Pancasila di kehidupan sehari-hari',
          'Mengabaikan perkembangan zaman',
          'Fokus pada nilai akademik teoritis saja'
        ],
        'answer': 'Mengamalkan nilai-nilai Pancasila di kehidupan sehari-hari'
      },
      {
        'question': 'Sikap apa yang mencerminkan pemahaman yang baik setelah membaca materi ini?',
        'options': [
          'Toleransi dan menghargai perbedaan',
          'Memaksakan kehendak kelompok',
          'Bersikap apatis terhadap sosial',
          'Menyebarkan hoaks dan ujaran kebencian'
        ],
        'answer': 'Toleransi dan menghargai perbedaan'
      }
    ];
  }

  void _submitAnswer() {
    setState(() {
      _isSubmitted = true;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _selectedAnswer = null;
        _isSubmitted = false;
      });
    } else {
      // Show result
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Text('Evaluasi Selesai!', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Text('Selamat! Anda telah menyelesaikan materi dan seluruh evaluasi pemahaman untuk ${widget.moduleTitle}.'),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // close dialog
                Navigator.of(context).pop(); // close post quiz screen
                Navigator.of(context).pop(); // close module detail screen
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFB91C1C),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Kembali ke Dashboard', style: TextStyle(color: Colors.white)),
            )
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = _questions[_currentQuestionIndex];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: const Text(
          'Ujian Pemahaman Materi',
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Progress Info Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'SOAL ${_currentQuestionIndex + 1} DARI ${_questions.length}',
                    style: TextStyle(
                      color: widget.themeColor,
                      fontWeight: FontWeight.w900,
                      fontSize: 11,
                      letterSpacing: 1.0,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: widget.themeColor.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Evaluasi',
                      style: TextStyle(color: widget.themeColor, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Question Container Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC), // slate-50
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(
                  question['question'],
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E293B),
                    height: 1.4,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Options Builder
              ...List.generate(
                (question['options'] as List<String>).length,
                (index) {
                  final option = (question['options'] as List<String>)[index];
                  final isSelected = _selectedAnswer == option;
                  final isCorrect = option == question['answer'];

                  Color getCardColor() {
                    if (!_isSubmitted) {
                      return isSelected ? widget.themeColor.withOpacity(0.08) : Colors.white;
                    }
                    if (isCorrect) return const Color(0xFFECFDF5); // green-50
                    if (isSelected && !isCorrect) return const Color(0xFFFEF2F2); // red-50
                    return Colors.white;
                  }

                  Color getBorderColor() {
                    if (!_isSubmitted) {
                      return isSelected ? widget.themeColor : const Color(0xFFE2E8F0);
                    }
                    if (isCorrect) return const Color(0xFF10B981); // green-500
                    if (isSelected && !isCorrect) return const Color(0xFFEF4444); // red-500
                    return const Color(0xFFE2E8F0);
                  }

                  Color getTextColor() {
                    if (isSelected && !_isSubmitted) return widget.themeColor;
                    if (isCorrect && _isSubmitted) return const Color(0xFF047857); // green-700
                    if (isSelected && !isCorrect && _isSubmitted) return const Color(0xFFB91C1C); // red-700
                    return const Color(0xFF475569); // slate-600
                  }

                  return GestureDetector(
                    onTap: _isSubmitted
                        ? null
                        : () {
                            setState(() {
                              _selectedAnswer = option;
                            });
                          },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
                      decoration: BoxDecoration(
                        color: getCardColor(),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: getBorderColor(), width: 2),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              option,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: isSelected || (isCorrect && _isSubmitted) ? FontWeight.w900 : FontWeight.w600,
                                color: getTextColor(),
                                height: 1.3,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (_isSubmitted && isCorrect)
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981))
                          else if (_isSubmitted && isSelected && !isCorrect)
                            const Icon(Icons.cancel_rounded, color: Color(0xFFEF4444))
                          else
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected ? widget.themeColor : const Color(0xFFCBD5E1),
                                  width: 2,
                                ),
                                color: isSelected ? widget.themeColor : Colors.transparent,
                              ),
                              child: isSelected
                                  ? const Icon(Icons.circle, size: 8, color: Colors.white)
                                  : null,
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 36),

              // Action Button
              if (!_isSubmitted)
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _selectedAnswer == null ? null : _submitAnswer,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.themeColor,
                      elevation: 4,
                      shadowColor: widget.themeColor.withOpacity(0.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Text(
                      'Cek Jawaban',
                      style: TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                )
              else
                SizedBox(
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _nextQuestion,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB), // blue-600
                      elevation: 4,
                      shadowColor: const Color(0xFF2563EB).withOpacity(0.2),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      _currentQuestionIndex < _questions.length - 1 ? 'Soal Selanjutnya' : 'Selesai',
                      style: const TextStyle(fontSize: 14, color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
