// Keymap Layer Management & Remapping Store

import { create } from 'zustand';
import { cool68Service } from '../device/cool68Service';
import {
  FACTORY_KEYMAP_LAYER_0,
  FACTORY_KEYMAP_LAYER_1,
  COOL68_KEYS,
} from '../protocol/keyCodes';

interface KeymapState {
  currentLayer: number; // 0 = standard, 1 = fn layer, 2 = layer 2
  layer0: Record<number, number>;
  layer1: Record<number, number>;
  layer2: Record<number, number>;
  selectedPos: number | null;
  isLoading: boolean;
  isSaving: boolean;
  rebindModalOpen: boolean;

  // Actions
  setLayer: (layer: number) => void;
  setSelectedPos: (pos: number | null) => void;
  openRebindModal: (pos: number) => void;
  closeRebindModal: () => void;
  loadKeymaps: () => Promise<void>;
  bindKey: (pos: number, code: number) => Promise<void>;
  restoreCurrentLayerDefaults: () => Promise<void>;
}

export const useKeymapStore = create<KeymapState>((set, get) => ({
  currentLayer: 0,
  layer0: { ...FACTORY_KEYMAP_LAYER_0 },
  layer1: { ...FACTORY_KEYMAP_LAYER_1 },
  layer2: { ...FACTORY_KEYMAP_LAYER_0 },
  selectedPos: null,
  isLoading: false,
  isSaving: false,
  rebindModalOpen: false,

  setLayer: (layer) => set({ currentLayer: layer }),
  setSelectedPos: (pos) => set({ selectedPos: pos }),
  openRebindModal: (pos) => set({ selectedPos: pos, rebindModalOpen: true }),
  closeRebindModal: () => set({ rebindModalOpen: false }),

  loadKeymaps: async () => {
    set({ isLoading: true });
    try {
      const [l0, l1] = await Promise.all([
        cool68Service.getKeymap(0),
        cool68Service.getKeymap(1),
      ]);
      set({
        layer0: Object.keys(l0).length > 0 ? l0 : { ...FACTORY_KEYMAP_LAYER_0 },
        layer1: Object.keys(l1).length > 0 ? l1 : { ...FACTORY_KEYMAP_LAYER_1 },
      });
    } catch (e) {
      console.error('Failed to load keymaps from device:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  bindKey: async (pos: number, code: number) => {
    const { currentLayer } = get();
    set({ isSaving: true });
    try {
      await cool68Service.setKeys(currentLayer, { [pos]: code });
      if (currentLayer === 0) {
        set({ layer0: { ...get().layer0, [pos]: code }, rebindModalOpen: false });
      } else if (currentLayer === 1) {
        set({ layer1: { ...get().layer1, [pos]: code }, rebindModalOpen: false });
      } else {
        set({ layer2: { ...get().layer2, [pos]: code }, rebindModalOpen: false });
      }
    } finally {
      set({ isSaving: false });
    }
  },

  restoreCurrentLayerDefaults: async () => {
    const { currentLayer } = get();
    set({ isSaving: true });
    try {
      await cool68Service.restoreLayer(currentLayer);
      if (currentLayer === 1) {
        set({ layer1: { ...FACTORY_KEYMAP_LAYER_1 } });
      } else {
        set({ layer0: { ...FACTORY_KEYMAP_LAYER_0 } });
      }
    } finally {
      set({ isSaving: false });
    }
  },
}));
