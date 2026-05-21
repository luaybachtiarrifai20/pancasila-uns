import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dosen_progres_screen.dart';
import 'dosen_penilaian_screen.dart';
import 'dosen_kelola_modul_screen.dart';
import 'dosen_kelola_kuis_screen.dart';
import 'dosen_kelola_kasus_screen.dart';
import 'dosen_kelola_kelas_screen.dart';

class DosenDashboardScreen extends StatefulWidget {
  const DosenDashboardScreen({super.key});

  @override
  State<DosenDashboardScreen> createState() => _DosenDashboardScreenState();
}

class _DosenDashboardScreenState extends State<DosenDashboardScreen> {
  String _dosenName = 'Dosen';
  final FirebaseAuth _auth = FirebaseAuth.instance;

  @override
  void initState() {
    super.initState();
    _fetchDosenData();
  }

  void _fetchDosenData() {
    final user = _auth.currentUser;
    if (user != null && user.email != null) {
      final namePart = user.email!.split('@')[0];
      setState(() {
        _dosenName = namePart.substring(0, 1).toUpperCase() + namePart.substring(1);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC), // slate-50 matching web
      appBar: AppBar(
        title: RichText(
          text: const TextSpan(
            text: 'Pancasila',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: Color(0xFF1E293B), // slate-800
              fontFamily: 'Roboto',
            ),
            children: [
              TextSpan(
                text: 'Admin',
                style: TextStyle(
                  color: Color(0xFF4338CA), // indigo-700
                ),
              ),
            ],
          ),
        ),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: Padding(
          padding: const EdgeInsets.only(left: 12.0),
          child: Icon(Icons.shield_rounded, color: Colors.indigo[700], size: 28),
        ),
        leadingWidth: 40,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Color(0xFF475569)),
            onPressed: () async {
              await _auth.signOut();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/');
              }
            },
            tooltip: 'Keluar',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xFFE2E8F0), // slate-200 border
            height: 1.0,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildWelcomeCard(),
            const SizedBox(height: 32),
            const Text(
              'Menu Utama',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B), // slate-800
              ),
            ),
            const SizedBox(height: 16),
            _buildMenuList(context),
            const SizedBox(height: 32),
            const Text(
              'Aktivitas Terbaru',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B), // slate-800
              ),
            ),
            const SizedBox(height: 16),
            _buildRecentActivities(),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF3730A3), // indigo-800
            Color(0xFF4338CA), // indigo-700
            Color(0xFF4F46E5), // indigo-600
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4338CA).withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Halo, $_dosenName!',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Selamat bekerja, Bapak/Ibu Dosen',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Text(
            'Pantau progres kemandirian belajar mahasiswa dan kelola materi modul interaktif Pancasila.',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white,
              fontWeight: FontWeight.w500,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatItem('Mahasiswa', '120'),
              _buildStatItem('Tugas Masuk', '45'),
              _buildStatItem('Modul Aktif', '4'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuList(BuildContext context) {
    final List<Map<String, dynamic>> menus = [
      {
        'title': 'Kelola Kelas & Mahasiswa',
        'subtitle': 'Tambah kelas dan daftarkan mahasiswa',
        'icon': Icons.groups_rounded,
        'color': const Color(0xFF475569), // slate-600
        'screen': const DosenKelolaKelasScreen(),
      },
      {
        'title': 'Pantau Progres Mahasiswa',
        'subtitle': 'Lihat sejauh mana progres belajar',
        'icon': Icons.trending_up_rounded,
        'color': const Color(0xFF2563EB), // blue-600
        'screen': const DosenProgresScreen(),
      },
      {
        'title': 'Penilaian Studi Kasus',
        'subtitle': 'Beri nilai pada analisis mahasiswa',
        'icon': Icons.assignment_turned_in_rounded,
        'color': const Color(0xFFEA580C), // orange-600
        'screen': const DosenPenilaianScreen(),
      },
      {
        'title': 'Kelola Modul Pembelajaran',
        'subtitle': 'Tambah atau ubah materi pelajaran/bab',
        'icon': Icons.auto_stories_rounded,
        'color': const Color(0xFF059669), // emerald-600
        'screen': const DosenKelolaModulScreen(),
      },
      {
        'title': 'Kelola Kuis Mandiri',
        'subtitle': 'Buat daftar soal untuk kuis mahasiswa',
        'icon': Icons.quiz_rounded,
        'color': const Color(0xFF9333EA), // purple-600
        'screen': const DosenKelolaKuisScreen(),
      },
      {
        'title': 'Kelola Diskusi & Studi Kasus',
        'subtitle': 'Beri tema diskusi dan studi kasus',
        'icon': Icons.forum_rounded,
        'color': const Color(0xFF0D9488), // teal-600
        'screen': const DosenKelolaKasusScreen(),
      },
    ];

    return Column(
      children: menus.map((menu) {
        return Container(
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFF1F5F9)), // slate-100
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: ListTile(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => menu['screen']),
              );
            },
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            leading: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (menu['color'] as Color).withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                menu['icon'] as IconData,
                color: menu['color'] as Color,
                size: 24,
              ),
            ),
            title: Text(
              menu['title'] as String,
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B), // slate-800
                fontSize: 15,
              ),
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4.0),
              child: Text(
                menu['subtitle'] as String,
                style: const TextStyle(
                  color: Color(0xFF64748B), // slate-500
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildRecentActivities() {
    final List<Map<String, String>> activities = [
      {
        'name': 'Budi Santoso',
        'action': 'Menyelesaikan Kuis Bab 1',
        'time': '10 mnt yang lalu',
      },
      {
        'name': 'Siti Aminah',
        'action': 'Mengirim jawaban Studi Kasus',
        'time': '35 mnt yang lalu',
      },
      {
        'name': 'Andi Wijaya',
        'action': 'Menyelesaikan Kuis Bab 2',
        'time': '1 jam yang lalu',
      },
    ];

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: activities.length,
        separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), height: 24),
        itemBuilder: (context, index) {
          final activity = activities[index];
          return Row(
            children: [
              CircleAvatar(
                backgroundColor: const Color(0xFFEEF2FF), // indigo-50
                child: Text(
                  activity['name']![0],
                  style: const TextStyle(color: Color(0xFF4338CA), fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      activity['name']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1E293B), fontSize: 14),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      activity['action']!,
                      style: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                    ),
                  ],
                ),
              ),
              Text(
                activity['time']!,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w500),
              ),
            ],
          );
        },
      ),
    );
  }
}
