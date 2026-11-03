import React from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { cool68Service } from '../device/cool68Service';
import { SLEEP_TIMEOUTS } from '../protocol/constants';
import { Settings2, Cpu, Moon, Lock, Apple, Flame, Sliders, Terminal } from 'lucide-react';

interface SettingsPageProps {
  onOpenDiagnostics: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenDiagnostics }) => {
  const {
    deviceInfo,
    setWinLock,
    setMacMode,
    setAutoCalibrate,
    setOverdrive,
  } = useDeviceStore();

  const handleSleepChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = Number(e.target.value);
    await cool68Service.setSleepTimeout(level);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-atk-orange" />
          Device Settings & Preferences
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Hardware flags, keyboard OS modes, and firmware diagnostic status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Hardware Feature Toggles */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
          <h3 className="text-sm font-bold text-white">Hardware Feature Flags</h3>

          <div className="space-y-3 pt-1">
            {/* Windows Key Lock */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-atk-surface border border-atk-border">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-atk-orange" />
                <div>
                  <h4 className="text-xs font-bold text-white">Lock Windows Key</h4>
                  <p className="text-[11px] text-zinc-500">Disables the Win key to prevent tab-outs during gaming</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={deviceInfo?.winLock ?? false}
                onChange={(e) => setWinLock(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-atk-orange focus:ring-atk-orange cursor-pointer"
              />
            </div>

            {/* Mac Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-atk-surface border border-atk-border">
              <div className="flex items-center gap-2.5">
                <Apple className="w-4 h-4 text-zinc-300" />
                <div>
                  <h4 className="text-xs font-bold text-white">macOS Key Layout</h4>
                  <p className="text-[11px] text-zinc-500">Swaps Windows and Alt keys for Command / Option mapping</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={deviceInfo?.macMode ?? false}
                onChange={(e) => setMacMode(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-atk-orange focus:ring-atk-orange cursor-pointer"
              />
            </div>

            {/* Auto Calibration */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-atk-surface border border-atk-border">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Hardware Auto-Calibration</h4>
                  <p className="text-[11px] text-zinc-500">Dynamically calibrates Hall-effect resting baselines</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={deviceInfo?.autoCalibrate ?? false}
                onChange={(e) => setAutoCalibrate(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-atk-orange focus:ring-atk-orange cursor-pointer"
              />
            </div>

            {/* Overdrive Mode */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-atk-surface border border-atk-border">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Overdrive Mode</h4>
                  <p className="text-[11px] text-zinc-500">Prioritizes sensor scan loops for ultra-low latency response</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={deviceInfo?.overdrive ?? false}
                onChange={(e) => setOverdrive(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-600 text-atk-orange focus:ring-atk-orange cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Sleep & Diagnostics */}
        <div className="space-y-5">
          {/* Sleep Timeout */}
          <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-3 shadow-atk-card">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Inactivity Sleep Timeout</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Puts RGB backlight into standby sleep after a period of inactivity.
            </p>
            <select
              onChange={handleSleepChange}
              className="w-full bg-atk-surface border border-atk-border text-xs rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-atk-orange cursor-pointer"
            >
              {Object.entries(SLEEP_TIMEOUTS).map(([label, val]) => (
                <option key={label} value={Number(val)}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Hardware Diagnostic Info Card */}
          <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-3 shadow-atk-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-atk-orange" />
                <h3 className="text-sm font-bold text-white">Hardware Information</h3>
              </div>
              <button
                onClick={onOpenDiagnostics}
                className="flex items-center gap-1 text-xs text-atk-orange hover:underline font-mono cursor-pointer"
              >
                <Terminal className="w-3 h-3" />
                <span>Open Packet Console</span>
              </button>
            </div>

            <div className="bg-atk-surface border border-atk-border rounded-xl p-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Firmware:</span>
                <span className="text-emerald-400 font-semibold">{deviceInfo?.firmwareVersion || '0x0124'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Device ID:</span>
                <span className="text-zinc-200">{deviceInfo?.deviceId || 'COOL68-HE-001'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">USB Identifiers:</span>
                <span className="text-zinc-200">VID 0x372E : PID 0x1083</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HID Configuration Interface:</span>
                <span className="text-zinc-200">Interface 2 (UsagePage 0xFF60)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Sensor Step Precision:</span>
                <span className="text-cyan-400">{deviceInfo?.precisionUm || 5} µm (0.005mm)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
