import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library, Mail, Lock } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email.includes('admin')) {
          navigate('/admin-dashboard', { replace: true });
        } else if (user.email.includes('dosen')) {
          navigate('/dosen-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    let finalIdentifier = email.toLowerCase().trim();
    
    if (!finalIdentifier.includes('@')) {
      finalIdentifier = `${finalIdentifier}@pancasila.id`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, finalIdentifier, password);
      const user = userCredential.user;
      
      if (user.email.includes('admin')) {
        navigate('/admin-dashboard');
      } else if (user.email.includes('dosen')) {
        navigate('/dosen-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error("Firebase Login Error:", error.code, error.message);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorMessage('Akun tidak ditemukan. Pastikan NIM/Email sudah terdaftar di Firebase Console.');
          break;
        case 'auth/wrong-password':
          setErrorMessage('Password salah. Silakan coba lagi.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Format email/NIM tidak valid.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
          break;
        default:
          setErrorMessage('Login Gagal: NIM/Email atau password salah.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-700 p-3 rounded-2xl shadow-xl shadow-red-200">
            <Library className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Pancasila <span className="text-red-700">Digital</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Modul Digital Interaktif MKU Pancasila
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-red-100 sm:rounded-3xl sm:px-10 border border-red-50">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                NIM atau Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-red-700 transition-colors">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-red-600" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Contoh: K4517026 atau email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-red-700 transition-colors">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-600" />
                </div>
                <input
                  id="password"
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'MASUK KE DASHBOARD'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              MKU Pendidikan Pancasila &copy; 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
