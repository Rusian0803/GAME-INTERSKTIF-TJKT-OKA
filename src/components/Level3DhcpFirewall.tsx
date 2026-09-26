import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  Database,
  Clock,
  Ban,
  ArrowRight,
  Check,
  Cpu,
  Terminal,
  AlertCircle,
  Info
} from 'lucide-react';
import { NetworkConfig } from '../types/serkom';
import { sounds } from '../utils/audio';

interface Level3DhcpFirewallProps {
  config: NetworkConfig;
  setConfig: React.Dispatch<React.SetStateAction<NetworkConfig>>;
  onComplete: (points: number) => void;
  onNextLevel: () => void;
  isCompleted: boolean;
}

export const Level3DhcpFirewall: React.FC<Level3DhcpFirewallProps> = ({
  config,
  setConfig,
  onComplete,
  onNextLevel,
  isCompleted,
}) => {
  const [activeTab, setActiveTab] = useState<'dhcp' | 'firewall_icmp' | 'logging' | 'hotspot_time' | 'blocking'>('dhcp');
  const [earnedScore, setEarnedScore] = useState<number>(25);
  const [feedbackMessage, setFeedbackMessage] = useState<{ success: boolean; text: string; errorsList?: string[] } | null>(null);

  // Helper to normalize IP ranges
  const cleanRange = (val: string) => val.replace(/\s+/g, '');

  // Validate entire Level 3 Configuration
  const handleValidateAll = () => {
    sounds.click();
    const errors: string[] = [];
    let deductions = 0;

    // 1. Check DHCP LAN
    if (config.lanDhcpPoolStart !== '192.168.100.2' || config.lanDhcpPoolEnd !== '192.168.100.100') {
      errors.push('DHCP Pool LAN (ether2) harus mencakup tepat 99 Client (192.168.100.2 - 192.168.100.100) sesuai Butir 7.');
      deductions += 4;
    }

    // 2. Check DHCP WLAN
    if (config.wlanDhcpPoolStart !== '192.168.200.2' || config.wlanDhcpPoolEnd !== '192.168.200.100') {
      errors.push('DHCP Pool Wireless (wlan1) harus mencakup tepat 99 Client (192.168.200.2 - 192.168.200.100) sesuai Butir 13.');
      deductions += 4;
    }

    // 3. Check Firewall Rule Ping to Router (Butir 8)
    const rule1Chain = (config.firewallPingRouterChain || '').trim().toLowerCase();
    const rule1Src = cleanRange(config.firewallPingRouterSrc || '');
    const rule1Proto = (config.firewallPingRouterProto || '').trim().toLowerCase();
    const rule1Action = (config.firewallPingRouterAction || '').trim().toLowerCase();

    let rule1HasError = false;
    if (rule1Chain !== 'input') {
      errors.push('Rule 1 (Blokir Ping ke Router): Chain harus "input" karena ditujukan langsung ke routerboard.');
      rule1HasError = true;
    }
    if (rule1Src !== '192.168.100.2-192.168.100.50') {
      errors.push('Rule 1 (Blokir Ping ke Router): Src. Address harus rentang "192.168.100.2-192.168.100.50".');
      rule1HasError = true;
    }
    if (rule1Proto !== 'icmp') {
      errors.push('Rule 1 (Blokir Ping ke Router): Protocol harus "icmp" (protokol ping).');
      rule1HasError = true;
    }
    if (rule1Action !== 'drop') {
      errors.push('Rule 1 (Blokir Ping ke Router): Action harus "drop" untuk memblokir paket.');
      rule1HasError = true;
    }
    if (rule1HasError) deductions += 4;

    // 4. Check Firewall Rule Ping to Wireless (Butir 9)
    const rule2Chain = (config.firewallPingWlanChain || '').trim().toLowerCase();
    const rule2Src = cleanRange(config.firewallPingWlanSrc || '');
    const rule2Dst = cleanRange(config.firewallPingWlanDst || '');
    const rule2Proto = (config.firewallPingWlanProto || '').trim().toLowerCase();
    const rule2Action = (config.firewallPingWlanAction || '').trim().toLowerCase();

    let rule2HasError = false;
    if (rule2Chain !== 'forward') {
      errors.push('Rule 2 (Blokir Ping ke Wireless): Chain harus "forward" karena melintasi router antar interface.');
      rule2HasError = true;
    }
    if (rule2Src !== '192.168.100.51-192.168.100.100') {
      errors.push('Rule 2 (Blokir Ping ke Wireless): Src. Address harus rentang "192.168.100.51-192.168.100.100".');
      rule2HasError = true;
    }
    if (rule2Dst !== '192.168.200.0/24' && rule2Dst !== '192.168.200.0') {
      errors.push('Rule 2 (Blokir Ping ke Wireless): Dst. Address harus subnet wireless "192.168.200.0/24".');
      rule2HasError = true;
    }
    if (rule2Proto !== 'icmp') {
      errors.push('Rule 2 (Blokir Ping ke Wireless): Protocol harus "icmp".');
      rule2HasError = true;
    }
    if (rule2Action !== 'drop') {
      errors.push('Rule 2 (Blokir Ping ke Wireless): Action harus "drop".');
      rule2HasError = true;
    }
    if (rule2HasError) deductions += 4;

    // 5. Check System Logging ke Disk (Butir 10)
    const logTopic = (config.loggingTopic || '').trim().toLowerCase();
    const logAction = (config.loggingAction || '').trim().toLowerCase();
    const logPrefix = (config.loggingPrefix || '').trim();

    let logHasError = false;
    if (!logTopic.includes('firewall')) {
      errors.push('System Logging: Topic logging harus menyertakan "firewall" (contoh: firewall atau firewall,info).');
      logHasError = true;
    }
    if (logAction !== 'disk') {
      errors.push('System Logging: Action media penyimpanan harus "disk" (bukan memory) agar log tersimpan permanen.');
      logHasError = true;
    }
    if (!logPrefix) {
      errors.push('System Logging: Prefix log pada firewall filter wajib diisi (contoh: "AKSES_ROUTER: " atau "akses-router:").');
      logHasError = true;
    }
    if (logHasError) deductions += 3;

    // 6. Check Hotspot Time Restriction (Butir 15)
    const timeStart = (config.hotspotTimeStart || '').trim();
    const timeEnd = (config.hotspotTimeEnd || '').trim();
    const timeAction = (config.hotspotTimeAction || '').trim().toLowerCase();

    const isStartValid = timeStart === '07:00' || timeStart === '07:00:00' || timeStart === '07.00';
    const isEndValid = timeEnd === '16:00' || timeEnd === '16:00:00' || timeEnd === '16.00';

    let timeHasError = false;
    if (!isStartValid || !isEndValid) {
      errors.push('Hotspot Time Restriction: Jam operasional wajib diatur mulai "07:00" hingga "16:00" (format 07:00 - 16:00).');
      timeHasError = true;
    }
    if (timeAction !== 'accept') {
      errors.push('Hotspot Time Restriction: Action pada jam 07:00 - 16:00 harus "accept" (diizinkan akses).');
      timeHasError = true;
    }
    if (timeHasError) deductions += 3;

    // 7. Check Blocking Site (Butir 16)
    const blockUrl = (config.blockWebsiteUrl || '').trim().toLowerCase();
    const blockAction = (config.blockWebsiteAction || '').trim().toLowerCase();
    const redirectPort = (config.blockWebsiteRedirectPort || '').trim();

    let blockHasError = false;
    if (!blockUrl.includes('example.com')) {
      errors.push('Blocking Site: Alamat situs yang diblokir harus memuat "http://www.example.com/" atau "example.com".');
      blockHasError = true;
    }
    if (blockAction !== 'deny' && blockAction !== 'drop') {
      errors.push('Blocking Site: Action Web Proxy / Filter harus "deny" (atau drop).');
      blockHasError = true;
    }
    if (redirectPort !== '8080') {
      errors.push('Blocking Site: Port redirection transparent proxy NAT harus "8080".');
      blockHasError = true;
    }
    if (blockHasError) deductions += 3;

    const calculatedScore = Math.max(5, 25 - deductions);
    setEarnedScore(calculatedScore);

    if (errors.length === 0) {
      sounds.success();
      // Activate all boolean flags for Level 4 verification
      setConfig((prev) => ({
        ...prev,
        firewallDropPingRouter: true,
        firewallDropPingWireless: true,
        loggingToDisk: true,
        hotspotTimeRestriction: true,
        blockWebsite: true,
      }));

      setFeedbackMessage({
        success: true,
        text: 'Semua Konfigurasi DHCP, Firewall ICMP Rules, Logging ke Disk, Hotspot Time Schedule, dan Site Blocking Berhasil & Tepat!',
      });
      onComplete(25);
    } else {
      sounds.error();
      setFeedbackMessage({
        success: false,
        text: errors.join(' • '),
        errorsList: errors,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-400 font-mono tracking-wider">
              LEVEL 3 DARI 4
            </span>
            <h1 className="text-lg font-bold text-white mt-0.5">
              Konfigurasi DHCP Server & Keamanan Firewall RouterOS
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Isi parameter secara mandiri: DHCP pool 99 client, firewall ICMP drop ping, system logging ke disk, jadwal hotspot 07.00-16.00, serta blocking example.com.
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Level 3 Selesai (+25 Poin)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          {[
            { id: 'dhcp', label: '1. DHCP Pools (99 Client)', icon: Database },
            { id: 'firewall_icmp', label: '2. Firewall ICMP Rules', icon: ShieldAlert },
            { id: 'logging', label: '3. System Logging ke Disk', icon: Cpu },
            { id: 'hotspot_time', label: '4. Hotspot Time 07.00-16.00', icon: Clock },
            { id: 'blocking', label: '5. Blocking Site example.com', icon: Ban },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.click();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleValidateAll}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
          >
            <Check className="w-4 h-4" />
            <span>Validasi & Terapkan Konfigurasi</span>
          </button>
        </div>
      </div>

      {/* Tab 1: DHCP Pools */}
      {activeTab === 'dhcp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Konfigurasi DHCP Pool (Sebanyak Tepat 99 Client)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Butir 7: DHCP Pool LAN (ether2) sebanyak 99 Client &middot; Butir 13: DHCP Pool Wireless (wlan1) sebanyak 99 Client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LAN Pool */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>DHCP Server: ether2 (LAN)</span>
                <span className="font-mono text-cyan-400">192.168.100.1/25</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Pool Range Awal:</label>
                  <input
                    type="text"
                    value={config.lanDhcpPoolStart}
                    onChange={(e) => setConfig({ ...config, lanDhcpPoolStart: e.target.value })}
                    placeholder="192.168.100.2"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Pool Range Akhir:</label>
                  <input
                    type="text"
                    value={config.lanDhcpPoolEnd}
                    onChange={(e) => setConfig({ ...config, lanDhcpPoolEnd: e.target.value })}
                    placeholder="192.168.100.100"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/80">
                Hitungan Client: 100 - 2 + 1 = <strong className="text-emerald-400">99 IP Client</strong> (.2 s/d .100)
              </div>
            </div>

            {/* WLAN Pool */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>DHCP Server: wlan1 (Hotspot)</span>
                <span className="font-mono text-emerald-400">192.168.200.1/24</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Pool Range Awal:</label>
                  <input
                    type="text"
                    value={config.wlanDhcpPoolStart}
                    onChange={(e) => setConfig({ ...config, wlanDhcpPoolStart: e.target.value })}
                    placeholder="192.168.200.2"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Pool Range Akhir:</label>
                  <input
                    type="text"
                    value={config.wlanDhcpPoolEnd}
                    onChange={(e) => setConfig({ ...config, wlanDhcpPoolEnd: e.target.value })}
                    placeholder="192.168.200.100"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-800/80">
                Hitungan Client: 100 - 2 + 1 = <strong className="text-emerald-400">99 IP Client</strong> (.2 s/d .100)
              </div>
            </div>
          </div>

          {/* NAT Masquerade */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-200 block">IP Firewall NAT (Masquerade)</span>
              <span className="text-slate-400 text-[11px]">Memampukan translasi IP private client kabel & wireless menuju internet lewat ether1.</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.natMasquerade}
                onChange={(e) => setConfig({ ...config, natMasquerade: e.target.checked })}
                className="w-4 h-4 rounded text-cyan-600 border-slate-700 focus:ring-cyan-500"
              />
              <span className="font-semibold text-slate-300">Aktif (Masquerade out-interface=ether1)</span>
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Firewall ICMP Ping Rules (Player Fills Everything In) */}
      {activeTab === 'firewall_icmp' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Firewall Filter Rules: Pembatasan Ping ICMP (Input Pemain)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasikan dua rule firewall filter: blokir ping ke router (Butir 8) dan blokir ping ke client wireless (Butir 9).
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
              WinBox: IP ➔ Firewall ➔ Filter Rules
            </span>
          </div>

          <div className="space-y-4">
            {/* Rule 1: Drop ping router (.2 s/d .50) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                  <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[11px] font-mono">
                    RULE 1
                  </span>
                  <span>Butir 8: Setiap IP 192.168.100.2 - 192.168.100.50 Tidak Dapat Ping ke Router</span>
                </div>
                <span className="text-[11px] text-slate-400">Target Tujuan: Routerboard</span>
              </div>

              {/* Form Grid for Rule 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Chain:</label>
                  <select
                    value={config.firewallPingRouterChain}
                    onChange={(e) => setConfig({ ...config, firewallPingRouterChain: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Chain --</option>
                    <option value="input">input (Ke Router)</option>
                    <option value="forward">forward (Melintasi)</option>
                    <option value="output">output (Dari Router)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Src. Address (Range IP):</label>
                  <input
                    type="text"
                    value={config.firewallPingRouterSrc}
                    onChange={(e) => setConfig({ ...config, firewallPingRouterSrc: e.target.value })}
                    placeholder="192.168.100.2-192.168.100.50"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Protocol:</label>
                  <select
                    value={config.firewallPingRouterProto}
                    onChange={(e) => setConfig({ ...config, firewallPingRouterProto: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Protocol --</option>
                    <option value="icmp">icmp (Ping)</option>
                    <option value="tcp">tcp</option>
                    <option value="udp">udp</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Action:</label>
                  <select
                    value={config.firewallPingRouterAction}
                    onChange={(e) => setConfig({ ...config, firewallPingRouterAction: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-rose-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Action --</option>
                    <option value="drop">drop (Tolak / Buang)</option>
                    <option value="reject">reject</option>
                    <option value="accept">accept (Izinkan)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic CLI Command Preview */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-start gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  /ip firewall filter add chain=
                  <span className="text-cyan-300">{config.firewallPingRouterChain || '...'}</span>{' '}
                  src-address=
                  <span className="text-emerald-300">{config.firewallPingRouterSrc || '...'}</span>{' '}
                  protocol=
                  <span className="text-amber-300">{config.firewallPingRouterProto || '...'}</span>{' '}
                  action=
                  <span className="text-rose-300">{config.firewallPingRouterAction || '...'}</span>{' '}
                  comment="Drop Ping ke Router"
                </span>
              </div>
            </div>

            {/* Rule 2: Drop ping wireless client (.51 s/d .100) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[11px] font-mono">
                    RULE 2
                  </span>
                  <span>Butir 9: Setiap IP 192.168.100.51 - 192.168.100.100 Tidak Dapat Ping ke Client Wireless</span>
                </div>
                <span className="text-[11px] text-slate-400">Target Tujuan: Jaringan Wireless (192.168.200.0/24)</span>
              </div>

              {/* Form Grid for Rule 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Chain:</label>
                  <select
                    value={config.firewallPingWlanChain}
                    onChange={(e) => setConfig({ ...config, firewallPingWlanChain: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Chain --</option>
                    <option value="forward">forward (Antar Interface)</option>
                    <option value="input">input (Ke Router)</option>
                    <option value="output">output</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Src. Address (Range IP):</label>
                  <input
                    type="text"
                    value={config.firewallPingWlanSrc}
                    onChange={(e) => setConfig({ ...config, firewallPingWlanSrc: e.target.value })}
                    placeholder="192.168.100.51-192.168.100.100"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Dst. Address (Subnet WLAN):</label>
                  <input
                    type="text"
                    value={config.firewallPingWlanDst}
                    onChange={(e) => setConfig({ ...config, firewallPingWlanDst: e.target.value })}
                    placeholder="192.168.200.0/24"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Protocol:</label>
                  <select
                    value={config.firewallPingWlanProto}
                    onChange={(e) => setConfig({ ...config, firewallPingWlanProto: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Protocol --</option>
                    <option value="icmp">icmp (Ping)</option>
                    <option value="tcp">tcp</option>
                    <option value="udp">udp</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Action:</label>
                  <select
                    value={config.firewallPingWlanAction}
                    onChange={(e) => setConfig({ ...config, firewallPingWlanAction: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-rose-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Action --</option>
                    <option value="drop">drop (Tolak / Buang)</option>
                    <option value="reject">reject</option>
                    <option value="accept">accept</option>
                  </select>
                </div>
              </div>

              {/* Dynamic CLI Command Preview */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-start gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-slate-400">
                  /ip firewall filter add chain=
                  <span className="text-cyan-300">{config.firewallPingWlanChain || '...'}</span>{' '}
                  src-address=
                  <span className="text-emerald-300">{config.firewallPingWlanSrc || '...'}</span>{' '}
                  dst-address=
                  <span className="text-amber-300">{config.firewallPingWlanDst || '...'}</span>{' '}
                  protocol=
                  <span className="text-cyan-200">{config.firewallPingWlanProto || '...'}</span>{' '}
                  action=
                  <span className="text-rose-300">{config.firewallPingWlanAction || '...'}</span>{' '}
                  comment="Drop Ping LAN to WLAN"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Logging ke Disk (Player Fills Everything In) */}
      {activeTab === 'logging' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Butir 10: Rule Logging Setiap Akses ke Router & Tersimpan di Disk
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi pencatatan log pada firewall dan pengaturan media penyimpanan RouterOS ke disk flash storage permanen.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
              WinBox: System ➔ Logging
            </span>
          </div>

          <div className="space-y-4">
            {/* Form Section A: Firewall Log Prefix */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 text-xs block">
                A. Pengaturan Firewall Filter Logging (Pencatatan Akses ke Router)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Chain Firewall:</label>
                  <input
                    type="text"
                    disabled
                    value="input (Menuju Router)"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Log Prefix (Karakter Awalan Catatan Log):
                  </label>
                  <input
                    type="text"
                    value={config.loggingPrefix}
                    onChange={(e) => setConfig({ ...config, loggingPrefix: e.target.value })}
                    placeholder="Contoh: AKSES_ROUTER: atau akses-router:"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Section B: System Logging Actions to Disk */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 text-xs block">
                B. Pengaturan System Logging Storage (Target Simpan ke Disk)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Topics (Topik yang Dicatat):
                  </label>
                  <input
                    type="text"
                    value={config.loggingTopic}
                    onChange={(e) => setConfig({ ...config, loggingTopic: e.target.value })}
                    placeholder="Ketik topik: firewall atau firewall,info"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Ketik topik "firewall" untuk menyaring pesan filter rule firewall.
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Action (Media Penyimpanan Target):
                  </label>
                  <select
                    value={config.loggingAction}
                    onChange={(e) => setConfig({ ...config, loggingAction: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">-- Pilih Media Simpan (Action) --</option>
                    <option value="disk">disk (Flash Internal Permanen)</option>
                    <option value="memory">memory (RAM Sementara - Hilang saat reboot)</option>
                    <option value="echo">echo</option>
                    <option value="remote">remote (Syslog Server)</option>
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Sesuai soal: Wajib memilih <strong>disk</strong> agar histori tersimpan permanen.
                  </span>
                </div>
              </div>

              {/* Dynamic CLI Command Preview */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">
                    /ip firewall filter add chain=input action=log log=yes log-prefix="
                    <span className="text-cyan-300">{config.loggingPrefix || 'AKSES_ROUTER: '}</span>"
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">
                    /system logging add topics=
                    <span className="text-cyan-300">{config.loggingTopic || '...'}</span>{' '}
                    action=
                    <span className="text-emerald-300">{config.loggingAction || '...'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hotspot Time 07.00 - 16.00 (Player Fills Everything In) */}
      {activeTab === 'hotspot_time' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Butir 15: Pembatasan Waktu Internet Hotspot (Pukul 07.00 - 16.00)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Atur jadwal jam operasional internet wireless hanya pada pukul 07.00 sampai 16.00 WIB.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
              WinBox: IP ➔ Firewall ➔ Tab Extra: Time
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <span className="font-bold text-slate-200 text-xs block">
              Formulir Pembatasan Waktu Akses (Time Restriction):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Jam Mulai (Time Start):</label>
                <input
                  type="text"
                  value={config.hotspotTimeStart}
                  onChange={(e) => setConfig({ ...config, hotspotTimeStart: e.target.value })}
                  placeholder="07:00:00 atau 07:00"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Format: 07:00:00</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Jam Selesai (Time End):</label>
                <input
                  type="text"
                  value={config.hotspotTimeEnd}
                  onChange={(e) => setConfig({ ...config, hotspotTimeEnd: e.target.value })}
                  placeholder="16:00:00 atau 16:00"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Format: 16:00:00</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Action Dalam Rentang Jam:</label>
                <select
                  value={config.hotspotTimeAction}
                  onChange={(e) => setConfig({ ...config, hotspotTimeAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-emerald-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Pilih Action --</option>
                  <option value="accept">accept (Izinkan Akses Internet)</option>
                  <option value="drop">drop (Blokir)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Di luar jam ini, paket otomatis di-drop</span>
              </div>
            </div>

            {/* Dynamic CLI Command Preview */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400">
                  /ip firewall filter add chain=forward src-address=192.168.200.0/24 time=
                  <span className="text-amber-300">{config.hotspotTimeStart || '07:00:00'}</span>-
                  <span className="text-amber-300">{config.hotspotTimeEnd || '16:00:00'}</span>,sun,mon,tue,wed,thu,fri,sat action=
                  <span className="text-emerald-300">{config.hotspotTimeAction || 'accept'}</span>{' '}
                  comment="Allow Internet 07.00 - 16.00"
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-slate-400">
                  /ip firewall filter add chain=forward src-address=192.168.200.0/24 action=drop comment="Drop di luar jam operasional"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Blocking Site example.com (Player Fills Everything In) */}
      {activeTab === 'blocking' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Ban className="w-4 h-4 text-cyan-400" />
                Butir 16: Buat Rule Web Proxy / Firewall Memblokir http://www.example.com/
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tolak akses menuju website terlarang menggunakan fitur Web Proxy Access dan Transparent Proxy NAT Redirect.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 self-start sm:self-auto">
              WinBox: IP ➔ Web Proxy ➔ Access
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <span className="font-bold text-slate-200 text-xs block">
              Formulir Pemblokiran Situs (URL Filtering):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  URL / Domain yang Diblokir (Dst. Host):
                </label>
                <input
                  type="text"
                  value={config.blockWebsiteUrl}
                  onChange={(e) => setConfig({ ...config, blockWebsiteUrl: e.target.value })}
                  placeholder="Ketik: http://www.example.com/"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-amber-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Sesuai Butir 16 lembar soal</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Action Pemblokiran:</label>
                <select
                  value={config.blockWebsiteAction}
                  onChange={(e) => setConfig({ ...config, blockWebsiteAction: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-rose-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Pilih Action --</option>
                  <option value="deny">deny (Web Proxy 403 Forbidden)</option>
                  <option value="drop">drop (Firewall Filter Drop)</option>
                  <option value="allow">allow (Izinkan)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Pilih deny untuk pesan error proxy</span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  Redirect Port (Transparent Proxy NAT):
                </label>
                <input
                  type="text"
                  value={config.blockWebsiteRedirectPort}
                  onChange={(e) => setConfig({ ...config, blockWebsiteRedirectPort: e.target.value })}
                  placeholder="8080"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Port internal proxy: 8080</span>
              </div>
            </div>

            {/* Dynamic CLI Command Preview */}
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-slate-400">
                  /ip proxy access add dst-host="*
                  <span className="text-amber-300">
                    {config.blockWebsiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'example.com'}
                  </span>*" action=
                  <span className="text-rose-300">{config.blockWebsiteAction || 'deny'}</span>{' '}
                  comment="Blokir Situs example.com"
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-slate-400">
                  /ip firewall nat add chain=dstnat protocol=tcp dst-port=80 action=redirect to-ports=
                  <span className="text-cyan-300">{config.blockWebsiteRedirectPort || '8080'}</span>{' '}
                  comment="Transparent Proxy"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            feedbackMessage.success
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/70 border-rose-700 text-rose-200'
          }`}
        >
          {feedbackMessage.success ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-100 block">
                    Konfigurasi Firewall & Keamanan Jaringan Sempurna!
                  </span>
                  <span>
                    DHCP Pools 99 client, firewall ICMP drop input & forward, logging ke disk, jadwal waktu hotspot, dan site blocking berhasil divalidasi.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.click();
                  onNextLevel();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Lanjut ke Level 4: Pengujian & Troubleshooting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-800/60 pb-2">
                <div>
                  <span className="font-bold text-rose-100 block flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Koreksi Konfigurasi Diperlukan (Terdapat Kesalahan):
                  </span>
                  <span className="text-[11px] text-amber-300">
                    Pengurangan nilai: -{25 - earnedScore} Poin &bull; Nilai yang diperoleh: <strong>{earnedScore} / 25 Poin</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.click();
                    // Set flags so testing in Level 4 works based on what was configured
                    setConfig((prev) => ({
                      ...prev,
                      firewallDropPingRouter: config.firewallPingRouterAction === 'drop',
                      firewallDropPingWireless: config.firewallPingWlanAction === 'drop',
                      loggingToDisk: config.loggingAction === 'disk',
                      hotspotTimeRestriction: config.hotspotTimeAction === 'accept',
                      blockWebsite: config.blockWebsiteAction === 'deny' || config.blockWebsiteAction === 'drop',
                    }));
                    onComplete(earnedScore);
                    onNextLevel();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Tetap Lanjut ke Level 4 ({earnedScore} Poin)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {feedbackMessage.errorsList && feedbackMessage.errorsList.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-[11px]">
                  {feedbackMessage.errorsList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              ) : (
                <p className="leading-relaxed text-slate-300 text-[11px]">{feedbackMessage.text}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
