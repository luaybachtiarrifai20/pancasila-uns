import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MessageCircle, Edit, Trash2, X, Save } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';

export default function DosenKelolaKasusDetail() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [comments, setComments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch case document
  useEffect(() => {
  const fetchCase = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'cases', caseId));
      if (docSnap.exists()) {
        setCaseData({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.warn('Case not found');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  fetchCase();
}, [caseId]);

  // Real‑time comments for this case
  useEffect(() => {
    if (!caseId) return;
    const unsub = onSnapshot(collection(db, 'cases', caseId, 'comments'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setComments(data);
    });
    return () => unsub();
  }, [caseId]);

  // Submissions where title matches this case's title
  useEffect(() => {
    if (!caseData?.title) return;
    const unsub = onSnapshot(
      query(collection(db, 'submissions'), where('title', '==', `Studi Kasus: ${caseData.title}`)),
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSubmissions(data);
      }
    );
    return () => unsub();
  }, [caseData]);

  const handleDeleteCase = async () => {
    if (!window.confirm('Hapus studi kasus ini?')) return;
    try {
      await deleteDoc(doc(db, 'cases', caseId));
      navigate('/dosen-kelola-kasus');
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Data studi kasus tidak ditemukan.</p>
        <button onClick={() => navigate('/dosen-kelola-kasus')} className="mt-4 text-teal-600 hover:underline">Kembali</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="font-bold text-xl tracking-tight">Detail Studi Kasus</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDeleteCase} className="flex items-center gap-1 text-red-600 hover:text-red-800">
              <Trash2 className="w-4 h-4" /> Hapus
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
        {/* Case Content */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{caseData.title}</h2>
          <p className="text-slate-600 whitespace-pre-line mb-6">{caseData.content}</p>
          {/* Media */}
          {caseData.imageUrl && (
            <img src={caseData.imageUrl} alt="case" className="w-full max-h-96 object-contain mb-4" />
          )}
          {caseData.videoUrl && (
            <div className="aspect-video mb-4">
              <iframe src={(() => {
                const yt = caseData.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
                if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
                const gd = caseData.videoUrl.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
                if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
                return '';
              })()} className="w-full h-full" allowFullScreen />
            </div>
          )}
        </section>

        {/* Student Submissions */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" /> Jawaban Mahasiswa ({submissions.length})
          </h3>
          {submissions.length === 0 ? (
            <p className="text-slate-500 italic">Belum ada jawaban dari mahasiswa.</p>
          ) : (
            <div className="space-y-6">
              {submissions.map(sub => (
                <div key={sub.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">{sub.userName}</p>
                      <p className="text-xs text-slate-500">{sub.userId}</p>
                    </div>
                    <p className={`font-bold text-lg ${sub.status === 'Selesai' ? 'text-emerald-600' : 'text-slate-400'}`}>{sub.score ?? '-'}</p>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line mb-2">{sub.answerText || 'Tidak ada teks jawaban.'}</p>
                  <p className="text-xs text-slate-400">Status: {sub.status}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Comments */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-teal-600" /> Diskusi Mahasiswa ({comments.length})
          </h3>
          {comments.length === 0 ? (
            <p className="text-slate-500 italic">Belum ada komentar.</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center font-bold text-teal-700">
                      {c.user ? c.user.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{c.user || 'Mahasiswa'}</p>
                      <p className="text-[10px] text-slate-400">Baru saja</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
