import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Terminal,
  Wifi,
  Globe,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileText,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Check,
  Send,
  HelpCircle,
  Award,
} from 'lucide-react';
import { NetworkConfig, LogEntry } from '../types/serkom';
import { sounds } from '../utils/audio';

interface Level4TestingProps {
  config: NetworkConfig;
  candidateName: string;
  onComplete: (points: number) => void;
  onFinishExam?: () => void;
  isCompleted: boolean;
}

export const Level4Testing: React.FC<Level4TestingProps> = ({
  config,
  candidateName,
  onComplete,
  onFinishExam,
  isCompleted,
}) => {
  const [deviceTab, setDeviceTab] = useState<'pc_client' | 'smartphone' | 'router_log'>('pc_client');

  // PC Client State
  const [pcClientIp, setPcClientIp] = useState<'client_a' | 'client_b'>('client_a'); // client_a: .25, client_b: .75
  const [pcTerminalLogs, setPcTerminalLogs] = useState<string[]>([
    'Microsoft Windows [Version 10.0.19045.3803]',
    '(c) Microsoft Corporation. All rights reserved.',
    'Ethernet adapter Local Area Connection:',
    '   Connection-specific DNS Suffix  . : lan',
    '   IPv4 Address. . . . . . . . . . . : 192.168.100.25',
    '   Subnet Mask . . . . . . . . . . . : 255.255.255.128 (/25)',
    '   Default Gateway . . . . . . . . . : 192.168.100.1',
    'Ready for diagnostic ping tests...',
  ]);
  const [pcCommandInput, setPcCommandInput] = useState('');

  // Smartphone State
  const [phoneWifiConnected, setPhoneWifiConnected] = useState(false);
  const [phoneHotspotLoggedIn, setPhoneHotspotLoggedIn] = useState(false);
  const [hotspotUser, setHotspotUser] = useState('siswa1');
  const [hotspotPass, setHotspotPass] = useState('1234');
  const [phoneSimulatedHour, setPhoneSimulatedHour] = useState(10); // 10:00 (inside 07-16)
  const [browserUrl, setBrowserUrl] = useState('http://www.example.com/');
  const [browserContent, setBrowserContent] = useState<'idle' | 'google' | 'blocked_example' | 'time_restricted' | 'not_connected'>('idle');

  // Router Logs
  const [routerLogs, setRouterLogs] = useState<LogEntry[]>([
    { id: '1', time: '08:00:12', topic: 'system,info', message: 'RouterBOARD 941-2nD booted up successfully', type: 'info' },
    { id: '2', time: '08:00:15', topic: 'dhcp,info', message: 'dhcp_lan assigned 192.168.100.25 to 00:1A:2B:3C:4D:5E', type: 'dhcp' },
    { id: '3', time: '08:01:05', topic: 'system,info', message: `web-proxy cache administrator set to ${config.cacheAdministrator || 'admin@sekolah.sch.id'}`, type: 'proxy' },
  ]);

  // Serkom Verification Checklist status
  const [testsPassed, setTestsPassed] = useState({
    pcDhcpVerified: true,
    pcInternetVerified: false,
    pcPingRule1Verified: false, // Drop ping router for .2-.50
    pcPingRule2Verified: false, // Drop ping wireless for .51-.100
    routerLogVerified: false,
    phoneHotspotLoginVerified: false,
    phoneTimeRestrictionVerified: false,
    phoneSiteBlockingVerified: false,
  });

  const normalizedName = candidateName.trim().toLowerCase().replace(/\s+/g, '_') || 'peserta';
  const expectedCacheAdmin = config.cacheAdministrator || `${normalizedName}@sekolah.sch.id`;
  const expectedSsid = config.ssid || `${normalizedName}@ProxyUKK`;

  const addRouterLog = (topic: string, message: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setRouterLogs((prev) => [
      ...prev,
      { id: Math.random().toString(), time: timeStr, topic, message, type },
    ]);
  };

  // Run PC Ping Test
  const runPcTest = (target: 'router' | 'wireless' | 'internet') => {
    sounds.click();
    const ip = pcClientIp === 'client_a' ? '192.168.100.25' : '192.168.100.75';
    const newLogs = [...pcTerminalLogs];

    if (target === 'router') {
      newLogs.push(`\nC:\\Users\\Student> ping 192.168.100.1 -n 4`);
      newLogs.push(`Pinging 192.168.100.1 with 32 bytes of data:`);

      // Rule 8: 192.168.100.2 - 192.168.100.50 tidak dapat ping ke router
      const isDropped = config.firewallDropPingRouter && pcClientIp === 'client_a';

      if (isDropped) {
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Ping statistics for 192.168.100.1:');
        newLogs.push('    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)');
        newLogs.push('[FIREWALL RESULT]: Rule Butir 8 TERBUKTI (IP 192.168.100.25 diblokir ping ke router)!');

        if (config.loggingToDisk) {
          addRouterLog(
            'firewall,info',
            `AKSES_ROUTER: in:ether2 out:(unknown 0), proto ICMP (type 8, code 0) 192.168.100.25->192.168.100.1, len 60 [ACTION: DROP, SAVED TO DISK]`,
            'firewall'
          );
        }
        setTestsPassed((p) => ({ ...p, pcPingRule1Verified: true }));
      } else {
        newLogs.push('Reply from 192.168.100.1: bytes=32 time<1ms TTL=64');
        newLogs.push('Reply from 192.168.100.1: bytes=32 time<1ms TTL=64');
        newLogs.push('Reply from 192.168.100.1: bytes=32 time<1ms TTL=64');
        newLogs.push('Reply from 192.168.100.1: bytes=32 time<1ms TTL=64');
        newLogs.push('Ping statistics for 192.168.100.1:');
        newLogs.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)');
        if (pcClientIp === 'client_b') {
          newLogs.push('[FIREWALL RESULT]: IP 192.168.100.75 di luar range blokir ping router (Sesuai Butir 8)!');
        }
      }
    } else if (target === 'wireless') {
      newLogs.push(`\nC:\\Users\\Student> ping 192.168.200.5 -n 4`);
      newLogs.push(`Pinging 192.168.200.5 with 32 bytes of data:`);

      // Rule 9: 192.168.100.51 - 192.168.100.100 tidak dapat ping ke wireless client
      const isDropped = config.firewallDropPingWireless && pcClientIp === 'client_b';

      if (isDropped) {
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Request timed out.');
        newLogs.push('Ping statistics for 192.168.200.5:');
        newLogs.push('    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)');
        newLogs.push('[FIREWALL RESULT]: Rule Butir 9 TERBUKTI (IP 192.168.100.75 diblokir ping ke client wireless)!');
        setTestsPassed((p) => ({ ...p, pcPingRule2Verified: true }));
      } else {
        newLogs.push('Reply from 192.168.200.5: bytes=32 time=2ms TTL=63');
        newLogs.push('Reply from 192.168.200.5: bytes=32 time=1ms TTL=63');
        newLogs.push('Reply from 192.168.200.5: bytes=32 time=2ms TTL=63');
        newLogs.push('Reply from 192.168.200.5: bytes=32 time=1ms TTL=63');
        newLogs.push('Ping statistics for 192.168.200.5:');
        newLogs.push('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)');
        if (pcClientIp === 'client_a') {
          newLogs.push('[FIREWALL RESULT]: IP 192.168.100.25 diizinkan ping ke wireless client (Sesuai Butir 9)!');
        }
      }
    } else if (target === 'internet') {
      newLogs.push(`\nC:\\Users\\Student> ping 8.8.8.8 -n 4`);
      newLogs.push(`Pinging 8.8.8.8 with 32 bytes of data:`);
      if (config.natMasquerade) {
        newLogs.push('Reply from 8.8.8.8: bytes=32 time=18ms TTL=117');
        newLogs.push('Reply from 8.8.8.8: bytes=32 time=17ms TTL=117');
        newLogs.push('Reply from 8.8.8.8: bytes=32 time=19ms TTL=117');
        newLogs.push('Reply from 8.8.8.8: bytes=32 time=18ms TTL=117');
        newLogs.push('Ping statistics for 8.8.8.8: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)');
        newLogs.push('[INTERNET STATUS]: Terhubung melalui Gateway ISP (NAT Masquerade OK)');
        setTestsPassed((p) => ({ ...p, pcInternetVerified: true }));
      } else {
        newLogs.push('Destination host unreachable.');
        newLogs.push('[ERROR]: NAT Masquerade belum aktif di RouterOS!');
      }
    }

    setPcTerminalLogs(newLogs);
    checkAllComplete();
  };

  // Switch PC IP range simulation
  const togglePcClient = (type: 'client_a' | 'client_b') => {
    sounds.click();
    setPcClientIp(type);
    const ip = type === 'client_a' ? '192.168.100.25' : '192.168.100.75';
    setPcTerminalLogs((prev) => [
      ...prev,
      `\n[DHCP CLIENT]: Renewing IP lease...`,
      `[DHCP CLIENT]: New IPv4 Address assigned: ${ip}`,
      type === 'client_a'
        ? '(Rentang .2 s/d .50 - Menguji Rule Butir 8 Drop Ping Router)'
        : '(Rentang .51 s/d .100 - Menguji Rule Butir 9 Drop Ping Wireless)',
    ]);
  };

  // Smartphone Hotspot Login
  const handleHotspotLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    if (!hotspotUser || !hotspotPass) return;
    setPhoneHotspotLoggedIn(true);
    sounds.success();
    addRouterLog(
      'hotspot,info',
      `hotspot1: ${hotspotUser} (192.168.200.25): logged in via captive portal`,
      'hotspot'
    );
    setTestsPassed((p) => ({ ...p, phoneHotspotLoginVerified: true }));
    checkAllComplete();
  };

  // Smartphone Browser Navigation
  const handleBrowserGo = (urlToLoad?: string) => {
    sounds.click();
    const url = (urlToLoad || browserUrl).trim().toLowerCase();

    if (!phoneWifiConnected || !phoneHotspotLoggedIn) {
      setBrowserContent('not_connected');
      return;
    }

    // Check time restriction (07.00 - 16.00)
    const isWithinAllowedTime = phoneSimulatedHour >= 7 && phoneSimulatedHour < 16;
    if (config.hotspotTimeRestriction && !isWithinAllowedTime) {
      setBrowserContent('time_restricted');
      setTestsPassed((p) => ({ ...p, phoneTimeRestrictionVerified: true }));
      checkAllComplete();
      return;
    }

    // Check site blocking
    if (config.blockWebsite && url.includes('example.com')) {
      setBrowserContent('blocked_example');
      setTestsPassed((p) => ({ ...p, phoneSiteBlockingVerified: true }));
      addRouterLog(
        'proxy,info',
        `web-proxy: 192.168.200.25 requested http://www.example.com/ -> ACTION: 403 ACCESS DENIED`,
        'proxy'
      );
      checkAllComplete();
      return;
    }

    // Normal browsing
    setBrowserContent('google');
  };

  const calculateLevel4Score = () => {
    const verifiedCount = Object.values(testsPassed).filter(Boolean).length;
    if (verifiedCount >= 6) return 25;
    if (verifiedCount >= 4) return 20;
    if (verifiedCount >= 2) return 15;
    return 10;
  };

  const checkAllComplete = () => {
    // If all essential Serkom tests are triggered, complete Level 4!
    setTimeout(() => {
      onComplete(calculateLevel4Score());
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Level Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-400 font-mono tracking-wider">
              LEVEL 4 DARI 4
            </span>
            <h1 className="text-lg font-bold text-white mt-0.5">
              Pengujian Jaringan, Troubleshooting & Log Verifikasi
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sesuai Butir 9 & 10 Dokumen Soal: Uji koneksi internet, drop ping router, drop ping wireless, live log disk, login hotspot captive portal, dan simulasi web proxy blocking site.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isCompleted && (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Level 4 Selesai (+25 Poin)</span>
              </div>
            )}
            {onFinishExam && (
              <button
                onClick={() => {
                  sounds.success();
                  const scoreFinal = calculateLevel4Score();
                  onComplete(scoreFinal);
                  onFinishExam();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-emerald-950/60 transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Selesaikan Ujian & Lihat Nilai</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Device Tab Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => {
              sounds.click();
              setDeviceTab('pc_client');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              deviceTab === 'pc_client'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>1. Pengujian PC Client (Kabel)</span>
          </button>
          <button
            onClick={() => {
              sounds.click();
              setDeviceTab('smartphone');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              deviceTab === 'smartphone'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>2. Pengujian Smartphone (Hotspot & Proxy)</span>
          </button>
          <button
            onClick={() => {
              sounds.click();
              setDeviceTab('router_log');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors ${
              deviceTab === 'router_log'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>3. Live RouterOS Disk Logs</span>
          </button>
        </div>
      </div>

      {/* Tab 1: PC Client Testing */}
      {deviceTab === 'pc_client' && (
        <div className="space-y-4">
          {/* IP Client Selector & Ping Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">Pilih Simulasi IP Client Laptop:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePcClient('client_a')}
                  className={`px-3 py-1.5 rounded-md border font-mono transition-colors ${
                    pcClientIp === 'client_a'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Client IP: 192.168.100.25 (Uji Butir 8 Drop Ping)
                </button>
                <button
                  onClick={() => togglePcClient('client_b')}
                  className={`px-3 py-1.5 rounded-md border font-mono transition-colors ${
                    pcClientIp === 'client_b'
                      ? 'bg-amber-950 text-amber-300 border-amber-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  Client IP: 192.168.100.75 (Uji Butir 9 Drop Wireless)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => runPcTest('router')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ping Router (192.168.100.1)</span>
              </button>
              <button
                onClick={() => runPcTest('wireless')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ping Wireless Client (.200.5)</span>
              </button>
              <button
                onClick={() => runPcTest('internet')}
                className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded flex items-center gap-1.5 font-semibold"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Ping Internet (8.8.8.8)</span>
              </button>
            </div>
          </div>

          {/* PC Command Prompt Terminal */}
          <div className="bg-black border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Command Prompt - PC Client [192.168.100.{pcClientIp === 'client_a' ? '25' : '75'}]</span>
              </div>
              <button
                onClick={() => setPcTerminalLogs(['Command Prompt reset. Ready.'])}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Clear Screen
              </button>
            </div>
            <div className="p-4 h-72 overflow-y-auto space-y-0.5 text-slate-300 leading-relaxed">
              {pcTerminalLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('Request timed out')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('Reply from')
                      ? 'text-emerald-400'
                      : log.includes('[FIREWALL RESULT]')
                      ? 'text-amber-300 font-bold'
                      : ''
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Smartphone Testing */}
      {deviceTab === 'smartphone' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Smartphone Frame Simulator */}
          <div className="max-w-xs mx-auto w-full bg-slate-950 border-4 border-slate-700 rounded-[2.5rem] p-3 shadow-2xl relative overflow-hidden">
            {/* Phone Speaker & Camera punch hole */}
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            </div>

            {/* Screen Content */}
            <div className="bg-slate-900 rounded-[1.8rem] p-3 min-h-[460px] flex flex-col justify-between text-xs border border-slate-800">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-mono font-bold text-white">
                  {phoneSimulatedHour.toString().padStart(2, '0')}:30 WIB
                </span>
                <div className="flex items-center gap-1.5">
                  <Wifi
                    className={`w-3.5 h-3.5 ${
                      phoneWifiConnected ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  />
                  <span>100%</span>
                </div>
              </div>

              {/* Screen Body */}
              <div className="flex-1 py-3 flex flex-col justify-center">
                {/* State 1: Wifi Not Connected */}
                {!phoneWifiConnected && (
                  <div className="text-center space-y-3">
                    <Wifi className="w-8 h-8 text-slate-500 mx-auto" />
                    <div>
                      <span className="font-bold text-slate-200 block">Jaringan Wi-Fi Terdeteksi</span>
                      <span className="text-[11px] text-slate-400">Pilih SSID untuk menghubungkan perangkat</span>
                    </div>
                    <button
                      onClick={() => {
                        sounds.click();
                        setPhoneWifiConnected(true);
                      }}
                      className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 text-left flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-white block">{expectedSsid}</span>
                        <span className="text-[10px] text-emerald-400">Terbuka (Captive Portal)</span>
                      </div>
                      <Wifi className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                )}

                {/* State 2: Captive Portal Hotspot Login */}
                {phoneWifiConnected && !phoneHotspotLoggedIn && (
                  <form onSubmit={handleHotspotLogin} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="text-center pb-2 border-b border-slate-800">
                      <span className="font-bold text-cyan-400 block text-xs">MikroTik RouterOS</span>
                      <span className="text-[10px] text-slate-400">Hotspot Login Gateway</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Username / Voucher:</label>
                      <input
                        type="text"
                        value={hotspotUser}
                        onChange={(e) => setHotspotUser(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Password:</label>
                      <input
                        type="password"
                        value={hotspotPass}
                        onChange={(e) => setHotspotPass(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs shadow"
                    >
                      Login Hotspot
                    </button>
                    <span className="text-[10px] text-slate-500 block text-center">
                      SSID: {expectedSsid}
                    </span>
                  </form>
                )}

                {/* State 3: Smartphone Browser */}
                {phoneWifiConnected && phoneHotspotLoggedIn && (
                  <div className="space-y-2 flex-1 flex flex-col">
                    {/* Browser Address Bar */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-md border border-slate-800">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={browserUrl}
                        onChange={(e) => setBrowserUrl(e.target.value)}
                        className="w-full bg-transparent text-[11px] font-mono text-slate-200 focus:outline-none"
                      />
                      <button
                        onClick={() => handleBrowserGo()}
                        className="p-1 rounded bg-cyan-600 text-white text-[10px]"
                      >
                        Buka
                      </button>
                    </div>

                    {/* Browser Viewport */}
                    <div className="flex-1 bg-white rounded-lg p-3 text-slate-950 overflow-y-auto min-h-[220px]">
                      {browserContent === 'idle' && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
                          <Globe className="w-6 h-6 text-slate-400" />
                          <span className="text-xs">Ketik alamat URL atau klik tombol uji cepat di sebelah kanan.</span>
                        </div>
                      )}

                      {/* Normal Google Site */}
                      {browserContent === 'google' && (
                        <div className="space-y-3 pt-2 text-center">
                          <span className="text-xl font-bold tracking-tight text-slate-800">Google</span>
                          <input
                            type="text"
                            disabled
                            placeholder="Cari di Google..."
                            className="w-full px-2.5 py-1 text-xs border rounded-full bg-slate-50"
                          />
                          <p className="text-[10px] text-emerald-600 font-semibold">
                            Koneksi Internet Normal &middot; Web Proxy Membuka Akses
                          </p>
                        </div>
                      )}

                      {/* MikroTik Web Proxy Access Denied (403 Forbidden) */}
                      {browserContent === 'blocked_example' && (
                        <div className="space-y-2 border-2 border-red-600 p-2.5 rounded bg-red-50 text-slate-900 font-mono text-[10px] leading-tight">
                          <div className="font-bold text-red-700 text-xs flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            ERROR: 403 Forbidden
                          </div>
                          <div className="font-bold">Access Denied by Web Proxy</div>
                          <p className="text-slate-700">
                            Access control rule prohibits you from accessing the requested URL:
                            <span className="block font-bold text-slate-900 mt-0.5">http://www.example.com/</span>
                          </p>
                          <hr className="border-red-200" />
                          <div className="text-slate-600">
                            Your cache administrator is:{' '}
                            <span className="font-bold text-blue-800 block break-all">
                              {expectedCacheAdmin}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 pt-1">
                            Generated by MikroTik RouterOS Proxy
                          </div>
                        </div>
                      )}

                      {/* Time Restriction Denied */}
                      {browserContent === 'time_restricted' && (
                        <div className="border border-amber-600 p-2.5 rounded bg-amber-50 text-amber-950 space-y-1 text-center font-sans">
                          <Clock className="w-5 h-5 text-amber-600 mx-auto" />
                          <span className="font-bold text-xs block">Akses Hotspot Dibatasi</span>
                          <p className="text-[10px] text-slate-700">
                            Sesuai Butir 15: Hotspot hanya bisa menggunakan internet pada pukul <strong>07.00 - 16.00 WIB</strong>.
                            Saat ini jam simulasi menunjukkan <strong>{phoneSimulatedHour}:30 WIB</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Home Bar */}
              <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>
          </div>

          {/* Smartphone Control Deck */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                Instrumen Uji Sesuai Butir 10 Dokumen Soal
              </h3>

              {/* Time Simulator Slider */}
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    Simulasi Jam Operasional (Butir 15: 07.00 - 16.00):
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {phoneSimulatedHour.toString().padStart(2, '0')}:30 WIB
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={phoneSimulatedHour}
                  onChange={(e) => setPhoneSimulatedHour(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className={phoneSimulatedHour >= 7 && phoneSimulatedHour < 16 ? 'text-emerald-400 font-bold' : ''}>
                    Jam Aktif: 07.00 - 16.00 (Internet ON)
                  </span>
                  <span className={phoneSimulatedHour < 7 || phoneSimulatedHour >= 16 ? 'text-rose-400 font-bold' : ''}>
                    Luar Jam (Internet BLOCKED)
                  </span>
                </div>
              </div>

              {/* Quick URL Trigger Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Uji Website di Browser Handphone:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setBrowserUrl('http://www.example.com/');
                      handleBrowserGo('http://www.example.com/');
                    }}
                    className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-700/80 hover:bg-rose-900 text-rose-200 text-xs font-medium text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold block">Uji Blocking Site (Butir 16)</span>
                      <span className="font-mono text-[10px] text-rose-300">http://www.example.com/</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-rose-400" />
                  </button>

                  <button
                    onClick={() => {
                      setBrowserUrl('http://www.google.com');
                      handleBrowserGo('http://www.google.com');
                    }}
                    className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-700/80 hover:bg-emerald-900 text-emerald-200 text-xs font-medium text-left flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold block">Uji Akses Normal</span>
                      <span className="font-mono text-[10px] text-emerald-300">http://www.google.com</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Status summary */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>SSID Terhubung:</span>
                  <span className="font-mono text-emerald-400">{phoneWifiConnected ? expectedSsid : 'Belum konek'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status Hotspot User:</span>
                  <span className="font-mono text-cyan-400">{phoneHotspotLoggedIn ? `Aktif (${hotspotUser})` : 'Belum login'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cache Administrator Terverifikasi:</span>
                  <span className="font-mono text-amber-300">{expectedCacheAdmin}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live RouterOS Disk Logs */}
      {deviceTab === 'router_log' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Live Log Disk RouterOS (/log print)
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Butir 10: Rule agar setiap akses ke router tercatat di logging dan tersimpan di disk.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-emerald-400">
                Action: disk (Persistent)
              </span>
            </div>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-2 max-h-80 overflow-y-auto">
            {routerLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 text-slate-300 py-1 border-b border-slate-900/60 last:border-0"
              >
                <span className="text-slate-500 shrink-0">{log.time}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                    log.type === 'firewall'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : log.type === 'hotspot'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : log.type === 'proxy'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {log.topic}
                </span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion & Score Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-950 border-2 border-emerald-500/80 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-950/60 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base">
                Tahap Pengujian Selesai: Siap Melihat Hasil & Rincian Nilai?
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300 border border-emerald-700">
                UKK Serkom
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
              Klik tombol di samping untuk mengakhiri sesi ujian praktik dan menampilkan <strong>Tampilan Nilai Akhir</strong> beserta sertifikat resmi.
            </p>
          </div>
        </div>

        {onFinishExam && (
          <button
            onClick={() => {
              sounds.success();
              const scoreFinal = calculateLevel4Score();
              onComplete(scoreFinal);
              onFinishExam();
            }}
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/70 transition-all flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesaikan Ujian & Lihat Nilai Akhir</span>
          </button>
        )}
      </div>
    </div>
  );
};
