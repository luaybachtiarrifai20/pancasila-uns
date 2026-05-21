import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, GraduationCap, Book, History, Lightbulb, 
  Flag, CheckCircle, ChevronRight, HelpCircle, Users,
  Award, Clock, LayoutDashboard, Globe, Shield
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Mahasiswa');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        } else {
          const name = user.email.split('@')[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }

        // Fetch Modules from Firestore
        try {
          const q = query(collection(db, 'modules'), orderBy('order', 'asc'));
          const querySnapshot = await getDocs(q);
          const modulesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              // Map icons based on order
              icon: data.order === 1 ? <Book className="w-6 h-6 text-blue-600" /> :
                    data.order === 2 ? <Award className="w-6 h-6 text-emerald-600" /> :
                    data.order === 3 ? <History className="w-6 h-6 text-amber-600" /> :
                    data.order === 4 ? <Globe className="w-6 h-6 text-purple-600" /> :
                    data.order === 5 ? <Shield className="w-6 h-6 text-red-600" /> :
                    <Flag className="w-6 h-6 text-slate-600" />,
              colorClass: data.order === 1 ? 'bg-blue-100/80' :
                          data.order === 2 ? 'bg-emerald-100/80' :
                          data.order === 3 ? 'bg-amber-100/80' :
                          data.order === 4 ? 'bg-purple-100/80' :
                          data.order === 5 ? 'bg-red-100/80' :
                          'bg-slate-100/80',
              progress: data.order === 1 ? 100 : data.order === 2 ? 50 : 0
            };
          });
          setModules(modulesData);
        } catch (error) {
          console.error("Error fetching modules:", error);
        } finally {
          setLoading(false);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-red-700 p-1.5 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Pancasila<span className="text-red-700">Digital</span></h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-600 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-red-200 mb-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
            <GraduationCap size={240} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Halo, {userName}!</h2>
                <p className="text-red-100 font-medium">Mahasiswa Pancasila Digital</p>
              </div>
            </div>
            
            <p className="text-red-50 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              Mari tingkatkan kemandirian belajarmu melalui modul digital interaktif Pendidikan Pancasila.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <span className="flex items-center gap-2 font-bold text-sm tracking-wide">
                    <Award className="w-4 h-4 text-amber-300" />
                    PROGRES BELAJAR: 30%
                  </span>
                </div>
                <div className="w-full bg-black/10 rounded-full h-3 backdrop-blur-sm p-0.5">
                  <div className="bg-gradient-to-r from-amber-300 to-yellow-400 h-2 rounded-full shadow-lg shadow-amber-500/20" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div className="flex justify-start sm:justify-end">
                <button className="bg-white text-red-700 px-6 py-3 rounded-2xl font-bold shadow-xl hover:bg-red-50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2">
                  Lanjutkan Belajar
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Book className="w-5 h-5 text-red-700" />
                Materi Pembelajaran
              </h3>
              <button className="text-red-700 text-sm font-semibold hover:underline">Lihat Semua</button>
            </div>
            
            <div className="flex flex-col gap-4">
              {modules.map((mod, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate('/module-detail', { state: { moduleId: mod.id } })}
                  className="group bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-100 transition-all duration-500 cursor-pointer flex items-center gap-5"
                >
                  <div className={`p-4 rounded-2xl ${mod.colorClass} group-hover:scale-110 transition-transform duration-500`}>
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-base sm:text-lg group-hover:text-red-700 transition-colors truncate">{mod.title}</h4>
                    <p className="text-slate-500 text-sm mt-1 mb-4 line-clamp-1">{mod.subtitle || mod.title}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden p-0.5">
                        <div 
                          className={`h-1 rounded-full transition-all duration-1000 ease-out shadow-sm ${mod.progress === 100 ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-500 shadow-blue-500/20'}`} 
                          style={{ width: `${mod.progress}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-black min-w-[30px] ${mod.progress === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {mod.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 group-hover:bg-red-50 transition-colors duration-500">
                    {mod.progress === 100 ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-700 transition-all duration-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 px-1 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-700" />
                Evaluasi
              </h3>
              <div className="space-y-4">
                <div 
                  onClick={() => navigate('/quiz')}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all duration-500 cursor-pointer group"
                >
                  <div className="bg-purple-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                    <HelpCircle className="w-7 h-7 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">Kuis Mandiri</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Evaluasi pemahaman tiap bab untuk melatih kemandirian.
                  </p>
                </div>
                
                <div 
                  onClick={() => navigate('/case-study')}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-teal-200 transition-all duration-500 cursor-pointer group"
                >
                  <div className="bg-teal-100/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-7 h-7 text-teal-600" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">Studi Kasus</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Analisis kasus nyata sesuai nilai-nilai Pancasila.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
