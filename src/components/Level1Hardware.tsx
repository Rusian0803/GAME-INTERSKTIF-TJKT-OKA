import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Wrench, Play, RotateCcw, AlertCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { ToolItem, WireColor } from '../types/serkom';
import { sounds } from '../utils/audio';

interface Level1HardwareProps {
  onComplete: (scorePoints: number) => void;
  onNextLevel: () => void;
  isCompleted: boolean;
}

const INITIAL_TOOLS: ToolItem[] = [
  { id: 't1', name: 'Laptop Client', spec: 'Core 2 Duo, RAM 2GB, HDD 250GB, 14"', category: 'required', selected: false, iconName: 'laptop' },
  { id: 't2', name: 'Hub / Switch', spec: 'Minimal 4 Port 10/100 Mbps', category: 'required', selected: false, iconName: 'network' },
  { id: 't3', name: 'Handphone (Smartphone)', spec: 'Android / iOS (Wifi Support)', category: 'required', selected: false, iconName: 'phone' },
  { id: 't4', name: 'Wifi Routerboard', spec: 'RB941-2nD-TC (hAP lite)', category: 'required', selected: false, iconName: 'router' },
  { id: 't5', name: 'Crimping Tool', spec: 'Tang Crimping untuk RJ-45', category: 'required', selected: false, iconName: 'tool' },
  { id: 't6', name: 'LAN Tester', spec: 'Cable Tester RJ-45 (Master + Remote)', category: 'required', selected: false, iconName: 'tester' },
  { id: 't7', name: 'Kabel UTP', spec: 'CAT 5 (Panjang 5 Meter)', category: 'required', selected: false, iconName: 'cable' },
  { id: 't8', name: 'Koneksi Internet', spec: 'Dedicated / Shared 1 Mbps (1 titik)', category: 'required', selected: false, iconName: 'globe' },
  // Distractors
  { id: 'd1', name: 'Fusion Splicer Fiber', spec: 'Penyambung Kabel Fiber Optic Core', category: 'distractor', selected: false, iconName: 'box' },
  { id: 'd2', name: 'Solder Listrik 60W', spec: 'Untuk penyolderan PCB elektronika', category: 'distractor', selected: false, iconName: 'box' },
  { id: 'd3', name: 'Konektor RJ-11', spec: 'Konektor 4-pin kabel telepon analog', category: 'distractor', selected: false, iconName: 'box' },
  { id: 'd4', name: 'Optical Power Meter', spec: 'Pengukur sinyal redaman cahaya dBm', category: 'distractor', selected: false, iconName: 'box' },
];

const STANDARD_T568B: WireColor[] = [
  { id: 1, colorName: 'Putih Orange', hex: '#ea580c', borderHex: '#ffffff', striped: true },
  { id: 2, colorName: 'Orange', hex: '#f97316' },
  { id: 3, colorName: 'Putih Hijau', hex: '#16a34a', borderHex: '#ffffff', striped: true },
  { id: 4, colorName: 'Biru', hex: '#2563eb' },
  { id: 5, colorName: 'Putih Biru', hex: '#0284c7', borderHex: '#ffffff', striped: true },
  { id: 6, colorName: 'Hijau', hex: '#22c55e' },
  { id: 7, colorName: 'Putih Cokelat', hex: '#92400e', borderHex: '#ffffff', striped: true },
  { id: 8, colorName: 'Cokelat', hex: '#78350f' },
];

