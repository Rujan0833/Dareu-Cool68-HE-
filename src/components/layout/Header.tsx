import React from 'react';
import { useDeviceStore } from '../../store/useDeviceStore';
import { Zap, Activity, Terminal, RefreshCw, Cpu, Usb } from 'lucide-react';

interface HeaderProps {
  onOpenDiagnostics: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDiagnostics }) => {
  const { status, deviceInfo, refresh, disconnect } = useDeviceStore();

  return (
    <header className="h-14 border-b border-atk-border bg-atk-surface/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Breadcrumb */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-atk-orange to-amber-500 flex items-center justify-center shadow-atk-glow">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-extrabold tracking-wider text-base text-white">
            COOL68 <span className="text-atk-orange">HUB</span>
          </span>
        </div>

        {status === 'connected' && (
          <div className="hidden md:flex items-center space-x-2 text-xs text-atk-subtext pl-4 border-l border-atk-border">
            <span>Devices</span>
            <span>/</span>
            <span className="text-atk-text font-medium flex items-center gap-1.5">
              <Usb className="w-3.5 h-3.5 text-atk-orange" />
              DAREU COOL68 HE
            </span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {status === 'connected' && deviceInfo && (
          <>
            {/* Firmware badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-atk-card border border-atk-border text-atk-subtext font-mono">
              <Cpu className="w-3.5 h-3.5 text-atk-orange" />
              <span>FW {deviceInfo.firmwareVersion.split(' ')[0]}</span>
            </div>

            {/* Polling rate pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-atk-card border border-atk-border text-atk-subtext font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{deviceInfo.pollingRateHz} Hz</span>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => refresh()}
              title="Refresh keyboard state"
              className="p-1.5 rounded-md hover:bg-atk-hover border border-atk-border text-atk-subtext hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Diagnostics Button */}
        <button
          onClick={onOpenDiagnostics}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-atk-card hover:bg-atk-hover border border-atk-border text-atk-subtext hover:text-white transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-atk-orange" />
          <span className="hidden sm:inline">HID Console</span>
        </button>

        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-atk-border">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                : status === 'connecting'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-zinc-600'
            }`}
          />
          <span className="text-zinc-400 font-medium">
            {status === 'connected' ? 'Wired' : status === 'connecting' ? 'Connecting' : 'Disconnected'}
          </span>
          {status === 'connected' && (
            <button
              onClick={() => disconnect()}
              className="ml-2 text-zinc-500 hover:text-red-400 transition-colors"
              title="Disconnect device"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
