import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, 
  Search, ShieldCheck, ChevronRight, MessageSquare
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';

export default function DosenPenilaian() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const subData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(subData);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
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
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">Penilaian Tugas</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari mahasiswa atau tugas..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 outline-none w-full shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              Semua Tipe
            </button>
            <button className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl text-xs font-bold text-orange-600 shadow-sm">
              Belum Dinilai
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSubmissions.map(sub => (
            <div 
              key={sub.id} 
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-orange-100 transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-6 group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                sub.type === 'kuis' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'
              }`}>
                {sub.type === 'kuis' ? <MessageSquare className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    sub.type === 'kuis' ? 'bg-blue-50 text-blue-700' : 'bg-teal-50 text-teal-700'
                  }`}>
                    {sub.type}
                  </span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Baru saja
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-lg group-hover:text-orange-600 transition-colors truncate">{sub.userName}</h4>
                <p className="text-slate-500 text-sm font-medium">{sub.title}</p>
              </div>

              <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-slate-100">
                <div className="text-center min-w-[60px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai</p>
                  <p className={`text-2xl font-black ${sub.status === 'Selesai' ? 'text-emerald-600' : 'text-slate-300'}`}>
                    {sub.score || '-'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {sub.status === 'Belum Dinilai' ? (
                    <button className="bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center gap-2">
                      Beri Nilai
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      Selesai
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredSubmissions.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="italic">Tidak ada tugas yang perlu dinilai.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
