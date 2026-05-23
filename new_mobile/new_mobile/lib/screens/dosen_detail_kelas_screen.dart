import 'dart:convert';
import 'dart:io' show Platform;

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DosenDetailKelasScreen extends StatefulWidget {
  final String classId;
  final String className;

  const DosenDetailKelasScreen({
    super.key,
    required this.classId,
    required this.className,
  });

  @override
  State<DosenDetailKelasScreen> createState() => _DosenDetailKelasScreenState();
}

class _DosenDetailKelasScreenState extends State<DosenDetailKelasScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  String getBackendUrl() {
    return dotenv.get('BACKEND_URL');
  }

  Future<void> _hapusMahasiswa(String email, String name) async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Mahasiswa secara TOTAL'),
        content: Text(
          'Apakah Anda yakin ingin menghapus "$name"? Tindakan ini akan menghapus akun login dan profil database.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Hapus', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            CircularProgressIndicator(color: Colors.white),
            SizedBox(width: 12),
            Text('Sedang menghapus...'),
          ],
        ),
      ),
    );

    try {
      final response = await http.delete(
        Uri.parse('${getBackendUrl()}/delete-user'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).hideCurrentSnackBar();

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Mahasiswa berhasil dihapus total!')),
        );
      } else {
        final errData = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal menghapus: ${errData['message'] ?? 'Error'}'),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Koneksi backend gagal: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          widget.className,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.blueGrey[700],
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: _firestore
            .collection('users')
            .where('role', isEqualTo: 'mahasiswa')
            .where('classId', isEqualTo: widget.classId)
            .snapshots(),
        builder: (context, snapshot) {
          if (snapshot.hasError)
            return const Center(child: Text('Terjadi kesalahan'));
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final docs = snapshot.data!.docs;
          if (docs.isEmpty) {
            return const Center(
              child: Text('Belum ada mahasiswa terdaftar di kelas ini.'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16.0),
            itemCount: docs.length,
            itemBuilder: (context, index) {
              final student = docs[index].data() as Map<String, dynamic>;
              final String email = docs[index].id;
              final String name = student['name'] ?? 'Tanpa Nama';
              final String nim = student['nim'] ?? 'N/A';

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: CircleAvatar(
                    backgroundColor: Colors.blueGrey[100],
                    child: Text(
                      name[0].toUpperCase(),
                      style: TextStyle(
                        color: Colors.blueGrey[800],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(
                    name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text('NIM: $nim'),
                      Text('Email Virtual: $email'),
                    ],
                  ),
                  trailing: IconButton(
                    icon: const Icon(
                      Icons.remove_circle_outline,
                      color: Colors.red,
                    ),
                    onPressed: () => _hapusMahasiswa(email, name),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          _tampilkanDialogTambahMahasiswa(context);
        },
        backgroundColor: Colors.blueGrey[700],
        icon: const Icon(Icons.person_add, color: Colors.white),
        label: const Text(
          'Tambah Mahasiswa',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  void _tampilkanDialogTambahMahasiswa(BuildContext context) {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController nimController = TextEditingController();
    bool isSaving = false;
    String errorText = '';

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text(
                'Tambah Mahasiswa',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController,
                      decoration: InputDecoration(
                        labelText: 'Nama Mahasiswa *',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      enabled: !isSaving,
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: nimController,
                      decoration: InputDecoration(
                        labelText: 'NIM *',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      keyboardType: TextInputType.text,
                      enabled: !isSaving,
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.amber.withOpacity(0.5),
                        ),
                      ),
                      child: const Text(
                        'Password default mahasiswa adalah: pancasila123.\nNIM tidak boleh sama dengan yang sudah terdaftar.',
                        style: TextStyle(fontSize: 12, color: Colors.orange),
                      ),
                    ),
                    if (errorText.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        errorText,
                        style: const TextStyle(
                          color: Colors.red,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: isSaving ? null : () => Navigator.pop(context),
                  child: const Text('Batal'),
                ),
                ElevatedButton(
                  onPressed: isSaving
                      ? null
                      : () async {
                          final String name = nameController.text.trim();
                          final String nim = nimController.text.trim();

                          if (name.isEmpty || nim.isEmpty) {
                            setDialogState(() {
                              errorText = 'Nama dan NIM wajib diisi!';
                            });
                            return;
                          }

                          setDialogState(() {
                            isSaving = true;
                            errorText = '';
                          });

                          try {
                            final response = await http.post(
                              Uri.parse('${getBackendUrl()}/create-user'),
                              headers: {'Content-Type': 'application/json'},
                              body: jsonEncode({
                                'name': name,
                                'nim': nim,
                                'classId': widget.classId,
                              }),
                            );

                            if (response.statusCode == 201) {
                              if (context.mounted) {
                                Navigator.pop(context);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Mahasiswa berhasil ditambahkan!',
                                    ),
                                  ),
                                );
                              }
                            } else {
                              final errData = jsonDecode(response.body);
                              setDialogState(() {
                                isSaving = false;
                                errorText =
                                    errData['message'] ??
                                    'Gagal menambahkan mahasiswa';
                              });
                            }
                          } catch (e) {
                            setDialogState(() {
                              isSaving = false;
                              errorText = 'Koneksi backend gagal: $e';
                            });
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueGrey[700],
                  ),
                  child: isSaving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Simpan',
                          style: TextStyle(color: Colors.white),
                        ),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
