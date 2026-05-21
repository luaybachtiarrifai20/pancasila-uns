import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Plus, Trash2, Search, Edit2,
  UserPlus, ShieldCheck, Mail, BookOpen, X, Loader2, AlertTriangle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function DosenKelolaKelas() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', nim: '', classId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classSnap = await getDocs(collection(db, 'classes'));
      const classData = classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(classData);
      
      if (!selectedClass && classData.length > 0) {
        setSelectedClass(classData[0]);
      }

      const studentSnap = await getDocs(collection(db, 'users'));
      const studentData = studentSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.role === 'mahasiswa');
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({ name: '', nim: '', classId: selectedClass?.id || '' });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setIsEditMode(true);
    setEditingId(student.id);
    setFormData({ name: student.name, nim: student.nim, classId: student.classId });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError('');

    const formattedNIM = formData.nim.toUpperCase().trim();

    try {
      if (isEditMode) {
        // UPDATE FIRESTORE ONLY (Auth email/pass change is restricted on client)
        await updateDoc(doc(db, 'users', editingId), {
          name: formData.name,
          classId: formData.classId
        });
        alert('Data mahasiswa berhasil diperbarui.');
      } else {
        // CREATE NEW via Backend API
        const response = await fetch('http://localhost:5001/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            nim: formattedNIM,
            classId: formData.classId
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal mendaftarkan mahasiswa');
        }

        alert('Mahasiswa berhasil didaftarkan.');
      }

      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      setModalError('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Hapus mahasiswa "${name}" secara TOTAL? Tindakan ini akan menghapus akun login dan profil database.`)) {
      try {
        // CALL THE NODE.JS BACKEND
        const response = await fetch('http://localhost:5001/delete-user', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: id })
        });

        if (response.ok) {
          setStudents(students.filter(s => s.id !== id));
          alert('Mahasiswa berhasil dihapus total dari sistem.');
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal menghapus');
        }
      } catch (error) {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    (selectedClass ? s.classId === selectedClass.id : true) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nim?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dosen-dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-700 p-1.5 rounded-lg"><ShieldCheck className="w-5 h-5 text-white" /></div>
              <h1 className="font-bold text-xl tracking-tight">Kelola Kelas</h1>
            </div>
          </div>
          <button onClick={handleOpenAdd} className="bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-800 transition-all">
            <Plus className="w-4 h-4" />
            Tambah Mahasiswa
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 px-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-700" /> Daftar Kelas</h3>
            <div className="space-y-2">
              {classes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClass(c)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    selectedClass?.id === c.id ? 'bg-indigo-700 text-white border-indigo-700 shadow-lg' : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <p className="font-bold text-sm truncate">{c.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedClass?.name || 'Mahasiswa'}</h2>
                  <p className="text-sm text-slate-500">{filteredStudents.length} Mahasiswa</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2">Mahasiswa</th>
                      <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2">NIM</th>
                      <th className="pb-4 font-bold text-slate-400 text-[10px] uppercase tracking-[0.2em] px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map(s => (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">{s.name.charAt(0)}</div>
                            <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2"><span className="text-slate-500 font-mono text-xs">{s.nim}</span></td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleOpenEdit(s)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id, s.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL EDIT / ADD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isEditMode ? 'bg-amber-500' : 'bg-indigo-700'}`}></div>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>

            <h2 className="text-2xl font-black text-slate-800 mb-2">{isEditMode ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
            <p className="text-sm text-slate-500 mb-8">{isEditMode ? 'Perbarui informasi profil mahasiswa.' : 'Daftarkan mahasiswa baru ke sistem.'}</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nama Lengkap</label>
                <input 
                  type="text" required placeholder="Nama Lengkap"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">NIM (Tidak bisa diubah)</label>
                <input 
                  type="text" required placeholder="K4517XXX" disabled={isEditMode}
                  className={`w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none uppercase ${isEditMode ? 'opacity-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-indigo-600'}`}
                  value={formData.nim}
                  onChange={(e) => setFormData({...formData, nim: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Kelas</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {isEditMode && (
                <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 items-start border border-amber-100 shadow-sm shadow-amber-50">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs text-amber-800 font-bold">Informasi Identitas Login</p>
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                      NIM terhubung langsung dengan akun login mahasiswa. Jika terdapat kesalahan pada NIM, silakan <b>hapus profil ini</b> dan <b>daftarkan ulang</b> agar akun login tetap sinkron.
                    </p>
                  </div>
                </div>
              )}

              {modalError && <div className="bg-red-50 text-red-600 text-[11px] p-4 rounded-xl font-bold border border-red-100">{modalError}</div>}

              <button 
                type="submit" disabled={isSubmitting}
                className={`w-full text-white py-4 rounded-2xl font-black shadow-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4 ${isEditMode ? 'bg-amber-600 shadow-amber-100' : 'bg-indigo-700 shadow-indigo-100'}`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditMode ? 'SIMPAN PERUBAHAN' : 'DAFTARKAN MAHASISWA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
