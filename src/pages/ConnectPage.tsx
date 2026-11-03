import React from 'react';
import { useDeviceStore } from '../store/useDeviceStore';
import { Plus, Usb, AlertTriangle, Cpu, Zap, Activity } from 'lucide-react';
import { KeyboardVisualizer } from '../components/keyboard/KeyboardVisualizer';

interface ConnectPageProps {
  onEnterApp: () => void;
}

export const ConnectPage: React.FC<ConnectPageProps> = ({ onEnterApp }) => {
  const { status, connect, errorMessage, deviceInfo, isWebHIDSupported } = useDeviceStore();

  return (
    <div className="min-h-screen bg-atk-bg flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-atk-orange/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Minimal Top Bar */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-atk-border/40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-atk-orange to-amber-500 flex items-center justify-center shadow-atk-glow">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-extrabold tracking-widest text-lg text-white">
            ATK <span className="text-atk-orange">GEAR</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10 max-w-4xl mx-auto w-full">
        {/* Browser Support Warning */}
        {!isWebHIDSupported && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold">WebHID is not supported in this browser.</p>
              <p className="text-amber-300/80">Please open this page in Google Chrome or Microsoft Edge on Windows 11.</p>
            </div>
          </div>
        )}

        {/* Connection Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-600/40 text-red-200 text-xs flex items-center gap-3 max-w-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-semibold">Connection Notice</p>
              <p className="text-red-300/80">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* State A: Device Connected Card (Matching Screenshot 2) */}
        {status === 'connected' && deviceInfo ? (
          <div className="w-full max-w-md bg-atk-card border border-atk-border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Peripheral Silhouette / Preview */}
            <div className="w-full py-6 flex items-center justify-center">
              <div className="w-48 h-32 bg-[#121217] rounded-xl border border-zinc-700/60 p-2 shadow-inner flex flex-col justify-between">
                <div className="grid grid-cols-10 gap-1 opacity-70">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="h-3 bg-zinc-700 rounded-sm" />
                  ))}
                </div>
                <div className="h-2 w-16 bg-atk-orange rounded-full mx-auto shadow-atk-glow" />
              </div>
            </div>

            {/* Device Title & Details */}
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                DAREU COOL68 HE
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Usb className="w-3.5 h-3.5 text-atk-orange" />
                  Wired USB
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  {deviceInfo.pollingRateHz} Hz
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Cpu className="w-3.5 h-3.5" />
                  {deviceInfo.firmwareVersion.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Enter Button */}
            <button
              onClick={onEnterApp}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-atk-orange to-amber-500 hover:from-atk-orange-hover hover:to-amber-400 text-white font-bold text-sm tracking-wider shadow-atk-glow transition-all"
            >
              Enter Device Configuration
            </button>
          </div>
        ) : (
          /* State B: Disconnected / Landing (Matching Screenshot 1) */
          <div className="w-full flex flex-col items-center text-center space-y-8">
            {/* Visualizer Preview in background */}
            <div className="w-full max-w-3xl opacity-75 pointer-events-none scale-90 sm:scale-100 transition-transform">
              <KeyboardVisualizer mode="performance" />
            </div>

            {/* Centered Connect Button (Pill button matching Screenshot 1) */}
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => connect()}
                disabled={status === 'connecting' || !isWebHIDSupported}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold text-xs tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-900" />
                <span>{status === 'connecting' ? 'Connecting...' : 'Add Device'}</span>
              </button>

              <h2 className="text-base font-bold text-white tracking-wide pt-2">
                Please connect device
              </h2>

              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                The driver communicates directly with your DAREU COOL68 Hall Effect keyboard over USB. Please ensure the keyboard is connected via wired USB cable.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-atk-border/40 px-8 flex items-center justify-between text-[11px] text-zinc-500">
        <span>DAREU COOL68 HE Web Driver</span>
        <span className="font-mono">WebHID Vendor Protocol</span>
      </footer>
    </div>
  );
};
