import React from 'react';
import { Volume2, VolumeX, Award, Clock, Home, Lock, CheckCircle2, Share2, Unlock } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  activeLevel: number;
  setActiveLevel: (level: number) => void;
  score: number;
  timeRemaining: number;
  candidateName: string;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenCertificate: () => void;
  onOpenResult?: () => void;
  onReturnToHome?: () => void;
  onOpenTeacherReview?: () => void;
  isTeacherBypassMode?: boolean;
  levelCompletion: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
    level4: boolean;
  };
  onAttemptLockedLevel?: (level: number, reason: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeLevel,
  setActiveLevel,
  score,
  timeRemaining,
  candidateName,
  soundEnabled,
  setSoundEnabled,
  onOpenCertificate,
  onOpenResult,
  onReturnToHome,
  onOpenTeacherReview,
  isTeacherBypassMode = false,
  levelCompletion,
  onAttemptLockedLevel,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems = [
    { id: 1, label: 'Level 1: Hardware' },
    { id: 2, label: 'Level 2: Konfigurasi Dasar' },
    { id: 3, label: 'Level 3: DHCP & Firewall' },
    { id: 4, label: 'Level 4: Pengujian & Lab' },
  ];

  const getLevelStatus = (levelId: number) => {
    // If teacher bypass mode is enabled, unlock all levels
    if (isTeacherBypassMode) {
      return {
        isUnlocked: true,
        isCompleted: levelId === 1 ? levelCompletion.level1 : levelId === 2 ? levelCompletion.level2 : levelId === 3 ? levelCompletion.level3 : levelCompletion.level4,
        lockReason: '',
      };
    }

    if (levelId === 1) {
      return {
        isUnlocked: true,
        isCompleted: levelCompletion.level1,
        lockReason: '',
      };
    }
    if (levelId === 2) {
      return {
        isUnlocked: levelCompletion.level1,
        isCompleted: levelCompletion.level2,
        lockReason: 'Level 2 Terkunci: Wajib selesaikan Level 1 (Hardware & Kabel) terlebih dahulu.',
      };
    }
    if (levelId === 3) {
      return {
        isUnlocked: levelCompletion.level1 && levelCompletion.level2,
        isCompleted: levelCompletion.level3,
        lockReason: 'Level 3 Terkunci: Wajib selesaikan Level 2 (Konfigurasi Dasar MikroTik) terlebih dahulu.',
      };
    }
    if (levelId === 4) {
      return {
        isUnlocked: levelCompletion.level1 && levelCompletion.level2 && levelCompletion.level3,
        isCompleted: levelCompletion.level4,
        lockReason: 'Level 4 Terkunci: Wajib selesaikan Level 3 (DHCP & Firewall) terlebih dahulu.',
      };
    }
    return { isUnlocked: false, isCompleted: false, lockReason: 'Level ini terkunci.' };
  };

  const handleNavClick = (levelId: number) => {
    const status = getLevelStatus(levelId);
    if (status.isUnlocked) {
      sounds.click();
      setActiveLevel(levelId);
    } else {
      sounds.error();
      if (onAttemptLockedLevel) {
        onAttemptLockedLevel(levelId, status.lockReason);
      }
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sounds.enabled = next;
    setSoundEnabled(next);
    if (next) sounds.click();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark + Home button */}
        <div className="flex items-center gap-3 shrink-0">
          {onReturnToHome && (
            <button
              onClick={() => {
                sounds.click();
                onReturnToHome();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-semibold"
              title="Kembali ke Tampilan Awalan / Halaman Utama"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Menu Awalan</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center font-bold text-white shadow-sm shadow-cyan-900/40">
              RB
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                MikroTik Serkom Simulator
              </span>
              <span className="text-xs text-slate-400 block">
                {candidateName || 'Junior Technician'} · UKK Serkom BNSP
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: 4 nav links with locked status enforcement */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
          {navItems.map((item) => {
            const isActive = activeLevel === item.id;
            const status = getLevelStatus(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={!status.isUnlocked ? status.lockReason : status.isCompleted ? `${item.label} (Selesai)` : item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/50'
                    : !status.isUnlocked
                    ? 'text-slate-600 bg-slate-950/40 cursor-not-allowed border border-slate-900 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/50'
                    : status.isCompleted
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {!status.isUnlocked ? (
                  <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                ) : status.isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : null}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions with timer & score */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Timer display */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-semibold tabular-nums text-amber-300">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Score counter */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
            <span className="text-slate-400">Skor:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                score >= 75 ? 'text-emerald-400' : 'text-cyan-400'
              }`}
            >
              {score}/100
            </span>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Teacher Review & Publish button */}
          {onOpenTeacherReview && (
            <button
              onClick={() => {
                sounds.click();
                onOpenTeacherReview();
              }}
              title="Publikasi Proyek & Lembar Revisi Guru Penguji"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all shadow-sm whitespace-nowrap ${
                isTeacherBypassMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-bold'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isTeacherBypassMode ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-950" />
                  <span>Mode Guru Aktif</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Publikasi / Guru</span>
                </>
              )}
            </button>
          )}

          {/* View Certificate / Assessment Rubric button */}
          <button
            onClick={() => {
              sounds.click();
              onOpenCertificate();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-md transition-all shadow-sm shadow-emerald-950 whitespace-nowrap"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Sertifikat</span>
          </button>

          {/* View Score Result button */}
          {onOpenResult && (
            <button
              onClick={() => {
                sounds.click();
                onOpenResult();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-md transition-all shadow-sm shadow-amber-950 whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>Nilai Akhir</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const isActive = activeLevel === item.id;
          const status = getLevelStatus(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 font-medium rounded transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : !status.isUnlocked
                  ? 'text-slate-600 bg-slate-950/40 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {!status.isUnlocked ? (
                <Lock className="w-2.5 h-2.5 text-slate-500" />
              ) : status.isCompleted ? (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              ) : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
