import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'module_detail_screen.dart';
import 'quiz_screen.dart';
import 'case_study_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _userName = 'Mahasiswa';
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    try {
      final user = _auth.currentUser;
      if (user != null && user.email != null) {
        final doc = await _firestore.collection('users').doc(user.email).get();
        if (doc.exists && mounted) {
          setState(() {
            _userName = doc.data()?['name'] ?? 'Mahasiswa';
          });
        }
      }
    } catch (e) {
      debugPrint("Error fetching user data: $e");
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFFF8FAFC), // slate-50
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFFB91C1C)),
          ),
        ),
      );
    }

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
                text: 'Digital',
                style: TextStyle(
                  color: Color(0xFFB91C1C), // red-700
                ),
              ),
            ],
          ),
        ),
        backgroundColor: Colors.white.withOpacity(0.8),
        elevation: 0,
        scrolledUnderElevation: 0,
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
              'Materi Pembelajaran',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B), // slate-800
              ),
            ),
            const SizedBox(height: 16),
            _buildModuleList(),
            const SizedBox(height: 32),
            const Text(
              'Tugas & Evaluasi',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: Color(0xFF1E293B), // slate-800
              ),
            ),
            const SizedBox(height: 16),
            _buildTaskGrid(context),
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
            Color(0xFF991B1B), // red-800
            Color(0xFFB91C1C), // red-700
            Color(0xFFDC2626), // red-600
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFB91C1C).withOpacity(0.2),
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
                child: const Icon(Icons.school_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Halo, $_userName!',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Selamat belajar Pancasila',
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
          const SizedBox(height: 24),
          const Text(
            'Mari tingkatkan kemandirian belajarmu melalui modul digital interaktif Pancasila.',
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
              const Text(
                'Progres Belajar: 30%',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                'Lanjutkan >',
                style: TextStyle(
                  color: Colors.amber[300],
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: 0.3,
              backgroundColor: Colors.white.withOpacity(0.2),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFBBF24)), // amber-400
              minHeight: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModuleList() {
    return StreamBuilder<QuerySnapshot>(
      stream: _firestore.collection('modules').orderBy('order').snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return const Center(child: Text('Terjadi kesalahan'));
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final docs = snapshot.data!.docs;
        if (docs.isEmpty) {
          return const Center(
            child: Text(
              'Belum ada modul terdaftar.',
              style: TextStyle(fontStyle: FontStyle.italic, color: Colors.grey),
            ),
          );
        }

        return Column(
          children: docs.map((doc) {
            final data = doc.data() as Map<String, dynamic>;
            final int order = data['order'] ?? 1;
            final double progress = order == 1 ? 1.0 : order == 2 ? 0.5 : 0.0;

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
                    MaterialPageRoute(
                      builder: (context) => ModuleDetailScreen(
                        moduleId: doc.id,
                        title: data['title'] ?? 'Tanpa Judul',
                        subtitle: data['subtitle'] ?? 'Modul pembelajaran',
                        color: _getColorForOrder(order),
                        content: data['content'] ?? 'Materi belum tersedia.',
                        order: order,
                        duration: data['duration'] ?? '60 Menit',
                      ),
                    ),
                  );
                },
                contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                leading: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getColorForOrder(order).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(
                    _getIconForOrder(order),
                    color: _getColorForOrder(order),
                    size: 24,
                  ),
                ),
                title: Text(
                  data['title'] ?? 'Tanpa Judul',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1E293B), // slate-800
                    fontSize: 15,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      data['subtitle'] ?? 'Modul pembelajaran',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFF64748B), // slate-500
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: progress,
                        backgroundColor: const Color(0xFFF1F5F9),
                        valueColor: AlwaysStoppedAnimation<Color>(_getColorForOrder(order)),
                        minHeight: 5,
                      ),
                    ),
                  ],
                ),
                trailing: const Icon(Icons.chevron_right_rounded, color: Color(0xFF94A3B8)),
              ),
            );
          }).toList(),
        );
      },
    );
  }

  Color _getColorForOrder(int order) {
    if (order == 1) return const Color(0xFF2563EB); // blue-600 matching web
    if (order == 2) return const Color(0xFF059669); // emerald-600 matching web
    if (order == 3) return const Color(0xFFD97706); // amber-600 matching web
    if (order == 4) return const Color(0xFF9333EA); // purple-600 matching web
    if (order == 5) return const Color(0xFFDC2626); // red-600 matching web
    return const Color(0xFF64748B); // slate-500 matching web
  }

  IconData _getIconForOrder(int order) {
    if (order == 1) return Icons.book_rounded;
    if (order == 2) return Icons.assignment_rounded;
    if (order == 3) return Icons.history_edu_rounded;
    if (order == 4) return Icons.public_rounded;
    if (order == 5) return Icons.verified_user_rounded;
    return Icons.outlined_flag_rounded;
  }

  Widget _buildTaskGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.05,
      children: [
        _buildTaskCard(
          context,
          'Kuis Mandiri',
          'Evaluasi pemahaman bab',
          Icons.help_outline_rounded,
          const Color(0xFF9333EA), // purple-600
          const QuizScreen(),
        ),
        _buildTaskCard(
          context,
          'Studi Kasus',
          'Analisis kasus nyata',
          Icons.people_outline_rounded,
          const Color(0xFF0D9488), // teal-600
          const CaseStudyScreen(),
        ),
      ],
    );
  }

  Widget _buildTaskCard(
    BuildContext context,
    String title,
    String desc,
    IconData icon,
    Color color,
    Widget targetScreen,
  ) {
    return Container(
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => targetScreen),
            );
          },
          borderRadius: BorderRadius.circular(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const Spacer(),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 14,
                    color: Color(0xFF1E293B),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  desc,
                  style: const TextStyle(
                    color: Color(0xFF64748B),
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
