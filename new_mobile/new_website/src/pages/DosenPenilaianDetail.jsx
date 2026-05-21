import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function DosenPenilaianDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // submission ID
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const docRef = doc(db, 'submissions', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setSubmission({ id: snap.id, ...data });
          setScore(data.score?.toString() ?? '');
          setStatus(data.status ?? '');
        } else {
          setError('Submission not found');
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load submission');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id]);

  const handleSave = async () => {
    if (!score || isNaN(Number(score))) {
      setError('Score must be a number');
      return;
    }
    try {
      const docRef = doc(db, 'submissions', id);
      await updateDoc(docRef, {
        score: Number(score),
        status: 'Selesai',
      });
      navigate('/dosen-penilaian');
    } catch (e) {
      console.error(e);
      setError('Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <AlertCircle className="w-12 h-12 text-red-600" />
        <p className="ml-4 text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-xl">Penilaian Detail</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-2xl font-bold mb-4">{submission.title}</h2>
          <p className="text-slate-600 mb-2"><strong>Mahasiswa:</strong> {submission.userName}</p>
          <p className="text-slate-600 mb-2"><strong>Jenis:</strong> {submission.type}</p>
          <div className="mt-4 flex items-center gap-4">
            <label className="font-medium">Nilai:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={e => setScore(e.target.value)}
              className="border rounded px-2 py-1 w-20"
            />
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
