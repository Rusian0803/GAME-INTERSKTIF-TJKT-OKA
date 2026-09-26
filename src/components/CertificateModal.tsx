import React from 'react';
import { Award, CheckCircle2, XCircle, Printer, X, ShieldCheck } from 'lucide-react';
import { NetworkConfig } from '../types/serkom';
import { sounds } from '../utils/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  schoolName?: string;
  score: number;
  config: NetworkConfig;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  schoolName,
  score,
  config,
}) => {
  if (!isOpen) return null;

  const isKompeten = score >= 75;
  const normalizedName = candidateName.trim() || 'Peserta Uji Kompetensi';
  const examDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rubricItems = [
    {
      no: 1,
      title: 'Persiapan Alat & Bahan Standar UKK (8 Item)',
      scorePart: 10,
      achieved: score >= 10,
      desc: 'Laptop, Switch, Smartphone, MikroTik RB941, Crimping, Tester, UTP, ISP 1 Mbps',
    },
    {
      no: 2,
      title: 'Pemasangan & Pengujian Kabel UTP CAT 5 T568B',
      scorePart: 15,
      achieved: score >= 25,
      desc: 'Urutan pin 1-8 T568B Straight lolos uji LED LAN Cable Tester',
    },
    {
      no: 3,
      title: 'Konfigurasi IP WAN, Gateway ISP & DNS Server',
      scorePart: 10,
      achieved: score >= 35,
      desc: 'Alokasi IP ether1, default route 0.0.0.0/0, DNS Server ISP & allow remote',
    },
    {
      no: 4,
      title: 'Aktivasi NTP Client (SNTP) & Web Proxy',
      scorePart: 10,
      achieved: score >= 45,
      desc: `NTP=Yes dan Cache Administrator: ${config.cacheAdministrator || 'nama@sekolah.sch.id'}`,
    },
    {
      no: 5,
      title: 'Konfigurasi Jaringan Lokal (LAN) IP 192.168.100.1/25',
      scorePart: 10,
      achieved: score >= 55,
      desc: 'Alokasi subnet /25 dan DHCP Pool sebanyak 99 Client (.2 s/d .100)',
    },
    {
      no: 6,
      title: 'Konfigurasi Jaringan Wireless (WLAN) IP 192.168.200.1/24',
      scorePart: 10,
      achieved: score >= 65,
      desc: `Alokasi IP wlan1, SSID: ${config.ssid || 'nama@ProxyUKK'}, DHCP Pool 99 Client`,
    },
    {
      no: 7,
      title: 'Firewall Filter: Blokir Ping Router (.2-.50)',
      scorePart: 10,
      achieved: score >= 75,
      desc: 'Chain input protocol icmp drop untuk IP 192.168.100.2-192.168.100.50',
    },
    {
      no: 8,
      title: 'Firewall Filter: Blokir Ping Wireless (.51-.100)',
      scorePart: 10,
      achieved: score >= 85,
      desc: 'Chain forward protocol icmp drop menuju subnet wireless 192.168.200.0/24',
    },
    {
      no: 9,
      title: 'Logging Akses Router ke Disk & Jadwal Hotspot',
      scorePart: 5,
      achieved: score >= 90,
      desc: 'Rule action=log disimpan ke disk, hotspot internet aktif hanya 07.00 - 16.00',
    },
    {
      no: 10,
      title: 'Blocking Site http://www.example.com/ & Lab Test',
      scorePart: 5,
      achieved: score >= 100,
      desc: 'Web proxy deny site & pengujian menyeluruh pada PC kabel dan Handphone',
    },
  ];

  const handlePrint = () => {
    sounds.click();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm">
              Lembar Penilaian & Sertifikat Uji Kompetensi Keahlian
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-md border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Hasil</span>
            </button>
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
        </div>

        {/* Certificate Printable Body */}
        <div className="p-6 space-y-6 text-slate-200">
          {/* Certificate Header Banner */}
          <div className="text-center space-y-1.5 border-b border-slate-800 pb-5">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-xs tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>BADAN NASIONAL SERTIFIKASI PROFESI / UJI KOMPETENSI KEAHLIAN</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              LEMBAR HASIL UJI KOMPETENSI NETWORK ADMINISTRATOR
            </h2>
            <p className="text-xs text-slate-400">
              Judul Tugas: Troubleshooting Keamanan Jaringan Pada Jaringan WAN (MikroTik RouterOS)
            </p>
          </div>

          {/* Candidate Profile Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Nama Asesi / Peserta:</span>
              <span className="font-bold text-white text-sm">{normalizedName}</span>
              {schoolName && (
                <span className="text-[11px] text-cyan-400 block mt-0.5 font-medium">{schoolName}</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Peran Kerja:</span>
              <span className="font-semibold text-cyan-300">Junior Network Technician</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Tanggal Asesmen:</span>
              <span className="font-mono text-slate-300">{examDate}</span>
            </div>
          </div>

          {/* Result Banner: Kompeten vs Belum Kompeten */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isKompeten
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                : 'bg-amber-950/70 border-amber-700 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isKompeten ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider block">
                  Keputusan Asesmen Akhir:
                </span>
                <span className="text-lg font-black tracking-wide">
                  {isKompeten ? 'KOMPETEN (LULUS)' : 'BELUM KOMPETEN (REMEDIAL)'}
                </span>
                <p className="text-xs mt-0.5 opacity-90">
                  {isKompeten
                    ? 'Peserta telah mendemonstrasikan seluruh kompetensi konfigurasi WAN, LAN, WLAN, DHCP, Web Proxy & Firewall sesuai standar.'
                    : 'Peserta perlu melengkapi seluruh level konfigurasi dan pengujian untuk mencapai batas minimal kompeten (75 poin).'}
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right shrink-0 bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">TOTAL NILAI AKHIR</span>
              <span className="text-2xl font-black font-mono text-white tabular-nums">
                {score}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
            </div>
          </div>

          {/* Detailed Rubric Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Rincian Aspek Penilaian Sesuai Dokumen Soal Praktik:
            </span>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px] sticky top-0">
                    <tr>
                      <th className="p-2.5 w-10 text-center">No</th>
                      <th className="p-2.5">Elemen Kompetensi / Soal</th>
                      <th className="p-2.5 w-16 text-center">Bobot</th>
                      <th className="p-2.5 w-24 text-center">Hasil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {rubricItems.map((item) => (
                      <tr key={item.no} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-center font-mono text-slate-500">{item.no}</td>
                        <td className="p-2.5">
                          <span className="font-semibold text-slate-200 block">{item.title}</span>
                          <span className="text-[11px] text-slate-400">{item.desc}</span>
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-400">{item.scorePart} pt</td>
                        <td className="p-2.5 text-center">
                          {item.achieved ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Kompeten
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                              Belum
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span>Tanda Tangan Asesi:</span>
              <div className="font-bold text-slate-200 mt-6 underline">{normalizedName}</div>
            </div>
            <div className="text-right">
              <span>Asesor Penguji Kompetensi:</span>
              <div className="font-bold text-slate-200 mt-6 underline">Tim Penguji BNSP / LSP-P1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
