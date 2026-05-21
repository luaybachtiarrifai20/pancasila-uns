import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const { user, userData, logout, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else if (needsProfileCompletion) {
      navigate('/complete-profile');
    }
  }, [user, needsProfileCompletion, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const modules = [
    { id: 1, title: 'Modul 1', subtitle: 'Pancasila sebagai Dasar Negara', icon: '📚', color: '#3498db' },
    { id: 2, title: 'Modul 2', subtitle: 'Nilai-Nilai Pancasila', icon: '⭐', color: '#f39c12' },
    { id: 3, title: 'Modul 3', subtitle: 'Pancasila dalam Kehidupan Berbangsa', icon: '👥', color: '#27ae60' },
    { id: 4, title: 'Modul 4', subtitle: 'Pancasila dalam Era Global', icon: '🌍', color: '#9b59b6' },
    { id: 5, title: 'Modul 5', subtitle: 'Implementasi Pancasila', icon: '💡', color: '#1abc9c' },
  ];

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Modul Pancasila</h1>
          <button onClick={handleLogout} className="logout-button">
            Keluar
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="profile-section">
          <div className="profile-card">
            <div className="profile-avatar">
              <span>👤</span>
            </div>
            <div className="profile-info">
              <h2>{userData?.nama || 'Mahasiswa'}</h2>
              <p>{userData?.prodi} - {userData?.angkatan}</p>
            </div>
          </div>
        </div>

        <div className="modules-section">
          <h2>Modul Pembelajaran</h2>
          <div className="modules-grid">
            {modules.map((module) => (
              <div key={module.id} className="module-card">
                <div className="module-icon" style={{ backgroundColor: module.color }}>
                  <span>{module.icon}</span>
                </div>
                <div className="module-content">
                  <h3>{module.title}</h3>
                  <p>{module.subtitle}</p>
                </div>
                <div className="module-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
