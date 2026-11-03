import React, { useEffect, useState } from 'react';
import { useLightingStore } from '../store/useLightingStore';
import { KeyboardVisualizer } from '../components/keyboard/KeyboardVisualizer';
import { LIGHT_MODES } from '../protocol/constants';
import { Sun, Palette, Sparkles, Paintbrush, Sliders } from 'lucide-react';

export const LightingPage: React.FC = () => {
  const {
    backlight,
    sideLight,
    setBacklight,
    setSideLight,
    loadLighting,
    activeBrushColor,
    setActiveBrushColor,
    paintKeyColor,
    fillAllKeys,
    applyPerKeyColors,
    isSaving,
  } = useLightingStore();

  const [hexColor, setHexColor] = useState('#FF5C00');

  useEffect(() => {
    loadLighting();
  }, []);

  const colorPresets = [
    { label: 'ATK Blaze', hex: '#FF5C00', r: 255, g: 92, b: 0 },
    { label: 'Cyan Cyber', hex: '#00E5FF', r: 0, g: 229, b: 255 },
    { label: 'Toxic Green', hex: '#00FF66', r: 0, g: 255, b: 102 },
    { label: 'Neon Purple', hex: '#A855F7', r: 168, g: 85, b: 247 },
    { label: 'Hot Pink', hex: '#EC4899', r: 236, g: 72, b: 153 },
    { label: 'Ice White', hex: '#FFFFFF', r: 255, g: 255, b: 255 },
    { label: 'Deep Blue', hex: '#3B82F6', r: 59, g: 130, b: 246 },
    { label: 'Solar Gold', hex: '#F59E0B', r: 245, g: 158, b: 11 },
  ];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexColor(val);
    const r = parseInt(val.slice(1, 3), 16) || 0;
    const g = parseInt(val.slice(3, 5), 16) || 0;
    const b = parseInt(val.slice(5, 7), 16) || 0;
    setBacklight({ r, g, b, mix: false });
    setActiveBrushColor({ r, g, b });
  };

  const handleSelectPreset = (p: typeof colorPresets[0]) => {
    setHexColor(p.hex);
    setBacklight({ r: p.r, g: p.g, b: p.b, mix: false });
    setActiveBrushColor({ r: p.r, g: p.g, b: p.b });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Visualizer in Lighting Mode */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-atk-orange" />
            <h1 className="text-base font-extrabold text-white tracking-wide">
              RGB Backlight & Side Light
            </h1>
          </div>
          {backlight.mode === 19 && (
            <span className="text-xs font-mono text-atk-orange bg-atk-orange/10 px-2 py-0.5 rounded border border-atk-orange/20">
              Custom Per-Key RGB Mode Active
            </span>
          )}
        </div>

        <KeyboardVisualizer
          mode="lighting"
          onKeyClick={(pos: number) => {
            if (backlight.mode === 19) {
              paintKeyColor(pos);
            }
          }}
        />

        {backlight.mode === 19 && (
          <p className="text-xs text-zinc-400 text-center font-mono">
            Click any keycap above to paint it with the current brush color.
          </p>
        )}
      </div>

      {/* Main Lighting Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Backlight Modes & Colors */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-atk-orange" />
              <h3 className="text-sm font-bold text-white">Backlight Effect</h3>
            </div>

            {/* Multicolour toggle */}
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <span>Multicolour</span>
              <input
                type="checkbox"
                checked={backlight.mix}
                onChange={(e) => setBacklight({ mix: e.target.checked })}
                className="rounded bg-zinc-800 border-zinc-600 text-atk-orange focus:ring-atk-orange"
              />
            </label>
          </div>

          {/* Mode Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Effect Preset (20 Hardware Effects)</label>
            <select
              value={backlight.mode}
              onChange={(e) => setBacklight({ mode: Number(e.target.value) })}
              className="w-full bg-atk-surface border border-atk-border rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-atk-orange cursor-pointer"
            >
              {Object.entries(LIGHT_MODES).map(([modeId, name]) => (
                <option key={modeId} value={modeId}>
                  {String(name)}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Color Swatches */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-400" />
                Color Palette
              </span>
              <input
                type="color"
                value={hexColor}
                onChange={handleHexChange}
                className="w-6 h-6 rounded cursor-pointer border border-zinc-700 bg-transparent"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {colorPresets.map((p) => {
                const isSelected = backlight.r === p.r && backlight.g === p.g && backlight.b === p.b && !backlight.mix;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleSelectPreset(p)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-white bg-atk-hover text-white shadow-sm'
                        : 'border-atk-border bg-atk-surface text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: p.hex }}
                    />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Module 2: Brightness, Speed & Sidelight */}
        <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-5 shadow-atk-card">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-atk-orange" />
            <h3 className="text-sm font-bold text-white">Brightness & Speed</h3>
          </div>

          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Brightness</span>
                <span className="font-mono text-atk-orange font-bold">{backlight.brightness} / 20</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={backlight.brightness}
                onChange={(e) => setBacklight({ brightness: Number(e.target.value) })}
                className="w-full accent-atk-orange"
              />
            </div>

            {/* Speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Effect Speed</span>
                <span className="font-mono text-cyan-400 font-bold">{backlight.speed} / 4</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={backlight.speed}
                onChange={(e) => setBacklight({ speed: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Sidelight Settings */}
          <div className="pt-3 border-t border-atk-border space-y-3">
            <h4 className="text-xs font-bold text-zinc-300">Side Light Wing Controls</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500">Side Mode</label>
                <select
                  value={sideLight.mode}
                  onChange={(e) => setSideLight({ mode: Number(e.target.value) })}
                  className="w-full bg-atk-surface border border-atk-border rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                >
                  <option value={0}>Off</option>
                  <option value={1}>Always On</option>
                  <option value={2}>Breathing</option>
                  <option value={3}>Wave / Stream</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-500">Side Brightness</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={sideLight.brightness}
                  onChange={(e) => setSideLight({ brightness: Number(e.target.value) })}
                  className="w-full accent-atk-orange mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module 3: Custom Per-Key RGB Painter (Mode 19) */}
      <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-atk-orange" />
            <div>
              <h3 className="text-sm font-bold text-white">Per-Key Color Painter (Mode 19)</h3>
              <p className="text-xs text-zinc-400">
                Paint individual keys with custom colors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBacklight({ mode: 19 });
                fillAllKeys(activeBrushColor);
              }}
              className="px-3 py-1.5 rounded-lg bg-atk-hover hover:bg-zinc-700 text-xs text-zinc-200 border border-atk-border transition-colors font-medium"
            >
              Fill All Keys
            </button>

            <button
              onClick={() => applyPerKeyColors()}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-atk-orange to-amber-500 hover:from-atk-orange-hover hover:to-amber-400 text-white text-xs font-bold shadow-atk-glow transition-all"
            >
              Save Custom Colors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
