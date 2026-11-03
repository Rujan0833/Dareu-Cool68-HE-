import React from 'react';
import { COOL68_KEYS, lookupKeyLabel } from '../../protocol/keyCodes';
import { usePerformanceStore } from '../../store/usePerformanceStore';
import { useKeymapStore } from '../../store/useKeymapStore';
import { useLightingStore } from '../../store/useLightingStore';

interface KeyboardVisualizerProps {
  mode: 'performance' | 'keymap' | 'lighting';
  onKeyClick?: (pos: number) => void;
  selectedPos?: number | null;
}

export const KeyboardVisualizer: React.FC<KeyboardVisualizerProps> = ({
  mode,
  onKeyClick,
  selectedPos,
}) => {
  const { perKeyActuation, perKeyRt, liveReadings, globalActuationMm, globalRtEnabled } = usePerformanceStore();
  const { currentLayer, layer0, layer1, layer2 } = useKeymapStore();
  const { backlight, perKeyColors } = useLightingStore();

  const activeLayerMap = currentLayer === 1 ? layer1 : currentLayer === 2 ? layer2 : layer0;

  // Group keys by row 0..4
  const rows = [0, 1, 2, 3, 4].map(rowIndex =>
    COOL68_KEYS.filter(k => k.row === rowIndex)
  );

  return (
    <div className="w-full bg-atk-surface/80 border border-atk-border rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm select-none">
      {/* Keyboard Case Simulation */}
      <div className="bg-[#121217] border-2 border-[#202028] rounded-xl p-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] mx-auto max-w-5xl">
        <div className="space-y-2">
          {rows.map((rowKeys, rowIdx) => (
            <div key={rowIdx} className="flex gap-1.5 justify-start">
              {rowKeys.map(key => {
                const isSelected = selectedPos === key.pos;
                const reading = liveReadings[key.pos];
                const actuation = perKeyActuation[key.pos];
                const rt = perKeyRt[key.pos];

                const actuationMm = actuation?.useGlobal ? globalActuationMm : actuation?.distanceMm ?? globalActuationMm;
                const rtActive = rt?.useGlobal ? globalRtEnabled : rt?.enable ?? globalRtEnabled;

                // Key width styling multiplier (base unit = 52px)
                const widthStyle = {
                  flexGrow: key.width || 1,
                  minWidth: `${(key.width || 1) * 44}px`,
                  maxWidth: `${(key.width || 1) * 72}px`,
                };

                // Dynamic background for lighting mode
                let bgStyle: React.CSSProperties = {};
                let glowStyle: React.CSSProperties = {};
                if (mode === 'lighting') {
                  const keyColor = perKeyColors[key.pos] || { r: backlight.r, g: backlight.g, b: backlight.b };
                  if (backlight.mode !== 0) {
                    const alpha = backlight.brightness / 20;
                    glowStyle = {
                      boxShadow: `0 0 12px rgba(${keyColor.r}, ${keyColor.g}, ${keyColor.b}, ${alpha * 0.7})`,
                    };
                    bgStyle = {
                      borderColor: `rgba(${keyColor.r}, ${keyColor.g}, ${keyColor.b}, 0.6)`,
                    };
                  }
                }

                // Dynamic live travel depression
                const travelPercent = reading ? Math.min(100, Math.max(0, (reading.distanceMm / 4.0) * 100)) : 0;

                // Mapped key label
                const mappedCode = activeLayerMap[key.pos];
                const mappedLabel = mappedCode !== undefined ? lookupKeyLabel(mappedCode) : key.label;

                return (
                  <button
                    key={key.pos}
                    onClick={() => onKeyClick && onKeyClick(key.pos)}
                    style={{ ...widthStyle, ...bgStyle, ...glowStyle }}
                    className={`h-12 relative flex flex-col justify-between p-1.5 rounded-lg border transition-all text-left overflow-hidden group ${
                      isSelected
                        ? 'border-atk-orange bg-atk-orange/20 shadow-atk-glow scale-[1.03] z-10'
                        : reading?.pressed
                        ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_10px_#f59e0b]'
                        : 'border-[#282833] bg-[#181822] hover:border-zinc-500 hover:bg-[#20202e]'
                    }`}
                  >
                    {/* Live Travel Depth Bar (shows physical travel live as user presses key) */}
                    {mode === 'performance' && reading && reading.distanceMm > 0.05 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-atk-orange/60 to-transparent transition-all duration-75 pointer-events-none"
                        style={{ height: `${travelPercent}%` }}
                      />
                    )}

                    {/* Top Row: Key Label / Sublabel */}
                    <div className="flex items-center justify-between w-full z-10">
                      <span className="font-semibold text-xs tracking-tight text-zinc-100 group-hover:text-white truncate">
                        {mode === 'keymap' ? mappedLabel : key.label}
                      </span>
                      {key.sublabel && mode !== 'performance' && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {key.sublabel}
                        </span>
                      )}
                      {mode === 'performance' && rtActive && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-atk-orange/20 text-atk-orange border border-atk-orange/30">
                          RT
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Mode-specific Metadata */}
                    <div className="flex items-center justify-between w-full z-10 text-[10px] font-mono">
                      {mode === 'performance' && (
                        <>
                          <span className={`${reading?.pressed ? 'text-amber-300 font-bold' : 'text-zinc-500'}`}>
                            {reading ? `${reading.distanceMm.toFixed(2)}mm` : `${actuationMm.toFixed(1)}mm`}
                          </span>
                          {reading?.pressed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                          )}
                        </>
                      )}

                      {mode === 'lighting' && (
                        <span className="w-2 h-2 rounded-full border border-white/40 ml-auto"
                          style={{
                            backgroundColor: `rgb(${
                              perKeyColors[key.pos]?.r ?? backlight.r
                            }, ${perKeyColors[key.pos]?.g ?? backlight.g}, ${
                              perKeyColors[key.pos]?.b ?? backlight.b
                            })`,
                          }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
