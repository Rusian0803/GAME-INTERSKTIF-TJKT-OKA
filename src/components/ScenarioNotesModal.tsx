import React, { useState } from 'react';
import { BookOpen, X, FileText, Globe, Radio, Shield, Clock, Database, Ban, Cpu, Printer } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ScenarioNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  onOpenQuestionBook?: () => void;
}

export const ScenarioNotesModal: React.FC<ScenarioNotesModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  onOpenQuestionBook,
}) => {
  if (!isOpen) return null;

  const normalizedName = candidateName.trim().toLowerCase().replace(/\s+/g, '_') || 'peserta';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="font-bold text-white text-sm block">
                Buku Catatan Skenario & Ketentuan Ujian (UKK / Serkom)
              </span>
              <span className="text-[11px] text-slate-400">
                Dokumen Resmi: Lembar Kerja Praktik Kejuruan Teknik Komputer dan Jaringan
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.click();
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notes Content */}
        <div className="p-6 space-y-5 text-slate-200 text-xs leading-relaxed max-h-[75vh] overflow-y-auto font-sans">
          {/* Instructions Callout */}
          <div className="bg-cyan-950/40 border border-cyan-800/80 rounded-xl p-3.5 text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="font-bold text-cyan-100 block">
                Petunjuk Pengerjaan untuk Peserta Ujian:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Seluruh formulir konfigurasi dan CLI routerboard harus diinputkan secara mandiri sesuai dengan ketentuan skenario yang tertera di dokumen ini.
              </p>
            </div>
            {onOpenQuestionBook && (
              <button
                onClick={() => {
                  sounds.click();
                  onClose();
                  onOpenQuestionBook();
                }}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs whitespace-nowrap shadow-sm border border-cyan-400/40 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Buka Buku Penjelasan Soal</span>
              </button>
            )}
          </div>

          {/* Section 1: Jaringan Internet (WAN) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>1. Konfigurasi Jaringan Internet (WAN) - ether1</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>IP ether1:</strong> Sesuai dengan Network yang diberikan ISP (Gunakan IP host valid dari rentang subnet ISP, misal: <code className="text-cyan-300 font-mono">192.168.1.50/24</code>).
              </li>
              <li>
                <strong>Gateway:</strong> Sesuai dengan IP yang diberikan oleh ISP (<code className="text-cyan-300 font-mono">192.168.1.1</code>).
              </li>
              <li>
                <strong>DNS:</strong> Sesuai dengan DNS yang diberikan ISP (<code className="text-cyan-300 font-mono">192.168.1.1</code> dan/atau <code className="text-cyan-300 font-mono">8.8.8.8</code>). Aktifkan <em>Allow Remote Requests</em>.
              </li>
              <li>
                <strong>NTP (Network Time Protocol):</strong> Harus diaktifkan (<strong>NTP = Yes</strong>) via SNTP Client agar router tersinkronisasi dengan waktu server.
              </li>
              <li>
                <strong>Web Proxy:</strong> Harus diaktifkan pada port standard (<code className="text-cyan-300 font-mono">8080</code>).
              </li>
              <li>
                <strong>Cache Administrator:</strong> Wajib diisi menggunakan identitas peserta dengan format:
                <div className="mt-1 px-2.5 py-1 bg-slate-900 rounded font-mono text-amber-300 inline-block border border-slate-800">
                  {normalizedName}@sekolah.sch.id
                </div>
              </li>
            </ul>
          </div>

          {/* Section 2: Jaringan Lokal (LAN) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>2. Konfigurasi Jaringan Lokal (LAN) - ether2</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>IP ether2:</strong> Wajib dikonfigurasi dengan alamat <code className="text-emerald-300 font-mono">192.168.100.1/25</code>.
              </li>
              <li>
                <strong>DHCP Pool:</strong> Buat DHCP Server untuk ether2 sebanyak tepat <strong>99 Client</strong>.
                <br />
                <span className="text-[11px] text-slate-400">
                  (Rentang IP: <code className="text-slate-200 font-mono">192.168.100.2 - 192.168.100.100</code>).
                </span>
              </li>
              <li>
                <strong>Firewall Filter 1:</strong> Buat rule firewall filter agar rentang IP <code className="text-rose-300 font-mono">192.168.100.2 - 192.168.100.50</code> <strong>tidak dapat ping ke router</strong> (Chain input, Protocol icmp, Action drop).
              </li>
              <li>
                <strong>Firewall Filter 2:</strong> Buat rule firewall filter agar rentang IP <code className="text-amber-300 font-mono">192.168.100.51 - 192.168.100.100</code> <strong>tidak dapat ping ke client wireless</strong> (Chain forward, Protocol icmp, Dst 192.168.200.0/24, Action drop).
              </li>
              <li>
                <strong>Rule Logging ke Disk:</strong> Buat rule agar setiap akses ke router tercatat di logging firewall (<code className="text-slate-200 font-mono">log=yes log-prefix="AKSES_ROUTER: "</code>) dan tersimpan di penyimpanan disk (<code className="text-slate-200 font-mono">/system logging add topics=firewall action=disk</code>).
              </li>
            </ul>
          </div>

          {/* Section 3: Jaringan Wireless (WLAN) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
              <Radio className="w-4 h-4 text-purple-400" />
              <span>3. Konfigurasi Jaringan Wireless (WLAN) - wlan1</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>
                <strong>IP wlan1:</strong> Wajib dikonfigurasi dengan alamat <code className="text-purple-300 font-mono">192.168.200.1/24</code>.
              </li>
              <li>
                <strong>SSID Hotspot:</strong> Wajib menggunakan format nama peserta:
                <div className="mt-1 px-2.5 py-1 bg-slate-900 rounded font-mono text-purple-300 inline-block border border-slate-800">
                  {normalizedName}@ProxyUKK
                </div>
              </li>
              <li>
                <strong>DHCP Pool Wireless:</strong> Buat DHCP Server untuk wlan1 sebanyak tepat <strong>99 Client</strong> (Rentang: <code className="text-slate-200 font-mono">192.168.200.2 - 192.168.200.100</code>).
              </li>
              <li>
                <strong>Jadwal Waktu Hotspot:</strong> Account hotspot hanya diizinkan menggunakan internet pada rentang waktu <strong>07.00 - 16.00 WIB</strong> (Time restriction).
              </li>
              <li>
                <strong>Blocking Site:</strong> Buat aturan Firewall / Web Proxy Access yang memblokir situs:
                <div className="mt-1 px-2.5 py-1 bg-slate-900 rounded font-mono text-rose-300 inline-block border border-slate-800">
                  http://www.example.com/
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Rujukan: Soal Praktik Uji Kompetensi Keahlian - Modul Administrasi Jaringan</span>
          <button
            onClick={() => {
              sounds.click();
              onClose();
            }}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-md transition-colors"
          >
            Tutup Catatan
          </button>
        </div>
      </div>
    </div>
  );
};
