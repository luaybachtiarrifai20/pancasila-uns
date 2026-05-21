import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, ChevronRight, CheckCircle2, Share2, Printer, Edit3, Save, X } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ModuleDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDosen, setIsDosen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Mode States
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSubtitle, setEditedSubtitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  // Get clicked moduleId from navigation state, default to 'bab1'
  const moduleId = location.state?.moduleId || 'bab1';

  useEffect(() => {
    // Check Dosen role
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email.includes('dosen')) {
        setIsDosen(true);
      } else {
        setIsDosen(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'modules', moduleId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setModule(data);
        setEditedTitle(data.title || '');
        setEditedSubtitle(data.subtitle || '');
        setEditedContent(data.content || '');
      } else {
        // Fallback to first module if not found
        const q = query(collection(db, 'modules'), orderBy('order', 'asc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setModule(data);
          setEditedTitle(data.title || '');
          setEditedSubtitle(data.subtitle || '');
          setEditedContent(data.content || '');
        }
      }
    } catch (error) {
      console.error("Error fetching module:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'modules', moduleId);
      const currentDosenId = auth.currentUser?.email || 'unknown_dosen';
      await updateDoc(docRef, {
        title: editedTitle,
        subtitle: editedSubtitle,
        content: editedContent,
        dosenId: currentDosenId
      });
      setModule({
        ...module,
        title: editedTitle,
        subtitle: editedSubtitle,
        content: editedContent,
        dosenId: currentDosenId
      });
      setIsEditing(false);
      alert('Materi berhasil diperbarui!');
    } catch (error) {
      console.error("Error updating module:", error);
      alert("Gagal memperbarui materi: " + error.message);
    }
  };

  const handleStartQuiz = () => {
    if (isDosen) {
      navigate('/dosen-kelola-kuis');
    } else {
      navigate('/quiz');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Materi Pembelajaran</h1>
          </div>
          <div className="flex items-center gap-2">
            {isDosen && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-red-50 text-red-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100 hover:bg-red-100 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Materi
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Pancasila Digital
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {module?.duration || '60 Menit'}
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Judul Materi</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Sub Judul</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm italic font-medium outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  value={editedSubtitle}
                  onChange={(e) => setEditedSubtitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Konten Materi</label>
                <textarea 
                  rows="12"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed text-slate-600 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(module.title);
                    setEditedSubtitle(module.subtitle);
                    setEditedContent(module.content);
                  }}
                  className="w-1/3 py-3.5 border border-slate-200 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button 
                  type="button"
                  onClick={handleSave}
                  className="w-2/3 py-3.5 bg-red-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-800 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-6 leading-tight">
                {module?.title || 'Bab 1: Pengantar Pendidikan Pancasila'}
              </h1>
              
              <p className="text-slate-500 text-lg mb-10 font-medium italic border-l-4 border-red-700 pl-6 py-2">
                "{module?.subtitle || 'Menelusuri Konsep dan Urgensi Pendidikan Pancasila'}"
              </p>

              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-6">
                <p className="text-justify whitespace-pre-line text-slate-600 leading-relaxed">
                  {module?.content}
                </p>
                
                {module?.order === 1 && (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Urgensi Pendidikan Pancasila</h3>
                    <p>
                      Pancasila sebagai dasar negara dan ideologi nasional memiliki kedudukan yang sangat sentral. Pendidikan Pancasila di perguruan tinggi bertujuan untuk memberikan pemahaman yang komprehensif kepada mahasiswa agar memiliki etika berpolitik dan berkewarganegaraan yang sesuai dengan nilai-nilai luhur bangsa.
                    </p>
                    
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100 my-8">
                      <h4 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Poin Penting:
                      </h4>
                      <ul className="list-disc list-inside text-red-700 space-y-2 text-sm font-medium">
                        <li>Memperkuat Pancasila sebagai dasar falsafah negara.</li>
                        <li>Memberikan pemahaman dan penghayatan atas jiwa luhur bangsa.</li>
                        <li>Membentuk karakter mahasiswa yang berintegritas.</li>
                      </ul>
                    </div>

                    <p>
                      Melalui modul ini, diharapkan mahasiswa tidak hanya sekadar hafal sila-sila Pancasila, namun mampu menginternalisasikan nilai-nilai tersebut dalam kehidupan sehari-hari, terutama dalam menghadapi tantangan globalisasi dan arus informasi yang begitu deras.
                    </p>
                  </>
                )}

                {module?.order !== 1 && (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">Internalisasi Nilai</h3>
                    <p>
                      Sebagai mahasiswa, kemandirian belajar sangat dibutuhkan untuk dapat mengeksplorasi berbagai sumber literasi guna memperdalam pemahaman tentang Pancasila. Nilai-nilai ketuhanan, kemanusiaan, persatuan, kerakyatan, dan keadilan sosial harus diimplementasikan secara konkret.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Materi Selesai?</p>
                    <p className="text-xs text-slate-400">Tandai progres Anda</p>
                  </div>
                </div>
                <button 
                  onClick={handleStartQuiz}
                  className="w-full sm:w-auto bg-red-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-800 transition-all flex items-center justify-center gap-2"
                >
                  {isDosen ? 'Lihat Kuis' : 'Lanjut ke Kuis'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
