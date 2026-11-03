import React from 'react';
import { useDeviceStore } from '../../store/useDeviceStore';
import {
  Gauge,
  Keyboard,
  Sun,
  Layers,
  Settings2,
  Sliders,
  ChevronDown,
  HelpCircle,
  Usb,
} from 'lucide-react';

export type ActivePage = 'performance' | 'keymap' | 'lighting' | 'profiles' | 'settings';

interface SidebarProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const { deviceInfo, switchProfile } = useDeviceStore();

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'performance', label: 'Performance Settings', icon: <Gauge className="w-4 h-4" /> },
    { id: 'keymap', label: 'Key Change Settings', icon: <Keyboard className="w-4 h-4" /> },
    { id: 'lighting', label: 'Lighting Settings', icon: <Sun className="w-4 h-4" /> },
    { id: 'profiles', label: 'Configuration & Macro', icon: <Layers className="w-4 h-4" /> },
    { id: 'settings', label: 'Other Settings', icon: <Settings2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 border-r border-atk-border bg-atk-surface flex flex-col justify-between select-none">
      <div className="p-4 space-y-6">
        {/* Device Summary Card (Top of sidebar matching ATK screenshot) */}
        <div className="bg-atk-card border border-atk-border rounded-xl p-3.5 space-y-3 shadow-atk-card">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <Usb className="w-3.5 h-3.5 text-atk-orange" />
              Wired USB
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Active
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              DAREU COOL68 HE
            </h2>
            <p className="text-[11px] text-zinc-500 font-mono">
              Hall Effect Magnetic Matrix
            </p>
          </div>

          {/* Profile Quick Selector */}
          <div className="pt-2 border-t border-atk-border/80">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-1.5 block">
              Hardware Profile
            </label>
            <div className="relative">
              <select
                value={deviceInfo?.activeProfile ?? 0}
                onChange={(e) => switchProfile(Number(e.target.value))}
                className="w-full appearance-none bg-atk-hover border border-atk-border text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 pr-8 focus:outline-none focus:border-atk-orange transition-colors cursor-pointer"
              >
                <option value={0}>{deviceInfo?.profileNames?.[0] || 'Profile 1'}</option>
                <option value={1}>{deviceInfo?.profileNames?.[1] || 'Profile 2'}</option>
                <option value={2}>{deviceInfo?.profileNames?.[2] || 'Profile 3'}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <div>
          <div className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 px-2 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-atk-orange" />
            Keyboard Configuration
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectPage(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-atk-hover text-white border-l-2 border-atk-orange shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-atk-hover/60'
                  }`}
                >
                  <span className={`${isActive ? 'text-atk-orange' : 'text-zinc-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-atk-border text-[11px] text-zinc-500 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
            WebHID Wired Channel
          </span>
          <span className="font-mono text-zinc-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
