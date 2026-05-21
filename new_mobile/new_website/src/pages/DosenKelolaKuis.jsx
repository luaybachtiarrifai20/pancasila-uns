import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, HelpCircle, Plus, Edit, Trash2, X,
  Search, BookOpen, Clock, ChevronRight, FileQuestion, Trash, Save
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function DosenKelolaKuis() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formData, setFormData] = useState({
    id: '',
    moduleId: '',
    questions: [
      { q: '', options: ['', '', '', ''], a: 0 }
    ]
  });

  useEffect(() => {
    fetchQuizzes();
    fetchModules();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'quizzes'));
      const querySnapshot = await getDocs(q);
      const quizData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(quizData);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const q = query(collection(db, 'modules'));
      const querySnapshot = await getDocs(q);
      const modulesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setModules(modulesData);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kuis ini?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', id));
        fetchQuizzes();
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert("Gagal menghapus kuis: " + error.message);
      }
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({
      id: `quiz_bab${quizzes.length + 1}`,
      moduleId: modules[0]?.id || 'bab1',
      questions: [
        { q: '', options: ['', '', '', ''], a: 0 }
      ]
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (quiz) => {
    setModalMode('edit');
    setFormData({
      id: quiz.id,
      moduleId: quiz.moduleId || 'bab1',
      questions: quiz.questions && quiz.questions.length > 0 
        ? quiz.questions.map(q => ({
            q: q.q || '',
            options: q.options ? [...q.options] : ['', '', '', ''],
            a: q.a !== undefined ? q.a : 0
          }))
        : [{ q: '', options: ['', '', '', ''], a: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleAddQuestionField = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { q: '', options: ['', '', '', ''], a: 0 }]
    });
  };

  const handleRemoveQuestionField = (qIdx) => {
    if (formData.questions.length <= 1) {
      alert("Kuis harus memiliki minimal 1 pertanyaan!");
      return;
    }
    const updated = formData.questions.filter((_, idx) => idx !== qIdx);
    setFormData({
      ...formData,
      questions: updated
    });
  };

  const handleQuestionTextChange = (qIdx, value) => {
    const updated = [...formData.questions];
    updated[qIdx].q = value;
    setFormData({
      ...formData,
      questions: updated
    });
  };

  const handleOptionTextChange = (qIdx, optIdx, value) => {
    const updated = [...formData.questions];
    updated[qIdx].options[optIdx] = value;
    setFormData({
      ...formData,
      questions: updated
    });
  };

  const handleCorrectAnswerChange = (qIdx, value) => {
    const updated = [...formData.questions];
    updated[qIdx].a = Number(value);
    setFormData({
      ...formData,
      questions: updated
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate inputs
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.q.trim()) {
        alert(`Pertanyaan ke-${i + 1} tidak boleh kosong!`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          alert(`Pilihan ${String.fromCharCode(65 + j)} pada Pertanyaan ke-${i + 1} tidak boleh kosong!`);
          return;
        }
      }
    }

    try {
      if (modalMode === 'add') {
        await setDoc(doc(db, 'quizzes', formData.id), {
          moduleId: formData.moduleId,
          questions: formData.questions
        });
      } else {
        await updateDoc(doc(db, 'quizzes', formData.id), {
          moduleId: formData.moduleId,
          questions: formData.questions
        });
      }
      setIsModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert("Gagal menyimpan kuis: " + error.message);
    }
  };

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
              <div className="bg-purple-600 p-1.5 rounded-lg">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">Kelola Kuis</h1>
            </div>
          </div>
          <button 
            onClick={handleAddClick}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat Kuis Baru
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 gap-6">
          {quizzes.map((quiz, idx) => {
            const associatedMod = modules.find(m => m.id === quiz.moduleId);
            return (
              <div 
                key={quiz.id} 
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-purple-100 transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-6 group"
              >
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <FileQuestion className="w-8 h-8" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-purple-600 text-[10px] font-black uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-full font-sans">
                      {quiz.questions?.length || 0} Pertanyaan
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {associatedMod?.title || `ID: ${quiz.moduleId}`}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 text-lg group-hover:text-purple-600 transition-colors truncate">
                    Kuis Interaktif: {quiz.id.replace('quiz_', '').toUpperCase()}
                  </h4>
                  <p className="text-slate-500 text-sm">Evaluasi kemandirian belajar mahasiswa untuk materi terkait.</p>
                </div>

                <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-slate-100">
                  <button 
                    onClick={() => handleEditClick(quiz)}
                    className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          {quizzes.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="italic">Belum ada daftar kuis.</p>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Edit/Create Quiz Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[85vh] transform transition-all duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-purple-600" />
                {modalMode === 'add' ? 'Buat Kuis Baru' : 'Edit Kuis Interaktif'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {modalMode === 'add' ? (
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ID Kuis (Unik)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: quiz_bab2"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-semibold"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">ID Kuis</label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm outline-none text-slate-400 font-bold"
                      value={formData.id}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pilih Bab Modul</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all font-semibold"
                    value={formData.moduleId}
                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  >
                    {modules.map(mod => (
                      <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-base">Daftar Pertanyaan ({formData.questions.length})</h3>
                  <button 
                    type="button"
                    onClick={handleAddQuestionField}
                    className="text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Soal
                  </button>
                </div>

                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 relative space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        Soal #{qIdx + 1}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveQuestionField(qIdx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Pertanyaan</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ketik pertanyaan kuis..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={q.q}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="space-y-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase">
                            Pilihan {String.fromCharCode(65 + optIdx)}
                          </label>
                          <input 
                            type="text" 
                            required
                            placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}...`}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                            value={opt}
                            onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Jawaban Benar</label>
                      <select 
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 outline-none font-bold text-emerald-600"
                        value={q.a}
                        onChange={(e) => handleCorrectAnswerChange(qIdx, e.target.value)}
                      >
                        <option value={0}>Pilihan A</option>
                        <option value={1}>Pilihan B</option>
                        <option value={2}>Pilihan C</option>
                        <option value={3}>Pilihan D</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

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
                  className="w-2/3 py-3.5 bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Kuis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
