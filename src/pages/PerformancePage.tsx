import React, { useEffect, useState } from 'react';
import { usePerformanceStore } from '../store/usePerformanceStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { KeyboardVisualizer } from '../components/keyboard/KeyboardVisualizer';
import { COOL68_KEYS } from '../protocol/keyCodes';
import {
  Zap,
  Activity,
  Sliders,
  Play,
  Square,
  Shield,
} from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const {
    loadHardwareSettings,
    globalActuationMm,
    globalRtEnabled,
    globalRtPressMm,
    globalRtReleaseMm,
    globalDeadZoneTopMm,
    globalDeadZoneBottomMm,
    applyGlobalActuation,
    applyGlobalRt,
    applyGlobalDeadZone,
    selectedKeyPos,
    setSelectedKeyPos,
    perKeyActuation,
    perKeyRt,
    applyPerKeyActuation,
    applyPerKeyRt,
    isLiveTracking,
    startLiveMonitoring,
    stopLiveMonitoring,
    liveReadings,
  } = usePerformanceStore();

  const { deviceInfo, setPollingRate } = useDeviceStore();
  const [activeTab, setActiveTab] = useState<'global' | 'perkey'>('global');

  useEffect(() => {
    loadHardwareSettings();
  }, []);

  const selectedKeyDef = COOL68_KEYS.find(k => k.pos === selectedKeyPos);
  const currentKeyActuation = selectedKeyPos ? perKeyActuation[selectedKeyPos] : null;
  const currentKeyRt = selectedKeyPos ? perKeyRt[selectedKeyPos] : null;

  // Polling rates array matching ATK screenshot 5
  const pollingRates = [1000, 2000, 4000, 8000];
  const activeRate = deviceInfo?.pollingRateHz || 1000;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Banner / Keyboard Visualizer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-atk-orange" />
              Hall Effect Magnetic Switches
            </h1>
            <span className="text-xs text-zinc-500 font-mono">
              (0.005mm Hardware Step Precision)
            </span>
          </div>

          {/* Mode Switcher: Global vs Per Key */}
          <div className="flex items-center gap-1 bg-atk-card border border-atk-border p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTab('global');
                setSelectedKeyPos(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'global'
                  ? 'bg-atk-orange text-white shadow-atk-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Keys (Global)
            </button>
            <button
              onClick={() => setActiveTab('perkey')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'perkey'
                  ? 'bg-atk-orange text-white shadow-atk-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Per-Key Tuning
            </button>
          </div>
        </div>

        {/* 68-Key Interactive Visualizer */}
        <KeyboardVisualizer
          mode="performance"
          selectedPos={selectedKeyPos}
          onKeyClick={(pos: number) => {
            setActiveTab('perkey');
            setSelectedKeyPos(pos);
          }}
        />

        {activeTab === 'perkey' && (
          <div className="text-xs text-zinc-400 flex items-center justify-between px-2">
            <span>
              Selected Key:{' '}
              <strong className="text-atk-orange font-mono">
                {selectedKeyDef ? `${selectedKeyDef.label} (Key #${selectedKeyDef.pos})` : 'Click any key on the visualizer above'}
              </strong>
            </span>
            {selectedKeyDef && (
              <button
                onClick={() => setSelectedKeyPos(null)}
                className="text-zinc-500 hover:text-zinc-300 underline"
              >
                Clear Selection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Polling Rate Segmented Bar (Matching Screenshot 5) */}
      <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Polling Rate
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Current: <strong className="text-cyan-400">{activeRate} Hz</strong>
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 bg-atk-surface p-1.5 rounded-xl border border-atk-border">
            {pollingRates.map((rate) => {
              const isSelected = activeRate === rate;
              return (
                <button
                  key={rate}
                  onClick={() => setPollingRate(rate)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-atk-orange text-white shadow-atk-glow'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-atk-hover'
                  }`}
                >
                  {rate >= 1000 ? `${rate / 1000}K` : `${rate}`}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-zinc-500 font-medium px-1">
            <span>Standard (1000Hz)</span>
            <span>Ultra-Fast Esports (8000Hz)</span>
          </div>
        </div>
      </div>

      {/* Tuning Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Actuation Point */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-atk-orange" />
              <h3 className="text-sm font-bold text-white">Actuation Travel</h3>
            </div>
            <div className="flex items-center gap-1 font-mono text-xs bg-atk-surface border border-atk-border px-2 py-1 rounded-lg text-atk-orange font-bold">
              <span>
                {activeTab === 'perkey' && currentKeyActuation && !currentKeyActuation.useGlobal
                  ? currentKeyActuation.distanceMm.toFixed(2)
                  : globalActuationMm.toFixed(2)}
              </span>
              <span className="text-zinc-500 font-normal">mm</span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            The switch triggers a keystroke when pressed down to this millimeter depth (0.1 mm to 4.0 mm).
          </p>

          <div className="space-y-2 pt-2">
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.05"
              value={
                activeTab === 'perkey' && currentKeyActuation && !currentKeyActuation.useGlobal
                  ? currentKeyActuation.distanceMm
                  : globalActuationMm
              }
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (activeTab === 'perkey' && selectedKeyPos) {
                  applyPerKeyActuation(selectedKeyPos, val);
                } else {
                  applyGlobalActuation(val);
                }
              }}
              className="w-full accent-atk-orange"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0.1 mm (Instant)</span>
              <span>2.0 mm (Balanced)</span>
              <span>4.0 mm (Deep)</span>
            </div>
          </div>
        </div>

        {/* Module 2: Rapid Trigger (RT) */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Rapid Trigger (RT)</h3>
            </div>

            {/* Enable Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  activeTab === 'perkey' && currentKeyRt && !currentKeyRt.useGlobal
                    ? currentKeyRt.enable
                    : globalRtEnabled
                }
                onChange={(e) => {
                  const en = e.target.checked;
                  if (activeTab === 'perkey' && selectedKeyPos) {
                    applyPerKeyRt(selectedKeyPos, en, globalRtPressMm, globalRtReleaseMm);
                  } else {
                    applyGlobalRt(en, globalRtPressMm, globalRtReleaseMm);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-atk-orange"></div>
            </label>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Resets the key immediately the moment you let up, and retriggers the instant you press down again.
          </p>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Press Sensitivity</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {globalRtPressMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={globalRtPressMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  applyGlobalRt(globalRtEnabled, val, globalRtReleaseMm);
                }}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Release Sensitivity</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {globalRtReleaseMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2.0"
                step="0.05"
                value={globalRtReleaseMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  applyGlobalRt(globalRtEnabled, globalRtPressMm, val);
                }}
                className="w-full accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Dead Zones (Safe Areas) */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Dead Zones (Safe Area)</h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Prevents accidental activations caused by resting your fingers on the keycaps or bottoming out.
          </p>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Top Dead Zone</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {globalDeadZoneTopMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.01"
                value={globalDeadZoneTopMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  applyGlobalDeadZone(val, globalDeadZoneBottomMm);
                }}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Bottom Dead Zone</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {globalDeadZoneBottomMm.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.01"
                value={globalDeadZoneBottomMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  applyGlobalDeadZone(globalDeadZoneTopMm, val);
                }}
                className="w-full accent-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Module 4: Live Switch Travel Realtime Stream (cmd 0x98) */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Switch Travel Monitor</h3>
              </div>

              <button
                onClick={() => {
                  if (isLiveTracking) {
                    stopLiveMonitoring();
                  } else {
                    startLiveMonitoring();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isLiveTracking
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {isLiveTracking ? (
                  <>
                    <Square className="w-3 h-3 fill-red-400" />
                    <span>Stop Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-emerald-400" />
                    <span>Start Live Stream</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Streams raw analog Hall-effect sensor packets directly from the keyboard controller at 20Hz. Press any key to watch the live switch depth move in real time!
            </p>
          </div>

          {/* Live Readings meters */}
          <div className="bg-atk-surface border border-atk-border rounded-xl p-3 grid grid-cols-3 gap-2">
            {[29, 43, 44, 45, 70, 54].map((pos) => {
              const key = COOL68_KEYS.find(k => k.pos === pos);
              const reading = liveReadings[pos];
              const pct = reading ? Math.min(100, (reading.distanceMm / 4.0) * 100) : 0;

              return (
                <div key={pos} className="bg-atk-card p-2 rounded-lg border border-atk-border flex flex-col justify-between">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-zinc-200">{key?.label || `K#${pos}`}</span>
                    <span className="font-mono text-atk-orange font-semibold">
                      {reading ? `${reading.distanceMm.toFixed(2)}mm` : '0.00mm'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-gradient-to-r from-atk-orange to-amber-400 h-full transition-all duration-75"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
