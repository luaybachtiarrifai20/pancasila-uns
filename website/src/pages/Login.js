import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

function Login() {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (needsProfileCompletion) {
        navigate('/complete-profile');
      } else {
        navigate('/home');
      }
    }
  }, [user, needsProfileCompletion, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(nim, password);
    } catch (error) {
      setError('Login gagal. Periksa NIM dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="icon-wrapper">
            <span className="icon">🎓</span>
          </div>
          <h1>Modul Pancasila</h1>
          <p>Mata Kuliah Umum Pancasila</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nim">NIM</label>
            <input
              type="text"
              id="nim"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Masukkan NIM"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
