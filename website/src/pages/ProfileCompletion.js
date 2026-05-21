import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProfileCompletion.css';

function ProfileCompletion() {
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState('');
  const [angkatan, setAngkatan] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { completeProfile, user, needsProfileCompletion } = useAuth();
  const navigate = useNavigate();

  const prodiOptions = [
    'Teknik Informatika',
    'Sistem Informasi',
    'Teknik Elektro',
    'Teknik Mesin',
    'Teknik Sipil',
    'Manajemen',
    'Akuntansi',
    'Ekonomi',
    'Hukum',
    'Psikologi',
  ];

  React.useEffect(() => {
    if (!user || !needsProfileCompletion) {
      navigate('/home');
    }
  }, [user, needsProfileCompletion, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await completeProfile(nama, prodi, angkatan);
      navigate('/home');
    } catch (error) {
      setError('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="icon-wrapper">
            <span className="icon">👤</span>
          </div>
          <h1>Lengkapi Profil</h1>
          <p>Silakan lengkapi data diri Anda untuk melanjutkan</p>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="nama">Nama Lengkap</label>
            <input
              type="text"
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="prodi">Program Studi</label>
            <select
              id="prodi"
              value={prodi}
              onChange={(e) => setProdi(e.target.value)}
              required
            >
              <option value="">Pilih program studi</option>
              {prodiOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="angkatan">Angkatan</label>
            <input
              type="text"
              id="angkatan"
              value={angkatan}
              onChange={(e) => setAngkatan(e.target.value)}
              placeholder="Contoh: 2023"
              maxLength={4}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Memuat...' : 'Simpan & Lanjutkan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileCompletion;
