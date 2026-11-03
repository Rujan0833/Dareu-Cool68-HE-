import React, { useState } from 'react';
import { useKeymapStore } from '../../store/useKeymapStore';
import { COOL68_KEYS, REMAP_CATEGORIES, lookupKeyLabel } from '../../protocol/keyCodes';
import { X, RotateCcw, Search } from 'lucide-react';

export const RebindModal: React.FC = () => {
  const { rebindModalOpen, selectedPos, closeRebindModal, bindKey, currentLayer, layer0, layer1, layer2 } = useKeymapStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Standard Keys');
  const [searchQuery, setSearchQuery] = useState('');

  if (!rebindModalOpen || selectedPos === null) return null;

  const keyDef = COOL68_KEYS.find(k => k.pos === selectedPos);
  const activeMap = currentLayer === 1 ? layer1 : currentLayer === 2 ? layer2 : layer0;
  const currentCode = activeMap[selectedPos];

  const currentCategoryObj = REMAP_CATEGORIES.find(c => c.name === selectedCategory);
  const filteredOptions = (currentCategoryObj?.options || []).filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-atk-card border border-atk-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-atk-border flex items-center justify-between bg-atk-surface">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Remap Key:</span>
              <span className="px-2 py-0.5 rounded bg-atk-hover border border-atk-border font-mono text-atk-orange">
                {keyDef?.label || `Key #${selectedPos}`}
              </span>
              <span className="text-xs text-zinc-400 font-normal">
                (Layer {currentLayer === 1 ? '1 — Fn' : currentLayer})
              </span>
            </h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Current Function: <span className="text-zinc-300 font-semibold">{currentCode !== undefined ? lookupKeyLabel(currentCode) : 'Default'}</span>
            </p>
          </div>
          <button
            onClick={closeRebindModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-atk-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="p-3 border-b border-atk-border bg-atk-card/50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            {REMAP_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-atk-orange text-white shadow-atk-glow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-atk-hover'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-atk-surface border border-atk-border text-xs rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-atk-orange"
            />
          </div>
        </div>

        {/* Options Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 flex-1">
          {filteredOptions.map(opt => (
            <button
              key={opt.code}
              onClick={() => bindKey(selectedPos, opt.code)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                currentCode === opt.code
                  ? 'border-atk-orange bg-atk-orange/15 text-white font-semibold shadow-atk-glow'
                  : 'border-atk-border bg-atk-surface hover:border-zinc-500 hover:bg-atk-hover text-zinc-300'
              }`}
            >
              <span className="text-xs truncate">{opt.label}</span>
              <span className="text-[10px] font-mono text-zinc-500 mt-1">
                0x{opt.code.toString(16).toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* Footer with Reset */}
        <div className="p-3 border-t border-atk-border bg-atk-surface flex items-center justify-between">
          <button
            onClick={() => {
              if (keyDef) {
                // Restore default for this specific key
                bindKey(selectedPos, 0x00000004); // Default fallback
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-atk-border text-xs text-zinc-400 hover:text-white hover:bg-atk-hover transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={closeRebindModal}
            className="px-4 py-1.5 rounded-lg bg-atk-hover hover:bg-zinc-700 text-xs text-zinc-300 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
