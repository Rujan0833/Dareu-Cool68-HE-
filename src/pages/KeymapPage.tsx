import React, { useEffect } from 'react';
import { useKeymapStore } from '../store/useKeymapStore';
import { KeyboardVisualizer } from '../components/keyboard/KeyboardVisualizer';
import { RebindModal } from '../components/keyboard/RebindModal';
import { Keyboard, RotateCcw, Layers } from 'lucide-react';

export const KeymapPage: React.FC = () => {
  const {
    currentLayer,
    setLayer,
    loadKeymaps,
    openRebindModal,
    restoreCurrentLayerDefaults,
    isSaving,
    isLoading,
  } = useKeymapStore();

  useEffect(() => {
    loadKeymaps();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none flex flex-col justify-between min-h-[calc(100vh-100px)]">
      <div className="space-y-4">
        {/* Header & Layer Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-atk-orange" />
              Key Change & Remap Settings
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any key below to assign custom keys, shortcuts, modifiers, media controls, or mouse actions.
            </p>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center gap-1 bg-atk-card border border-atk-border p-1 rounded-xl self-start sm:self-auto">
            <span className="text-[11px] font-mono text-zinc-500 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-atk-orange" />
              Layer:
            </span>
            <button
              onClick={() => setLayer(0)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentLayer === 0
                  ? 'bg-atk-orange text-white shadow-atk-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Layer 0 (Base)
            </button>
            <button
              onClick={() => setLayer(1)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentLayer === 1
                  ? 'bg-atk-orange text-white shadow-atk-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Layer 1 (Fn)
            </button>
            <button
              onClick={() => setLayer(2)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentLayer === 2
                  ? 'bg-atk-orange text-white shadow-atk-glow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Layer 2
            </button>
          </div>
        </div>

        {/* 68-Key Visualizer in Keymap Mode */}
        <div className="pt-2">
          <KeyboardVisualizer
            mode="keymap"
            onKeyClick={(pos: number) => openRebindModal(pos)}
          />
        </div>
      </div>

      {/* Bottom Center: Restore Default Button */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2">
        <button
          onClick={() => restoreCurrentLayerDefaults()}
          disabled={isSaving || isLoading}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-atk-card hover:bg-atk-hover border border-atk-border text-zinc-200 hover:text-white text-xs font-bold tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-atk-orange" />
          <span>Restore Default</span>
        </button>
        <span className="text-[11px] text-zinc-500 font-mono">
          Restores factory firmware mappings for current {currentLayer === 1 ? 'Fn Layer' : 'Base Layer'}
        </span>
      </div>

      {/* Rebind Modal */}
      <RebindModal />
    </div>
  );
};
