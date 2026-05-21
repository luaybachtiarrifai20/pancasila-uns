import 'package:flutter/material.dart';
import 'dosen_penilaian_detail_screen.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class DosenPenilaianScreen extends StatefulWidget {
  const DosenPenilaianScreen({super.key});

  @override
  State<DosenPenilaianScreen> createState() => _DosenPenilaianScreenState();
}

class _DosenPenilaianScreenState extends State<DosenPenilaianScreen> {
  String _selectedClass = 'MKU Pancasila - Kelas A';

  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> submissions = [
      {
        'name': 'Siti Aminah',
        'topic': 'Kasus 1: Toleransi di Era Digital',
        'date': '14 Mei 2026',
        'status': 'Belum Dinilai',
      },
      {
        'name': 'Rina Marlina',
        'topic': 'Kasus 1: Toleransi di Era Digital',
        'date': '13 Mei 2026',
        'status': 'Belum Dinilai',
      },
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: const Text(
          'Penilaian Studi Kasus',
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
      body: Column(
        children: [
          // Class Selector Banner Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: const Border(
                bottom: BorderSide(color: Color(0xFFE2E8F0)),
              ),
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
                const Icon(Icons.school_rounded, color: Color(0xFFEA580C), size: 20),
                const SizedBox(width: 10),
                const Text(
                  'Kelas:',
                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF1E293B)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedClass,
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFF64748B)),
                        style: const TextStyle(
                          color: Color(0xFF1E293B),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                        items: ['MKU Pancasila - Kelas A', 'MKU Pancasila - Kelas B', 'MKU Pancasila - Kelas C']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => _selectedClass = val);
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Submissions list
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('submissions')
                  .where('className', isEqualTo: _selectedClass)
                  .snapshots(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return const Center(
                    child: Text(
                      'Belum ada tugas yang perlu dinilai.',
                      style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
                    ),
                  );
                }

                final docs = snapshot.data!.docs;

                return ListView.builder(
                  padding: const EdgeInsets.all(20.0),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final data = docs[index].data() as Map<String, dynamic>;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(20),
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
                                  data['studentName'] ?? 'Unknown',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  data['topic'] ?? '-',
                                  style: const TextStyle(
                                    color: Color(0xFF475569),
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => DosenPenilaianDetailScreen(submissionId: docs[index].id),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEA580C),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                            child: const Text(
                              'Beri Nilai',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
