// DAREU COOL68 HE Protocol & Device Types

export interface DeviceInfo {
  firmwareVersion: string; // e.g. "0x0124 (v1.36)"
  rawFirmware: number;
  deviceId: string;
  rawDeviceId: bigint;
  pollingRateHz: number;
  winLock: boolean;
  macMode: boolean;
  autoCalibrate: boolean;
  overdrive: boolean;
  activeProfile: number; // 0, 1, or 2
  profileNames: string[];
  precisionUm: number; // unit in um, default 5 (0.005mm)
}

export interface LightConfig {
  mode: number; // 0..19 (19 = custom per-key)
  mix: boolean; // multicolour mode (mix byte == 7)
  mixMask: number;
  r: number;
  g: number;
  b: number;
  brightness: number; // 0..20
  speed: number; // 0..4
}

export interface SideLightConfig {
  mode: number;
  mix: boolean;
  r: number;
  g: number;
  b: number;
  brightness: number;
  speed: number;
}

export interface KeyActuation {
  pos: number;
  distanceUm: number; // in micrometers (0.1mm = 100um, 4.0mm = 4000um)
  distanceMm: number;
  useGlobal: boolean;
}

export interface RapidTriggerConfig {
  pos: number;
  enable: boolean;
  pressSensitivityMm: number; // e.g. 0.1mm
  releaseSensitivityMm: number; // e.g. 0.1mm
  rawUp: number;
  rawDown: number;
  useGlobal: boolean;
}

export interface DeadZoneConfig {
  pos: number;
  enable: boolean;
  topMm: number;
  bottomMm: number;
  rawUp: number;
  rawDown: number;
  useGlobal: boolean;
}

export interface LiveKeyReading {
  pos: number;
  distanceMm: number;
  rawDistance: number;
  sensorValue: number;
  pressed: boolean;
  timestamp: number;
}

export interface KeyDefinition {
  pos: number;
  label: string;
  sublabel?: string;
  row: number;
  col: number;
  width?: number; // 1 = 1u, 1.25 = 1.25u, 2.25 = 2.25u, etc.
  category?: 'alphanumeric' | 'modifier' | 'navigation' | 'function' | 'special';
}

export interface LayerMapping {
  layer: number; // 0 = default, 1 = fn, 2 = layer 2
  keys: Record<number, number>; // pos -> 32-bit key code
}

export interface LocalProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pollingRateHz: number;
  globalActuationMm: number;
  globalRtEnabled: boolean;
  globalRtPressMm: number;
  globalRtReleaseMm: number;
  globalDeadZoneTopMm: number;
  globalDeadZoneBottomMm: number;
  perKeyActuation: Record<number, number>; // pos -> mm
  perKeyRt: Record<number, { enable: boolean; pressMm: number; releaseMm: number }>;
  perKeyDeadZone: Record<number, { enable: boolean; topMm: number; bottomMm: number }>;
  lighting: LightConfig;
  sideLight: SideLightConfig;
  keymapLayer0: Record<number, number>;
  keymapLayer1: Record<number, number>;
}
