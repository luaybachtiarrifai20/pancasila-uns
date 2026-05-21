import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Users, LineChart, FileCheck, 
  Library, HelpCircle, MessageSquare, ChevronRight,
  ShieldCheck, LayoutDashboard, Activity
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function DosenDashboard() {
  const navigate = useNavigate();
  const [dosenName, setDosenName] = useState('Dosen');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const name = user.email.split('@')[0];
        setDosenName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const menus = [
    {
      title: 'Kelola Kelas & Mahasiswa',
      subtitle: 'Tambah kelas dan daftarkan mahasiswa',
      icon: <Users className="w-6 h-6 text-slate-700" />,
      colorClass: 'bg-slate-100',
      path: '/dosen-kelola-kelas',
    },
    {
      title: 'Pantau Progres Mahasiswa',
      subtitle: 'Lihat sejauh mana kemandirian belajar mahasiswa',
      icon: <LineChart className="w-6 h-6 text-blue-600" />,
      colorClass: 'bg-blue-100',
      path: '/dosen-progres',
    },
    {
      title: 'Penilaian Studi Kasus',
      subtitle: 'Beri nilai pada analisis dan diskusi mahasiswa',
      icon: <FileCheck className="w-6 h-6 text-orange-600" />,
      colorClass: 'bg-orange-100',
      path: '/dosen-penilaian',
    },
    {
      title: 'Kelola Modul Pembelajaran',
      subtitle: 'Tambah atau ubah materi pelajaran/bab',
      icon: <Library className="w-6 h-6 text-emerald-600" />,
      colorClass: 'bg-emerald-100',
      path: '/dosen-kelola-modul',
    },
    {
      title: 'Kelola Kuis Mandiri',
      subtitle: 'Buat daftar soal untuk kuis mahasiswa',
      icon: <HelpCircle className="w-6 h-6 text-purple-600" />,
      colorClass: 'bg-purple-100',
      path: '/dosen-kelola-kuis',
    },
    {
      title: 'Kelola Diskusi & Studi Kasus',
      subtitle: 'Beri tema diskusi dan studi kasus',
      icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
      colorClass: 'bg-teal-100',
      path: '/dosen-kelola-kasus',
    },
  ];

  const activities = [
    { name: 'Budi Santoso', action: 'Menyelesaikan Kuis Bab 1', time: '10 menit yang lalu', color: 'bg-blue-500' },
    { name: 'Siti Aminah', action: 'Mengirim jawaban Studi Kasus', time: '35 menit yang lalu', color: 'bg-emerald-500' },
    { name: 'Andi Wijaya', action: 'Menyelesaikan Kuis Bab 2', time: '1 jam yang lalu', color: 'bg-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-700 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Pancasila<span className="text-indigo-700">Admin</span></h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-indigo-200 mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
            <LayoutDashboard size={240} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Halo, {dosenName}!</h2>
                <p className="text-indigo-100 font-medium">Panel Manajemen Akademik</p>
              </div>
            </div>
            
            <p className="text-indigo-50 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl">
              Pantau progres kemandirian belajar mahasiswa dan kelola materi modul interaktif Pancasila secara efisien.
            </p>
            
            <div className="grid grid-cols-3 gap-4 sm:gap-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-black mb-1">120</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-200">Mahasiswa</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-2xl sm:text-4xl font-black mb-1">45</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-200">Tugas Masuk</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-4xl font-black mb-1">4</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-200">Modul Aktif</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Menu */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-slate-800 mb-6 px-1 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-700" />
              Menu Utama
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menus.map((menu, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(menu.path)}
                  className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-200/50 hover:border-indigo-100 transition-all duration-500 cursor-pointer flex items-center gap-4"
                >
                  <div className={`p-4 rounded-2xl ${menu.colorClass} group-hover:scale-110 transition-transform duration-500`}>
                    {menu.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-indigo-700 transition-colors truncate">{menu.title}</h4>
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{menu.subtitle}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 transition-colors duration-500">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-all duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6 px-1 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-700" />
              Aktivitas Terbaru
            </h3>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {activities.map((activity, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50 transition-colors duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      {activity.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{activity.name}</h4>
                      <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                  <div className="mt-3 pl-14">
                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{activity.action}</p>
                  </div>
                </div>
              ))}
              <div className="p-4 text-center">
                <button className="text-indigo-700 text-xs font-bold hover:underline tracking-widest uppercase">Lihat Riwayat Lengkap</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
