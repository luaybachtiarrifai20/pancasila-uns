import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Library, Plus, Edit, Trash2, X,
  Search, BookOpen, Clock, ChevronRight, CheckCircle2
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function DosenKelolaModul() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    duration: '60 Menit',
    content: '',
    order: 1
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'modules'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const modulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(modulesData);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) {
      try {
        await deleteDoc(doc(db, 'modules', id));
        fetchModules();
      } catch (error) {
        console.error("Error deleting module:", error);
      }
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({
      id: `bab${modules.length + 1}`,
      title: '',
      subtitle: '',
      duration: '60 Menit',
      content: '',
      order: modules.length + 1
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (mod) => {
    setModalMode('edit');
    setFormData({
      id: mod.id,
      title: mod.title,
      subtitle: mod.subtitle || '',
      duration: mod.duration || '60 Menit',
      content: mod.content || '',
      order: mod.order || 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentDosenId = auth.currentUser?.email || 'unknown_dosen';
      if (modalMode === 'add') {
        await setDoc(doc(db, 'modules', formData.id), {
          title: formData.title,
          subtitle: formData.subtitle,
          duration: formData.duration,
          content: formData.content,
          order: Number(formData.order),
          dosenId: currentDosenId
        });
      } else {
        await updateDoc(doc(db, 'modules', formData.id), {
          title: formData.title,
          subtitle: formData.subtitle,
          duration: formData.duration,
          content: formData.content,
          order: Number(formData.order),
          dosenId: currentDosenId
        });
      }
      setIsModalOpen(false);
      fetchModules();
    } catch (error) {
      console.error("Error saving module:", error);
      alert("Gagal menyimpan modul: " + error.message);
    }
  };

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dosen-dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Library className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">Kelola Modul</h1>
            </div>
          </div>
          <button 
            onClick={handleAddClick}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Modul
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari judul modul..."
              className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredModules.map((mod, idx) => (
            <div 
              key={mod.id} 
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-6 group"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                {idx + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mod.duration || '60 Menit'}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-lg group-hover:text-emerald-600 transition-colors truncate">{mod.title}</h4>
                <p className="text-slate-500 text-sm line-clamp-1">{mod.subtitle || mod.title}</p>
              </div>

              <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-slate-100">
                <button 
                  onClick={() => handleEditClick(mod)}
                  className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(mod.id)}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => navigate('/module-detail', { state: { moduleId: mod.id } })}
                  className="bg-slate-50 text-slate-400 p-3 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {filteredModules.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="italic">Belum ada modul pembelajaran.</p>
            </div>
          )}
        </div>
      </main>

      {/* Elegant Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Library className="w-5 h-5 text-emerald-600" />
                {modalMode === 'add' ? 'Tambah Modul Baru' : 'Edit Modul Pembelajaran'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {modalMode === 'add' && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ID Modul (Unik)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: bab5"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Judul Bab</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Contoh: Bab 5: Pancasila sebagai Etika"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Urutan (Order)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-bold"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sub Judul</label>
                <input 
                  type="text" 
                  required
                  placeholder="Deskripsi singkat modul..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estimasi Waktu Belajar</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: 60 Menit"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-semibold"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Konten / Isi Materi</label>
                <textarea 
                  required
                  rows="6"
                  placeholder="Ketik seluruh teks materi bab di sini..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all leading-relaxed"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="w-2/3 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
