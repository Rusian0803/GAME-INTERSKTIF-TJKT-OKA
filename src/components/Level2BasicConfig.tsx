import React, { useState } from 'react';
import { CheckCircle2, Server, Terminal, Monitor, RefreshCw, ArrowRight, Shield, Globe, Clock, Radio, Check } from 'lucide-react';
import { NetworkConfig } from '../types/serkom';
import { sounds } from '../utils/audio';

interface Level2BasicConfigProps {
  config: NetworkConfig;
  setConfig: React.Dispatch<React.SetStateAction<NetworkConfig>>;
  candidateName: string;
  setCandidateName: (name: string) => void;
  onComplete: (points: number) => void;
  onNextLevel: () => void;
  isCompleted: boolean;
}

export const Level2BasicConfig: React.FC<Level2BasicConfigProps> = ({
  config,
  setConfig,
  candidateName,
  setCandidateName,
  onComplete,
  onNextLevel,
  isCompleted,
}) => {
  // Mode: Winbox GUI or Terminal CLI
  const [viewMode, setViewMode] = useState<'winbox' | 'terminal'>('winbox');
  const [activeWinboxTab, setActiveWinboxTab] = useState<'ip_address' | 'routes' | 'dns' | 'ntp' | 'proxy' | 'wireless'>('ip_address');

  // Terminal input & history
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([
    'MikroTik RouterOS 6.49.10 (c) 1991-2023 http://www.mikrotik.com/',
    'CPU: MIPS 24Kc V7.4 650 MHz',
    'Model: RouterBOARD 941-2nD (hAP lite)',
    'Current time: Sep/23/2026 08:00:00',
    'Type "?" or "help" for command list or use GUI tabs.',
    '[admin@MikroTik] > ',
  ]);

  // Validation feedback
  const [earnedScore, setEarnedScore] = useState<number>(25);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  // Auto-calculated defaults
  const normalizedName = candidateName.trim().toLowerCase().replace(/\s+/g, '_') || 'peserta';
  const expectedCacheAdmin = `${normalizedName}@sekolah.sch.id`;
  const expectedSsid = `${normalizedName}@ProxyUKK`;

  const handleApplyConfig = () => {
    sounds.click();
    const errors: string[] = [];
    const warnings: string[] = [];
    let deductions = 0;

    // Validate WAN IP & Gateway
    if (!config.wanIp || !config.wanIp.includes('/')) {
      errors.push('IP Address WAN (ether1) harus terdefinisi lengkap dengan subnet mask (notasi CIDR /24).');
      deductions += 4;
    }
    if (!config.wanGateway) {
      errors.push('Default Gateway (IP ISP) belum diisi.');
      deductions += 4;
    }

    // Validate LAN IP (must be 192.168.100.1/25)
    if (config.lanIp !== '192.168.100.1/25') {
      errors.push('IP Address LAN (ether2) harus 192.168.100.1/25 sesuai Butir 6 Dokumen Soal.');
      deductions += 4;
    }

    // Validate Wireless IP (must be 192.168.200.1/24)
    if (config.wlanIp !== '192.168.200.1/24') {
      errors.push('IP Address Wireless (wlan1) harus 192.168.200.1/24 sesuai Butir 11 Dokumen Soal.');
      deductions += 3;
    }

    // Validate NTP
    if (!config.ntpEnabled) {
      errors.push('NTP Client harus diaktifkan (NTP=Yes) sesuai Butir 2 Dokumen Soal.');
      deductions += 3;
    }

    // Validate Web Proxy
    if (!config.webProxyEnabled) {
      errors.push('Web Proxy harus diaktifkan pada Router.');
      deductions += 2;
    }
    if (!config.cacheAdministrator.includes('@sekolah.sch.id')) {
      errors.push('Cache Administrator Web Proxy belum sesuai format identitas sekolah pada Butir 3 (nama@sekolah.sch.id).');
      deductions += 2;
    }

    // Validate SSID
    if (!config.ssid.includes('@ProxyUKK')) {
      warnings.push('Peringatan: Format SSID belum sesuai penamaan lembar soal UKK (nama@ProxyUKK).');
      deductions += 3;
    }

    const calculatedScore = Math.max(5, 25 - deductions);
    setEarnedScore(calculatedScore);

    if (errors.length === 0) {
      setValidationResult({ success: true, errors: [], warnings });
      sounds.success();
      onComplete(25);
    } else {
      setValidationResult({ success: false, errors, warnings });
      sounds.error();
    }
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim();
    sounds.click();

    const newLogs = [...cliLogs, `[admin@MikroTik] > ${cmd}`];

    if (cmd === 'help' || cmd === '?') {
      newLogs.push(
        'Available commands:',
        '  /ip address add address=... interface=...',
        '  /ip address print',
        '  /ip route add gateway=...',
        '  /ip dns set servers=... allow-remote-requests=yes',
        '  /system ntp client set enabled=yes primary-ntp=...',
        '  /ip web-proxy set enabled=yes port=8080 cache-administrator=...',
        '  /interface wireless set wlan1 ssid=... mode=ap-bridge',
        '  check (Verifikasi seluruh konfigurasi)'
      );
    } else if (cmd.includes('/ip address print')) {
      newLogs.push(
        'Flags: X - disabled, I - invalid, D - dynamic',
        ' #   ADDRESS            NETWORK         INTERFACE',
        ` 0   ${config.wanIp}     192.168.1.0     ether1`,
        ` 1   ${config.lanIp}   192.168.100.0   ether2`,
        ` 2   ${config.wlanIp}   192.168.200.0   wlan1`
      );
    } else if (cmd === 'check') {
      handleApplyConfig();
      newLogs.push('Executing Serkom Configuration Audit Check...');
    } else if (cmd.includes('cache-administrator')) {
      const match = cmd.match(/cache-administrator=([^\s]+)/);
      if (match) {
        setConfig((p) => ({ ...p, cacheAdministrator: match[1], webProxyEnabled: true }));
        newLogs.push(`Web proxy cache-administrator updated to: ${match[1]}`);
      }
    } else {
      newLogs.push('Command executed successfully into RouterOS running-config.');
    }

    newLogs.push('[admin@MikroTik] > ');
    setCliLogs(newLogs);
    setCliInput('');
  };

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-400 font-mono tracking-wider">
              LEVEL 2 DARI 4
            </span>
            <h1 className="text-lg font-bold text-white mt-0.5">
              Konfigurasi Dasar MikroTik Routerboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Atur IP WAN, Gateway ISP, DNS, NTP Client, Web Proxy dengan Cache Administrator sesuai identitas peserta, dan IP LAN/WLAN.
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Level 2 Selesai (+25 Poin)</span>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Profile Dynamic Binding */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-200">Profil Peserta Uji Kompetensi:</span>
            <p className="text-xs text-slate-400">
              Identitas peserta untuk parameter konfigurasi pada RouterOS sesuai petunjuk lembar soal UKK.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">Nama Peserta:</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Masukkan nama peserta"
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Winbox vs Terminal Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              sounds.click();
              setViewMode('winbox');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'winbox'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Winbox GUI Simulator</span>
          </button>
          <button
            onClick={() => {
              sounds.click();
              setViewMode('terminal');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'terminal'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>MikroTik CLI Terminal</span>
          </button>
        </div>

        <button
          onClick={handleApplyConfig}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Validasi & Simpan Konfigurasi</span>
        </button>
      </div>

      {/* Winbox GUI View */}
      {viewMode === 'winbox' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          {/* Winbox Top Title Bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              <span className="font-bold text-white">admin@MikroTik (hAP lite RB941-2nD-TC) - Winbox v3.38</span>
            </div>
            <div className="text-[11px] text-slate-500">RouterOS v6.49.10</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Winbox Left Sidebar Menu */}
            <div className="bg-slate-950/60 p-2 border-r border-slate-800 space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1 tracking-wider">
                Menu Navigasi
              </div>
              {[
                { id: 'ip_address', label: 'IP > Addresses', icon: Globe },
                { id: 'routes', label: 'IP > Routes', icon: Server },
                { id: 'dns', label: 'IP > DNS', icon: Shield },
                { id: 'ntp', label: 'System > SNTP', icon: Clock },
                { id: 'proxy', label: 'IP > Web Proxy', icon: RefreshCw },
                { id: 'wireless', label: 'Wireless (wlan1)', icon: Radio },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeWinboxTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.click();
                      setActiveWinboxTab(tab.id as typeof activeWinboxTab);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md font-medium text-left transition-colors ${
                      isActive
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Winbox Active Content Area */}
            <div className="p-5 md:col-span-3 space-y-4">
              {/* Tab 1: IP Addresses */}
              {activeWinboxTab === 'ip_address' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">Address List Configuration</h3>
                    <p className="text-xs text-slate-400">Atur IP Address untuk ether1 (WAN), ether2 (LAN), dan wlan1 (WLAN) sesuai lembar soal.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300">ether1 (WAN ISP):</label>
                      <input
                        type="text"
                        value={config.wanIp}
                        onChange={(e) => setConfig({ ...config, wanIp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md font-mono text-slate-200 focus:border-cyan-500"
                        placeholder="IP WAN / Prefix (CIDR)"
                      />
                      <span className="text-[10px] text-slate-500 block">Sesuai petunjuk soal UKK</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300">ether2 (LAN Lokal):</label>
                      <input
                        type="text"
                        value={config.lanIp}
                        onChange={(e) => setConfig({ ...config, lanIp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md font-mono text-slate-200 focus:border-cyan-500"
                        placeholder="IP LAN / Prefix (CIDR)"
                      />
                      <span className="text-[10px] text-slate-500 block">Sesuai petunjuk soal UKK</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-300">wlan1 (Wireless Hotspot):</label>
                      <input
                        type="text"
                        value={config.wlanIp}
                        onChange={(e) => setConfig({ ...config, wlanIp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-md font-mono text-slate-200 focus:border-cyan-500"
                        placeholder="IP WLAN / Prefix (CIDR)"
                      />
                      <span className="text-[10px] text-slate-500 block">Sesuai petunjuk soal UKK</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: IP Routes */}
              {activeWinboxTab === 'routes' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">IP &gt; Routes (Default Gateway)</h3>
                    <p className="text-xs text-slate-400">Rute keluar untuk koneksi internet upstream menuju gateway ISP.</p>
                  </div>
                  <div className="space-y-2 max-w-md">
                    <label className="text-xs font-mono text-slate-300">Dst. Address:</label>
                    <input
                      type="text"
                      disabled
                      value="0.0.0.0/0 (Default Route)"
                      className="w-full px-3 py-2 text-xs bg-slate-950/50 border border-slate-800 rounded text-slate-500 font-mono"
                    />

                    <label className="text-xs font-mono text-slate-300 block pt-2">Gateway IP (ISP):</label>
                    <input
                      type="text"
                      value={config.wanGateway}
                      onChange={(e) => setConfig({ ...config, wanGateway: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-slate-200 focus:border-cyan-500"
                      placeholder="IP Gateway ISP"
                    />
                    <span className="text-[11px] text-slate-400 block">Sesuai petunjuk konfigurasi gateway pada lembar soal.</span>
                  </div>
                </div>
              )}

              {/* Tab 3: IP DNS */}
              {activeWinboxTab === 'dns' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">DNS Settings</h3>
                    <p className="text-xs text-slate-400">Konfigurasi DNS Server sesuai instruksi Dokumen Soal.</p>
                  </div>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Servers (Primary / Secondary):</label>
                      <input
                        type="text"
                        value={config.dnsServer}
                        onChange={(e) => setConfig({ ...config, dnsServer: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-slate-200 focus:border-cyan-500"
                        placeholder="DNS Server"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={true}
                        readOnly
                        className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Allow Remote Requests (Centang untuk DNS Caching Router)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 4: System SNTP Client */}
              {activeWinboxTab === 'ntp' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">SNTP Client Settings (NTP)</h3>
                    <p className="text-xs text-slate-400">Sinkronisasi jam RouterOS sesuai instruksi Dokumen Soal.</p>
                  </div>
                  <div className="space-y-3 max-w-md">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.ntpEnabled}
                        onChange={(e) => setConfig({ ...config, ntpEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-600"
                      />
                      <span>Enabled</span>
                    </label>

                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Primary NTP Server:</label>
                      <input
                        type="text"
                        value={config.ntpServer}
                        onChange={(e) => setConfig({ ...config, ntpServer: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-slate-200"
                        placeholder="NTP Server"
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">Sesuai petunjuk konfigurasi SNTP lembar soal UKK.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: IP Web Proxy */}
              {activeWinboxTab === 'proxy' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">Web Proxy Settings</h3>
                    <p className="text-xs text-slate-400">
                      Konfigurasi Web Proxy dan Cache Administrator sesuai instruksi Dokumen Soal.
                    </p>
                  </div>
                  <div className="space-y-3 max-w-lg">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.webProxyEnabled}
                        onChange={(e) => setConfig({ ...config, webProxyEnabled: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 text-cyan-600"
                      />
                      <span>Enabled</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-mono text-slate-300 block mb-1">Port:</label>
                        <input
                          type="text"
                          value={config.webProxyPort}
                          onChange={(e) => setConfig({ ...config, webProxyPort: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-slate-200"
                          placeholder="Port Proxy"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-slate-300 block mb-1">Cache Administrator:</label>
                        <input
                          type="text"
                          value={config.cacheAdministrator}
                          onChange={(e) => setConfig({ ...config, cacheAdministrator: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-cyan-300"
                          placeholder="Cache Administrator"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                      Catatan: Nilai Cache Administrator ini akan ditampilkan pada browser ketika client mengakses website yang diblokir.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Wireless wlan1 */}
              {activeWinboxTab === 'wireless' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white">Wireless Interface (wlan1)</h3>
                    <p className="text-xs text-slate-400">
                      Konfigurasi Wireless Interface dan SSID jaringan sesuai instruksi Dokumen Soal.
                    </p>
                  </div>
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">Mode:</label>
                      <input
                        type="text"
                        disabled
                        value="ap-bridge"
                        className="w-full px-3 py-2 text-xs bg-slate-950/60 border border-slate-800 rounded font-mono text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-slate-300 block mb-1">SSID:</label>
                      <input
                        type="text"
                        value={config.ssid}
                        onChange={(e) => setConfig({ ...config, ssid: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded font-mono text-emerald-300"
                        placeholder="SSID Jaringan"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terminal CLI View */}
      {viewMode === 'terminal' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>MikroTik RouterOS CLI Terminal - [admin@MikroTik]</span>
            </div>
            <button
              onClick={() => setCliLogs(['[admin@MikroTik] > '])}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-1 text-slate-300">
            {cliLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log.startsWith('[admin@MikroTik]') ? (
                  <span className="text-cyan-400 font-bold">{log}</span>
                ) : (
                  <span>{log}</span>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleCliSubmit} className="p-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2">
            <span className="text-cyan-400 pl-2 font-bold">[admin@MikroTik] &gt;</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Ketik command, 'check', 'help'..."
              className="flex-1 bg-transparent border-0 text-slate-100 focus:outline-none font-mono text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-sans"
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      {/* Validation Feedback Banner */}
      {validationResult && (
        <div
          className={`p-4 rounded-xl border text-xs ${
            validationResult.success
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/70 border-rose-700 text-rose-200'
          }`}
        >
          {validationResult.success ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-100 block">
                    Konfigurasi Dasar Sesuai Standar Uji Kompetensi!
                  </span>
                  <span>
                    IP WAN, Gateway, DNS, NTP Client, Web Proxy Cache Administrator ({config.cacheAdministrator}), dan Wireless SSID ({config.ssid}) telah tersimpan ke RouterOS.
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.click();
                  onNextLevel();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md shadow transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Lanjut ke Level 3: DHCP & Firewall</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-800/60 pb-2">
                <div>
                  <span className="font-bold text-rose-100 block text-xs">
                    Koreksi Parameter yang Diperlukan (Terdapat Kesalahan):
                  </span>
                  <span className="text-[11px] text-amber-300">
                    Pengurangan nilai: -{25 - earnedScore} Poin &bull; Nilai yang diperoleh: <strong>{earnedScore} / 25 Poin</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    sounds.click();
                    onComplete(earnedScore);
                    onNextLevel();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <span>Tetap Lanjut ke Level 3 ({earnedScore} Poin)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-300">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
