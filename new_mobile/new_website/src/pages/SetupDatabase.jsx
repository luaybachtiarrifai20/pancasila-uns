import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupDatabase() {
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const seedDatabase = async () => {
    setStatus('loading');
    setMessage('Memulai proses pengisian data masif...');

    try {
      const batch = writeBatch(db);

      // 1. DATA USER (Admin, Dosen & Mahasiswa)
      const users = [
        { id: 'admin@pancasila.id', name: 'Super Administrator', role: 'admin', desc: 'Sistem Administrator Utama' },
        { id: 'dosen1@pancasila.id', name: 'Dr. Ahmad Hidayat', role: 'dosen', nidn: '0011223344', bio: 'Dosen Senior Pendidikan Pancasila' },
        { id: 'dosen2@pancasila.id', name: 'Dra. Siti Aminah, M.Pd', role: 'dosen', nidn: '0055667788', bio: 'Pakar Sejarah Kebangsaan' },
        { id: 'k4517026@pancasila.id', name: 'Andi Pratama', role: 'mahasiswa', nim: 'K4517026', classId: 'kelas_a' },
        { id: 'k4517027@pancasila.id', name: 'Budi Santoso', role: 'mahasiswa', nim: 'K4517027', classId: 'kelas_a' },
        { id: 'k4517028@pancasila.id', name: 'Citra Lestari', role: 'mahasiswa', nim: 'K4517028', classId: 'kelas_b' },
        { id: 'k4517029@pancasila.id', name: 'Dewi Saputri', role: 'mahasiswa', nim: 'K4517029', classId: 'kelas_b' },
        { id: 'k4517030@pancasila.id', name: 'Eko Wijaya', role: 'mahasiswa', nim: 'K4517030', classId: 'kelas_c' },
      ];

      users.forEach(u => batch.set(doc(db, 'users', u.id), u));

      // 2. DATA KELAS
      const classes = [
        { id: 'kelas_a', name: 'MKU Pancasila - Kelas A', dosenId: 'dosen1@pancasila.id', schedule: 'Senin, 08:00' },
        { id: 'kelas_b', name: 'MKU Pancasila - Kelas B', dosenId: 'dosen1@pancasila.id', schedule: 'Selasa, 10:00' },
        { id: 'kelas_c', name: 'MKU Pancasila - Kelas C', dosenId: 'dosen2@pancasila.id', schedule: 'Rabu, 13:00' },
      ];

      classes.forEach(c => batch.set(doc(db, 'classes', c.id), c));

      // 3. DATA MODUL (Bab 1-5 dengan Konten Akademik Lengkap & Mendalam)
      const modules = [
        {
          id: 'bab1',
          title: 'Bab 1: Pancasila sebagai Dasar Negara',
          subtitle: 'Menilik Sejarah, Kedudukan, dan Peran Pancasila sebagai Pondasi Hukum Negara RI',
          content: `### Pendahuluan
Pancasila sebagai dasar negara merupakan landasan yuridis, filosofis, dan politis bagi berdirinya Negara Kesatuan Republik Indonesia. Secara konstitusional, kedudukan Pancasila sebagai dasar negara ditegaskan dalam Pembukaan UUD NRI Tahun 1945 alinea keempat. Hal ini menuntut agar seluruh penyelenggaraan negara, mulai dari pembuatan undang-undang hingga pelaksanaan kebijakan publik, senantiasa merujuk pada nilai-nilai Pancasila.

### Kedudukan Pancasila sebagai Dasar Negara
Sebagai dasar negara, Pancasila berfungsi sebagai norma dasar (Grundnorm) atau sumber dari segala sumber hukum di Indonesia. Hal ini tertuang dalam Undang-Undang Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan. Konsekuensi dari kedudukan ini adalah:
1. **Hierarki Hukum**: Setiap peraturan hukum yang berlaku di Indonesia tidak boleh bertentangan dengan Pancasila.
2. **Pedoman Penyelenggaraan Negara**: Pancasila menjadi kompas moral dan operasional bagi lembaga eksekutif, legislatif, dan yudikatif.
3. **Penyatuan Bangsa**: Pancasila mengikat kemajemukan suku, agama, ras, dan antargolongan dalam bingkai NKRI.

### Urgensi bagi Mahasiswa
Mahasiswa sebagai calon intelektual harus memahami Pancasila sebagai dasar negara agar mampu mengawal jalannya demokrasi, keadilan hukum, dan tata kelola pemerintahan yang bersih serta berintegritas di masa depan.`,
          order: 1,
          duration: '60 Menit'
        },
        {
          id: 'bab2',
          title: 'Bab 2: Nilai-Nilai Pancasila',
          subtitle: 'Menginternalisasi Kedalaman Makna dan Hakikat dari Sila Kesatu hingga Sila Kelima',
          content: `### Hakikat Nilai Pancasila
Pancasila terdiri dari lima nilai dasar yang saling berkaitan dan membentuk satu kesatuan yang utuh (sistemik). Setiap sila tidak dapat berdiri sendiri karena melambangkan kepribadian bangsa Indonesia secara menyeluruh.

### Rincian Nilai Tiap Sila
1. **Nilai Ketuhanan (Sila ke-1)**:
   Menjamin kemerdekaan beragama, menghormati perbedaan keyakinan, dan membina kerukunan hidup antarumat beragama tanpa adanya pemaksaan keyakinan.
2. **Nilai Kemanusiaan (Sila ke-2)**:
   Mengakui persamaan derajat, hak, dan kewajiban asasi manusia, serta mengembangkan sikap tenggang rasa dan menjunjung tinggi kemanusiaan yang beradab.
3. **Nilai Persatuan (Sila ke-3)**:
   Menempatkan keselamatan, persatuan, dan kesatuan bangsa di atas kepentingan pribadi atau kelompok, serta menumbuhkan rasa cinta tanah air.
4. **Nilai Kerakyatan (Sila ke-4)**:
   Mengutamakan musyawarah untuk mufakat dalam pengambilan keputusan serta menghormati perbedaan pendapat secara demokratis.
5. **Nilai Keadilan (Sila ke-5)**:
   Mewujudkan keadilan sosial bagi seluruh rakyat melalui keseimbangan hak dan kewajiban serta kerja keras dalam pembangunan sosial-ekonomi.

### Internalisasi Nilai
Internalisasi berarti meresapkan nilai-nilai tersebut ke dalam sanubari dan mengaplikasikannya dalam interaksi sosial sehari-hari sebagai wujud kepribadian luhur.`,
          order: 2,
          duration: '60 Menit'
        },
        {
          id: 'bab3',
          title: 'Bab 3: Pancasila dalam Kehidupan Berbangsa',
          subtitle: 'Mengaktualisasikan Nilai Luhur Pancasila dalam Kehidupan Bermasyarakat dan Bernegara',
          content: `### Pancasila sebagai Pandangan Hidup
Sebagai pandangan hidup bangsa (way of life atau weltanschauung), Pancasila berfungsi sebagai pedoman bagi masyarakat Indonesia dalam bersikap, bertingkah laku, dan menyelesaikan berbagai permasalahan sosial yang timbul. Nilai-nilai Pancasila menjadi rujukan moral dalam kehidupan bermasyarakat.

### Aktualisasi Nilai Pancasila
Aktualisasi Pancasila terbagi menjadi dua dimensi:
*   **Aktualisasi Objektif**: Penerapan nilai Pancasila dalam bentuk undang-undang, keputusan pemerintah, dan kebijakan lembaga negara.
*   **Aktualisasi Subjektif**: Penerapan nilai Pancasila oleh setiap individu warga negara dalam kehidupan pribadinya, kelompoknya, dan lingkungannya.

### Tantangan Kehidupan Berbangsa
Di era kontemporer, bangsa Indonesia dihadapkan pada tantangan disintegrasi, polarisasi politik, dan konflik horizontal. Pancasila hadir sebagai pemersatu (common denominator) yang merangkul semua perbedaan demi keutuhan bangsa. Gotong royong merupakan kunci utama dalam membumikan Pancasila dalam kehidupan sosial.`,
          order: 3,
          duration: '60 Menit'
        },
        {
          id: 'bab4',
          title: 'Bab 4: Pancasila dalam Era Global',
          subtitle: 'Menjawab Tantangan Modernisasi, Globalisasi, dan Arus Ideologi Dunia',
          content: `### Tantangan Globalisasi
Globalisasi membawa arus informasi, teknologi, dan budaya asing secara masif ke dalam kehidupan masyarakat Indonesia. Hal ini menghadirkan tantangan berupa merebaknya individualisme, konsumerisme, serta paparan ideologi transnasional yang bertentangan dengan Pancasila, seperti liberalisme ekstrem dan radikalisme.

### Pancasila sebagai Ideologi Terbuka
Untuk menghadapi globalisasi, Pancasila diposisikan sebagai ideologi terbuka yang memiliki tiga dimensi:
1. **Dimensi Realitas**: Bersumber dari nilai nyata di masyarakat.
2. **Dimensi Idealitas**: Mengandung cita-cita masa depan.
3. **Dimensi Fleksibilitas**: Terbuka terhadap pemikiran baru secara konstruktif tanpa mengubah esensi nilai dasarnya.

### Peran Mahasiswa di Era Digital
Mahasiswa dituntut menjadi agen filterisasi budaya. Melalui pemahaman Pancasila, mahasiswa diharapkan mampu memanfaatkan teknologi digital untuk menyebarkan konten positif, memperkuat toleransi, serta menjaga kedaulatan bangsa di ruang siber.`,
          order: 4,
          duration: '60 Menit'
        },
        {
          id: 'bab5',
          title: 'Bab 5: Implementasi Pancasila',
          subtitle: 'Panduan Praktis Aktualisasi Nilai Pancasila bagi Mahasiswa di Kampus dan Masyarakat',
          content: `### Pancasila dalam Aksi Nyata
Implementasi Pancasila bukan sekadar wacana teoretis, melainkan gerakan aksi nyata (civic engagement) di lingkungan keluarga, perguruan tinggi, dan masyarakat luas. Peran aktif mahasiswa sangat krusial dalam mewujudkan keadilan sosial dan kebhinekaan yang harmonis.

### Penerapan di Lingkungan Kampus
*   **Akademik**: Menjunjung tinggi integritas ilmiah, kejujuran (tidak menyontek/plagiat), dan kebebasan mimbar akademik secara bertanggung jawab.
*   **Organisasi**: Menerapkan prinsip demokrasi Pancasila dalam pemilihan pengurus, menghargai pendapat anggota, dan mengutamakan mufakat.
*   **Sosial**: Menolak segala bentuk diskriminasi, perundungan (bullying), dan kekerasan seksual di kampus.

### Penerapan di Masyarakat
Mahasiswa dapat melakukan pengabdian masyarakat dengan memecahkan problem sosial-ekonomi lokal berdasarkan nilai kemanusiaan dan persatuan, seperti membantu korban bencana, edukasi literasi, serta aktif dalam kegiatan gotong royong warga.`,
          order: 5,
          duration: '60 Menit'
        }
      ];

      modules.forEach(m => batch.set(doc(db, 'modules', m.id), m));

      // 4. DATA KUIS (Kuis per Bab)
      const quizzes = [
        {
          id: 'quiz_bab1',
          moduleId: 'bab1',
          questions: [
            { q: 'Siapa yang pertama kali mengusulkan istilah Pancasila?', options: ['Soekarno', 'Moh. Hatta', 'Soepomo', 'M. Yamin'], a: 0 },
            { q: 'Pancasila sebagai dasar negara disahkan pada tanggal?', options: ['1 Juni 1945', '17 Agustus 1945', '18 Agustus 1945', '22 Juni 1945'], a: 2 },
          ]
        },
        {
          id: 'quiz_bab2',
          moduleId: 'bab2',
          questions: [
            { q: 'Apa lambang dari sila kedua Pancasila?', options: ['Bintang Tunggal', 'Rantai Emas', 'Pohon Beringin', 'Kepala Banteng'], a: 1 },
            { q: 'Sila kelima Pancasila menekankan pada keadilan yang berdimensi...', options: ['Hukum semata', 'Individu', 'Kelompok elit', 'Sosial-ekonomi bagi seluruh rakyat'], a: 3 },
          ]
        },
        {
          id: 'quiz_bab3',
          moduleId: 'bab3',
          questions: [
            { q: 'Aktualisasi Pancasila oleh setiap individu warga negara dalam kehidupan sehari-hari disebut aktualisasi...', options: ['Subjektif', 'Objektif', 'Kolektif', 'Legalistik'], a: 0 },
            { q: 'Gotong royong merupakan salah satu wujud aktualisasi sila Pancasila ke...', options: ['Dua', 'Tiga', 'Empat', 'Lima'], a: 1 },
          ]
        },
        {
          id: 'quiz_bab4',
          moduleId: 'bab4',
          questions: [
            { q: 'Pancasila sebagai ideologi terbuka memiliki fleksibilitas untuk berkembang tanpa mengubah...', options: ['Nama negaranya', 'Lambang negaranya', 'Nilai dasarnya', 'Undang-undangnya'], a: 2 },
            { q: 'Apa tantangan utama Pancasila dalam era globalisasi?', options: ['Kurangnya sumber daya alam', 'Arus konsumerisme dan paparan ideologi luar', 'Keterbatasan teknologi informasi', 'Meningkatnya ekspor budaya lokal'], a: 1 },
          ]
        },
        {
          id: 'quiz_bab5',
          moduleId: 'bab5',
          questions: [
            { q: 'Perilaku jujur dan menghindari plagiarisme di kampus merupakan implementasi nilai Pancasila di bidang...', options: ['Akademik', 'Politik', 'Keagamaan', 'Pertahanan'], a: 0 },
            { q: 'Menolak segala bentuk diskriminasi di lingkungan perkuliahan sesuai dengan pengamalan sila ke...', options: ['Satu', 'Dua', 'Tiga', 'Lima'], a: 1 },
          ]
        }
      ];

      quizzes.forEach(q => batch.set(doc(db, 'quizzes', q.id), q));

      // 5. DATA SUBMISSION (Agar Dashboard Dosen ada isinya)
      const submissions = [
        { id: 'sub1', userId: 'k4517026@pancasila.id', userName: 'Andi Pratama', type: 'kuis', title: 'Kuis Bab 1', score: 90, status: 'Selesai', timestamp: new Date() },
        { id: 'sub2', userId: 'k4517027@pancasila.id', userName: 'Budi Santoso', type: 'tugas', title: 'Analisis Sejarah', score: 0, status: 'Belum Dinilai', timestamp: new Date() },
        { id: 'sub3', userId: 'k4517028@pancasila.id', userName: 'Citra Lestari', type: 'kuis', title: 'Kuis Bab 1', score: 100, status: 'Selesai', timestamp: new Date() },
      ];

      submissions.forEach(s => batch.set(doc(db, 'submissions', s.id), s));

      await batch.commit();

      setStatus('success');
      setMessage('Semua data fitur (User, Kelas, Modul, Kuis, & Tugas) berhasil diunggah!');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Gagal inisialisasi: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center">
        <div className="bg-red-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Database className="w-12 h-12 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Inisialisasi Database Lengkap</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Ini akan mengisi Firestore dengan 2 Dosen, 5 Mahasiswa, 3 Kelas, 4 Modul materi, serta data kuis dan riwayat tugas.
        </p>

        {status === 'idle' && (
          <button 
            onClick={seedDatabase}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-red-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            ISI DATA SEKARANG
          </button>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-6 py-6">
            <Loader2 className="w-12 h-12 text-red-700 animate-spin" />
            <p className="text-red-700 font-bold animate-pulse">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-3xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-emerald-800 font-black text-xl mb-2">Sukses Besar!</p>
            <p className="text-emerald-700 text-sm leading-relaxed">{message}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-6 text-emerald-700 font-bold underline"
            >
              Kembali ke Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border-2 border-red-100 p-8 rounded-3xl">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <p className="text-red-800 font-bold text-xl mb-2">Terjadi Kesalahan</p>
            <p className="text-red-600 text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
