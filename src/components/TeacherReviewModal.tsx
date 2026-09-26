import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Printer,
  FileText,
  UserCheck,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Save,
  MessageSquare,
  School,
  Award,
  BookOpen,
  Send,
  Calendar,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface TeacherReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  schoolName: string;
  score: number;
  isTeacherBypassMode: boolean;
  setIsTeacherBypassMode: (enabled: boolean) => void;
  levelCompletion: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
    level4: boolean;
  };
}

export const TeacherReviewModal: React.FC<TeacherReviewModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  schoolName,
  score,
  isTeacherBypassMode,
  setIsTeacherBypassMode,
  levelCompletion,
}) => {
  // Public URL of the app
  const publicAppUrl = window.location.href.split('?')[0] || 'https://ais-pre-lbf5i4ydhqd4edydduadpl-864655981995.asia-southeast1.run.app';

  const [activeTab, setActiveTab] = useState<'publish' | 'review_form' | 'rubric'>('publish');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Teacher Review Form State (persistent in localStorage)
  const [teacherName, setTeacherName] = useState(() => {
    return localStorage.getItem('teacher_review_name') || 'Bapak/Ibu Guru Pembimbing TKJ';
  });
  const [teacherNip, setTeacherNip] = useState(() => {
    return localStorage.getItem('teacher_review_nip') || '-';
  });
  const [reviewDate, setReviewDate] = useState(() => {
    return localStorage.getItem('teacher_review_date') || new Date().toISOString().split('T')[0];
  });
  const [projectStatus, setProjectStatus] = useState<'approved' | 'approved_with_notes' | 'needs_revision'>(() => {
    return (localStorage.getItem('teacher_review_status') as any) || 'approved_with_notes';
  });
  const [teacherRecommendedScore, setTeacherRecommendedScore] = useState<number>(() => {
    const saved = localStorage.getItem('teacher_review_score');
    return saved ? Number(saved) : Math.max(score, 88);
  });

  // Notes per module
  const [notesModule1, setNotesModule1] = useState(() => {
    return localStorage.getItem('teacher_notes_mod1') || 'Susunan warna pin T568B dan pemilihan alat sudah tepat sesuai standar K3.';
  });
  const [notesModule2, setNotesModule2] = useState(() => {
    return localStorage.getItem('teacher_notes_mod2') || 'Konfigurasi IP WAN/LAN, Gateway, dan Web Proxy port 8080 sudah sesuai soal.';
  });
  const [notesModule3, setNotesModule3] = useState(() => {
    return localStorage.getItem('teacher_notes_mod3') || 'Firewall drop ICMP dan rule logging ke disk sudah diterapkan dengan benar.';
  });
  const [notesModule4, setNotesModule4] = useState(() => {
    return localStorage.getItem('teacher_notes_mod4') || 'Uji coba ping drop dan redirect hotspot waktu 07:00-16:00 berhasil diverifikasi.';
  });
  const [generalFeedback, setGeneralFeedback] = useState(() => {
    return localStorage.getItem('teacher_general_feedback') || 'Proyek simulator sudah sangat baik dan siap diujikan atau dijadikan portofolio laporan PKL/UKK.';
  });

  const handleCopyLink = () => {
    sounds.click();
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const whatsappMessage = `Yth. Bapak/Ibu Guru Pembimbing / Penguji UKK,
Berikut saya kirimkan tautan hasil proyek simulator Uji Kompetensi Keahlian (UKK) & PKL Teknik Komputer dan Jaringan:

Nama Siswa: ${candidateName || 'Siswa TKJ'}
Asal Sekolah: ${schoolName || 'SMK Negeri'}
Judul Proyek: Simulator Jaringan MikroTik RouterOS UKK Paket 2
Tautan Publikasi: ${publicAppUrl}

Mohon kesediaan Bapak/Ibu untuk memeriksa, menguji simulasi pada browser, dan memberikan revisi/catatan evaluasi. Terima kasih banyak.`;

  const handleCopyMessage = () => {
    sounds.click();
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 3000);
  };

  const handleSaveReview = () => {
    sounds.success();
    localStorage.setItem('teacher_review_name', teacherName);
    localStorage.setItem('teacher_review_nip', teacherNip);
    localStorage.setItem('teacher_review_date', reviewDate);
    localStorage.setItem('teacher_review_status', projectStatus);
    localStorage.setItem('teacher_review_score', teacherRecommendedScore.toString());
    localStorage.setItem('teacher_notes_mod1', notesModule1);
    localStorage.setItem('teacher_notes_mod2', notesModule2);
    localStorage.setItem('teacher_notes_mod3', notesModule3);
    localStorage.setItem('teacher_notes_mod4', notesModule4);
    localStorage.setItem('teacher_general_feedback', generalFeedback);

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handlePrint = () => {
    sounds.click();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Publikasi & Lembar Revisi Guru Pembimbing
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Mode Penguji / PKL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Bagikan tautan proyek untuk ditinjau, uji bypass level untuk penguji, dan rekap lembar catatan revisi guru.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.click();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/60 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              sounds.click();
              setActiveTab('publish');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'publish'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>1. Tautan Publikasi & Bagikan</span>
          </button>

          <button
            onClick={() => {
              sounds.click();
              setActiveTab('review_form');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'review_form'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Lembar Catatan Revisi Guru</span>
          </button>

          <button
            onClick={() => {
              sounds.click();
              setActiveTab('rubric');
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === 'rubric'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Rubrik Penilaian UKK Resmi</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {saveToast && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Catatan revisi dan penilaian guru berhasil disimpan ke penyimpanan lokal!</span>
              </div>
              <button
                onClick={() => setSaveToast(false)}
                className="text-emerald-400 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          {/* TAB 1: PUBLISH & SHARE */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              {/* Teacher Bypass Quick Access */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                      Mode Pratinjau Guru / Penguji (Buka Semua Level)
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Aktifkan fitur ini agar Guru Pembimbing dapat langsung meloncat ke Level mana pun (Level 1, 2, 3, atau 4) tanpa harus menyelesaikan perakitan kabel dari awal.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.click();
                    setIsTeacherBypassMode(!isTeacherBypassMode);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm ${
                    isTeacherBypassMode
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isTeacherBypassMode ? 'Mode Guru Aktif (Unlocked)' : 'Aktifkan Mode Guru'}</span>
                </button>
              </div>

              {/* Direct Link Section */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    Tautan Publik Langsung (Untuk Dibuka Guru):
                  </span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    Online & Siap Diakses
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicAppUrl}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs font-mono text-cyan-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-all ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm'
                    }`}
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Guru pembimbing dapat membuka tautan ini di peramban apa pun (Chrome, Edge, Safari di laptop atau smartphone) tanpa perlu instalasi tambahan.
                </p>
              </div>

              {/* WhatsApp / Email Template */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-400" />
                    Template Pesan Kirim ke Guru (WhatsApp / Email):
                  </span>
                  <button
                    onClick={handleCopyMessage}
                    className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                      copiedMsg
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {copiedMsg ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMsg ? 'Pesan Tersalin!' : 'Salin Seluruh Pesan'}</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed select-all">
                  {whatsappMessage}
                </div>
              </div>

              {/* Steps for Teacher Review */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Panduan Bagi Guru Pembimbing Saat Memeriksa:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-400">
                  <li>
                    <strong className="text-slate-300">Buka Tautan:</strong> Akses link simulator melalui peramban laptop untuk tampilan WinBox yang optimal.
                  </li>
                  <li>
                    <strong className="text-slate-300">Gunakan Mode Pratinjau Penguji:</strong> Tekan tombol "Mode Guru (Unlocked)" di menu publikasi jika ingin langsung memeriksa Level 2, 3, atau 4.
                  </li>
                  <li>
                    <strong className="text-slate-300">Tulis Catatan Revisi:</strong> Masuk ke tab "2. Lembar Catatan Revisi Guru" untuk memberi feedback, skor rekomendasi, dan mencetak lembar berita acara.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: TEACHER REVISION FORM */}
          {activeTab === 'review_form' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-cyan-400" />
                    Lembar Verifikasi & Catatan Revisi Penguji / Guru Pembimbing
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data dapat dicetak langsung sebagai lembar evaluasi resmi untuk lampiran Laporan PKL siswa.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveReview}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Revisi</span>
                  </button>
                </div>
              </div>

              {/* Form Fields: Teacher Info & Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Nama Guru Pembimbing / Penguji:
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Contoh: Budi Santoso, S.Kom., M.T."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    NIP / No. Induk Pegawai:
                  </label>
                  <input
                    type="text"
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    placeholder="Contoh: 19850315 201001 1 012"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tanggal Verifikasi / Ujian:
                  </label>
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(e) => setReviewDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Decision & Recommended Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Status Kelayakan Proyek:
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800">
                      <input
                        type="radio"
                        name="projectStatus"
                        checked={projectStatus === 'approved'}
                        onChange={() => setProjectStatus('approved')}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span className="text-xs text-emerald-300 font-medium">
                        Disetujui Penuh / Sangat Layak (Tanpa Revisi)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800">
                      <input
                        type="radio"
                        name="projectStatus"
                        checked={projectStatus === 'approved_with_notes'}
                        onChange={() => setProjectStatus('approved_with_notes')}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span className="text-xs text-amber-300 font-medium">
                        Disetujui dengan Catatan / Revisi Ringan
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-850 cursor-pointer border border-slate-800">
                      <input
                        type="radio"
                        name="projectStatus"
                        checked={projectStatus === 'needs_revision'}
                        onChange={() => setProjectStatus('needs_revision')}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span className="text-xs text-rose-300 font-medium">
                        Perlu Perbaikan / Uji Ulang (Revisi Mayor)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Nilai Rekomendasi Guru:
                    </label>
                    <span className="text-xs text-cyan-400 font-mono font-bold">
                      Skor Sistem: {score}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={teacherRecommendedScore}
                      onChange={(e) => setTeacherRecommendedScore(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <span className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-sm min-w-[3.5rem] text-center">
                      {teacherRecommendedScore}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>
                      <strong>Predikat:</strong>{' '}
                      {teacherRecommendedScore >= 90
                        ? 'Sangat Kompeten (A)'
                        : teacherRecommendedScore >= 80
                        ? 'Kompeten (B)'
                        : teacherRecommendedScore >= 70
                        ? 'Cukup Kompeten (C)'
                        : 'Belum Kompeten'}
                    </p>
                    <p>KKM Uji Kompetensi Keahlian TKJ: 75.00</p>
                  </div>
                </div>
              </div>

              {/* Module Notes Grid */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Catatan Revisi & Feedback per Modul Soal:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Modul 1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400">
                        Modul 1: Hardware & Kabel UTP Straight
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          levelCompletion.level1
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {levelCompletion.level1 ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={notesModule1}
                      onChange={(e) => setNotesModule1(e.target.value)}
                      placeholder="Catatan untuk modul 1..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Modul 2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400">
                        Modul 2: Konfigurasi Dasar RouterOS & Proxy
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          levelCompletion.level2
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {levelCompletion.level2 ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={notesModule2}
                      onChange={(e) => setNotesModule2(e.target.value)}
                      placeholder="Catatan untuk modul 2..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Modul 3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400">
                        Modul 3: DHCP Pool & Firewall Rules
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          levelCompletion.level3
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {levelCompletion.level3 ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={notesModule3}
                      onChange={(e) => setNotesModule3(e.target.value)}
                      placeholder="Catatan untuk modul 3..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Modul 4 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400">
                        Modul 4: Pengujian Client & Hotspot
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          levelCompletion.level4
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {levelCompletion.level4 ? 'Selesai' : 'Belum'}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={notesModule4}
                      onChange={(e) => setNotesModule4(e.target.value)}
                      placeholder="Catatan untuk modul 4..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* General Feedback */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Kesimpulan & Saran Umum Penguji untuk Laporan PKL:
                </label>
                <textarea
                  rows={3}
                  value={generalFeedback}
                  onChange={(e) => setGeneralFeedback(e.target.value)}
                  placeholder="Tuliskan evaluasi menyeluruh atau saran penyusunan bab laporan PKL..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: RUBRIC */}
          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Rubrik Penilaian Standar Uji Kompetensi Keahlian (UKK) TKJ
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Berdasarkan instrumen asesmen BNSP / Kemendikbudristek untuk Paket Praktik Kejuruan TKJ.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">No</th>
                      <th className="p-3">Komponen / Sub Komponen Penilaian</th>
                      <th className="p-3">Indikator Ketercapaian</th>
                      <th className="p-3 text-center">Bobot</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                    <tr>
                      <td className="p-3 font-mono font-bold text-cyan-400">I</td>
                      <td className="p-3 font-semibold text-slate-200">
                        Persiapan & Pengkabelan
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Peralatan K3, crimping kabel Straight T568B, uji LAN tester 8 pin
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        8 pin menyala berurutan (1-8), RJ45 terkunci rapi tanpa jaket terkelupas
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">25%</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            levelCompletion.level1
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {levelCompletion.level1 ? 'Tercapai' : 'Belum'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-mono font-bold text-cyan-400">II</td>
                      <td className="p-3 font-semibold text-slate-200">
                        Konfigurasi Dasar MikroTik
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Identity router, IP WAN/Gateway/DNS, SNTP Client, Web Proxy
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        Router terhubung internet, waktu tersinkronisasi NTP, proxy port 8080 aktif
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">25%</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            levelCompletion.level2
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {levelCompletion.level2 ? 'Tercapai' : 'Belum'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-mono font-bold text-cyan-400">III</td>
                      <td className="p-3 font-semibold text-slate-200">
                        Routing, DHCP & Firewall Security
                        <span className="block text-[11px] text-slate-400 font-normal">
                          DHCP pool 99 clients LAN/WLAN, drop ICMP router, rule logging ke disk
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        Filter rule drop IP 192.168.100.2-50, logging firewall tersimpan ke disk
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">25%</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            levelCompletion.level3
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {levelCompletion.level3 ? 'Tercapai' : 'Belum'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="p-3 font-mono font-bold text-cyan-400">IV</td>
                      <td className="p-3 font-semibold text-slate-200">
                        Pengujian & Troubleshooting
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Uji koneksi PC, wireless hotspot jadwal 07:00-16:00, pemblokiran web
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        Ping router drop, browsing google sukses, situs example.com terblokir
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-cyan-300">25%</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            levelCompletion.level4
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {levelCompletion.level4 ? 'Tercapai' : 'Belum'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <School className="w-4 h-4 text-cyan-400" />
            <span>
              Kandidat: <strong className="text-white">{candidateName || 'Peserta Didik'}</strong> &middot;{' '}
              {schoolName || 'SMK'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveReview}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simpan Catatan</span>
            </button>

            <button
              onClick={() => {
                sounds.click();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              Tutup & Lanjutkan Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
