import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, LogOut, Users, BookOpen, GraduationCap, School,
  Plus, Edit, Trash2, X, Save, Search, CheckCircle2
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc, updateDoc, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dosen'); // 'dosen' | 'kelas' | 'mahasiswa' | 'modul'
  const [loading, setLoading] = useState(true);

  // Firestore Data Lists
  const [dosenList, setDosenList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [mahasiswaList, setMahasiswaList] = useState([]);
  const [modulesList, setModulesList] = useState([]);

  // Modals Open
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('dosen'); // 'dosen' | 'kelas' | 'mahasiswa' | 'modul'
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'

  // Form Fields
  const [dosenForm, setDosenForm] = useState({ id: '', name: '', nidn: '', bio: '' });
  const [kelasForm, setKelasForm] = useState({ id: '', name: '', dosenId: '', schedule: '' });
  const [mahasiswaForm, setMahasiswaForm] = useState({ id: '', name: '', nim: '', classId: '' });
  const [moduleForm, setModuleForm] = useState({ id: '', title: '', subtitle: '', duration: '60 Menit', content: '', order: 1 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => doc.data());
      
      const dosens = usersData.filter(u => u.role === 'dosen');
      const mahasiswas = usersData.filter(u => u.role === 'mahasiswa');
      
      setDosenList(dosens);
      setMahasiswaList(mahasiswas);

      // 2. Fetch Classes
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClassList(classesData);

      // 3. Fetch Modules
      const modulesQuery = query(collection(db, 'modules'), orderBy('order', 'asc'));
      const modulesSnapshot = await getDocs(modulesQuery);
      const modulesData = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModulesList(modulesData);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      await signOut(auth);
      navigate('/');
    }
  };

  // ==========================================
  // DELETE HANDLERS
  // ==========================================
  const handleDeleteDosen = async (email) => {
    if (window.confirm(`Hapus dosen ${email}?`)) {
      await deleteDoc(doc(db, 'users', email));
      fetchAllData();
    }
  };

  const handleDeleteKelas = async (id) => {
    if (window.confirm("Hapus kelas ini?")) {
      await deleteDoc(doc(db, 'classes', id));
      fetchAllData();
    }
  };

  const handleDeleteMahasiswa = async (email) => {
    if (window.confirm(`Hapus mahasiswa ${email}?`)) {
      await deleteDoc(doc(db, 'users', email));
      fetchAllData();
    }
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm("Hapus modul ini? Semua dosen dan mahasiswa tidak akan bisa mengakses modul ini lagi.")) {
      await deleteDoc(doc(db, 'modules', id));
      fetchAllData();
    }
  };

  // ==========================================
  // ADD / EDIT HANDLERS (MODAL)
  // ==========================================
  const openAddModal = (type) => {
    setModalType(type);
    setModalMode('add');
    
    if (type === 'dosen') {
      setDosenForm({ id: '', name: '', nidn: '', bio: '' });
    } else if (type === 'kelas') {
      setKelasForm({ id: `kelas_${Date.now()}`, name: '', dosenId: dosenList[0]?.id || '', schedule: '' });
    } else if (type === 'mahasiswa') {
      setMahasiswaForm({ id: '', name: '', nim: '', classId: classList[0]?.id || '' });
    } else if (type === 'modul') {
      setModuleForm({ id: `bab${modulesList.length + 1}`, title: '', subtitle: '', duration: '60 Menit', content: '', order: modulesList.length + 1 });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (type, data) => {
    setModalType(type);
    setModalMode('edit');

    if (type === 'dosen') {
      setDosenForm({ id: data.id, name: data.name || '', nidn: data.nidn || '', bio: data.bio || '' });
    } else if (type === 'kelas') {
      setKelasForm({ id: data.id, name: data.name || '', dosenId: data.dosenId || '', schedule: data.schedule || '' });
    } else if (type === 'mahasiswa') {
      setMahasiswaForm({ id: data.id, name: data.name || '', nim: data.nim || '', classId: data.classId || '' });
    } else if (type === 'modul') {
      setModuleForm({ id: data.id, title: data.title || '', subtitle: data.subtitle || '', duration: data.duration || '60 Menit', content: data.content || '', order: data.order || 1 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'dosen') {
        let finalEmail = dosenForm.id.toLowerCase().trim();
        if (!finalEmail.includes('@')) finalEmail = `${finalEmail}@pancasila.id`;
        
        await setDoc(doc(db, 'users', finalEmail), {
          id: finalEmail,
          name: dosenForm.name,
          role: 'dosen',
          nidn: dosenForm.nidn,
          bio: dosenForm.bio
        }, { merge: true });

      } else if (modalType === 'kelas') {
        await setDoc(doc(db, 'classes', kelasForm.id), {
          id: kelasForm.id,
          name: kelasForm.name,
          dosenId: kelasForm.dosenId,
          schedule: kelasForm.schedule
        }, { merge: true });

      } else if (modalType === 'mahasiswa') {
        let finalEmail = mahasiswaForm.id.toLowerCase().trim();
        if (!finalEmail.includes('@')) finalEmail = `${finalEmail}@pancasila.id`;

        await setDoc(doc(db, 'users', finalEmail), {
          id: finalEmail,
          name: mahasiswaForm.name,
          role: 'mahasiswa',
          nim: mahasiswaForm.nim || finalEmail.split('@')[0].toUpperCase(),
          classId: mahasiswaForm.classId
        }, { merge: true });

      } else if (modalType === 'modul') {
        await setDoc(doc(db, 'modules', moduleForm.id), {
          id: moduleForm.id,
          title: moduleForm.title,
          subtitle: moduleForm.subtitle,
          duration: moduleForm.duration,
          content: moduleForm.content,
          order: Number(moduleForm.order)
        }, { merge: true });
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Terjadi kesalahan: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Header Panel */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 p-2 rounded-xl text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-slate-800">Administrator MKU</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dashboard Kendali Sistem</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => setActiveTab('dosen')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'dosen' ? 'bg-red-700 text-white shadow-xl shadow-red-200 border-transparent' : 'bg-white text-slate-800 border-slate-100 hover:shadow-lg'
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === 'dosen' ? 'bg-white/20' : 'bg-red-50 text-red-700'}`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'dosen' ? 'text-red-100' : 'text-slate-400'}`}>Dosen</p>
              <h3 className="text-2xl font-black">{dosenList.length} Orang</h3>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('kelas')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'kelas' ? 'bg-red-700 text-white shadow-xl shadow-red-200 border-transparent' : 'bg-white text-slate-800 border-slate-100 hover:shadow-lg'
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === 'kelas' ? 'bg-white/20' : 'bg-red-50 text-red-700'}`}>
              <School className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'kelas' ? 'text-red-100' : 'text-slate-400'}`}>Kelas</p>
              <h3 className="text-2xl font-black">{classList.length} Kelas</h3>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('mahasiswa')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'mahasiswa' ? 'bg-red-700 text-white shadow-xl shadow-red-200 border-transparent' : 'bg-white text-slate-800 border-slate-100 hover:shadow-lg'
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === 'mahasiswa' ? 'bg-white/20' : 'bg-red-50 text-red-700'}`}>
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'mahasiswa' ? 'text-red-100' : 'text-slate-400'}`}>Mahasiswa</p>
              <h3 className="text-2xl font-black">{mahasiswaList.length} Siswa</h3>
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('modul')}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'modul' ? 'bg-red-700 text-white shadow-xl shadow-red-200 border-transparent' : 'bg-white text-slate-800 border-slate-100 hover:shadow-lg'
            }`}
          >
            <div className={`p-3 rounded-2xl ${activeTab === 'modul' ? 'bg-white/20' : 'bg-red-50 text-red-700'}`}>
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${activeTab === 'modul' ? 'text-red-100' : 'text-slate-400'}`}>Materi Modul</p>
              <h3 className="text-2xl font-black">{modulesList.length} Bab</h3>
            </div>
          </div>
        </div>

        {/* Tab Controls Action */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-800 capitalize">Daftar Pengelolaan: {activeTab}</h2>
            <p className="text-xs text-slate-400 font-medium">Tambah, sunting, dan hapus baris data secara instan di Firebase.</p>
          </div>

          <button 
            onClick={() => openAddModal(activeTab)}
            className="bg-red-700 hover:bg-red-800 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-red-100 transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> Tambah {activeTab === 'dosen' ? 'Dosen' : activeTab === 'kelas' ? 'Kelas' : activeTab === 'mahasiswa' ? 'Mahasiswa' : 'Modul'}
          </button>
        </div>

        {/* Dynamic Lists Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            
            {/* 1. DOSEN TAB */}
            {activeTab === 'dosen' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                      <th className="p-6">Nama Lengkap</th>
                      <th className="p-6">Email / Username</th>
                      <th className="p-6">NIDN</th>
                      <th className="p-6">Bio Keterangan</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dosenList.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                        <td className="p-6 text-slate-800">{d.name}</td>
                        <td className="p-6 text-slate-500 font-mono text-xs">{d.id}</td>
                        <td className="p-6 text-slate-800">{d.nidn || '-'}</td>
                        <td className="p-6 text-slate-400 text-xs max-w-xs truncate">{d.bio || '-'}</td>
                        <td className="p-6 text-right space-x-2">
                          <button 
                            onClick={() => openEditModal('dosen', d)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDosen(d.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dosenList.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-400 italic">Belum ada dosen terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. KELAS TAB */}
            {activeTab === 'kelas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                      <th className="p-6">Nama Kelas</th>
                      <th className="p-6">ID / Kode Kelas</th>
                      <th className="p-6">Dosen Pengampu</th>
                      <th className="p-6">Jadwal Kuliah</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classList.map((c) => {
                      const pengampu = dosenList.find(d => d.id === c.dosenId);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                          <td className="p-6 text-slate-800">{c.name}</td>
                          <td className="p-6 text-slate-500 font-mono text-xs">{c.id}</td>
                          <td className="p-6 text-slate-800">{pengampu?.name || c.dosenId || '-'}</td>
                          <td className="p-6 text-slate-500 text-xs">{c.schedule || '-'}</td>
                          <td className="p-6 text-right space-x-2">
                            <button 
                              onClick={() => openEditModal('kelas', c)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteKelas(c.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {classList.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-400 italic">Belum ada kelas terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. MAHASISWA TAB */}
            {activeTab === 'mahasiswa' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                      <th className="p-6">Nama Mahasiswa</th>
                      <th className="p-6">Email / Login</th>
                      <th className="p-6">NIM</th>
                      <th className="p-6">Kelas Terpilih</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mahasiswaList.map((m) => {
                      const kelas = classList.find(c => c.id === m.classId);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                          <td className="p-6 text-slate-800">{m.name}</td>
                          <td className="p-6 text-slate-500 font-mono text-xs">{m.id}</td>
                          <td className="p-6 text-slate-800">{m.nim || '-'}</td>
                          <td className="p-6 text-red-700 text-xs">{kelas?.name || 'Belum Masuk Kelas'}</td>
                          <td className="p-6 text-right space-x-2">
                            <button 
                              onClick={() => openEditModal('mahasiswa', m)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMahasiswa(m.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {mahasiswaList.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-400 italic">Belum ada mahasiswa terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. MODUL TAB */}
            {activeTab === 'modul' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-wider">
                      <th className="p-6">Judul Bab</th>
                      <th className="p-6">ID Bab</th>
                      <th className="p-6">Urutan</th>
                      <th className="p-6">Estimasi Waktu</th>
                      <th className="p-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modulesList.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors font-semibold">
                        <td className="p-6">
                          <p className="text-slate-800 font-bold">{m.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">{m.subtitle}</p>
                        </td>
                        <td className="p-6 text-slate-500 font-mono text-xs">{m.id}</td>
                        <td className="p-6 text-slate-800 font-black">{m.order}</td>
                        <td className="p-6 text-slate-500 text-xs">{m.duration || '60 Menit'}</td>
                        <td className="p-6 text-right space-x-2">
                          <button 
                            onClick={() => openEditModal('modul', m)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteModule(m.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {modulesList.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-slate-400 italic">Belum ada modul terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ==========================================
          DYNAMIC FORM MODAL
         ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2 capitalize">
                {modalMode === 'add' ? 'Tambah ' : 'Edit '} {modalType}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* 1. DOSEN FORM */}
              {modalType === 'dosen' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Username / Email Dosen</label>
                    <input 
                      type="text" 
                      required
                      disabled={modalMode === 'edit'}
                      placeholder="Contoh: dosen3 atau email@pancasila.id"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold disabled:opacity-50"
                      value={dosenForm.id}
                      onChange={(e) => setDosenForm({ ...dosenForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Dr. Herman, M.Si"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={dosenForm.name}
                      onChange={(e) => setDosenForm({ ...dosenForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">NIDN</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan kode NIDN Dosen"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={dosenForm.nidn}
                      onChange={(e) => setDosenForm({ ...dosenForm, nidn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Biodata Singkat</label>
                    <textarea 
                      rows="3"
                      placeholder="Dosen Program Studi PKn..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={dosenForm.bio}
                      onChange={(e) => setDosenForm({ ...dosenForm, bio: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* 2. KELAS FORM */}
              {modalType === 'kelas' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Kode / ID Kelas (Unik)</label>
                    <input 
                      type="text" 
                      required
                      disabled={modalMode === 'edit'}
                      placeholder="Contoh: kelas_a"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold disabled:opacity-50"
                      value={kelasForm.id}
                      onChange={(e) => setKelasForm({ ...kelasForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nama Kelas</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: MKU Pancasila - Kelas A"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={kelasForm.name}
                      onChange={(e) => setKelasForm({ ...kelasForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Dosen Pengampu</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold"
                      value={kelasForm.dosenId}
                      onChange={(e) => setKelasForm({ ...kelasForm, dosenId: e.target.value })}
                    >
                      {dosenList.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                      {dosenList.length === 0 && <option value="">Belum ada dosen terdaftar</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Jadwal Kuliah</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Senin, 08:00 WIB"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={kelasForm.schedule}
                      onChange={(e) => setKelasForm({ ...kelasForm, schedule: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* 3. MAHASISWA FORM */}
              {modalType === 'mahasiswa' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">NIM / Username Login</label>
                    <input 
                      type="text" 
                      required
                      disabled={modalMode === 'edit'}
                      placeholder="Contoh: k4517026 atau email@pancasila.id"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold disabled:opacity-50"
                      value={mahasiswaForm.id}
                      onChange={(e) => setMahasiswaForm({ ...mahasiswaForm, id: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nama Lengkap</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Andi Pratama"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={mahasiswaForm.name}
                      onChange={(e) => setMahasiswaForm({ ...mahasiswaForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">NIM (Nomor Induk Mahasiswa)</label>
                    <input 
                      type="text" 
                      placeholder="Ketik NIM Mahasiswa"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={mahasiswaForm.nim}
                      onChange={(e) => setMahasiswaForm({ ...mahasiswaForm, nim: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pilihan Kelas</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold"
                      value={mahasiswaForm.classId}
                      onChange={(e) => setMahasiswaForm({ ...mahasiswaForm, classId: e.target.value })}
                    >
                      {classList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      {classList.length === 0 && <option value="">Belum ada kelas terdaftar</option>}
                    </select>
                  </div>
                </>
              )}

              {/* 4. MODUL FORM */}
              {modalType === 'modul' && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ID Modul (Unik)</label>
                    <input 
                      type="text" 
                      required
                      disabled={modalMode === 'edit'}
                      placeholder="Contoh: bab5"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold disabled:opacity-50"
                      value={moduleForm.id}
                      onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Judul Bab Modul</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Bab 5: Pancasila sebagai Sistem Etika"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Urutan (Order)</label>
                      <input 
                        type="number" 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-bold"
                        value={moduleForm.order}
                        onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sub-judul Penjelas</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Deskripsi singkat modul..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all"
                      value={moduleForm.subtitle}
                      onChange={(e) => setModuleForm({ ...moduleForm, subtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estimasi Waktu Belajar</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: 60 Menit"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all font-semibold"
                      value={moduleForm.duration}
                      onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Konten / Isi Materi</label>
                    <textarea 
                      rows="5"
                      required
                      placeholder="Ketik seluruh teks materi bab di sini..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-600 outline-none transition-all leading-relaxed"
                      value={moduleForm.content}
                      onChange={(e) => setModuleForm({ ...moduleForm, content: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Action Buttons inside Form */}
              <div className="flex gap-4 pt-6 border-t border-slate-100 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-3.5 bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
