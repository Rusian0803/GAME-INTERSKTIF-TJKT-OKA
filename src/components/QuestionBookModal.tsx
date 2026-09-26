import React, { useState } from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Search,
  Cpu,
  Info,
  Shield,
  Wifi,
  Globe,
  Terminal,
  Layers,
  Clock,
  Printer
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface QuestionBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
}

export const QuestionBookModal: React.FC<QuestionBookModalProps> = ({
  isOpen,
  onClose,
  candidateName,
}) => {
  const normalizedName = candidateName.trim().toLowerCase().replace(/\s+/g, '_') || 'peserta';
  const expectedCacheAdmin = `${normalizedName}@sekolah.sch.id`;
  const expectedSsid = `${normalizedName}@ProxyUKK`;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<'all' | 'table' | 'kabel' | 'wan' | 'lan' | 'wireless' | 'firewall' | 'cli'>('all');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    sounds.click();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Master answer key list for the consolidated table
  const masterAnswers = [
    {
      id: 'ans-cable',
      section: 'Level 1: Hardware & Kabel',
      soal: 'Urutan 8 Pin Kabel UTP (Straight T568B)',
      value: 'Putih-Orange, Orange, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Cokelat, Cokelat',
      copyValue: 'Putih Orange, Orange, Putih Hijau, Biru, Putih Biru, Hijau, Putih Cokelat, Cokelat',
      location: 'Sandbox Level 1 (Crimping UTP T568B)',
      note: 'Pin 1-2 TX, Pin 3-6 RX. Konektor A & B identik.',
    },
    {
      id: 'ans-wan-ip',
      section: 'Level 2: WAN & Internet',
      soal: 'IP Address WAN ether1',
      value: '192.168.1.50/24',
      copyValue: '192.168.1.50/24',
      location: 'IP ➔ Addresses (ether1)',
      note: 'Wajib prefix /24. Satu subnet dengan ISP 192.168.1.0/24.',
    },
    {
      id: 'ans-wan-gw',
      section: 'Level 2: WAN & Internet',
      soal: 'Gateway WAN (Default Route 0.0.0.0/0)',
      value: '192.168.1.1',
      copyValue: '192.168.1.1',
      location: 'IP ➔ Routes (Dst: 0.0.0.0/0)',
      note: 'IP modem ISP. Flag route harus Active Static (AS).',
    },
    {
      id: 'ans-dns',
      section: 'Level 2: WAN & Internet',
      soal: 'DNS Server & Remote Requests',
      value: '192.168.1.1, 8.8.8.8 (Centang Allow Remote Requests)',
      copyValue: '192.168.1.1, 8.8.8.8',
      location: 'IP ➔ DNS',
      note: 'Centang [v] Allow Remote Requests agar client dapat browsing.',
    },
    {
      id: 'ans-ntp',
      section: 'Level 2: WAN & Internet',
      soal: 'SNTP Client (Network Time Protocol)',
      value: 'Yes / Enabled (Server: id.pool.ntp.org)',
      copyValue: 'id.pool.ntp.org',
      location: 'System ➔ SNTP Client',
      note: 'Mode: Unicast. Timezone: Asia/Jakarta (GMT+7).',
    },
    {
      id: 'ans-proxy',
      section: 'Level 2: WAN & Internet',
      soal: 'Web Proxy Port & Cache Administrator',
      value: `Port: 8080 | Cache Admin: ${expectedCacheAdmin}`,
      copyValue: expectedCacheAdmin,
      location: 'IP ➔ Web Proxy',
      note: 'Format email resmi: nama_peserta@sekolah.sch.id',
    },
    {
      id: 'ans-lan-ip',
      section: 'Level 3: LAN ether2',
      soal: 'IP Address Jaringan Lokal (LAN ether2)',
      value: '192.168.100.1/25',
      copyValue: '192.168.100.1/25',
      location: 'IP ➔ Addresses (ether2)',
      note: 'Subnet /25 (Netmask 255.255.255.128, range 126 host usable).',
    },
    {
      id: 'ans-lan-dhcp',
      section: 'Level 3: LAN ether2',
      soal: 'DHCP Pool LAN (Tepat 99 Client)',
      value: '192.168.100.2 - 192.168.100.100',
      copyValue: '192.168.100.2-192.168.100.100',
      location: 'IP ➔ DHCP Server ➔ DHCP Setup',
      note: 'Rumus: IP_Akhir - IP_Awal + 1 = 100 - 2 + 1 = 99 host.',
    },
    {
      id: 'ans-wlan-ip',
      section: 'Level 3: WLAN wlan1',
      soal: 'IP Address Jaringan Wireless (wlan1)',
      value: '192.168.200.1/24',
      copyValue: '192.168.200.1/24',
      location: 'IP ➔ Addresses (wlan1)',
      note: 'Subnet /24 (Netmask 255.255.255.0). Pastikan interface wlan1 Enable.',
    },
    {
      id: 'ans-ssid',
      section: 'Level 3: WLAN wlan1',
      soal: 'SSID Hotspot Wireless',
      value: expectedSsid,
      copyValue: expectedSsid,
      location: 'Wireless ➔ WiFi Interfaces (wlan1)',
      note: 'Mode: ap-bridge. Format: nama_peserta@ProxyUKK.',
    },
    {
      id: 'ans-wlan-dhcp',
      section: 'Level 3: WLAN wlan1',
      soal: 'DHCP Pool Wireless (Tepat 99 Client)',
      value: '192.168.200.2 - 192.168.200.100',
      copyValue: '192.168.200.2-192.168.200.100',
      location: 'IP ➔ DHCP Server / Hotspot Setup',
      note: 'Rumus: 100 - 2 + 1 = tepat 99 client nirkabel.',
    },
    {
      id: 'ans-fw-router',
      section: 'Level 4: Firewall & Security',
      soal: 'Blokir Ping ke Router (IP .2 s/d .50)',
      value: 'Chain: input | Src: 192.168.100.2-192.168.100.50 | Proto: icmp | Action: drop',
      copyValue: '192.168.100.2-192.168.100.50',
      location: 'IP ➔ Firewall ➔ Filter Rules',
      note: 'Wajib chain INPUT karena paket ditujukan ke router itu sendiri.',
    },
    {
      id: 'ans-fw-wlan',
      section: 'Level 4: Firewall & Security',
      soal: 'Blokir Ping ke Wireless (IP .51 s/d .100)',
      value: 'Chain: forward | Src: 192.168.100.51-192.168.100.100 | Dst: 192.168.200.0/24 | Proto: icmp | Action: drop',
      copyValue: '192.168.100.51-192.168.100.100',
      location: 'IP ➔ Firewall ➔ Filter Rules',
      note: 'Chain FORWARD karena melintasi router dari LAN ke WLAN.',
    },
    {
      id: 'ans-logging',
      section: 'Level 4: Firewall & Security',
      soal: 'Firewall Logging Tersimpan ke Disk',
      value: 'Action: disk | Topics: firewall | Log Prefix: akses-router:',
      copyValue: 'disk',
      location: 'System ➔ Logging',
      note: 'Agar log firewall tidak hilang saat router direstart.',
    },
    {
      id: 'ans-time',
      section: 'Level 4: Firewall & Security',
      soal: 'Jadwal Akses Internet Hotspot (07:00 - 16:00)',
      value: '07:00 - 16:00 (Jam Operasional Sekolah)',
      copyValue: '07:00 - 16:00',
      location: 'IP ➔ Firewall ➔ Filter (Extra: Time)',
      note: 'Di luar jam 07:00-16:00 akses internet client hotspot diblokir.',
    },
    {
      id: 'ans-block',
      section: 'Level 4: Firewall & Security',
      soal: 'Pemblokiran Situs / URL Filtering',
      value: 'http://www.example.com/ (Dst. Host: *example.com* deny)',
      copyValue: 'http://www.example.com/',
      location: 'IP ➔ Web Proxy ➔ Access',
      note: 'Action: deny. Disertai NAT Redirect port 80 ke 8080 (Transparent Proxy).',
    },
  ];

  // Full RouterOS CLI script
  const fullCliScript = `# ==============================================================
# MASTER CONFIGURATION SCRIPT UKK TKJ - MIKROTIK ROUTEROS
# Kandidat: ${candidateName}
# ==============================================================

# 1. KONFIGURASI IP ADDRESS ETHER1 (WAN), ETHER2 (LAN /25), WLAN1 (WLAN /24)
/ip address add address=192.168.1.50/24 interface=ether1 comment="WAN Gateway ISP"
/ip address add address=192.168.100.1/25 interface=ether2 comment="LAN Local Lab"
/ip address add address=192.168.200.1/24 interface=wlan1 comment="WLAN Hotspot"

# 2. DEFAULT GATEWAY (0.0.0.0/0) & DNS SERVER
/ip route add dst-address=0.0.0.0/0 gateway=192.168.1.1 comment="Default Gateway ISP"
/ip dns set servers=192.168.1.1,8.8.8.8 allow-remote-requests=yes

# 3. NTP (SNTP CLIENT) & ZONA WAKTU
/system clock set time-zone-name=Asia/Jakarta
/system ntp client set enabled=yes server-dns-names=id.pool.ntp.org

# 4. WEB PROXY INTERNAL
/ip proxy set enabled=yes port=8080 cache-administrator=${expectedCacheAdmin}

# 5. POOL & DHCP SERVER (TEPAT 99 CLIENT)
/ip pool add name=dhcp-pool-lan ranges=192.168.100.2-192.168.100.100
/ip dhcp-server add name=dhcp-lan interface=ether2 address-pool=dhcp-pool-lan disabled=no
/ip dhcp-server network add address=192.168.100.0/25 gateway=192.168.100.1 dns-server=192.168.100.1,8.8.8.8

/ip pool add name=dhcp-pool-wlan ranges=192.168.200.2-192.168.200.100
/ip dhcp-server add name=dhcp-wlan interface=wlan1 address-pool=dhcp-pool-wlan disabled=no
/ip dhcp-server network add address=192.168.200.0/24 gateway=192.168.200.1 dns-server=192.168.200.1,8.8.8.8

# 6. INTERFACE WIRELESS & SSID HOTSPOT
/interface wireless set wlan1 mode=ap-bridge band=2ghz-b/g/n ssid="${expectedSsid}" disabled=no

# 7. FIREWALL NAT (MASQUERADE & TRANSPARENT PROXY REDIRECT)
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade comment="NAT Internet"
/ip firewall nat add chain=dstnat in-interface=ether2 protocol=tcp dst-port=80 action=redirect to-ports=8080 comment="Transparent Proxy LAN"

# 8. FIREWALL FILTER: BLOKIR PING KE ROUTER (.2 s/d .50) -> CHAIN INPUT
/ip firewall filter add chain=input src-address=192.168.100.2-192.168.100.50 protocol=icmp action=drop log=yes log-prefix="drop-ping-router: " comment="Drop Ping to Router"

# 9. FIREWALL FILTER: BLOKIR PING KE WIRELESS (.51 s/d .100) -> CHAIN FORWARD
/ip firewall filter add chain=forward src-address=192.168.100.51-192.168.100.100 dst-address=192.168.200.0/24 protocol=icmp action=drop comment="Drop Ping LAN to WLAN"

# 10. FIREWALL FILTER: PEMBATASAN JAM AKSES HOTSPOT (07:00 - 16:00)
/ip firewall filter add chain=forward out-interface=ether1 in-interface=wlan1 time=07:00:00-16:00:00,sun,mon,tue,wed,thu,fri,sat action=accept comment="Allow Internet 07:00-16:00"
/ip firewall filter add chain=forward out-interface=ether1 in-interface=wlan1 action=drop comment="Drop Internet After Hours"

# 11. WEB PROXY ACCESS: BLOKIR SITUS
/ip proxy access add dst-host=*example.com* action=deny comment="Blokir Situs example.com"

# 12. LOGGING FIREWALL DISIMPAN PERMANEN KE DISK
/system logging add topics=firewall action=disk`;

  const filteredAnswers = masterAnswers.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.soal.toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.note.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-3 flex flex-col max-h-[94vh]">
        
        {/* Modal Top Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-cyan-950/50">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">
                  Buku Penjelasan: Ringkasan Terpadu Kunci Jawaban
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Master Cheatsheet UKK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Satu ringkasan menyeluruh yang langsung menjawab semua butir soal konfigurasi Level 1 s/d Level 4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.click();
                window.print();
              }}
              title="Cetak Ringkasan"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak</span>
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

        {/* Search & Quick Filter Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Quick Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kata kunci (cth: pool, dns, ping, 100)..."
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-9 pr-3 py-1.5 border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => { sounds.click(); setActiveSection('all'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeSection === 'all'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Semua Bagian
            </button>
            <button
              onClick={() => { sounds.click(); setActiveSection('table'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeSection === 'table'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              📋 Tabel Kunci Jawaban
            </button>
            <button
              onClick={() => { sounds.click(); setActiveSection('cli'); }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeSection === 'cli'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ⌨️ Full Script CLI
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 font-sans text-xs">
          
          {/* Main Info Banner */}
          <div className="bg-gradient-to-r from-blue-950/70 via-cyan-950/50 to-indigo-950/60 border border-cyan-800/60 rounded-xl p-4 text-cyan-200 flex items-start gap-3.5 shadow-sm">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  Ringkasan Lengkap Jawaban & Parameter Uji Kompetensi Keahlian (UKK)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                  Peserta: {candidateName || 'Peserta Ujian'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Seluruh jawaban pertanyaan ujian telah disatukan di bawah ini. Anda dapat melihat langsung nilai yang wajib diisi pada setiap parameter, rumus perhitungan subnetting, dan lokasi menu konfigurasi tanpa harus membuka kartu soal satu per satu.
              </p>
            </div>
          </div>

          {/* SECTION 1: MASTER ANSWER KEY TABLE */}
          {(activeSection === 'all' || activeSection === 'table') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-white text-sm">
                    Tabel Terpadu Kunci Jawaban Soal (Cheat Sheet Lengkap)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Menampilkan {filteredAnswers.length} parameter soal
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">No & Parameter Soal</th>
                      <th className="py-2.5 px-3">Kunci Jawaban Tepat (Yang Harus Diisi)</th>
                      <th className="py-2.5 px-3">Lokasi WinBox GUI</th>
                      <th className="py-2.5 px-3">Keterangan Teknis & Rumus</th>
                      <th className="py-2.5 px-2 text-center">Salin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {filteredAnswers.map((item, idx) => {
                      const isCopied = copiedKey === item.id;
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 font-sans">
                            <span className="text-[10px] text-cyan-400 block font-mono font-medium">
                              #{idx + 1} &middot; {item.section}
                            </span>
                            <span className="font-semibold text-slate-200 text-xs">
                              {item.soal}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-1 rounded bg-cyan-950/80 border border-cyan-800/70 text-cyan-300 font-bold text-xs inline-block selection:bg-cyan-500 selection:text-slate-950">
                              {item.value}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">
                            {item.location}
                          </td>
                          <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px] leading-relaxed">
                            {item.note}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleCopy(item.copyValue, item.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title={`Salin nilai: ${item.copyValue}`}
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: CONSOLIDATED STEP-BY-STEP EXPLANATION (SATU ALUR KERJA UTUH) */}
          {(activeSection === 'all') && (
            <div className="space-y-5 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">
                  Penjelasan & Alur Kerja Terpadu (Menjawab Semua Soal per Modul)
                </h3>
              </div>

              {/* Step 1: Cable Assembly */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Level 1: Perakitan Kabel Jaringan UTP Straight-Through T568B
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono">Modul 1 (Layer 1 Fisik)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="font-semibold text-cyan-300 block">
                      Urutan 8 Pin T568B (Konektor A & B Sama Persis):
                    </span>
                    <ol className="list-decimal list-inside space-y-1 font-mono text-slate-200">
                      <li><strong className="text-orange-400">Putih-Orange</strong></li>
                      <li><strong className="text-orange-500">Orange</strong></li>
                      <li><strong className="text-emerald-400">Putih-Hijau</strong></li>
                      <li><strong className="text-blue-400">Biru</strong></li>
                      <li><strong className="text-blue-300">Putih-Biru</strong></li>
                      <li><strong className="text-emerald-500">Hijau</strong></li>
                      <li><strong className="text-amber-600">Putih-Cokelat</strong></li>
                      <li><strong className="text-amber-700">Cokelat</strong></li>
                    </ol>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-200 block text-cyan-400">
                      Intisari & Alasan Teknis:
                    </span>
                    <p>
                      Kabel Straight-Through menghubungkan perangkat berbeda jenis (PC Client ke Router/Switch). Pin 1 & 2 bertindak sebagai <strong>TX (Transmit)</strong>, sedangkan Pin 3 & 6 bertindak sebagai <strong>RX (Receive)</strong>.
                    </p>
                    <p className="text-emerald-300 font-mono">
                      Indikator Lulus: Pada LAN Tester, seluruh lampu LED 1 s/d 8 menyala berurutan secara serempak di kedua sisi konektor.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: WAN & Internet Gateway */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-xs">
                      2
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Level 2: Konfigurasi WAN, Gateway, DNS, NTP & Web Proxy
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">Soal 1 s/d 5</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-cyan-300 block">
                      1. IP ether1 & Gateway ISP
                    </span>
                    <p className="text-slate-300">
                      • IP WAN: <code className="text-white font-mono bg-slate-950 px-1 rounded">192.168.1.50/24</code>
                    </p>
                    <p className="text-slate-300">
                      • Gateway: <code className="text-white font-mono bg-slate-950 px-1 rounded">192.168.1.1</code>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Router wajib satu segmen dengan modem ISP. Tambahkan default route Dst: <code>0.0.0.0/0</code> ke gateway <code>192.168.1.1</code>.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-cyan-300 block">
                      2. DNS & SNTP Client
                    </span>
                    <p className="text-slate-300">
                      • DNS: <code className="text-white font-mono bg-slate-950 px-1 rounded">192.168.1.1, 8.8.8.8</code>
                    </p>
                    <p className="text-slate-300">
                      • Allow Remote Requests: <strong className="text-emerald-400">Centang [v]</strong>
                    </p>
                    <p className="text-slate-300">
                      • SNTP: <code className="text-white font-mono bg-slate-950 px-1 rounded">id.pool.ntp.org</code>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      SNTP menyamakan jam router untuk akurasi rule firewall jadwal operasional 07:00-16:00.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <span className="font-semibold text-cyan-300 block">
                      3. Web Proxy Sekolah
                    </span>
                    <p className="text-slate-300">
                      • Port Proxy: <code className="text-white font-mono bg-slate-950 px-1 rounded">8080</code>
                    </p>
                    <p className="text-slate-300">
                      • Cache Administrator: <br />
                      <code className="text-cyan-300 font-mono bg-slate-950 px-1 rounded break-all">{expectedCacheAdmin}</code>
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Format: nama_peserta@sekolah.sch.id agar halaman error pemblokiran menampilkan identitas siswa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: LAN & WLAN Subnetting */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-xs">
                      3
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Level 3: Jaringan Lokal (LAN ether2), Wireless (WLAN wlan1) & DHCP Pool 99 Client
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono">Soal 6, 7, 11, 12, 13</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  {/* LAN /25 */}
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        Jaringan Kabel LAN (ether2) & Subnetting /25
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                        ether2
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <p>• <strong>IP Gateway ether2:</strong> <code className="text-cyan-300 font-mono bg-slate-950 px-1 rounded">192.168.100.1/25</code></p>
                      <p>• <strong>DHCP Pool (99 Client):</strong> <code className="text-emerald-300 font-mono bg-slate-950 px-1 rounded">192.168.100.2 - 192.168.100.100</code></p>
                    </div>

                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono">
                      💡 <strong>Rumus Rentang 99 Host:</strong><br />
                      Jumlah = IP_Akhir - IP_Awal + 1<br />
                      99 = IP_Akhir - 2 + 1 ➔ IP_Akhir = 100.<br />
                      Prefix /25 memiliki total 128 IP (Netmask: 255.255.255.128, broadcast: .127).
                    </div>
                  </div>

                  {/* WLAN /24 */}
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                        Jaringan Nirkabel Hotspot (wlan1) & Subnetting /24
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        wlan1
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <p>• <strong>IP Gateway wlan1:</strong> <code className="text-cyan-300 font-mono bg-slate-950 px-1 rounded">192.168.200.1/24</code></p>
                      <p>• <strong>SSID Hotspot:</strong> <code className="text-amber-300 font-mono bg-slate-950 px-1 rounded">{expectedSsid}</code></p>
                      <p>• <strong>DHCP Pool (99 Client):</strong> <code className="text-emerald-300 font-mono bg-slate-950 px-1 rounded">192.168.200.2 - 192.168.200.100</code></p>
                    </div>

                    <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono">
                      💡 <strong>Mode Wireless:</strong> Wajib diubah dari 'station' menjadi <span className="text-cyan-300">ap-bridge</span> agar memancarkan sinyal Wi-Fi hotspot.
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Firewall Security & Access Rules */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold font-mono text-xs">
                      4
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-sm">
                      Level 4: Keamanan Firewall, Pemblokiran Ping, Jadwal Waktu & URL Filtering
                    </h4>
                  </div>
                  <span className="text-[11px] text-rose-400 font-mono">Soal 8, 9, 10, 14, 15</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  {/* Ping Rules */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="font-semibold text-rose-300 block flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      1. Blokir ICMP / Ping (Input vs Forward)
                    </span>
                    <div className="space-y-1.5 text-slate-300">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <strong className="text-white block">Blokir Ping ke Router (.2-.50):</strong>
                        <span className="text-cyan-300 font-mono">Chain: input</span> | Src: <code>192.168.100.2-192.168.100.50</code> | Proto: <code>icmp</code> | Action: <code>drop</code>
                        <p className="text-[10px] text-slate-400 mt-0.5">Alasan: Paket ditujukan ke proses CPU router.</p>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <strong className="text-white block">Blokir Ping ke Wireless (.51-.100):</strong>
                        <span className="text-cyan-300 font-mono">Chain: forward</span> | Src: <code>192.168.100.51-192.168.100.100</code> | Dst: <code>192.168.200.0/24</code> | Proto: <code>icmp</code> | Action: <code>drop</code>
                        <p className="text-[10px] text-slate-400 mt-0.5">Alasan: Paket melintasi router dari LAN menuju WLAN.</p>
                      </div>
                    </div>
                  </div>

                  {/* Time, Log & Block Site */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                    <span className="font-semibold text-amber-300 block flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      2. Jadwal Waktu, Log ke Disk & Blokir Situs
                    </span>
                    <div className="space-y-1.5 text-slate-300">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <strong className="text-white block">Jadwal Akses Hotspot:</strong>
                        <code className="text-amber-300 font-mono">07:00 - 16:00</code> (Jam Belajar Sekolah).
                        Diatur pada Firewall Filter Rule tab <em>Extra ➔ Time</em>.
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <strong className="text-white block">Logging ke Disk:</strong>
                        Action: <code className="text-emerald-300 font-mono">disk</code>.
                        Diatur pada menu <em>System ➔ Logging</em> agar log tidak hilang saat reboot.
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <strong className="text-white block">Pemblokiran Situs Web:</strong>
                        <code className="text-rose-300 font-mono">http://www.example.com/</code>.
                        Diatur pada <em>IP ➔ Web Proxy ➔ Access ➔ Dst. Host: *example.com* Action: deny</em> disertai NAT Redirect port 80 ke 8080.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: MASTER ROUTEROS CLI SCRIPT */}
          {(activeSection === 'all' || activeSection === 'cli') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">
                    Master Script CLI RouterOS (Semua Jawaban dalam 1 Skrip Eksekusi)
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy(fullCliScript, 'full-script')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'full-script' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Script Lengkap Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua Script CLI</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Terminal RouterOS CLI &middot; One-Click Config</span>
                  <span>{candidateName} @ MikroTik RouterOS</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto selection:bg-emerald-500 selection:text-slate-950 max-h-96">
                  {fullCliScript}
                </pre>
              </div>
            </div>
          )}

          {/* SECTION 4: QUICK CHECKLIST (COMMON TRAPS TO AVOID) */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4 space-y-2 text-[11px] text-slate-300">
            <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Peringatan Kritis: 5 Jebakan Ujian yang Sering Menyebabkan Nilai Berkurang
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>
                <strong>Lupa Menuliskan Prefix /25:</strong> Pada ether2, jika hanya mengetik <code className="text-white">192.168.100.1</code> tanpa <code className="text-cyan-300">/25</code>, router akan menjadikannya subnet /32 dan DHCP server akan gagal!
              </li>
              <li>
                <strong>Salah Menghitung Batas DHCP Pool 99:</strong> Rentang pool harus berakhir di <code className="text-cyan-300">.100</code> (bukan .99). Karena <code className="font-mono">100 - 2 + 1 = 99</code> host.
              </li>
              <li>
                <strong>Tertukar Chain Input vs Forward:</strong> Untuk blokir ping ke routerboard gunakan chain <code className="text-cyan-300">input</code>. Untuk blokir ping antar-interface (LAN ke WLAN) gunakan chain <code className="text-cyan-300">forward</code>.
              </li>
              <li>
                <strong>Lupa Mengaktifkan (Enable) wlan1 & Mengubah Mode ke AP-Bridge:</strong> Interface wlan1 bawaan pabrik mati (disabled) dan bermode <code className="font-mono">station</code>. Wajib di-enable dan diset ke <code className="font-mono">ap-bridge</code>.
              </li>
              <li>
                <strong>Lupa Mencentang &quot;Allow Remote Requests&quot; di DNS:</strong> Jika opsi ini tidak dicentang, routerboard bisa browsing tetapi seluruh komputer client gagal resolusi domain internet.
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Ringkasan ini mencakup seluruh 15 butir parameter evaluasi teknis UKK / Serkom TKJ.
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                sounds.click();
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
            >
              <span>Mengerti & Tutup Ringkasan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