export const Level1Hardware: React.FC<Level1HardwareProps> = ({
  onComplete,
  onNextLevel,
  isCompleted,
}) => {
  // Tool selection state
  const [tools, setTools] = useState<ToolItem[]>(INITIAL_TOOLS);
  const [toolsEvaluated, setToolsEvaluated] = useState(false);
  const [toolsSuccess, setToolsSuccess] = useState(false);

  // Cable wire sequence puzzle state
  // Initial randomized wire order
  const [currentWires, setCurrentWires] = useState<WireColor[]>(() => {
    return [...STANDARD_T568B].sort(() => Math.random() - 0.5);
  });
  const [selectedWireIdx, setSelectedWireIdx] = useState<number | null>(null);
  const [isCrimped, setIsCrimped] = useState(false);
  const [wireSuccess, setWireSuccess] = useState(false);

  // LAN Tester state
  const [testingPin, setTestingPin] = useState<number>(0);
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'pass' | 'fail'>('idle');
  const [earnedScore, setEarnedScore] = useState<number>(25);

  // Overall step status
  const toggleTool = (id: string) => {
    sounds.click();
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const evaluateTools = () => {
    sounds.click();
    const requiredSelected = tools.filter((t) => t.category === 'required' && t.selected).length;
    const distractorsSelected = tools.filter((t) => t.category === 'distractor' && t.selected).length;

    if (requiredSelected === 8 && distractorsSelected === 0) {
      setToolsSuccess(true);
      sounds.success();
    } else {
      setToolsSuccess(false);
      sounds.error();
    }
    setToolsEvaluated(true);
  };

  const handleWireClick = (idx: number) => {
    sounds.click();
    if (isCrimped) return;
    if (selectedWireIdx === null) {
      setSelectedWireIdx(idx);
    } else {
      // Swap positions
      const newWires = [...currentWires];
      const temp = newWires[selectedWireIdx];
      newWires[selectedWireIdx] = newWires[idx];
      newWires[idx] = temp;
      setCurrentWires(newWires);
      setSelectedWireIdx(null);
    }
  };

  const handleCrimp = () => {
    sounds.crimp();
    setIsCrimped(true);
    // Check if wire order matches standard T568B
    const isCorrect = currentWires.every((w, idx) => w.id === STANDARD_T568B[idx].id);
    setWireSuccess(isCorrect);
  };

  const resetCrimping = () => {
    sounds.click();
    setIsCrimped(false);
    setWireSuccess(false);
    setTestResult('idle');
    setTestingPin(0);
    setCurrentWires([...STANDARD_T568B].sort(() => Math.random() - 0.5));
  };

  // Run LAN Tester simulation
  const startLanTest = () => {
    if (!isCrimped) return;
    sounds.click();
    setIsTestingActive(true);
    setTestResult('testing');
    setTestingPin(1);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestingActive && testingPin >= 1 && testingPin <= 8) {
      sounds.testerPin(testingPin);
      timer = setTimeout(() => {
        if (testingPin < 8) {
          setTestingPin((p) => p + 1);
        } else {
          setIsTestingActive(false);
          const matchingPins = currentWires.filter((w, idx) => w.id === STANDARD_T568B[idx].id).length;
          if (wireSuccess) {
            setTestResult('pass');
            setEarnedScore(25);
            sounds.success();
            // Complete Level 1 with 25 points!
            onComplete(25);
          } else {
            setTestResult('fail');
            sounds.error();
            // Reduced score: between 8 and 20 based on matching pins and tools
            const scoreCalc = Math.max(8, Math.round((matchingPins / 8) * 18) + (toolsSuccess ? 5 : 2));
            setEarnedScore(scoreCalc);
          }
        }
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isTestingActive, testingPin, wireSuccess, onComplete]);

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-cyan-400 font-mono tracking-wider">
              LEVEL 1 DARI 4
            </span>
            <h1 className="text-lg font-bold text-white mt-0.5">
              Persiapan Alat, Bahan & Pengecekan Kabel UTP
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sebagai Junior Technician, periksa 8 peralatan standar UKK Serkom (Tabel II Dokumen Soal) dan rangkai kabel UTP CAT 5 dengan konfigurasi Straight-Through T568B.
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Level 1 Selesai (25 Poin)</span>
            </div>
          )}
        </div>
      </div>

      {/* Task 1: Peralatan & Bahan (Tabel II Dokumen Soal) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-400 border border-cyan-700/80 flex items-center justify-center text-xs">1</span>
              Verifikasi & Pemilihan Alat Kerja Sesuai Soal Uji Kompetensi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih 8 item wajib sesuai Dokumen II. Daftar Peralatan dan Bahan. Hindari memilih alat yang tidak ada di daftar soal.
            </p>
          </div>
          <button
            onClick={evaluateTools}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-sm shadow-cyan-950"
          >
            Verifikasi Checklist Alat
          </button>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tools.map((tool) => {
            return (
              <div
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`cursor-pointer p-3 rounded-lg border transition-all text-xs flex items-start justify-between gap-3 ${
                  tool.selected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-sm shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    {tool.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tool.spec}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center text-white border mt-0.5 ${
                    tool.selected ? 'bg-cyan-600 border-cyan-500' : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {tool.selected && <Check className="w-3 h-3" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tools evaluation alert */}
        {toolsEvaluated && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              toolsSuccess
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {toolsSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Checklist Sempurna!</strong> Seluruh 8 peralatan minimal uji kompetensi telah terverifikasi dengan kondisi Baik.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Peralatan Belum Sesuai:</strong> Pastikan Anda memilih tepat 8 item sesuai Tabel II (Laptop, Switch, Smartphone, MikroTik RB941, Crimping Tool, LAN Tester, Kabel UTP CAT 5, Internet 1 Mbps) tanpa alat fiber optik/elektronika luar.
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Task 2: Pemasangan & Susunan Kabel UTP (T568B) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-400 border border-cyan-700/80 flex items-center justify-center text-xs">2</span>
              Perakitan Kabel UTP: Susunan Pin T568B Straight-Through
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik 2 pin kabel untuk menukar urutan sehingga tersusun sesuai standar internasional T568B (Pin 1 s/d Pin 8).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetCrimping}
              className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Susunan
            </button>
          </div>
        </div>

        {/* Cable Visualizer & Pin Arranger */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
          <div className="text-xs font-mono text-slate-400 mb-2 flex items-center justify-between">
            <span>Konektor RJ-45 (Tampak Tembaga Mengarah ke Atas):</span>
            <span className="text-[11px] text-cyan-400">
              {selectedWireIdx !== null ? `Klik pin tujuan untuk menukar Pin ${selectedWireIdx + 1}` : 'Klik pin untuk menukar urutan'}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
            {currentWires.map((wire, idx) => {
              const isSelected = selectedWireIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => handleWireClick(idx)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center justify-between text-center min-h-[90px] ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-500/50 scale-105'
                      : isCrimped
                      ? 'border-slate-700 bg-slate-900/90 cursor-default'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 font-bold mb-1">
                    Pin {idx + 1}
                  </div>
                  {/* Wire bar representation */}
                  <div className="w-5 h-10 rounded-sm relative overflow-hidden my-1 flex items-center justify-center shadow-inner" style={{ backgroundColor: wire.hex }}>
                    {wire.striped && (
                      <div className="absolute inset-0 bg-white/40 [background:repeating-linear-gradient(45deg,transparent,transparent_3px,#ffffff_3px,#ffffff_6px)]"></div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium leading-tight mt-1">
                    {wire.colorName}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Crimp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Standar T568B: Putih-Orange, Orange, Putih-Hijau, Biru, Putih-Biru, Hijau, Putih-Cokelat, Cokelat.
            </div>
            <button
              onClick={handleCrimp}
              disabled={isCrimped}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>{isCrimped ? 'Kabel Telah Di-Crimping' : 'Crimping dengan Tang RJ-45'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Task 3: Simulasi LAN Tester RJ-45 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-900/60 text-cyan-400 border border-cyan-700/80 flex items-center justify-center text-xs">3</span>
              Pengujian Fisik Menggunakan LAN Cable Tester
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan ujung kabel ke Master Unit dan Remote Unit. Lampu LED pin 1 s/d 8 harus menyala berurutan secara sinkron.
            </p>
          </div>
          <button
            onClick={startLanTest}
            disabled={!isCrimped || isTestingActive}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-sm transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Mulai Uji LAN Tester</span>
          </button>
        </div>

        {/* Hardware Visual Tester */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Master Unit */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300 font-mono">LAN TESTER - MASTER TX</span>
              <span className="text-[10px] text-cyan-400 font-mono">RJ-45 CAT 5</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pin) => {
                const isActive = testingPin === pin;
                return (
                  <div
                    key={pin}
                    className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                      isActive
                        ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold">{pin}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all ${
                        isActive
                          ? 'bg-emerald-400 shadow-md shadow-emerald-400 animate-pulse'
                          : 'bg-slate-800'
                      }`}
                    ></span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remote Unit */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300 font-mono">LAN TESTER - REMOTE RX</span>
              <span className="text-[10px] text-emerald-400 font-mono">STANDAR T568B</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pin) => {
                const isActive = testingPin === pin;
                const isPinMatch = wireSuccess;
                return (
                  <div
                    key={pin}
                    className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                      isActive
                        ? isPinMatch
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                          : 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold">{pin}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all ${
                        isActive
                          ? isPinMatch
                            ? 'bg-emerald-400 shadow-md shadow-emerald-400 animate-pulse'
                            : 'bg-rose-500 shadow-md shadow-rose-500 animate-ping'
                          : 'bg-slate-800'
                      }`}
                    ></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result alert */}
        {testResult === 'pass' && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-100">Kabel UTP Lolos Uji Kompetensi (T568B Straight)!</span>
                <span>Semua pin 1-8 sinkron tanpa crosstalk / miswire. Nilai kompetensi hardware berhasil diraih (+25 Poin).</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.click();
                onNextLevel();
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md shadow transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Lanjut ke Level 2: Konfigurasi Router</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {testResult === 'fail' && (
          <div className="mt-4 p-4 rounded-lg bg-rose-950/80 border border-rose-700 text-xs text-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <span className="font-bold block text-rose-100">
                  Kabel Mengalami Miswire / Pin Salah Susun!
                </span>
                <span className="text-slate-300">
                  Urutan kabel tidak sesuai standar T568B. Pengurangan nilai: -{25 - earnedScore} Poin (Nilai: {earnedScore} / 25 Poin).
                  Anda dapat merangkai ulang atau tetap lanjut ke level berikutnya.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={resetCrimping}
                className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Rangkai Ulang
              </button>
              <button
                onClick={() => {
                  sounds.click();
                  onComplete(earnedScore);
                  onNextLevel();
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow transition-all flex items-center gap-1.5"
              >
                <span>Tetap Lanjut ke Level 2 ({earnedScore} Poin)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
