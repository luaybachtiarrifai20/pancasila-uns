import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus, Edit, Trash2, X, Clock, Globe, Save, Image, Video, Link2, Eye } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, getDocs, doc, deleteDoc, setDoc, updateDoc, orderBy } from 'firebase/firestore';


// Helper: detect if link is a video embed (YouTube / Google Drive)
function getVideoEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Google Drive
  const gdMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
  return null;
}

function isImageUrl(url) {
  if (!url) return false;
  return /\.(jpeg|jpg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}

export default function DosenKelolaKasus() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [previewMedia, setPreviewMedia] = useState(null); // for inline preview
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Sila 3 & 5',
    domain: 'Media Sosial',
    content: '',
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'));
      const querySnapshot = await getDocs(q);
      const casesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCases(casesData);
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus studi kasus ini?')) {
      try {
        await deleteDoc(doc(db, 'cases', id));
        fetchCases();
      } catch (error) {
        console.error("Error deleting case:", error);
        alert("Gagal menghapus studi kasus: " + error.message);
      }
    }
  };

  const handleAddClick = () => {
    setModalMode('add');
    setPreviewMedia(null);
    setFormData({
      id: `case_${Date.now()}`,
      title: '',
      category: 'Sila 3 & 5',
      domain: 'Media Sosial',
      content: '',
      imageUrl: '',
      videoUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (cs) => {
    setModalMode('edit');
    setPreviewMedia(null);
    setFormData({
      id: cs.id,
      title: cs.title || '',
      category: cs.category || 'Sila 3 & 5',
      domain: cs.domain || 'Media Sosial',
      content: cs.content || '',
      imageUrl: cs.imageUrl || '',
      videoUrl: cs.videoUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Judul dan Konten tidak boleh kosong!");
      return;
    }

    const dosenId = auth.currentUser?.email || 'unknown_dosen';
    const payload = {
      title: formData.title,
      category: formData.category,
      domain: formData.domain,
      content: formData.content,
      imageUrl: formData.imageUrl.trim(),
      videoUrl: formData.videoUrl.trim(),
      dosenId
    };

    try {
      if (modalMode === 'add') {
        await setDoc(doc(db, 'cases', formData.id), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      } else {
        await updateDoc(doc(db, 'cases', formData.id), payload);
      }
      setIsModalOpen(false);
      fetchCases();
    } catch (error) {
      console.error("Error saving case:", error);
      alert("Gagal menyimpan studi kasus: " + error.message);
    }
  };

  // Render media badge on cards
  const renderMediaBadges = (cs) => (
    <div className="flex gap-2 mt-2">
      {cs.imageUrl && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          <Image className="w-2.5 h-2.5" /> Gambar
        </span>
      )}
      {cs.videoUrl && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
          <Video className="w-2.5 h-2.5" /> Video
        </span>
      )}
    </div>
  );

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
              <div className="bg-teal-600 p-1.5 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">Kelola Diskusi &amp; Studi Kasus</h1>
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Diskusi
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 gap-6">
          {cases.map((cs) => (
            <div
              key={cs.id}
              onClick={() => navigate(`/dosen-kelola-kasus/${cs.id}`)}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-teal-100 transition-all duration-500 flex flex-col sm:flex-row sm:items-center gap-6 group cursor-pointer"
            >
              {/* Media thumbnail preview on card */}
              {cs.imageUrl && isImageUrl(cs.imageUrl) ? (
                <img
                  src={cs.imageUrl}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded-2xl flex-shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  <Globe className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-teal-600 text-[10px] font-black uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full font-sans">
                    {cs.category}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {cs.domain}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-lg group-hover:text-teal-600 transition-colors truncate">
                  Studi Kasus: {cs.title}
                </h4>
                <p className="text-slate-500 text-sm line-clamp-1">{cs.content}</p>
                {renderMediaBadges(cs)}
              </div>

              <div className="flex items-center gap-3 sm:pl-6 sm:border-l border-slate-100">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEditClick(cs); }}
                  className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(cs.id)}
                  className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {cases.length === 0 && !loading && (
            <div className="py-20 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="italic">Belum ada daftar studi kasus.</p>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                {modalMode === 'add' ? 'Tambah Diskusi Baru' : 'Edit Diskusi & Studi Kasus'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
              {/* Judul */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Judul Studi Kasus</label>
                <input
                  type="text" required
                  placeholder="Contoh: Diskriminasi di Sosial Media"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Category + Domain */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Kategori Sila</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Sila 1 & 3"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Platform / Domain</label>
                  <input
                    type="text" required
                    placeholder="Contoh: Media Sosial"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all font-semibold"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
              </div>

              {/* Konten */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Konten / Skenario Diskusi</label>
                <textarea
                  rows="5" required
                  placeholder="Tuliskan skenario kasus secara rinci beserta pertanyaan diskusinya..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all leading-relaxed"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              {/* Divider media */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5" /> Media Pendukung (Opsional)
                </p>

                {/* Image URL */}
                <div className="mb-4">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Image className="w-3 h-3 text-indigo-500" /> Link Gambar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/gambar.jpg"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                      value={formData.imageUrl}
                      onChange={(e) => { setFormData({ ...formData, imageUrl: e.target.value }); setPreviewMedia(null); }}
                    />
                    {formData.imageUrl && (
                      <button type="button" onClick={() => setPreviewMedia('image')}
                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  {previewMedia === 'image' && formData.imageUrl && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-indigo-100 bg-indigo-50">
                      <img src={formData.imageUrl} alt="preview" className="w-full max-h-48 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">Tempel URL gambar langsung (JPG, PNG, WebP, dll)</p>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Video className="w-3 h-3 text-rose-500" /> Link Video
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://youtu.be/xxx atau Google Drive link"
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-400 outline-none transition-all"
                      value={formData.videoUrl}
                      onChange={(e) => { setFormData({ ...formData, videoUrl: e.target.value }); setPreviewMedia(null); }}
                    />
                    {formData.videoUrl && (
                      <button type="button" onClick={() => setPreviewMedia('video')}
                        className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    )}
                  </div>
                  {previewMedia === 'video' && formData.videoUrl && getVideoEmbedUrl(formData.videoUrl) && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-rose-100 aspect-video">
                      <iframe
                        src={getVideoEmbedUrl(formData.videoUrl)}
                        className="w-full h-full"
                        allowFullScreen title="Video Preview"
                      />
                    </div>
                  )}
                  {previewMedia === 'video' && formData.videoUrl && !getVideoEmbedUrl(formData.videoUrl) && (
                    <p className="text-xs text-rose-500 mt-1.5">⚠ Format video tidak dikenali. Gunakan link YouTube atau Google Drive.</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">Mendukung: YouTube (youtu.be / youtube.com) & Google Drive</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3.5 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Studi Kasus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
