import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dosen_detail_kelas_screen.dart';

class DosenKelolaKelasScreen extends StatefulWidget {
  const DosenKelolaKelasScreen({super.key});

  @override
  State<DosenKelolaKelasScreen> createState() => _DosenKelolaKelasScreenState();
}

class _DosenKelolaKelasScreenState extends State<DosenKelolaKelasScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('Kelola Kelas', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.blueGrey[700],
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: _firestore.collection('classes').snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError) return const Center(child: Text('Terjadi kesalahan'));
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final docs = snapshot.data!.docs;
          if (docs.isEmpty) {
            return const Center(child: Text('Belum ada kelas yang terdaftar.'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final docData = docs[index].data() as Map<String, dynamic>;
              final String classId = docs[index].id;
              final String className = docData['name'] ?? 'Kelas Tanpa Nama';
              final String schedule = docData['schedule'] ?? 'Tidak ada jadwal';

              // Stream count of students in this class
              return StreamBuilder<QuerySnapshot>(
                stream: _firestore
                    .collection('users')
                    .where('role', isEqualTo: 'mahasiswa')
                    .where('classId', isEqualTo: classId)
                    .snapshots(),
                builder: (context, studentSnapshot) {
                  int studentCount = 0;
                  if (studentSnapshot.hasData) {
                    studentCount = studentSnapshot.data!.docs.length;
                  }

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: Colors.blueGrey[100],
                        child: Icon(Icons.class_, color: Colors.blueGrey[800]),
                      ),
                      title: Text(className, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('$studentCount Mahasiswa • $schedule'),
                      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => DosenDetailKelasScreen(
                              classId: classId,
                              className: className,
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          _tampilkanDialogBuatKelas(context);
        },
        backgroundColor: Colors.blueGrey[700],
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Buat Kelas Baru', style: TextStyle(color: Colors.white)),
      ),
    );
  }

  void _tampilkanDialogBuatKelas(BuildContext context) {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController scheduleController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Buat Kelas Baru'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: InputDecoration(
                  labelText: 'Nama Kelas',
                  hintText: 'Contoh: MKU Pancasila - Kelas D',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: scheduleController,
                decoration: InputDecoration(
                  labelText: 'Jadwal Kelas',
                  hintText: 'Contoh: Kamis, 14:00',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameController.text.trim().isEmpty) return;

                final classId = 'kelas_${DateTime.now().millisecondsSinceEpoch}';
                await _firestore.collection('classes').doc(classId).set({
                  'name': nameController.text.trim(),
                  'schedule': scheduleController.text.trim().isEmpty ? 'Tidak ada jadwal' : scheduleController.text.trim(),
                  'dosenId': 'dosen1@pancasila.id',
                });

                if (context.mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Kelas berhasil ditambahkan!')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blueGrey[700]),
              child: const Text('Simpan', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
