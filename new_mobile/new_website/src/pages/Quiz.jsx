import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, HelpCircle, Timer, Award } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Quiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      id: 1,
      q: 'Siapa yang pertama kali mengusulkan istilah "Pancasila" pada sidang BPUPKI?',
      options: ['Moh. Yamin', 'Mr. Soepomo', 'Ir. Soekarno', 'Moh. Hatta'],
      correct: 2
    },
    {
      id: 2,
      q: 'Kapan Pancasila secara resmi disahkan sebagai dasar negara?',
      options: ['1 Juni 1945', '17 Agustus 1945', '18 Agustus 1945', '22 Juni 1945'],
      correct: 2
    },
    {
      id: 3,
      q: 'Sila kedua Pancasila berbunyi...',
      options: [
        'Persatuan Indonesia',
        'Kemanusiaan yang adil dan beradab',
        'Keadilan sosial bagi seluruh rakyat Indonesia',
        'Ketuhanan yang maha esa'
      ],
      correct: 1
    }
  ];

  const handleAnswer = (optIdx) => {
    setAnswers({ ...answers, [currentStep]: optIdx });
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (answers[idx] === q.correct) correctCount++;
      });
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setIsFinished(true);

      // Save to Firebase
      try {
        await addDoc(collection(db, 'submissions'), {
          userId: auth.currentUser?.email,
          userName: auth.currentUser?.email.split('@')[0],
          title: 'Kuis Bab 1',
          type: 'kuis',
          score: finalScore,
          status: 'Selesai',
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center">
          <div className="bg-amber-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Award className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Kuis Selesai!</h2>
          <p className="text-slate-500 mb-8 font-medium">Luar biasa! Kamu telah menyelesaikan evaluasi Bab 1.</p>
          
          <div className="bg-slate-50 rounded-3xl p-8 mb-8">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Skor Kamu</p>
            <p className="text-6xl font-black text-slate-800">{score}</p>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-red-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-800 transition-all"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg tracking-tight">Kuis Mandiri</h1>
          </div>
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl">
            <Timer className="w-4 h-4 text-red-600" />
            <span className="text-xs font-black text-red-700">10:00</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pertanyaan {currentStep + 1} dari {questions.length}</span>
            <span className="text-xs font-black text-red-700">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-red-700 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800 mb-10 leading-relaxed">
            {questions[currentStep].q}
          </h2>

          <div className="space-y-4">
            {questions[currentStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${
                  answers[currentStep] === idx 
                  ? 'border-red-700 bg-red-50 shadow-lg shadow-red-100' 
                  : 'border-slate-100 hover:border-red-200 hover:bg-slate-50'
                }`}
              >
                <span className={`font-bold text-lg ${answers[currentStep] === idx ? 'text-red-700' : 'text-slate-600'}`}>
                  {opt}
                </span>
                {answers[currentStep] === idx && (
                  <CheckCircle2 className="w-6 h-6 text-red-700" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <button
              onClick={handleNext}
              disabled={answers[currentStep] === undefined}
              className="bg-red-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-red-100 hover:bg-red-800 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {currentStep === questions.length - 1 ? 'Selesai' : 'Lanjut'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
