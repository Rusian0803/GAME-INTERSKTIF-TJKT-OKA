import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  FileCheck,
  RotateCcw,
  Sparkles,
  Check,
  Calendar,
  User,
  School,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  Cpu,
  Wifi,
  Globe
} from 'lucide-react';
import { NetworkConfig } from '../types/serkom';
import { sounds } from '../utils/audio';

interface ScoreResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  schoolName?: string;
  score: number;
  level1Completed: boolean;
  level2Completed: boolean;
  level3Completed: boolean;
  level4Completed: boolean;
  level1Score?: number;
  level2Score?: number;
  level3Score?: number;
  level4Score?: number;
  config: NetworkConfig;
  onOpenCertificate: () => void;
  onResetExam: () => void;
}

export const ScoreResultModal: React.FC<ScoreResultModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  schoolName,
  score,
  level1Completed,
  level2Completed,
  level3Completed,
  level4Completed,
  level1Score,
  level2Score,
  level3Score,
  level4Score,
  config,
  onOpenCertificate,
  onResetExam,
}) => {
  if (!isOpen) return null;

  const isAllCompleted = level1Completed && level2Completed && level3Completed && level4Completed;
  const isPass = score >= 75;
  const percentage = Math.round((score / 100) * 100);

  const l1Pts = level1Score !== undefined ? level1Score : (level1Completed ? 25 : 0);
  const l2Pts = level2Score !== undefined ? level2Score : (level2Completed ? 25 : 0);
  const l3Pts = level3Score !== undefined ? level3Score : (level3Completed ? 25 : 0);
  const l4Pts = level4Score !== undefined ? level4Score : (level4Completed ? 25 : 0);

  const examDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const predicate =
    score === 100
      ? { label: 'KOMPETEN SEMPURNA (A+)', desc: 'Seluruh konfigurasi dan pengujian terselesaikan tanpa celah.', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500' }
      : score >= 85
      ? { label: 'KOMPETEN SANGAT MEMUASKAN (A)', desc: 'Memenuhi standar kompetensi keahlian teknik jaringan.', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500' }
      : score >= 75
      ? { label: 'KOMPETEN (B)', desc: 'Memenuhi ambang batas minimal kelulusan UKK.', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500' }
      : { label: 'BELUM KOMPETEN', desc: 'Nilai belum mencapai standar kelulusan minimal UKK (75 Poin).', color: 'text-rose-400 bg-rose-950/80 border-rose-500' };

  // Level breakdowns
  const levelBreakdown = [
    {
      level: 'Level 1',
      title: 'Perakitan Kabel UTP & Hardware',
      desc: 'Crimping kabel Straight-Through T568B & lolos uji LAN tester 8 pin',
      points: l1Pts,
      maxPoints: 25,
      completed: level1Completed,
      icon: Layers,
    },
    {
      level: 'Level 2',
      title: 'Konfigurasi WAN, Gateway & Dasar',
      desc: 'IP ether1 /24, Gateway ISP, DNS Server + Remote, NTP Client & Web Proxy',
      points: l2Pts,
      maxPoints: 25,
      completed: level2Completed,
      icon: Globe,
    },
    {
      level: 'Level 3',
      title: 'Jaringan Lokal, Hotspot & Firewall ICMP',
      desc: 'Subnetting /25 ether2, WLAN /24, DHCP 99 client, rule drop ping router & wireless',
      points: l3Pts,
      maxPoints: 25,
      completed: level3Completed,
      icon: Cpu,
    },
    {
      level: 'Level 4',
      title: 'Pengujian Jaringan, Log Disk & Blocking',
      desc: 'Uji ping PC client, login captive portal hotspot, logging ke disk & blocking example.com',
      points: l4Pts,
      maxPoints: 25,
      completed: level4Completed,
      icon: ShieldCheck,
    },
  ];

  // Specific question checklist
  const questionChecklist = [
    { name: 'Kabel UTP Straight T568B', ok: level1Completed, note: '8 Pin identik' },
    { name: 'IP WAN ether1 (/24)', ok: !!config.wanIp, note: config.wanIp || '-' },
    { name: 'Default Gateway (0.0.0.0/0)', ok: !!config.wanGateway, note: config.wanGateway || '-' },
    { name: 'DNS Server & Remote Requests', ok: !!config.dnsServer, note: 'Aktif' },
    { name: 'SNTP Client (id.pool.ntp.org)', ok: config.ntpEnabled, note: 'Enabled' },
    { name: 'Web Proxy & Cache Admin', ok: config.webProxyEnabled, note: config.cacheAdministrator || '-' },
    { name: 'IP LAN ether2 (192.168.100.1/25)', ok: !!config.lanIp, note: 'Subnet /25' },
    { name: 'DHCP Pool LAN (99 Client)', ok: !!config.lanDhcpPoolStart && !!config.lanDhcpPoolEnd, note: `${config.lanDhcpPoolStart || '.2'} - ${config.lanDhcpPoolEnd || '.100'}` },
    { name: 'IP WLAN wlan1 (192.168.200.1/24)', ok: !!config.wlanIp, note: 'Subnet /24' },
    { name: 'SSID Hotspot Peserta', ok: !!config.ssid, note: config.ssid || '-' },
    { name: 'DHCP Pool WLAN (99 Client)', ok: !!config.wlanDhcpPoolStart && !!config.wlanDhcpPoolEnd, note: `${config.wlanDhcpPoolStart || '.2'} - ${config.wlanDhcpPoolEnd || '.100'}` },
    { name: 'Drop Ping Router (IP .2-.50)', ok: config.firewallDropPingRouter, note: 'Chain input drop' },
    { name: 'Drop Ping Wireless (IP .51-.100)', ok: config.firewallDropPingWireless, note: 'Chain forward drop' },
    { name: 'Logging Firewall Simpan ke Disk', ok: config.loggingToDisk, note: 'Action disk' },
    { name: 'Hotspot Time 07.00-16.00', ok: config.hotspotTimeRestriction, note: '07:00-16:00' },
    { name: 'Blocking http://www.example.com/', ok: config.blockWebsite, note: 'Deny 403 Forbidden' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[94vh]">
        
        {/* Header Modal */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  Hasil Ujian & Rincian Nilai Akhir
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Status: Selesai
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Uji Kompetensi Keahlian (UKK) Teknik Komputer & Jaringan &middot; Network Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.click();
                window.print();
              }}
              title="Cetak Nilai"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs border border-slate-800"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil</span>
            </button>
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
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 font-sans text-xs">
          
          {/* Hero Score Showcase Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 p-5 sm:p-6 shadow-xl">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left: Big Score & Badge */}
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-1 shadow-xl shadow-emerald-950/70">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
                      <span className="text-3xl font-black font-mono tracking-tight text-white">
                        {score}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                        / 100 POIN
                      </span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase shadow">
                    {percentage}%
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold border inline-block shadow-sm">
                      {predicate.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Ujian Praktik Telah Selesai
                  </h3>
                  <p className="text-slate-300 text-xs max-w-md leading-relaxed">
                    {predicate.desc}
                  </p>
                </div>
              </div>

              {/* Right: Candidate Summary Details */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs w-full md:w-72 shrink-0">
                <div className="flex items-center gap-2 text-slate-400 pb-1.5 border-b border-slate-800/80">
                  <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">Nama Peserta:</span>
                  <span className="font-bold text-white ml-auto truncate">{candidateName || 'Peserta Ujian'}</span>
                </div>
                {schoolName && (
                  <div className="flex items-center gap-2 text-slate-400 pb-1.5 border-b border-slate-800/80">
                    <School className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400 text-[11px]">Asal Sekolah:</span>
                    <span className="font-bold text-white ml-auto truncate">{schoolName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400 pb-1.5 border-b border-slate-800/80">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">Tanggal:</span>
                  <span className="font-mono text-slate-200 ml-auto">{examDate}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">Status Kelulusan:</span>
                  <span className="font-bold text-emerald-400 ml-auto">
                    {isPass ? 'LULUS KOMPETEN' : 'BELUM LULUS'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Breakdown per Level (4 Level) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">
                  Rincian Perolehan Nilai per Modul & Level Ujian
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Total Skor: {score} dari 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {levelBreakdown.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.level}
                    className={`p-3.5 rounded-xl border transition-all ${
                      item.completed
                        ? 'bg-slate-950 border-emerald-800/80 hover:border-emerald-600'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.completed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold text-cyan-400">
                              {item.level}
                            </span>
                            <span className="font-bold text-white text-xs">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-black text-sm block ${
                            item.completed ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {item.points} / {item.maxPoints}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.completed ? '✓ Selesai' : 'Belum'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: 16 Question Items Checklist Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Matriks Verifikasi 16 Butir Soal Uji Praktik (Checklist Resmi)
                </h4>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {questionChecklist.filter((q) => q.ok).length} dari 16 Butir Terverifikasi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {questionChecklist.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-[11px] ${
                    q.ok
                      ? 'bg-slate-950/90 border-slate-800 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-semibold block truncate text-slate-200 text-xs">
                      {idx + 1}. {q.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {q.note}
                    </span>
                  </div>
                  {q.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              sounds.click();
              onResetExam();
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Ujian (Reset)</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sounds.click();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Tutup & Tinjau Simulator
            </button>

            <button
              onClick={() => {
                sounds.click();
                onOpenCertificate();
              }}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/60 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Buka Lembar Sertifikat Resmi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
