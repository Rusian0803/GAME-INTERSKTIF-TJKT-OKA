import React, { useState } from 'react';
import { Globe, Server, Laptop, Smartphone, Wifi, Radio, Layers, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { NetworkConfig } from '../types/serkom';
import { sounds } from '../utils/audio';

interface TopologyMapProps {
  config: NetworkConfig;
  candidateName: string;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({ config }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('router');

  const proxyAdminDisplay = config.cacheAdministrator || 'Belum diatur';
  const ssidDisplay = config.ssid || 'Belum diatur';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Topologi Kerja & Diagram Skenario Uji Kompetensi
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sesuai Gambar Kerja UKK: ISP &rarr; MikroTik RB941-2nD-TC &rarr; Switch & PC Client &middot; wlan1 Hotspot & Smartphone
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Link Live
          </span>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <div className="relative bg-slate-950/80 rounded-lg p-4 border border-slate-800/80 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Node 1: Internet / ISP */}
          <div
            onClick={() => {
              sounds.click();
              setSelectedNode('isp');
            }}
            className={`cursor-pointer group p-3 rounded-lg border transition-all ${
              selectedNode === 'isp'
                ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded bg-sky-950 text-sky-400 border border-sky-800">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Koneksi Internet</span>
                <span className="text-[11px] text-slate-400 font-mono">1 Mbps (ISP)</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5 font-mono pt-1 border-t border-slate-800">
              <div>Gateway: {config.wanGateway || 'Belum diatur'}</div>
              <div>DNS: {config.dnsServer || 'Belum diatur'}</div>
            </div>
          </div>

          {/* Connection Line 1 */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mb-1">
              ether1 (WAN)
            </span>
            <div className="w-full h-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">UTP Cat5 (5m)</span>
          </div>

          {/* Node 2: MikroTik Router (Central) */}
          <div
            onClick={() => {
              sounds.click();
              setSelectedNode('router');
            }}
            className={`cursor-pointer group p-3.5 rounded-lg border transition-all ${
              selectedNode === 'router'
                ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded bg-cyan-950 text-cyan-400 border border-cyan-700">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">MikroTik Router</span>
                <span className="text-[11px] text-cyan-400 font-mono">RB941-2nD-TC (hAP)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-300 pt-1.5 border-t border-slate-800">
              <div className="bg-slate-950/70 p-1 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">ether2 (LAN)</span>
                {config.lanIp || 'Belum diatur'}
              </div>
              <div className="bg-slate-950/70 p-1 rounded border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">wlan1 (Hotspot)</span>
                {config.wlanIp || 'Belum diatur'}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Firewall & Proxy Ready</span>
            </div>
          </div>

          {/* Connection Line 2 */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 mb-1">
              ether2 / wlan1
            </span>
            <div className="w-full h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 relative">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-1">Switch & Wireless</span>
          </div>

          {/* Node 3 & 4: Clients (Cable & Wireless) */}
          <div className="space-y-2.5">
            {/* PC Client */}
            <div
              onClick={() => {
                sounds.click();
                setSelectedNode('pc');
              }}
              className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                selectedNode === 'pc'
                  ? 'bg-slate-800/90 border-cyan-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-800 text-cyan-400">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Laptop Client (Kabel)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Via Switch 4-Port &middot; DHCP Pool 99</span>
                </div>
              </div>
            </div>

            {/* Handphone Hotspot */}
            <div
              onClick={() => {
                sounds.click();
                setSelectedNode('phone');
              }}
              className={`cursor-pointer p-2.5 rounded-lg border transition-all ${
                selectedNode === 'phone'
                  ? 'bg-slate-800/90 border-emerald-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-800 text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Smartphone (Hotspot)</span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px] block">
                    {ssidDisplay}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="mt-4 pt-3 border-t border-slate-800/90 text-xs">
          {selectedNode === 'router' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-md border border-slate-800">
              <div className="space-y-1">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Parameter Konfigurasi Routerboard Skenario Uji Kompetensi
                </div>
                <div className="text-slate-400 text-[11px]">
                  Web Proxy Administrator: <span className="text-cyan-300 font-mono">{proxyAdminDisplay}</span> &middot; NTP Client: <span className="text-emerald-400 font-mono">{config.ntpEnabled ? 'Aktif (Yes)' : 'Non-aktif'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  LAN: {config.lanIp || 'Belum diatur'}
                </span>
                <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  WLAN: {config.wlanIp || 'Belum diatur'}
                </span>
              </div>
            </div>
          )}

          {selectedNode === 'isp' && (
            <div className="bg-slate-900/70 p-3 rounded-md border border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-200 block">Skenario Jaringan Internet (WAN)</span>
                <span className="text-slate-400 text-[11px]">Koneksi internet upstream disediakan oleh ISP dengan alokasi bandwidth 1 Mbps.</span>
              </div>
              <div className="font-mono text-[11px] text-slate-300 space-x-2">
                <span>WAN: {config.wanIp || 'Belum diatur'}</span>
                <span>&middot; Gateway: {config.wanGateway || 'Belum diatur'}</span>
              </div>
            </div>
          )}

          {selectedNode === 'pc' && (
            <div className="bg-slate-900/70 p-3 rounded-md border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                Spesifikasi Client Kabel (LAN - ether2)
              </div>
              <p className="text-slate-400 text-[11px]">
                Laptop terhubung ke Port Switch. Mendapatkan IP otomatis via DHCP Pool (192.168.100.2 - 192.168.100.100).
                Firewall menguji rule ICMP drop untuk IP .2-.50 ke router dan .51-.100 ke client wireless.
              </p>
            </div>
          )}

          {selectedNode === 'phone' && (
            <div className="bg-slate-900/70 p-3 rounded-md border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                Spesifikasi Client Wireless & Hotspot (wlan1)
              </div>
              <p className="text-slate-400 text-[11px]">
                Handphone terhubung ke SSID <span className="text-emerald-300 font-mono">{ssidDisplay}</span>.
                Mendapatkan IP dari DHCP Pool Wireless (192.168.200.2 - 192.168.200.100).
                Akses internet dibatasi pada pukul 07.00 - 16.00 dan memblokir website <span className="text-amber-300 font-mono">http://www.example.com/</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
