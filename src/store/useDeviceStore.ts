// Device Connection & Hardware Information Store

import { create } from 'zustand';
import { cool68Service } from '../device/cool68Service';
import { hidTransport } from '../device/hidTransport';
import { DeviceInfo } from '../types/protocol';

interface DeviceState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  deviceInfo: DeviceInfo | null;
  isWebHIDSupported: boolean;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refresh: () => Promise<void>;
  setPollingRate: (hz: number) => Promise<void>;
  setWinLock: (enabled: boolean) => Promise<void>;
  setMacMode: (enabled: boolean) => Promise<void>;
  setAutoCalibrate: (enabled: boolean) => Promise<void>;
  setOverdrive: (enabled: boolean) => Promise<void>;
  switchProfile: (idx: number) => Promise<void>;
  setProfileName: (idx: number, name: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set, get) => {
  // Listen to physical USB disconnect
  hidTransport.addDisconnectListener(() => {
    set({
      status: 'disconnected',
      deviceInfo: null,
      errorMessage: 'Keyboard disconnected from USB',
    });
  });

  return {
    status: 'disconnected',
    errorMessage: null,
    deviceInfo: null,
    isWebHIDSupported: hidTransport.isSupported(),

    connect: async () => {
      set({ status: 'connecting', errorMessage: null });
      try {
        const info = await cool68Service.connect();
        set({ status: 'connected', deviceInfo: info, errorMessage: null });
      } catch (err: any) {
        console.error('Connection failed:', err);
        set({
          status: 'error',
          errorMessage: err.message || 'Failed to connect to DAREU COOL68. Ensure the device is plugged in via USB and no other vendor software is holding the connection.',
        });
      }
    },

    disconnect: async () => {
      try {
        await cool68Service.disconnect();
      } finally {
        set({ status: 'disconnected', deviceInfo: null, errorMessage: null });
      }
    },

    refresh: async () => {
      if (get().status !== 'connected') return;
      try {
        const info = await cool68Service.fetchDeviceInfo();
        set({ deviceInfo: info });
      } catch (err: any) {
        console.warn('Failed to refresh device info:', err);
      }
    },

    setPollingRate: async (hz: number) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setPollingRate(hz);
      set({ deviceInfo: { ...current, pollingRateHz: hz } });
    },

    setWinLock: async (enabled: boolean) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setWinLock(enabled);
      set({ deviceInfo: { ...current, winLock: enabled } });
    },

    setMacMode: async (enabled: boolean) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setMacMode(enabled);
      set({ deviceInfo: { ...current, macMode: enabled } });
    },

    setAutoCalibrate: async (enabled: boolean) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setAutoCalibrate(enabled);
      set({ deviceInfo: { ...current, autoCalibrate: enabled } });
    },

    setOverdrive: async (enabled: boolean) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setOverdrive(enabled);
      set({ deviceInfo: { ...current, overdrive: enabled } });
    },

    switchProfile: async (idx: number) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.switchProfile(idx);
      set({ deviceInfo: { ...current, activeProfile: idx } });
    },

    setProfileName: async (idx: number, name: string) => {
      const current = get().deviceInfo;
      if (!current) return;
      await cool68Service.setProfileName(idx, name);
      const names = [...current.profileNames];
      names[idx] = name;
      set({ deviceInfo: { ...current, profileNames: names } });
    },
  };
});
