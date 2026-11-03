// Profiles Store (Onboard Slots + Local JSON Profiles)

import { create } from 'zustand';
import { LocalProfile } from '../types/protocol';
import { FACTORY_KEYMAP_LAYER_0, FACTORY_KEYMAP_LAYER_1 } from '../protocol/keyCodes';

const LOCAL_STORAGE_KEY = 'cool68_local_profiles_v1';

const defaultProfile: LocalProfile = {
  id: 'prof_default',
  name: 'Esports Gaming',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pollingRateHz: 1000,
  globalActuationMm: 1.2,
  globalRtEnabled: true,
  globalRtPressMm: 0.15,
  globalRtReleaseMm: 0.15,
  globalDeadZoneTopMm: 0.05,
  globalDeadZoneBottomMm: 0.05,
  perKeyActuation: {},
  perKeyRt: {},
  perKeyDeadZone: {},
  lighting: {
    mode: 1,
    mix: false,
    mixMask: 0,
    r: 255,
    g: 92,
    b: 0,
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
  keymapLayer0: { ...FACTORY_KEYMAP_LAYER_0 },
  keymapLayer1: { ...FACTORY_KEYMAP_LAYER_1 },
};

function loadStoredProfiles(): LocalProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [defaultProfile];
}

interface ProfileState {
  profiles: LocalProfile[];
  activeProfileId: string;

  // Actions
  createProfile: (name: string) => LocalProfile;
  duplicateProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setActiveProfileId: (id: string) => void;
  exportProfileAsJson: (id: string) => void;
  importProfileFromJson: (jsonStr: string) => boolean;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: loadStoredProfiles(),
  activeProfileId: defaultProfile.id,

  createProfile: (name: string) => {
    const newProfile: LocalProfile = {
      ...defaultProfile,
      id: `prof_${Date.now()}`,
      name: name.trim() || 'Untitled Profile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().profiles, newProfile];
    set({ profiles: updated, activeProfileId: newProfile.id });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return newProfile;
  },

  duplicateProfile: (id: string) => {
    const target = get().profiles.find(p => p.id === id);
    if (!target) return;
    const duplicated: LocalProfile = {
      ...JSON.parse(JSON.stringify(target)),
      id: `prof_${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...get().profiles, duplicated];
    set({ profiles: updated, activeProfileId: duplicated.id });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  deleteProfile: (id: string) => {
    const remaining = get().profiles.filter(p => p.id !== id);
    if (remaining.length === 0) return; // Must keep at least one
    const newActive = get().activeProfileId === id ? remaining[0].id : get().activeProfileId;
    set({ profiles: remaining, activeProfileId: newActive });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining));
  },

  renameProfile: (id: string, name: string) => {
    const updated = get().profiles.map(p =>
      p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: new Date().toISOString() } : p
    );
    set({ profiles: updated });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  setActiveProfileId: (id: string) => set({ activeProfileId: id }),

  exportProfileAsJson: (id: string) => {
    const target = get().profiles.find(p => p.id === id);
    if (!target) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(target, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${target.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importProfileFromJson: (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.name || typeof parsed !== 'object') return false;
      const imported: LocalProfile = {
        ...defaultProfile,
        ...parsed,
        id: `prof_${Date.now()}`,
        name: `${parsed.name} (Imported)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...get().profiles, imported];
      set({ profiles: updated, activeProfileId: imported.id });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },
}));
