

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DosenDashboard from './pages/DosenDashboard';
import DosenKelolaKelas from './pages/DosenKelolaKelas';
import DosenProgres from './pages/DosenProgres';
import DosenPenilaian from './pages/DosenPenilaian';
import DosenKelolaModul from './pages/DosenKelolaModul';
import DosenKelolaKuis from './pages/DosenKelolaKuis';
import DosenKelolaKasus from './pages/DosenKelolaKasus';
import DosenKelolaKasusDetail from './pages/DosenKelolaKasusDetail';
import ModuleDetail from './pages/ModuleDetail';
import Quiz from './pages/Quiz';
import CaseStudy from './pages/CaseStudy';
import SetupDatabase from './pages/SetupDatabase';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/setup-db" element={<SetupDatabase />} />
        
        {/* Mahasiswa Routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/module-detail" element={<PrivateRoute><ModuleDetail /></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/case-study" element={<PrivateRoute><CaseStudy /></PrivateRoute>} />
        
        {/* Dosen Routes */}
        <Route path="/dosen-dashboard" element={<PrivateRoute><DosenDashboard /></PrivateRoute>} />
        <Route path="/dosen-kelola-kelas" element={<PrivateRoute><DosenKelolaKelas /></PrivateRoute>} />
        <Route path="/dosen-progres" element={<PrivateRoute><DosenProgres /></PrivateRoute>} />
        <Route path="/dosen-penilaian" element={<PrivateRoute><DosenPenilaian /></PrivateRoute>} />
        <Route path="/dosen-kelola-modul" element={<PrivateRoute><DosenKelolaModul /></PrivateRoute>} />
        <Route path="/dosen-kelola-kuis" element={<PrivateRoute><DosenKelolaKuis /></PrivateRoute>} />
        <Route path="/dosen-kelola-kasus" element={<PrivateRoute><DosenKelolaKasus /></PrivateRoute>} />
<Route path="/dosen-kelola-kasus/:caseId" element={<PrivateRoute><DosenKelolaKasusDetail /></PrivateRoute>} />
        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
