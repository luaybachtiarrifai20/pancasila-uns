import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class DosenPenilaianDetailScreen extends StatefulWidget {
  final String submissionId;
  const DosenPenilaianDetailScreen({Key? key, required this.submissionId}) : super(key: key);

  @override
  State<DosenPenilaianDetailScreen> createState() => _DosenPenilaianDetailScreenState();
}

class _DosenPenilaianDetailScreenState extends State<DosenPenilaianDetailScreen> {
  final TextEditingController _scoreController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _scoreController.dispose();
    super.dispose();
  }

  Future<void> _submitScore() async {
    final scoreText = _scoreController.text.trim();
    if (scoreText.isEmpty) return;
    final int? score = int.tryParse(scoreText);
    if (score == null || score < 0 || score > 100) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Masukkan nilai antara 0-100.')));
      return;
    }
    setState(() {
      _isSubmitting = true;
    });
    try {
      await FirebaseFirestore.instance
          .collection('submissions')
          .doc(widget.submissionId)
          .update({
        'score': score,
        'status': 'Dinilai',
        'gradedAt': FieldValue.serverTimestamp(),
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Nilai berhasil disimpan.')));
      Navigator.of(context).pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal menyimpan: $e')));
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Detail Penilaian'),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
      ),
      body: StreamBuilder<DocumentSnapshot>(
        stream: FirebaseFirestore.instance
            .collection('submissions')
            .doc(widget.submissionId)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(child: Text('Data tidak ditemukan.'));
          }
          final data = snapshot.data!.data() as Map<String, dynamic>;
          return Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mahasiswa: ${data['studentName'] ?? '-'}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Text('Topik: ${data['topic'] ?? '-'}'),
                const SizedBox(height: 8),
                Text('Tanggal Submit: ${data['date'] ?? '-'}'),
                const SizedBox(height: 8),
                Text('Status: ${data['status'] ?? '-'}'),
                const SizedBox(height: 20),
                TextField(
                  controller: _scoreController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Nilai (0-100)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submitScore,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFEA580C),
                      foregroundColor: Colors.white,
                    ),
                    child: _isSubmitting
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Text('Simpan Nilai'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
