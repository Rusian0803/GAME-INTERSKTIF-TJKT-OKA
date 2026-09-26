import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { TopologyMap } from './components/TopologyMap';
import { Level1Hardware } from './components/Level1Hardware';
import { Level2BasicConfig } from './components/Level2BasicConfig';
import { Level3DhcpFirewall } from './components/Level3DhcpFirewall';
import { Level4Testing } from './components/Level4Testing';
import { CertificateModal } from './components/CertificateModal';
import { ScoreResultModal } from './components/ScoreResultModal';
import { QuestionBookModal } from './components/QuestionBookModal';
import { ScenarioNotesModal } from './components/ScenarioNotesModal';
import { TeacherReviewModal } from './components/TeacherReviewModal';
import { NetworkConfig } from './types/serkom';
import { sounds } from './utils/audio';
import { RotateCcw, HelpCircle, FileCheck, CheckCircle2, Home, Lock, AlertTriangle, X, ChevronRight, Award, Share2, Unlock } from 'lucide-react';

export default function App() {
  // Navigation view: 'start' (Tampilan Awalan / Beranda) or 'simulator' (Ruang Uji WinBox Lab)
  const [currentView, setCurrentView] = useState<'start' | 'simulator'>('start');

  // Candidate Profile (Dibuat kosong di awal agar diisi peserta)
  const [candidateName, setCandidateName] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const isIdentityComplete = candidateName.trim().length > 0 && schoolName.trim().length > 0;

  // Active level state (1, 2, 3, 4)
  const [activeLevel, setActiveLevel] = useState<number>(1);

  // Sound enabled
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Result & Score modal (Tampilan Nilai & Selesai)
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [hasAutoOpenedResult, setHasAutoOpenedResult] = useState<boolean>(false);

  // Teacher Review & Publication modal
  const [isTeacherReviewOpen, setIsTeacherReviewOpen] = useState<boolean>(false);
  const [isTeacherBypassMode, setIsTeacherBypassMode] = useState<boolean>(false);

  // Certificate modal
  const [isCertificateOpen, setIsCertificateOpen] = useState<boolean>(false);
  // Question Book modal (Only openable from StartScreen)
  const [isQuestionBookOpen, setIsQuestionBookOpen] = useState<boolean>(false);
  // Scenario Notes modal (Only openable from StartScreen)
  const [isScenarioNotesOpen, setIsScenarioNotesOpen] = useState<boolean>(false);

  // Timer: 45 minutes for practical Serkom test
  const [timeRemaining, setTimeRemaining] = useState<number>(2700);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Level Completion States
  const [level1Completed, setLevel1Completed] = useState<boolean>(false);
  const [level2Completed, setLevel2Completed] = useState<boolean>(false);
  const [level3Completed, setLevel3Completed] = useState<boolean>(false);
  const [level4Completed, setLevel4Completed] = useState<boolean>(false);

  // Individual Level Scores (Supports deductions for mistakes)
  const [level1Score, setLevel1Score] = useState<number>(0);
  const [level2Score, setLevel2Score] = useState<number>(0);
  const [level3Score, setLevel3Score] = useState<number>(0);
  const [level4Score, setLevel4Score] = useState<number>(0);

  // Locked notice banner / toast when user attempts to jump levels
  const [lockNotice, setLockNotice] = useState<string | null>(null);

  // Level Lock Rules:
  // Level 1: Always unlocked
  // Level 2: Requires Level 1 completed
  // Level 3: Requires Level 1 & Level 2 completed
  // Level 4: Requires Level 1, Level 2, & Level 3 completed
  // If isTeacherBypassMode is active, all levels are unlocked for grading/review
  const isLevelUnlocked = (lvl: number): boolean => {
    if (isTeacherBypassMode) return true;
    if (lvl === 1) return true;
    if (lvl === 2) return level1Completed;
    if (lvl === 3) return level1Completed && level2Completed;
    if (lvl === 4) return level1Completed && level2Completed && level3Completed;
    return false;
  };

  const handleSetActiveLevel = (lvl: number) => {
    if (isLevelUnlocked(lvl)) {
      sounds.click();
      setActiveLevel(lvl);
      setLockNotice(null);
    } else {
      sounds.error();
      const prevLevel = lvl - 1;
      setLockNotice(
        `Akses Level ${lvl} Terkunci! Anda tidak dapat meloncat level. Selesaikan seluruh penugasan pada Level ${prevLevel} terlebih dahulu.`
      );
    }
  };

  // Automatically enforce that activeLevel never exceeds the highest unlocked level
  useEffect(() => {
    if (!isLevelUnlocked(activeLevel)) {
      const highest = !level1Completed ? 1 : !level2Completed ? 2 : !level3Completed ? 3 : 4;
      setActiveLevel(highest);
    }
  }, [level1Completed, level2Completed, level3Completed, activeLevel]);

  // Auto-dismiss lock notice after 4.5 seconds
  useEffect(() => {
    if (!lockNotice) return;
    const timer = setTimeout(() => {
      setLockNotice(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [lockNotice]);

  // Configuration State matching PDF criteria (fresh unconfigured router)
  const [config, setConfig] = useState<NetworkConfig>(() => {
    return {
      wanIp: '',
      wanGateway: '',
      dnsServer: '',
      ntpEnabled: false,
      ntpServer: '',
      webProxyEnabled: false,
      webProxyPort: '8080',
      cacheAdministrator: '',
      lanIp: '',
      lanDhcpPoolStart: '',
      lanDhcpPoolEnd: '',
      lanDhcpEnabled: false,
      wlanIp: '',
      ssid: '',
      wlanDhcpPoolStart: '',
      wlanDhcpPoolEnd: '',
      wlanDhcpEnabled: false,
      firewallDropPingRouter: false,
      firewallPingRouterChain: '',
      firewallPingRouterSrc: '',
      firewallPingRouterProto: '',
      firewallPingRouterAction: '',

      firewallDropPingWireless: false,
      firewallPingWlanChain: '',
      firewallPingWlanSrc: '',
      firewallPingWlanDst: '',
      firewallPingWlanProto: '',
      firewallPingWlanAction: '',

      loggingToDisk: false,
      loggingTopic: '',
      loggingAction: '',
      loggingPrefix: '',

      hotspotTimeRestriction: false,
      hotspotTimeStart: '',
      hotspotTimeEnd: '',
      hotspotTimeAction: '',

      blockWebsite: false,
      blockWebsiteUrl: '',
      blockWebsiteAction: '',
      blockWebsiteRedirectPort: '',
      natMasquerade: false,
    };
  });

  // Calculate score based on actual points earned per level (supports deductions)
  const score = level1Score + level2Score + level3Score + level4Score;

  // Exam timer interval (only ticks when actively in simulator mode)
  useEffect(() => {
    if (isTimerPaused || timeRemaining <= 0 || currentView === 'start') return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused, timeRemaining, currentView]);

  // Boot sound effect on initial load
  useEffect(() => {
    const handleFirstClick = () => {
      sounds.mikroTikBoot();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick, { once: true });
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Automatically open Result Modal when all 4 levels are completed
  useEffect(() => {
    if (level1Completed && level2Completed && level3Completed && level4Completed && !hasAutoOpenedResult) {
      sounds.success();
      setIsResultModalOpen(true);
      setHasAutoOpenedResult(true);
    }
  }, [level1Completed, level2Completed, level3Completed, level4Completed, hasAutoOpenedResult]);

  const handleResetExam = () => {
    sounds.click();
    setIsResultModalOpen(false);
    setIsCertificateOpen(false);
    setHasAutoOpenedResult(false);
    setLevel1Completed(false);
    setLevel2Completed(false);
    setLevel3Completed(false);
    setLevel4Completed(false);
    setLevel1Score(0);
    setLevel2Score(0);
    setLevel3Score(0);
    setLevel4Score(0);
    setActiveLevel(1);
    setTimeRemaining(2700);
    setConfig({
      wanIp: '',
      wanGateway: '',
      dnsServer: '',
      ntpEnabled: false,
      ntpServer: '',
      webProxyEnabled: false,
      webProxyPort: '8080',
      cacheAdministrator: '',
      lanIp: '',
      lanDhcpPoolStart: '',
      lanDhcpPoolEnd: '',
      lanDhcpEnabled: false,
      wlanIp: '',
      ssid: '',
      wlanDhcpPoolStart: '',
      wlanDhcpPoolEnd: '',
      wlanDhcpEnabled: false,

      firewallDropPingRouter: false,
      firewallPingRouterChain: '',
      firewallPingRouterSrc: '',
      firewallPingRouterProto: '',
      firewallPingRouterAction: '',

      firewallDropPingWireless: false,
      firewallPingWlanChain: '',
      firewallPingWlanSrc: '',
      firewallPingWlanDst: '',
      firewallPingWlanProto: '',
      firewallPingWlanAction: '',

      loggingToDisk: false,
      loggingTopic: '',
      loggingAction: '',
      loggingPrefix: '',

      hotspotTimeRestriction: false,
      hotspotTimeStart: '',
      hotspotTimeEnd: '',
      hotspotTimeAction: '',

      blockWebsite: false,
      blockWebsiteUrl: '',
      blockWebsiteAction: '',
      blockWebsiteRedirectPort: '',
      natMasquerade: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* 1. Tampilan Awalan (Start Screen) */}
      {currentView === 'start' ? (
        <StartScreen
          candidateName={candidateName}
          setCandidateName={setCandidateName}
          schoolName={schoolName}
          setSchoolName={setSchoolName}
          score={score}
          timeRemaining={timeRemaining}
          levelCompletion={{
            level1: level1Completed,
            level2: level2Completed,
            level3: level3Completed,
            level4: level4Completed,
          }}
          onStartExam={() => {
            if (!isIdentityComplete) {
              sounds.error();
              setLockNotice('Harap lengkapi Identitas Peserta (Nama Lengkap & Asal Sekolah) terlebih dahulu!');
              return;
            }
            sounds.mikroTikBoot();
            setCurrentView('simulator');
          }}
          onResetExam={handleResetExam}
          onOpenQuestionBook={() => setIsQuestionBookOpen(true)}
          onOpenScenarioNotes={() => setIsScenarioNotesOpen(true)}
          onOpenCertificate={() => setIsCertificateOpen(true)}
          onOpenResult={() => setIsResultModalOpen(true)}
          onOpenTeacherReview={() => setIsTeacherReviewOpen(true)}
        />
      ) : (
        /* 2. Simulator Interface (WinBox Lab & Assessment Sandbox) */
        <>
          {/* 3-Zone Clean Header with Return to Home & Locked Level Guard */}
          <Header
            activeLevel={activeLevel}
            setActiveLevel={handleSetActiveLevel}
            score={score}
            timeRemaining={timeRemaining}
            candidateName={candidateName}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenResult={() => setIsResultModalOpen(true)}
            onReturnToHome={() => setCurrentView('start')}
            onOpenTeacherReview={() => setIsTeacherReviewOpen(true)}
            isTeacherBypassMode={isTeacherBypassMode}
            levelCompletion={{
              level1: level1Completed,
              level2: level2Completed,
              level3: level3Completed,
              level4: level4Completed,
            }}
            onAttemptLockedLevel={(lvl, reason) => {
              setLockNotice(reason);
            }}
          />

          {/* Toast Alert for Attempted Level Skipping */}
          {lockNotice && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-bounce-short">
              <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-100 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-900/80 text-rose-300 shrink-0 mt-0.5 border border-rose-700">
                    <Lock className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">Akses Ditolak: Tidak Boleh Meloncat Level!</span>
                    <p className="text-xs text-rose-200 mt-1 leading-relaxed">{lockNotice}</p>
                    <span className="text-[11px] text-amber-300 font-semibold block mt-1">
                      Wajib selesaikan secara berurutan: Level 1 ➔ Level 2 ➔ Level 3 ➔ Level 4.
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setLockNotice(null)}
                  className="p-1 hover:bg-rose-900 rounded text-rose-300 hover:text-white transition-colors shrink-0"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Main Sandbox Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
            {/* Progress Ribbon */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 font-bold">
                  UKK
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      Uji Kompetensi Keahlian: Troubleshooting Keamanan Jaringan WAN
                    </span>
                    <span className="text-xs text-cyan-400 font-mono hidden sm:inline">
                      (MikroTik RouterOS)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Standar Penilaian BNSP: Selesaikan 4 modul berurutan hingga mencapai ambang kompeten minimal 75 poin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end md:self-auto text-xs flex-wrap">
                {/* Notice that book buttons are restricted to Start Screen only */}
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[11px]">
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>Buku & Catatan hanya diakses di Menu Awalan</span>
                </div>

                <button
                  onClick={() => {
                    sounds.click();
                    setCurrentView('start');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
                  title="Kembali ke Menu Awalan untuk Membaca Panduan / Buku Catatan"
                >
                  <Home className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Menu Awalan</span>
                </button>

                <button
                  onClick={() => {
                    sounds.click();
                    setIsTeacherReviewOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 transition-colors border border-cyan-700/60 font-medium"
                  title="Buka Publikasi Tautan & Lembar Catatan Revisi Guru Penguji"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Publikasi / Catatan Guru</span>
                </button>

                <div className="flex items-center gap-1.5 font-mono text-slate-300 ml-1">
                  <span className="text-slate-500">Modul:</span>
                  <span className="font-bold text-cyan-400">
                    {[level1Completed, level2Completed, level3Completed, level4Completed].filter(Boolean).length}/4
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Apakah Anda ingin mereset seluruh sesi simulasi ujian?')) {
                      handleResetExam();
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Step Progression Visual Roadmap (Enforcing Linear Path) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    Jalur Ujian Bertingkat:
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Selesaikan tiap level untuk membuka level selanjutnya (tidak bisa melompat).
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Level Aktif: <strong className="text-cyan-400">Level {activeLevel}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                {[
                  {
                    id: 1,
                    title: 'Level 1: Hardware',
                    desc: 'Alat & Kabel UTP Straight',
                    unlocked: true,
                    completed: level1Completed,
                  },
                  {
                    id: 2,
                    title: 'Level 2: Konfigurasi Dasar',
                    desc: 'IP, Gateway, DNS, NTP, Proxy',
                    unlocked: level1Completed,
                    completed: level2Completed,
                  },
                  {
                    id: 3,
                    title: 'Level 3: DHCP & Firewall',
                    desc: 'Pool 99, ICMP Filter, Log Disk',
                    unlocked: level1Completed && level2Completed,
                    completed: level3Completed,
                  },
                  {
                    id: 4,
                    title: 'Level 4: Pengujian & Lab',
                    desc: 'Ping Test, Hotspot & Web Block',
                    unlocked: level1Completed && level2Completed && level3Completed,
                    completed: level4Completed,
                  },
                ].map((step) => {
                  const isActive = activeLevel === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleSetActiveLevel(step.id)}
                      disabled={!step.unlocked}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-start justify-between gap-2 ${
                        isActive
                          ? 'bg-cyan-950/80 border-cyan-500 ring-1 ring-cyan-500/40 shadow-sm'
                          : step.completed
                          ? 'bg-emerald-950/30 border-emerald-800/60 hover:bg-emerald-950/50 hover:border-emerald-700 text-slate-300'
                          : !step.unlocked
                          ? 'bg-slate-950/50 border-slate-900 opacity-60 cursor-not-allowed text-slate-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-xs ${isActive ? 'text-cyan-300' : step.completed ? 'text-emerald-300' : step.unlocked ? 'text-white' : 'text-slate-500'}`}>
                            {step.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{step.desc}</p>
                      </div>

                      <div className="shrink-0 mt-0.5">
                        {step.completed ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>✓</span>
                          </span>
                        ) : !step.unlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-900">
                            <Lock className="w-3 h-3" />
                            <span>Kunci</span>
                          </span>
                        ) : isActive ? (
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-700/60">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            Buka
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Victory Congratulations Banner when All 4 Levels Completed */}
            {level1Completed && level2Completed && level3Completed && level4Completed && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-cyan-950/90 border-2 border-emerald-500 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-white block">
                      Selamat! Anda Telah Menyelesaikan Seluruh 4 Level Uji Kompetensi!
                    </span>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      Skor Total: 100/100 Poin (Predikat: KOMPETEN SEMPURNA). Semua kriteria Network Administrator terpenuhi.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      sounds.click();
                      setIsResultModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>Lihat Nilai & Status Selesai</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.click();
                      setIsCertificateOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 border border-emerald-400/50"
                  >
                    <span>Buka Sertifikat Resmi</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Topology Blueprint */}
            <TopologyMap config={config} candidateName={candidateName} />

            {/* Active Simulation Stage */}
            <div className="transition-all duration-200">
              {activeLevel === 1 && (
                <Level1Hardware
                  isCompleted={level1Completed}
                  onComplete={(points) => {
                    setLevel1Completed(true);
                  }}
                  onNextLevel={() => setActiveLevel(2)}
                />
              )}

              {activeLevel === 2 && (
                <Level2BasicConfig
                  config={config}
                  setConfig={setConfig}
                  candidateName={candidateName}
                  setCandidateName={setCandidateName}
                  isCompleted={level2Completed}
                  onComplete={(points) => {
                    setLevel2Completed(true);
                  }}
                  onNextLevel={() => setActiveLevel(3)}
                />
              )}

              {activeLevel === 3 && (
                <Level3DhcpFirewall
                  config={config}
                  setConfig={setConfig}
                  isCompleted={level3Completed}
                  onComplete={(points) => {
                    setLevel3Completed(true);
                  }}
                  onNextLevel={() => setActiveLevel(4)}
                />
              )}

              {activeLevel === 4 && (
                <Level4Testing
                  config={config}
                  candidateName={candidateName}
                  isCompleted={level4Completed}
                  onComplete={(points) => {
                    setLevel4Completed(true);
                  }}
                  onFinishExam={() => {
                    setLevel4Completed(true);
                    setIsResultModalOpen(true);
                  }}
                />
              )}
            </div>

            {/* Quick Serkom Guidelines Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-300">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Referensi Butir Soal Resmi (Soal Praktek Network Admin Serkom.pdf):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong className="text-slate-200 block mb-1">LAN (ether2):</strong>
                  IP 192.168.100.1/25 &middot; DHCP Pool 99 Client (.2-.100) &middot; Blokir ping router (.2-.50) &middot; Blokir ping wireless (.51-.100).
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong className="text-slate-200 block mb-1">Wireless (wlan1):</strong>
                  IP 192.168.200.1/24 &middot; SSID nama_peserta@ProxyUKK &middot; DHCP Pool 99 Client &middot; Hotspot internet hanya 07.00 - 16.00.
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong className="text-slate-200 block mb-1">Web Proxy & Blocking:</strong>
                  NTP = Yes &middot; Cache Admin = nama_peserta@sekolah.sch.id &middot; Blokir situs http://www.example.com/.
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <strong className="text-slate-200 block mb-1">Logging ke Disk:</strong>
                  Setiap akses ke router tercatat di logging firewall dan tersimpan di disk (/system logging add topics=firewall action=disk).
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>MikroTik RouterOS Network Administrator Simulator &middot; Uji Kompetensi Keahlian (UKK)</span>
              <button
                onClick={() => {
                  sounds.click();
                  setIsCertificateOpen(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Buka Lembar Penilaian & Sertifikat &rarr;
              </button>
            </div>
          </footer>
        </>
      )}

      {/* Exam Result & Score Modal (Tampilan Nilai & Selesai) */}
      <ScoreResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        candidateName={candidateName}
        schoolName={schoolName}
        score={score}
        level1Completed={level1Completed}
        level2Completed={level2Completed}
        level3Completed={level3Completed}
        level4Completed={level4Completed}
        config={config}
        onOpenCertificate={() => {
          setIsResultModalOpen(false);
          setIsCertificateOpen(true);
        }}
        onResetExam={handleResetExam}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        candidateName={candidateName}
        schoolName={schoolName}
        score={score}
        config={config}
      />

      {/* Interactive Question Book Modal */}
      <QuestionBookModal
        isOpen={isQuestionBookOpen}
        onClose={() => setIsQuestionBookOpen(false)}
        candidateName={candidateName}
      />

      {/* Scenario Notes Modal */}
      <ScenarioNotesModal
        isOpen={isScenarioNotesOpen}
        onClose={() => setIsScenarioNotesOpen(false)}
        candidateName={candidateName}
        onOpenQuestionBook={() => setIsQuestionBookOpen(true)}
      />

      {/* Teacher Review & Publication Modal */}
      <TeacherReviewModal
        isOpen={isTeacherReviewOpen}
        onClose={() => setIsTeacherReviewOpen(false)}
        candidateName={candidateName}
        schoolName={schoolName}
        score={score}
        isTeacherBypassMode={isTeacherBypassMode}
        setIsTeacherBypassMode={setIsTeacherBypassMode}
        levelCompletion={{
          level1: level1Completed,
          level2: level2Completed,
          level3: level3Completed,
          level4: level4Completed,
        }}
      />
    </div>
  );
}
