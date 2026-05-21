import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Send, User, 
  ThumbsUp, MessageCircle, Share2, ShieldCheck, Globe, BookOpen
} from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, onSnapshot, orderBy, doc, updateDoc, increment } from 'firebase/firestore';

// Helper: detect if link is a video embed (YouTube / Google Drive)
function getVideoEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Google Drive
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return null;
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}

export default function CaseStudy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'));
      const querySnapshot = await getDocs(q);
      const casesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(casesData);

      // Select default case: passed via state, or the first one in the list
      const targetCaseId = location.state?.caseId;
      if (targetCaseId) {
        const found = casesData.find(c => c.id === targetCaseId);
        if (found) setSelectedCase(found);
      } else if (casesData.length > 0) {
        setSelectedCase(casesData[0]);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time comments listener for the selected case study
  useEffect(() => {
    if (!selectedCase) return;

    const q = query(
      collection(db, 'cases', selectedCase.id, 'comments'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return unsubscribe;
  }, [selectedCase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedCase) return;

    const userEmail = auth.currentUser?.email || 'mahasiswa@kampus.ac.id';
    const userName = userEmail.split('@')[0];

    try {
      // 1. Save comment to the case's comments subcollection
      await addDoc(collection(db, 'cases', selectedCase.id, 'comments'), {
        user: userName,
        text: comment,
        likes: 0,
        timestamp: new Date().toISOString()
      });

      // 2. Save submission to Firestore for the teacher to grade
      await addDoc(collection(db, 'submissions'), {
        userId: userEmail,
        userName: userName,
        title: `Studi Kasus: ${selectedCase.title}`,
        type: 'tugas',
        score: 0,
        status: 'Belum Dinilai',
        timestamp: new Date().toISOString()
      });

      setComment('');
    } catch (err) {
      console.error("Error sending comment:", err);
      alert("Gagal mengirim analisis: " + err.message);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const commentRef = doc(db, 'cases', selectedCase.id, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Diskusi & Studi Kasus</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Cases Sidebar list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider px-2">Daftar Skenario</h3>
          <div className="space-y-2">
            {cases.map((c) => (
              <div 
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer font-bold text-xs ${
                  selectedCase?.id === c.id 
                    ? 'bg-teal-50/55 text-teal-700 border-teal-200 shadow-sm shadow-teal-50' 
                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 opacity-70">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{c.category}</span>
                </div>
                <p className="line-clamp-2">{c.title}</p>
              </div>
            ))}
            {cases.length === 0 && (
              <p className="text-slate-400 italic text-sm px-2">Studi kasus belum tersedia.</p>
            )}
          </div>
        </div>

        {/* Case Description & Comments */}
        <div className="lg:col-span-2 space-y-8">
          {selectedCase ? (
            <>
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {selectedCase.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1 font-medium font-sans">
                    <Globe className="w-3.5 h-3.5" />
                    {selectedCase.domain}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-6 leading-tight">
                  {selectedCase.title}
                </h2>

                <div className="prose prose-slate text-slate-600 leading-relaxed mb-6 text-sm sm:text-base whitespace-pre-line text-justify">
                  {selectedCase.content}
                </div>

                {/* Media Section */}
                {(selectedCase.imageUrl || selectedCase.videoUrl) && (
                  <div className="mb-10 space-y-6 border-t border-slate-100 pt-6">
                    {selectedCase.imageUrl && isImageUrl(selectedCase.imageUrl) && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200">
                        <img 
                          src={selectedCase.imageUrl} 
                          alt="Kasus" 
                          className="w-full max-h-96 object-contain bg-slate-50"
                          onError={(e) => { e.target.style.display='none'; }}
                        />
                      </div>
                    )}
                    {selectedCase.videoUrl && getVideoEmbedUrl(selectedCase.videoUrl) && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video">
                        <iframe 
                          src={getVideoEmbedUrl(selectedCase.videoUrl)}
                          className="w-full h-full"
                          allowFullScreen title="Video Kasus"
                        />
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                  <textarea 
                    placeholder="Tuliskan analisis atau pendapatmu..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 pr-20 text-slate-700 min-h-[150px] outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="absolute right-4 bottom-4 bg-teal-600 text-white p-4 rounded-2xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all transform active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Comment Feed */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
                  <MessageCircle className="w-5 h-5 text-teal-600" />
                  Diskusi Mahasiswa ({comments.length})
                </h3>
                {comments.map((c) => (
                  <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-700 font-bold font-sans">
                          {c.user ? c.user.charAt(0).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.user || 'Mahasiswa'}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Baru saja</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {c.text}
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(c.id)}
                        className="flex items-center gap-1.5 text-slate-400 text-xs font-bold hover:text-teal-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {c.likes || 0} Suka
                      </button>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-slate-400 italic text-sm text-center py-6">Belum ada tanggapan untuk studi kasus ini.</p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400 italic">Pilih studi kasus di panel kiri untuk mulai membaca.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Instruksi Tugas
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 leading-relaxed">
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>
                Tulis minimal 50 kata analisis kritis.
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>
                Hubungkan pendapat Anda dengan nilai-nilai Pancasila.
              </li>
              <li className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 flex-shrink-0"></span>
                Gunakan bahasa yang santun, tertib, dan akademis.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
