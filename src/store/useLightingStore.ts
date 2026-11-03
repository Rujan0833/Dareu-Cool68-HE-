// Lighting & RGB Configuration Store

import { create } from 'zustand';
import { cool68Service } from '../device/cool68Service';
import { LightConfig, SideLightConfig } from '../types/protocol';
import { KEY_POSITION_LIST } from '../protocol/keyCodes';

interface LightingState {
  backlight: LightConfig;
  sideLight: SideLightConfig;
  perKeyColors: Record<number, { r: number; g: number; b: number }>;
  activeBrushColor: { r: number; g: number; b: number };
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  loadLighting: () => Promise<void>;
  setBacklight: (patch: Partial<LightConfig>) => Promise<void>;
  setSideLight: (patch: Partial<SideLightConfig>) => Promise<void>;
  setActiveBrushColor: (color: { r: number; g: number; b: number }) => void;
  paintKeyColor: (pos: number) => Promise<void>;
  fillAllKeys: (color: { r: number; g: number; b: number }) => Promise<void>;
  applyPerKeyColors: () => Promise<void>;
}

export const useLightingStore = create<LightingState>((set, get) => ({
  backlight: {
    mode: 1, // Always on
    mix: false,
    mixMask: 0,
    r: 255,
    g: 92,
    b: 0, // ATK Blaze Orange default
    brightness: 18,
    speed: 2,
  },
  sideLight: {
    mode: 1,
    mix: false,
    r: 255,
    g: 92,
    b: 0,
    brightness: 16,
    speed: 2,
  },
  perKeyColors: {},
  activeBrushColor: { r: 255, g: 92, b: 0 },
  isLoading: false,
  isSaving: false,

  loadLighting: async () => {
    set({ isLoading: true });
    try {
      const [bl, sl] = await Promise.all([
        cool68Service.getLight(),
        cool68Service.getSideLight(),
      ]);
      set({ backlight: bl, sideLight: sl });
    } catch (e) {
      console.error('Failed to load lighting from device:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setBacklight: async (patch) => {
    const updated = { ...get().backlight, ...patch };
    set({ backlight: updated, isSaving: true });
    try {
      await cool68Service.setLight(patch);
    } finally {
      set({ isSaving: false });
    }
  },

  setSideLight: async (patch) => {
    const updated = { ...get().sideLight, ...patch };
    set({ sideLight: updated, isSaving: true });
    try {
      await cool68Service.setSideLight(patch);
    } finally {
      set({ isSaving: false });
    }
  },

  setActiveBrushColor: (color) => set({ activeBrushColor: color }),

  paintKeyColor: async (pos: number) => {
    const color = get().activeBrushColor;
    const newColors = { ...get().perKeyColors, [pos]: color };
    set({ perKeyColors: newColors });

    // If currently in custom mode, write to keyboard
    if (get().backlight.mode === 19) {
      try {
        await cool68Service.setPerKeyColors({ [pos]: color });
      } catch (e) {
        console.warn('Failed to paint key:', e);
      }
    }
  },

  fillAllKeys: async (color) => {
    const newColors: Record<number, { r: number; g: number; b: number }> = {};
    KEY_POSITION_LIST.forEach(pos => { newColors[pos] = color; });
    set({ perKeyColors: newColors });

    if (get().backlight.mode === 19) {
      set({ isSaving: true });
      try {
        await cool68Service.setPerKeyColors(newColors);
      } finally {
        set({ isSaving: false });
      }
    }
  },

  applyPerKeyColors: async () => {
    set({ isSaving: true });
    try {
      // Must ensure mode is 19 first
      if (get().backlight.mode !== 19) {
        await cool68Service.setLight({ mode: 19 });
        set({ backlight: { ...get().backlight, mode: 19 } });
      }
      await cool68Service.setPerKeyColors(get().perKeyColors);
    } finally {
      set({ isSaving: false });
    }
  },
}));
