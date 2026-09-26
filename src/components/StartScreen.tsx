import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Play,
  RotateCcw,
  Award,
  ShieldCheck,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  User,
  School,
  IdCard,
  Network,
  Cpu,
  ArrowRight,
  Flame,
  Check,
  Compass,
  FileCheck,
  Lock,
  X,
  Share2,
  UserCheck,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface StartScreenProps {
  candidateName: string;
  setCandidateName: (name: string) => void;
  schoolName: string;
  setSchoolName: (school: string) => void;
  score: number;
  timeRemaining: number;
  levelCompletion: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
    level4: boolean;
  };
  onStartExam: () => void;
  onResetExam: () => void;
  onOpenQuestionBook: () => void;
  onOpenScenarioNotes: () => void;
  onOpenCertificate: () => void;
  onOpenResult?: () => void;
  onOpenTeacherReview?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  candidateName,
  setCandidateName,
  schoolName,
  setSchoolName,
  score,
  timeRemaining,
  levelCompletion,
  onStartExam,
  onResetExam,
  onOpenQuestionBook,
  onOpenScenarioNotes,
  onOpenCertificate,
  onOpenResult,
  onOpenTeacherReview,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'rules'>('overview');
  const [blockedActionNotice, setBlockedActionNotice] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const identitySectionRef = useRef<HTMLDivElement>(null);

  // Identity is complete only when both candidate name and school name are filled
  const isIdentityComplete = Boolean(candidateName.trim() && schoolName.trim());

  const handleAttemptBlockedAction = (actionDesc: string) => {
    sounds.error();
    setBlockedActionNotice(
      `Akses terkunci! Anda wajib mengisi Identitas Peserta (Nama Lengkap & Asal Sekolah) terlebih dahulu sebelum ${actionDesc}.`
    );
    if (nameInputRef.current && !candidateName.trim()) {
      nameInputRef.current.focus();
    }
    if (identitySectionRef.current) {
      identitySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Auto-dismiss notice after 4.5 seconds
  useEffect(() => {
    if (!blockedActionNotice) return;
    const timer = setTimeout(() => {
      setBlockedActionNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [blockedActionNotice]);

  const completedCount = [
    levelCompletion.level1,
    levelCompletion.level2,
    levelCompletion.level3,
    levelCompletion.level4,
  ].filter(Boolean).length;

  const isExamInProgress = completedCount > 0 || timeRemaining < 2700;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modules = [
    {
      id: 1,
      title: 'Modul 1: Hardware & Kabel UTP Straight',
      points: '25 Poin',
      completed: levelCompletion.level1,
      unlocked: true,
      desc: 'Seleksi 8 peralatan kerja standar UKK & perakitan pin kabel UTP T568B Straight-Through.',
      icon: Cpu,
      color: 'cyan',
    },
    {
      id: 2,
      title: 'Modul 2: Konfigurasi Dasar & Sistem Router',
      points: '25 Poin',
      completed: levelCompletion.level2,
      unlocked: levelCompletion.level1,
      desc: 'Identitas router, alokasi IP WAN dari ISP, gateway, DNS, aktivasi NTP Client, dan Web Proxy.',
      icon: Network,
      color: 'blue',
    },
    {
      id: 3,
      title: 'Modul 3: DHCP Pool & Keamanan Firewall',
      points: '25 Poin',
      completed: levelCompletion.level3,
      unlocked: levelCompletion.level1 && levelCompletion.level2,
      desc: 'IP LAN 192.168.100.1/25, IP WLAN 192.168.200.1/24, DHCP 99 clients, firewall drop ping & log disk.',
      icon: ShieldCheck,
      color: 'indigo',
    },
    {
      id: 4,
      title: 'Modul 4: Pengujian Terpadu & Verifikasi',
      points: '25 Poin',
      completed: levelCompletion.level4,
      unlocked: levelCompletion.level1 && levelCompletion.level2 && levelCompletion.level3,
      desc: 'Pengujian ping multi-segment, blokir website http://www.example.com/, verifikasi log disk & jadwal hotspot.',
      icon: CheckCircle2,
      color: 'emerald',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Ambience Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-950">
              UKK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  NetAdmin: The UKK Challenge
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Standar BNSP / LSP-P1
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5">
                Simulator Uji Kompetensi Keahlian Teknik Komputer & Jaringan (TKJ)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isExamInProgress && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-amber-300 font-semibold">{formatTime(timeRemaining)}</span>
                </div>
                <div className="w-px h-3.5 bg-slate-700" />
                <div className="font-mono font-bold text-cyan-400">
                  Skor: {score}/100
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (!isIdentityComplete) {
                  handleAttemptBlockedAction('melihat format sertifikat');
                  return;
                }
                sounds.click();
                onOpenCertificate();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isIdentityComplete
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 cursor-pointer'
                  : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:border-amber-600/70 hover:text-amber-300 cursor-not-allowed'
              }`}
              title={!isIdentityComplete ? 'Wajib isi identitas peserta terlebih dahulu' : 'Format Sertifikat'}
            >
              {!isIdentityComplete ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Award className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">Format</span> Sertifikat
            </button>

            {onOpenTeacherReview && (
              <button
                onClick={() => {
                  sounds.click();
                  onOpenTeacherReview();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 transition-colors cursor-pointer"
                title="Publikasikan Tautan Proyek & Lembar Catatan Revisi Guru"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Publikasi / Guru</span>
              </button>
            )}

            {onOpenResult && (
              <button
                onClick={() => {
                  if (!isIdentityComplete) {
                    handleAttemptBlockedAction('melihat rincian nilai ujian');
                    return;
                  }
                  sounds.click();
                  onOpenResult();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  isIdentityComplete
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500 shadow-sm shadow-amber-950 cursor-pointer'
                    : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:border-amber-600/70 hover:text-amber-300 cursor-not-allowed'
                }`}
                title={!isIdentityComplete ? 'Wajib isi identitas peserta terlebih dahulu' : 'Lihat Hasil & Rincian Nilai'}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Nilai Akhir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Alert for Attempted Action without Identity */}
      {blockedActionNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-bounce-short">
          <div className="bg-amber-950/95 border-2 border-amber-500 text-amber-100 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-900/90 text-amber-300 shrink-0 mt-0.5 border border-amber-700">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">Akses Terkunci: Lengkapi Identitas!</span>
                <p className="text-xs text-amber-200 mt-1 leading-relaxed">{blockedActionNotice}</p>
                <span className="text-[11px] text-cyan-300 font-semibold block mt-1">
                  Ketik Nama Lengkap & Asal Sekolah Anda pada formulir di bawah.
                </span>
              </div>
            </div>
            <button
              onClick={() => setBlockedActionNotice(null)}
              className="p-1 hover:bg-amber-900 rounded text-amber-300 hover:text-white transition-colors shrink-0"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulasi Ujian Berbasis Standar Industri MikroTik RouterOS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Selamat Datang di Portal Uji Kompetensi Keahlian{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Network Administrator
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Persiapkan diri Anda untuk menghadapi simulasi praktikum konfigurasi jaringan lengkap: mulai dari perakitan fisik kabel UTP straight, pengaturan IP WAN/LAN/WLAN, routing statis, DHCP server 99 clients, firewall security drop ICMP, logging disk, hingga pembatasan jam hotspot & web proxy.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
              <span className="text-slate-400 block text-[11px]">Durasi Simulasi</span>
              <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> 45 Menit
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
              <span className="text-slate-400 block text-[11px]">Ambang Kelulusan (KKM)</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Min. 75 / 100 Poin
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
              <span className="text-slate-400 block text-[11px]">Jumlah Modul Praktik</span>
              <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> 4 Modul Terintegrasi
              </span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/70">
              <span className="text-slate-400 block text-[11px]">Platform Router</span>
              <span className="text-sm font-bold text-indigo-300 font-mono mt-0.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> MikroTik RB941 / v6.x-v7.x
              </span>
            </div>
          </div>
        </div>

        {/* Prominent Gating Notice when identity is not yet filled */}
        {!isIdentityComplete ? (
          <div className="bg-amber-950/60 border-2 border-amber-500/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-white">
                    Seluruh Akses Ujian & Buku Panduan Terkunci
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-900 text-amber-300 border border-amber-700 px-2 py-0.5 rounded-full">
                    Wajib Isi Identitas
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Sebelum dapat membuka buku referensi, modul praktik, atau memulai ujian, Anda wajib mengisi formulir <strong className="text-white">Identitas Peserta</strong> (Nama Lengkap & Asal Sekolah) di bawah.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.click();
                if (nameInputRef.current) {
                  nameInputRef.current.focus();
                }
                if (identitySectionRef.current) {
                  identitySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Isi Identitas Sekarang &darr;</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Identitas Peserta Terdaftar: <strong className="text-white">{candidateName}</strong> ({schoolName}). Seluruh modul & buku referensi terbuka.
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold hidden sm:inline">
              Akses Penuh Aktif
            </span>
          </div>
        )}

        {/* IMPORTANT NOTICE & ACCESS HUB: BUKU PENJELASAN & CATATAN SKENARIO */}
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-2 border-cyan-500/40 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 text-[11px] font-semibold tracking-wide uppercase border border-cyan-700/50">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Akses Eksklusif Sebelum Simulasi
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Pusat Sumber Belajar & Buku Referensi Ujian
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                <strong className="text-amber-300">PENTING:</strong> Sesuai tata tertib ujian mandiri, <strong>Buku Penjelasan Soal</strong> dan <strong>Buku Catatan Skenario</strong> <span className="underline decoration-cyan-400 font-semibold text-white">hanya dapat dibuka di Tampilan Awalan ini</span>. Manfaatkan kedua buku di bawah untuk mempelajari apa yang harus diisi dan spesifikasi teknis sebelum menekan tombol "Mulai Ujian Praktik".
              </p>
            </div>
          </div>

          {/* 2 Big Action Cards for the Books */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {/* Card 1: Buku Penjelasan Soal */}
            <div className="group bg-slate-950/80 hover:bg-slate-900/90 border border-blue-500/30 hover:border-blue-400/80 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-blue-900/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-950/90 border border-blue-700/60 flex items-center justify-center text-blue-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                    Panduan 15 Butir Soal
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    📘 Buku Penjelasan & Petunjuk Soal Interaktif
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Berisi ulasan mendalam tentang <strong>apa yang harus diisi</strong> pada setiap butir tugas UKK, alasan teknis & rumus subnetting (/25), format input IP yang diterima, letak menu WinBox GUI, serta perintah RouterOS CLI.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Target & Format Nilai</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Rumus Subnet /25</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Alasan Teknis Firewall</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Panduan WinBox & CLI</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    if (!isIdentityComplete) {
                      handleAttemptBlockedAction('membuka Buku Penjelasan Soal');
                      return;
                    }
                    sounds.click();
                    onOpenQuestionBook();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all shadow-md ${
                    isIdentityComplete
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-950/50 cursor-pointer'
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-amber-500 hover:text-amber-300 cursor-not-allowed'
                  }`}
                >
                  {isIdentityComplete ? (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Buka Buku Penjelasan Soal (Apa Yang Harus Diisi)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300">Terkunci: Isi Identitas Peserta Terlebih Dahulu</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Buku Catatan Skenario */}
            <div className="group bg-slate-950/80 hover:bg-slate-900/90 border border-amber-500/30 hover:border-amber-400/80 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-amber-900/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-amber-950/90 border border-amber-700/60 flex items-center justify-center text-amber-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                    Dokumen Resmi PDF
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    📑 Buku Catatan Skenario & Ketentuan Teknis
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Dokumen acuan resmi parameter jaringan: ketentuan IP WAN dari ISP, jaringan LAN <span className="font-mono text-amber-300">192.168.100.1/25</span>, Wireless Hotspot <span className="font-mono text-amber-300">192.168.200.1/24</span>, Web Proxy, dan aturan firewall logging disk.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Parameter Resmi Soal PDF</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Alokasi Port ether1, ether2, wlan1</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Jam Hotspot 07.00 - 16.00</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">✓ Aturan Blokir ICMP</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    if (!isIdentityComplete) {
                      handleAttemptBlockedAction('membuka Buku Catatan Skenario');
                      return;
                    }
                    sounds.click();
                    onOpenScenarioNotes();
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs transition-all shadow-md ${
                    isIdentityComplete
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-600/50 hover:border-amber-500 shadow-slate-950 cursor-pointer'
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:border-amber-500 hover:text-amber-300 cursor-not-allowed'
                  }`}
                >
                  {isIdentityComplete ? (
                    <>
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>Buka Buku Catatan Skenario (Spesifikasi PDF)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300">Terkunci: Isi Identitas Peserta Terlebih Dahulu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Profile Card & Exam Preparation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Candidate Profile Form */}
          <div
            ref={identitySectionRef}
            className={`bg-slate-900 border rounded-2xl p-6 space-y-5 transition-all ${
              !isIdentityComplete
                ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-950/40'
                : 'border-emerald-700/60 shadow-lg shadow-emerald-950/20'
            }`}
          >
            <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <IdCard className="w-5 h-5 text-cyan-400" />
                <span>Identitas Peserta Uji Kompetensi</span>
              </div>
              {isIdentityComplete ? (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Terverifikasi</span>
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Wajib Diisi</span>
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Nama Lengkap Peserta
                  </span>
                  <span className="text-[10px] text-amber-400 font-normal">*Wajib</span>
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={candidateName}
                  onChange={(e) => {
                    setCandidateName(e.target.value);
                    if (blockedActionNotice) setBlockedActionNotice(null);
                  }}
                  placeholder="Ketik nama lengkap Anda..."
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-slate-100 font-medium focus:outline-none focus:ring-1 ${
                    !candidateName.trim()
                      ? 'border-amber-600/70 focus:border-amber-500 focus:ring-amber-500'
                      : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500'
                  }`}
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Nama ini akan dicetak pada Sertifikat & Lembar Hasil Uji Kompetensi.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-cyan-400" />
                    Asal Sekolah / Lembaga Uji
                  </span>
                  <span className="text-[10px] text-amber-400 font-normal">*Wajib</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => {
                    setSchoolName(e.target.value);
                    if (blockedActionNotice) setBlockedActionNotice(null);
                  }}
                  placeholder="Contoh: SMK Negeri 1 Jurusan TKJ"
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-slate-100 font-medium focus:outline-none focus:ring-1 ${
                    !schoolName.trim()
                      ? 'border-amber-600/70 focus:border-amber-500 focus:ring-amber-500'
                      : 'border-slate-700 focus:border-cyan-500 focus:ring-cyan-500'
                  }`}
                />
              </div>

              <div className="pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300">Paket Soal Ujian Terpilih:</div>
                  <div className="text-cyan-300 font-medium">
                    Paket 2: Rancang Bangun Keamanan Jaringan WAN & Wireless Hotspot Server
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Sesuai Kisi-kisi Uji Kompetensi Kejuruan (UKK) Nasional.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Modules Overview & Exam Launch */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 text-white font-bold text-base">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>Silabus & Status 4 Tahapan Praktik (Jalur Berurutan)</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Progres: <span className="font-bold text-cyan-400">{completedCount}/4 Modul Selesai</span>
                </div>
              </div>

              {/* Linear Progression Rule Callout */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-white block">Aturan Jalur Uji Bertahap (Anti-Meloncat Level):</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistem mewajibkan kelulusan berurutan: Modul 1 ➔ Modul 2 ➔ Modul 3 ➔ Modul 4. Anda tidak dapat melompati level sebelum modul prasyarat diselesaikan.
                  </p>
                </div>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        m.completed
                          ? 'bg-emerald-950/30 border-emerald-700/60 text-slate-200'
                          : !m.unlocked
                          ? 'bg-slate-950/40 border-slate-900 opacity-60 text-slate-500'
                          : 'bg-slate-950/80 border-cyan-800/50 text-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              m.completed
                                ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700'
                                : !m.unlocked
                                ? 'bg-slate-900 text-slate-600 border border-slate-800'
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`font-bold text-xs ${m.completed ? 'text-white' : !m.unlocked ? 'text-slate-500' : 'text-cyan-200'}`}>
                            Modul {m.id}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            m.completed
                              ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                              : !isIdentityComplete
                              ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80'
                              : !m.unlocked
                              ? 'bg-slate-900 text-slate-500 border border-slate-800'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {m.completed ? (
                            '✓ Selesai (+25 Poin)'
                          ) : !isIdentityComplete ? (
                            <>
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                              <span>Kunci Identitas</span>
                            </>
                          ) : !m.unlocked ? (
                            <>
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              <span>Terkunci</span>
                            </>
                          ) : (
                            '▶ Siap Dikerjakan'
                          )}
                        </span>
                      </div>
                      <div className={`font-semibold text-xs mb-1 ${m.completed ? 'text-slate-200' : !m.unlocked || !isIdentityComplete ? 'text-slate-400' : 'text-slate-200'}`}>
                        {m.title.replace(/^Modul \d+: /, '')}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {m.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Launch Action Section */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs space-y-0.5 text-center sm:text-left">
                <div className="text-slate-300 font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Status Ujian:</span>
                  <span className={isExamInProgress ? 'text-amber-400 font-bold' : isIdentityComplete ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {isExamInProgress ? 'Sesi Sedang Berjalan' : isIdentityComplete ? 'Siap Dimulai' : 'Menunggu Pengisian Identitas'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  {isExamInProgress
                    ? `Skor terkumpul: ${score}/100 poin · Sisa waktu: ${formatTime(timeRemaining)}`
                    : isIdentityComplete
                    ? 'Identitas siap. Waktu 45 menit akan dihitung otomatis saat simulasi aktif.'
                    : 'Wajib mengisi Nama Lengkap & Asal Sekolah sebelum memulai simulasi.'}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {isExamInProgress && (
                  <button
                    onClick={() => {
                      sounds.click();
                      if (window.confirm('Apakah Anda yakin ingin mereset seluruh progres ujian?')) {
                        onResetExam();
                      }
                    }}
                    className="flex-1 sm:flex-none px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset</span>
                  </button>
                )}

                {onOpenTeacherReview && (
                  <button
                    onClick={() => {
                      sounds.click();
                      onOpenTeacherReview();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-700/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    title="Buka Lembar Publikasi & Revisi Guru Penguji"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Publikasi / Mode Penguji</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (!isIdentityComplete) {
                      handleAttemptBlockedAction('memulai ujian praktik');
                      return;
                    }
                    sounds.click();
                    onStartExam();
                  }}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all transform ${
                    isIdentityComplete
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-950/60 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                      : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-300 cursor-not-allowed'
                  }`}
                >
                  {isIdentityComplete ? (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>
                        {isExamInProgress ? 'Lanjutkan Ujian Praktik' : 'Mulai Ujian Praktik Sekarang'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300">Lengkapi Identitas Untuk Mulai</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Rules & Exam Guidelines */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Panduan Singkat Pelaksanaan Uji Kompetensi</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center text-[10px]">1</span>
                Pelajari Panduan & Ketentuan
              </div>
              <p className="text-[11px] leading-relaxed">
                Buka <strong>Buku Penjelasan Soal</strong> untuk memahami apa yang harus diisi, rumus subnetting /25, dan buka <strong>Catatan Skenario</strong> untuk mengecek daftar IP, gateway, serta DNS sebelum memulai.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center text-[10px]">2</span>
                Input Mandiri di WinBox Lab
              </div>
              <p className="text-[11px] leading-relaxed">
                Di dalam simulator, seluruh kotak input bersih tanpa bocoran nilai. Ketikkan IP Address, Subnet Mask, Gateway, Pool, dan Firewall Rules sesuai pemahaman yang Anda pelajari.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1.5">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center text-[10px]">3</span>
                Pengujian & Sertifikasi
              </div>
              <p className="text-[11px] leading-relaxed">
                Uji konektivitas di Modul 4. Apabila semua aturan lolos verifikasi dan skor mencapai minimal 75 poin, Anda berhak mencetak <strong>Sertifikat Kompetensi BNSP</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NetAdmin: The UKK Challenge &middot; Lembaga Sertifikasi Profesi (LSP) & BNSP</span>
          <span className="text-slate-600">Simulasi Praktik Jaringan Komputer Berbasis Web</span>
        </div>
      </footer>
    </div>
  );
};
