import React, { useState } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDeviceStore } from '../store/useDeviceStore';
import { usePerformanceStore } from '../store/usePerformanceStore';
import { useLightingStore } from '../store/useLightingStore';
import {
  Layers,
  HardDrive,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit2,
  Plus,
  Check,
  Send,
} from 'lucide-react';

export const ProfilesPage: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    createProfile,
    duplicateProfile,
    deleteProfile,
    renameProfile,
    setActiveProfileId,
    exportProfileAsJson,
    importProfileFromJson,
  } = useProfileStore();

  const { deviceInfo, switchProfile, setProfileName } = useDeviceStore();
  const { applyGlobalActuation, applyGlobalRt, applyGlobalDeadZone } = usePerformanceStore();
  const { setBacklight } = useLightingStore();

  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [hardwareEditSlot, setHardwareEditSlot] = useState<number | null>(null);
  const [hardwareSlotName, setHardwareSlotName] = useState('');

  const activeProfile = profiles.find((p: any) => p.id === activeProfileId) || profiles[0];

  const handleApplyToHardware = async () => {
    if (!activeProfile) return;
    try {
      await applyGlobalActuation(activeProfile.globalActuationMm);
      await applyGlobalRt(
        activeProfile.globalRtEnabled,
        activeProfile.globalRtPressMm,
        activeProfile.globalRtReleaseMm
      );
      await applyGlobalDeadZone(
        activeProfile.globalDeadZoneTopMm,
        activeProfile.globalDeadZoneBottomMm
      );
      await setBacklight(activeProfile.lighting);
      alert(`Applied "${activeProfile.name}" settings to keyboard memory.`);
    } catch (err: any) {
      alert(`Failed to apply profile: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importProfileFromJson(content);
        if (ok) {
          alert('Profile imported successfully!');
        } else {
          alert('Invalid profile JSON file format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-atk-orange" />
            Profile & Configuration Management
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage 3 physical onboard keyboard slots or save unlimited local configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atk-card hover:bg-atk-hover border border-atk-border text-xs text-zinc-300 cursor-pointer font-medium transition-colors">
            <Upload className="w-3.5 h-3.5 text-atk-orange" />
            <span>Import Profile</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Section 1: Onboard Hardware Memory Slots */}
      <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Physical Onboard Keyboard Memory</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((slotIdx) => {
            const isActive = deviceInfo?.activeProfile === slotIdx;
            const slotName = deviceInfo?.profileNames?.[slotIdx] || `Profile ${slotIdx + 1}`;
            const isEditing = hardwareEditSlot === slotIdx;

            return (
              <div
                key={slotIdx}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isActive
                    ? 'border-atk-orange bg-atk-surface shadow-atk-glow'
                    : 'border-atk-border bg-atk-surface/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-500">Slot {slotIdx + 1}</span>
                  {isActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atk-orange/20 text-atk-orange border border-atk-orange/30 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={hardwareSlotName}
                        onChange={(e) => setHardwareSlotName(e.target.value)}
                        className="bg-atk-hover border border-atk-border text-xs px-2 py-1 rounded text-white flex-1"
                      />
                      <button
                        onClick={() => {
                          setProfileName(slotIdx, hardwareSlotName);
                          setHardwareEditSlot(null);
                        }}
                        className="p-1 bg-atk-orange rounded text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{slotName}</h4>
                      <button
                        onClick={() => {
                          setHardwareEditSlot(slotIdx);
                          setHardwareSlotName(slotName);
                        }}
                        className="text-zinc-500 hover:text-zinc-300"
                        title="Rename slot"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => switchProfile(slotIdx)}
                  disabled={isActive}
                  className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-atk-hover text-zinc-500 cursor-default'
                      : 'bg-atk-hover hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {isActive ? 'Current Slot' : 'Activate Onboard Slot'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Local App Profiles Library */}
      <div className="bg-atk-card border border-atk-border rounded-2xl p-5 space-y-4 shadow-atk-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Local Profile Library</h3>
            <p className="text-xs text-zinc-400">
              Save customized gaming profiles locally or export them to share.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New profile name..."
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="bg-atk-surface border border-atk-border text-xs px-3 py-1.5 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-atk-orange"
            />
            <button
              onClick={() => {
                if (newProfileName.trim()) {
                  createProfile(newProfileName);
                  setNewProfileName('');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-atk-orange hover:bg-atk-orange-hover text-white text-xs font-bold transition-all shadow-atk-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profiles.map((p: any) => {
            const isSelected = p.id === activeProfileId;
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isSelected
                    ? 'border-atk-orange bg-atk-surface shadow-atk-glow'
                    : 'border-atk-border bg-atk-surface/40 hover:bg-atk-surface/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-atk-hover border border-atk-border text-xs px-2 py-1 rounded text-white"
                        />
                        <button
                          onClick={() => {
                            renameProfile(p.id, editName);
                            setEditingId(null);
                          }}
                          className="p-1 bg-atk-orange rounded text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-bold text-white">{p.name}</h4>
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setEditName(p.name);
                          }}
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-atk-orange/20 text-atk-orange border border-atk-orange/30 font-bold">
                      SELECTED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-zinc-400 bg-atk-card p-2 rounded-lg border border-atk-border/80">
                  <div>Actuation: <span className="text-zinc-200">{p.globalActuationMm}mm</span></div>
                  <div>RT: <span className="text-zinc-200">{p.globalRtEnabled ? `${p.globalRtPressMm}mm` : 'OFF'}</span></div>
                  <div>Deadzone: <span className="text-zinc-200">{p.globalDeadZoneTopMm}mm</span></div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-atk-border/60">
                  <button
                    onClick={() => setActiveProfileId(p.id)}
                    className="text-xs font-semibold text-atk-orange hover:underline cursor-pointer"
                  >
                    Select Profile
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => duplicateProfile(p.id)}
                      className="p-1.5 rounded-lg hover:bg-atk-hover text-zinc-400 hover:text-zinc-200"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => exportProfileAsJson(p.id)}
                      className="p-1.5 rounded-lg hover:bg-atk-hover text-zinc-400 hover:text-zinc-200"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => deleteProfile(p.id)}
                        className="p-1.5 rounded-lg hover:bg-atk-hover text-zinc-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apply Active Profile to Keyboard */}
        <div className="pt-4 border-t border-atk-border flex justify-end">
          <button
            onClick={handleApplyToHardware}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-atk-orange to-amber-500 hover:from-atk-orange-hover hover:to-amber-400 text-white font-bold text-xs tracking-wider shadow-atk-glow transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Flash "{activeProfile?.name}" to Keyboard Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
