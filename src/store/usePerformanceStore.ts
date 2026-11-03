// Hall Effect Performance & Live Travel Store

import { create } from 'zustand';
import { cool68Service } from '../device/cool68Service';
import {
  KeyActuation,
  RapidTriggerConfig,
  DeadZoneConfig,
  LiveKeyReading,
} from '../types/protocol';
import { KEY_POSITION_LIST } from '../protocol/keyCodes';

interface PerformanceState {
  isLoading: boolean;
  isSaving: boolean;
  selectedKeyPos: number | null; // null = global mode
  
  // Global settings
  globalActuationMm: number;
  globalRtEnabled: boolean;
  globalRtPressMm: number;
  globalRtReleaseMm: number;
  globalDeadZoneTopMm: number;
  globalDeadZoneBottomMm: number;

  // Per-key dictionaries
  perKeyActuation: Record<number, KeyActuation>;
  perKeyRt: Record<number, RapidTriggerConfig>;
  perKeyDeadZone: Record<number, DeadZoneConfig>;

  // Real-time travel streaming
  isLiveTracking: boolean;
  liveReadings: Record<number, LiveKeyReading>;
  liveStopFn: (() => void) | null;

  // Actions
  setSelectedKeyPos: (pos: number | null) => void;
  loadHardwareSettings: () => Promise<void>;
  applyGlobalActuation: (distanceMm: number) => Promise<void>;
  applyPerKeyActuation: (pos: number, distanceMm: number) => Promise<void>;
  applyGlobalRt: (enable: boolean, pressMm: number, releaseMm: number) => Promise<void>;
  applyPerKeyRt: (pos: number, enable: boolean, pressMm: number, releaseMm: number) => Promise<void>;
  applyGlobalDeadZone: (topMm: number, bottomMm: number) => Promise<void>;
  applyPerKeyDeadZone: (pos: number, topMm: number, bottomMm: number, enable: boolean) => Promise<void>;
  startLiveMonitoring: (keys?: number[]) => Promise<void>;
  stopLiveMonitoring: () => Promise<void>;
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  isLoading: false,
  isSaving: false,
  selectedKeyPos: null,

  globalActuationMm: 2.0,
  globalRtEnabled: true,
  globalRtPressMm: 0.2,
  globalRtReleaseMm: 0.2,
  globalDeadZoneTopMm: 0.05,
  globalDeadZoneBottomMm: 0.05,

  perKeyActuation: {},
  perKeyRt: {},
  perKeyDeadZone: {},

  isLiveTracking: false,
  liveReadings: {},
  liveStopFn: null,

  setSelectedKeyPos: (pos) => set({ selectedKeyPos: pos }),

