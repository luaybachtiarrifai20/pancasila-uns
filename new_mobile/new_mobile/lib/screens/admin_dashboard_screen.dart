import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dosen_kelola_modul_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Controllers for CRUD Dialogs
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _nidnController = TextEditingController();
  final _bioController = TextEditingController();
  
  final _classNameController = TextEditingController();
  final _classScheduleController = TextEditingController();

  final _nimController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _nidnController.dispose();
    _bioController.dispose();
    _classNameController.dispose();
    _classScheduleController.dispose();
    _nimController.dispose();
    super.dispose();
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin keluar dari akun Administrator?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            child: const Text('Keluar', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await FirebaseAuth.instance.signOut();
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/');
      }
    }
  }

  // ==========================================
  // DELETE DIALOGS
  // ==========================================
  Future<void> _deleteUser(String email, String role) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Hapus $role', style: const TextStyle(fontWeight: FontWeight.bold)),
        content: Text('Apakah Anda yakin ingin menghapus $email dari database?'),
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
      final messenger = ScaffoldMessenger.of(context);
      try {
        await _firestore.collection('users').doc(email).delete();
        messenger.showSnackBar(SnackBar(content: Text('$role berhasil dihapus!')));
      } catch (e) {
        messenger.showSnackBar(SnackBar(content: Text('Gagal menghapus: $e')));
      }
    }
  }

  Future<void> _deleteClass(String classId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Hapus Kelas', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin menghapus kelas ini?'),
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
      final messenger = ScaffoldMessenger.of(context);
      try {
        await _firestore.collection('classes').doc(classId).delete();
        messenger.showSnackBar(const SnackBar(content: Text('Kelas berhasil dihapus!')));
      } catch (e) {
        messenger.showSnackBar(SnackBar(content: Text('Gagal menghapus kelas: $e')));
      }
    }
  }

  // ==========================================
  // ADD & EDIT FORM POPUPS
  // ==========================================
  void _showDosenForm({String? docId, Map<String, dynamic>? currentData}) {
    final isEdit = docId != null;
    if (isEdit && currentData != null) {
      _emailController.text = docId;
      _nameController.text = currentData['name'] ?? '';
      _nidnController.text = currentData['nidn'] ?? '';
      _bioController.text = currentData['bio'] ?? '';
    } else {
      _emailController.clear();
      _nameController.clear();
      _nidnController.clear();
      _bioController.clear();
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(isEdit ? 'Sunting Dosen' : 'Tambah Dosen Baru', style: const TextStyle(fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: _emailController,
                  enabled: !isEdit,
                  decoration: InputDecoration(
                    labelText: 'Email Dosen / Username',
                    hintText: 'Contoh: dosen3 atau email@pancasila.id',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: 'Nama Lengkap Dosen',
                    hintText: 'Contoh: Dr. Herman, M.Si',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _nidnController,
                  decoration: InputDecoration(
                    labelText: 'NIDN Dosen',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _bioController,
                  maxLines: 2,
                  decoration: InputDecoration(
                    labelText: 'Biodata / Deskripsi Singkat',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
            ),
            ElevatedButton(
              onPressed: () async {
                String email = _emailController.text.trim().toLowerCase();
                final name = _nameController.text.trim();
                final nidn = _nidnController.text.trim();
                final bio = _bioController.text.trim();

                if (email.isEmpty || name.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Email/Username dan nama tidak boleh kosong!')),
                  );
                  return;
                }

                if (!email.contains('@')) {
                  email = '$email@pancasila.id';
                }

                final messenger = ScaffoldMessenger.of(context);
                Navigator.pop(context);

                try {
                  await _firestore.collection('users').doc(email).set({
                    'id': email,
                    'name': name,
                    'role': 'dosen',
                    'nidn': nidn,
                    'bio': bio,
                  }, SetOptions(merge: true));

                  messenger.showSnackBar(
                    SnackBar(content: Text(isEdit ? 'Dosen berhasil diperbarui!' : 'Dosen berhasil ditambahkan!')),
                  );
                } catch (e) {
                  messenger.showSnackBar(SnackBar(content: Text('Gagal menyimpan: $e')));
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
              child: const Text('Simpan', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _showKelasForm({String? docId, Map<String, dynamic>? currentData, List<DocumentSnapshot>? dosens}) {
    final isEdit = docId != null;
    
    if (isEdit && currentData != null) {
      _classNameController.text = currentData['name'] ?? '';
      _classScheduleController.text = currentData['schedule'] ?? '';
    } else {
      _classNameController.clear();
      _classScheduleController.clear();
    }

    String selectedDosenId = currentData?['dosenId'] ?? (dosens != null && dosens.isNotEmpty ? dosens.first.id : '');

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text(isEdit ? 'Sunting Kelas' : 'Tambah Kelas Baru', style: const TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: _classNameController,
                      decoration: InputDecoration(
                        labelText: 'Nama Kelas',
                        hintText: 'Contoh: MKU Pancasila - Kelas A',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _classScheduleController,
                      decoration: InputDecoration(
                        labelText: 'Jadwal Kuliah',
                        hintText: 'Contoh: Senin, 08:00 WIB',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: selectedDosenId.isNotEmpty ? selectedDosenId : null,
                      decoration: InputDecoration(
                        labelText: 'Dosen Pengampu',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: (dosens ?? []).map((d) {
                        final data = d.data() as Map<String, dynamic>;
                        return DropdownMenuItem<String>(
                          value: d.id,
                          child: Text(data['name'] ?? d.id, overflow: TextOverflow.ellipsis),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setModalState(() {
                          selectedDosenId = val ?? '';
                        });
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
                ),
                ElevatedButton(
                  onPressed: () async {
                    final name = _classNameController.text.trim();
                    final schedule = _classScheduleController.text.trim();
                    final finalId = isEdit ? docId : 'kelas_${DateTime.now().millisecondsSinceEpoch}';

                    if (name.isEmpty || selectedDosenId.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Nama kelas dan Dosen Pengampu wajib diisi!')),
                      );
                      return;
                    }

                    final messenger = ScaffoldMessenger.of(context);
                    Navigator.pop(context);

                    try {
                      await _firestore.collection('classes').doc(finalId).set({
                        'id': finalId,
                        'name': name,
                        'schedule': schedule,
                        'dosenId': selectedDosenId,
                      }, SetOptions(merge: true));

                      messenger.showSnackBar(
                        SnackBar(content: Text(isEdit ? 'Kelas berhasil diperbarui!' : 'Kelas berhasil ditambahkan!')),
                      );
                    } catch (e) {
                      messenger.showSnackBar(SnackBar(content: Text('Gagal menyimpan kelas: $e')));
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
                  child: const Text('Simpan', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showMahasiswaForm({String? docId, Map<String, dynamic>? currentData, List<DocumentSnapshot>? classes}) {
    final isEdit = docId != null;

    if (isEdit && currentData != null) {
      _emailController.text = docId;
      _nameController.text = currentData['name'] ?? '';
      _nimController.text = currentData['nim'] ?? '';
    } else {
      _emailController.clear();
      _nameController.clear();
      _nimController.clear();
    }

    String selectedClassId = currentData?['classId'] ?? (classes != null && classes.isNotEmpty ? classes.first.id : '');

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text(isEdit ? 'Sunting Mahasiswa' : 'Tambah Mahasiswa Baru', style: const TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: _emailController,
                      enabled: !isEdit,
                      decoration: InputDecoration(
                        labelText: 'NIM atau Email Login',
                        hintText: 'Contoh: k4517026',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        labelText: 'Nama Lengkap',
                        hintText: 'Contoh: Andi Pratama',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _nimController,
                      decoration: InputDecoration(
                        labelText: 'NIM Mahasiswa',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: selectedClassId.isNotEmpty ? selectedClassId : null,
                      decoration: InputDecoration(
                        labelText: 'Pilihan Kelas',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: (classes ?? []).map((c) {
                        final data = c.data() as Map<String, dynamic>;
                        return DropdownMenuItem<String>(
                          value: c.id,
                          child: Text(data['name'] ?? c.id, overflow: TextOverflow.ellipsis),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setModalState(() {
                          selectedClassId = val ?? '';
                        });
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Batal', style: TextStyle(color: Color(0xFF64748B))),
                ),
                ElevatedButton(
                  onPressed: () async {
                    String email = _emailController.text.trim().toLowerCase();
                    final name = _nameController.text.trim();
                    final nimVal = _nimController.text.trim();

                    if (email.isEmpty || name.isEmpty || selectedClassId.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('NIM/Email, nama, dan kelas wajib diisi!')),
                      );
                      return;
                    }

                    if (!email.contains('@')) {
                      email = '$email@pancasila.id';
                    }

                    final finalNIM = nimVal.isNotEmpty ? nimVal : email.split('@')[0].toUpperCase();

                    final messenger = ScaffoldMessenger.of(context);
                    Navigator.pop(context);

                    try {
                      await _firestore.collection('users').doc(email).set({
                        'id': email,
                        'name': name,
                        'role': 'mahasiswa',
                        'nim': finalNIM,
                        'classId': selectedClassId,
                      }, SetOptions(merge: true));

                      messenger.showSnackBar(
                        SnackBar(content: Text(isEdit ? 'Mahasiswa berhasil diperbarui!' : 'Mahasiswa berhasil ditambahkan!')),
                      );
                    } catch (e) {
                      messenger.showSnackBar(SnackBar(content: Text('Gagal menyimpan mahasiswa: $e')));
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
                  child: const Text('Simpan', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Administrator MKU',
              style: TextStyle(color: Color(0xFF1E293B), fontSize: 16, fontWeight: FontWeight.w900),
            ),
            Text(
              'KENDALI SISTEM MOBILE',
              style: TextStyle(color: Color(0xFF94A3B8), fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1.0),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
            onPressed: _logout,
          ),
          const SizedBox(width: 8),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: const Color(0xFFB91C1C),
          unselectedLabelColor: const Color(0xFF64748B),
          indicatorColor: const Color(0xFFB91C1C),
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          tabs: const [
            Tab(icon: Icon(Icons.people_rounded, size: 20), text: 'Dosen'),
            Tab(icon: Icon(Icons.school_rounded, size: 20), text: 'Kelas'),
            Tab(icon: Icon(Icons.face_rounded, size: 20), text: 'Mahasiswa'),
          ],
        ),
      ),
      body: SafeArea(
        child: TabBarView(
          controller: _tabController,
          children: [
            // 1. Tab Dosen
            _buildDosenTab(),

            // 2. Tab Kelas
            _buildKelasTab(),

            // 3. Tab Mahasiswa
            _buildMahasiswaTab(),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: const Color(0xFFE2E8F0))),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const DosenKelolaModulScreen()),
              );
            },
            icon: const Icon(Icons.book_rounded, color: Colors.white, size: 18),
            label: const Text('KELOLA MODUL PEMBELAJARAN (MATERI BERSAMA)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669), // Emerald-600 matching web
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // TAB BUILDERS
  // ==========================================
  Widget _buildDosenTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: _firestore.collection('users').where('role', isEqualTo: 'dosen').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFFB91C1C)));
        }

        final docs = snapshot.data?.docs ?? [];
        
        return Scaffold(
          backgroundColor: const Color(0xFFF8FAFC),
          body: docs.isEmpty
              ? const Center(child: Text('Belum ada dosen terdaftar.', style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFF64748B))))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: docs.length,
                  itemBuilder: (context, index) {
                    final d = docs[index];
                    final data = d.data() as Map<String, dynamic>;

                    return Card(
                      color: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: const BorderSide(color: Color(0xFFF1F5F9)),
                      ),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        title: Text(data['name'] ?? d.id, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const SizedBox(height: 4),
                            Text('NIDN: ${data['nidn'] ?? '-'}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                            Text(data['id'] ?? d.id, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.edit_rounded, color: Color(0xFF2563EB), size: 20),
                              onPressed: () => _showDosenForm(docId: d.id, currentData: data),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_rounded, color: Color(0xFFEF4444), size: 20),
                              onPressed: () => _deleteUser(d.id, 'Dosen'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
          floatingActionButton: FloatingActionButton(
            backgroundColor: const Color(0xFFB91C1C),
            onPressed: () => _showDosenForm(),
            child: const Icon(Icons.add_rounded, color: Colors.white),
          ),
        );
      },
    );
  }

  Widget _buildKelasTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: _firestore.collection('users').where('role', isEqualTo: 'dosen').snapshots(),
      builder: (context, dosenSnapshot) {
        final dosens = dosenSnapshot.data?.docs ?? [];

        return StreamBuilder<QuerySnapshot>(
          stream: _firestore.collection('classes').snapshots(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFFB91C1C)));
            }

            final docs = snapshot.data?.docs ?? [];

            return Scaffold(
              backgroundColor: const Color(0xFFF8FAFC),
              body: docs.isEmpty
                  ? const Center(child: Text('Belum ada kelas terdaftar.', style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFF64748B))))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: docs.length,
                      itemBuilder: (context, index) {
                        final c = docs[index];
                        final data = c.data() as Map<String, dynamic>;
                        
                        final pengampuDoc = dosens.findDocById(data['dosenId'] ?? '');
                        final pengampuData = pengampuDoc?.data() as Map<String, dynamic>?;
                        final pengampuName = pengampuData?['name'] ?? data['dosenId'] ?? '-';

                        return Card(
                          color: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: const BorderSide(color: Color(0xFFF1F5F9)),
                          ),
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            title: Text(data['name'] ?? c.id, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text('Dosen: $pengampuName', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                                Text('Jadwal: ${data['schedule'] ?? '-'}', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_rounded, color: Color(0xFF2563EB), size: 20),
                                  onPressed: () => _showKelasForm(docId: c.id, currentData: data, dosens: dosens),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_rounded, color: Color(0xFFEF4444), size: 20),
                                  onPressed: () => _deleteClass(c.id),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
              floatingActionButton: FloatingActionButton(
                backgroundColor: const Color(0xFFB91C1C),
                onPressed: () => _showKelasForm(dosens: dosens),
                child: const Icon(Icons.add_rounded, color: Colors.white),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMahasiswaTab() {
    return StreamBuilder<QuerySnapshot>(
      stream: _firestore.collection('classes').snapshots(),
      builder: (context, classSnapshot) {
        final classes = classSnapshot.data?.docs ?? [];

        return StreamBuilder<QuerySnapshot>(
          stream: _firestore.collection('users').where('role', isEqualTo: 'mahasiswa').snapshots(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: Color(0xFFB91C1C)));
            }

            final docs = snapshot.data?.docs ?? [];

            return Scaffold(
              backgroundColor: const Color(0xFFF8FAFC),
              body: docs.isEmpty
                  ? const Center(child: Text('Belum ada mahasiswa terdaftar.', style: TextStyle(fontStyle: FontStyle.italic, color: Color(0xFF64748B))))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16.0),
                      itemCount: docs.length,
                      itemBuilder: (context, index) {
                        final m = docs[index];
                        final data = m.data() as Map<String, dynamic>;

                        final kelasDoc = classes.findDocById(data['classId'] ?? '');
                        final kelasData = kelasDoc?.data() as Map<String, dynamic>?;
                        final kelasName = kelasData?['name'] ?? 'Belum Masuk Kelas';

                        return Card(
                          color: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: const BorderSide(color: Color(0xFFF1F5F9)),
                          ),
                          margin: const EdgeInsets.only(bottom: 12),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                            title: Text(data['name'] ?? m.id, style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1E293B))),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 4),
                                Text('Kelas: $kelasName', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFB91C1C))),
                                Text('NIM: ${data['nim'] ?? m.id.split('@')[0]}', style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8))),
                              ],
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit_rounded, color: Color(0xFF2563EB), size: 20),
                                  onPressed: () => _showMahasiswaForm(docId: m.id, currentData: data, classes: classes),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_rounded, color: Color(0xFFEF4444), size: 20),
                                  onPressed: () => _deleteUser(m.id, 'Mahasiswa'),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
              floatingActionButton: FloatingActionButton(
                backgroundColor: const Color(0xFFB91C1C),
                onPressed: () => _showMahasiswaForm(classes: classes),
                child: const Icon(Icons.add_rounded, color: Colors.white),
              ),
            );
          },
        );
      },
    );
  }
}

// Helper Extension to easily find a document in a list by ID
extension DocumentListFinder on List<DocumentSnapshot> {
  DocumentSnapshot? findDocById(String id) {
    for (var doc in this) {
      if (doc.id == id) return doc;
    }
    return null;
  }
}
