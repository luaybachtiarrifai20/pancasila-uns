import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, LineChart, 
  BarChart3, PieChart, TrendingUp, ShieldCheck
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export default function DosenProgres() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classSnap = await getDocs(collection(db, 'classes'));
      setClasses(classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const studentSnap = await getDocs(collection(db, 'users'));
      const studentData = studentSnap.docs
        .map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          progress: Math.floor(Math.random() * 100), // Random for demo, should be dynamic
          lastActive: '2 jam yang lalu'
        }))
        .filter(u => u.role === 'mahasiswa');
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (selectedClass === 'all' ? true : s.classId === selectedClass) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nim?.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <div className="bg-indigo-700 p-1.5 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">Pantau Progres</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rata-rata Progres</p>
              <h4 className="text-2xl font-black text-slate-800">68%</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selesai Modul</p>
              <h4 className="text-2xl font-black text-slate-800">42 Mhs</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <LineChart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Keaktifan</p>
              <h4 className="text-2xl font-black text-slate-800">Tinggi</h4>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari Mahasiswa..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none appearance-none cursor-pointer"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-widest">Mahasiswa</th>
                  <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-widest">Progres Belajar</th>
                  <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-widest">Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.nim}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 min-w-[200px]">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              s.progress > 80 ? 'bg-emerald-500' : s.progress > 40 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${s.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-700">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        s.progress > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.progress > 80 ? 'Sangat Baik' : s.progress > 40 ? 'Aktif' : 'Kurang'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {s.lastActive}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