  loadHardwareSettings: async () => {
    set({ isLoading: true });
    try {
      const [travel, rt, safe] = await Promise.all([
        cool68Service.getTravel(),
        cool68Service.getRapidTrigger(),
        cool68Service.getSafeArea(),
      ]);

      // Calculate reasonable global defaults from readings
      const firstTravel = Object.values(travel)[0]?.distanceMm || 2.0;
      const firstRt = Object.values(rt)[0];
      const firstSafe = Object.values(safe)[0];

      set({
        perKeyActuation: travel,
        perKeyRt: rt,
        perKeyDeadZone: safe,
        globalActuationMm: firstTravel,
        globalRtEnabled: firstRt?.enable ?? true,
        globalRtPressMm: firstRt?.pressSensitivityMm ?? 0.2,
        globalRtReleaseMm: firstRt?.releaseSensitivityMm ?? 0.2,
        globalDeadZoneTopMm: firstSafe?.topMm ?? 0.05,
        globalDeadZoneBottomMm: firstSafe?.bottomMm ?? 0.05,
      });
    } catch (e) {
      console.error('Failed to load performance settings:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  applyGlobalActuation: async (distanceMm: number) => {
    set({ isSaving: true, globalActuationMm: distanceMm });
    try {
      const updates = KEY_POSITION_LIST.map(pos => ({
        pos,
        distanceMm,
        useGlobal: true,
      }));
      await cool68Service.setTravel(updates);
      
      const newMap = { ...get().perKeyActuation };
      updates.forEach(u => {
        newMap[u.pos] = {
          pos: u.pos,
          distanceMm,
          distanceUm: Math.round(distanceMm * 1000),
          useGlobal: true,
        };
      });
      set({ perKeyActuation: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  applyPerKeyActuation: async (pos: number, distanceMm: number) => {
    set({ isSaving: true });
    try {
      await cool68Service.setTravel([{ pos, distanceMm, useGlobal: false }]);
      const newMap = { ...get().perKeyActuation };
      newMap[pos] = {
        pos,
        distanceMm,
        distanceUm: Math.round(distanceMm * 1000),
        useGlobal: false,
      };
      set({ perKeyActuation: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  applyGlobalRt: async (enable: boolean, pressMm: number, releaseMm: number) => {
    set({ isSaving: true, globalRtEnabled: enable, globalRtPressMm: pressMm, globalRtReleaseMm: releaseMm });
    try {
      const configs: RapidTriggerConfig[] = KEY_POSITION_LIST.map(pos => ({
        pos,
        enable,
        pressSensitivityMm: pressMm,
        releaseSensitivityMm: releaseMm,
        rawUp: 0,
        rawDown: 0,
        useGlobal: true,
      }));
      await cool68Service.setRapidTrigger(configs);

      const newMap = { ...get().perKeyRt };
      configs.forEach(c => { newMap[c.pos] = c; });
      set({ perKeyRt: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  applyPerKeyRt: async (pos: number, enable: boolean, pressMm: number, releaseMm: number) => {
    set({ isSaving: true });
    try {
      const cfg: RapidTriggerConfig = {
        pos,
        enable,
        pressSensitivityMm: pressMm,
        releaseSensitivityMm: releaseMm,
        rawUp: 0,
        rawDown: 0,
        useGlobal: false,
      };
      await cool68Service.setRapidTrigger([cfg]);
      const newMap = { ...get().perKeyRt, [pos]: cfg };
      set({ perKeyRt: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  applyGlobalDeadZone: async (topMm: number, bottomMm: number) => {
    set({ isSaving: true, globalDeadZoneTopMm: topMm, globalDeadZoneBottomMm: bottomMm });
    try {
      const configs: DeadZoneConfig[] = KEY_POSITION_LIST.map(pos => ({
        pos,
        enable: topMm > 0 || bottomMm > 0,
        topMm,
        bottomMm,
        rawUp: 0,
        rawDown: 0,
        useGlobal: true,
      }));
      await cool68Service.setSafeArea(configs);

      const newMap = { ...get().perKeyDeadZone };
      configs.forEach(c => { newMap[c.pos] = c; });
      set({ perKeyDeadZone: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  applyPerKeyDeadZone: async (pos: number, topMm: number, bottomMm: number, enable: boolean) => {
    set({ isSaving: true });
    try {
      const cfg: DeadZoneConfig = {
        pos,
        enable,
        topMm,
        bottomMm,
        rawUp: 0,
        rawDown: 0,
        useGlobal: false,
      };
      await cool68Service.setSafeArea([cfg]);
      const newMap = { ...get().perKeyDeadZone, [pos]: cfg };
      set({ perKeyDeadZone: newMap });
    } finally {
      set({ isSaving: false });
    }
  },

  startLiveMonitoring: async (keys?: number[]) => {
    const existing = get().liveStopFn;
    if (existing) {
      existing();
    }

    // Default to WASD + Space + Enter + Arrows if no keys specified
    const targetKeys = keys && keys.length > 0 ? keys : [29, 43, 44, 45, 70, 54, 76, 75, 77]; // Q, A, S, D, Space, Enter, Left, Down, Right
    
    set({ isLiveTracking: true });
    const stopFn = await cool68Service.startLiveTravel(targetKeys, (reading) => {
      set((state) => ({
        liveReadings: {
          ...state.liveReadings,
          [reading.pos]: reading,
        },
      }));
    });

    set({ liveStopFn: stopFn });
  },

  stopLiveMonitoring: async () => {
    const existing = get().liveStopFn;
    if (existing) {
      existing();
    }
    set({ isLiveTracking: false, liveStopFn: null });
  },
}));
