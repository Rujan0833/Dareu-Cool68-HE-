// High-level DAREU COOL68 HE Service Layer

import { hidTransport } from './hidTransport';
import {
  CMD_SET,
  CMD_GET,
  CMD_INFO_GET,
  SUB_INFO_FIRMWARE,
  SUB_INFO_DEVICE_ID,
  SUB_INFO_RT_PRECISION,
  SUB_LIGHT,
  SUB_SIDE_LIGHT,
  SUB_POLLING,
  SUB_WIN_LOCK,
  SUB_MAC_MODE,
  SUB_AUTO_CALIBRATE,
  SUB_OVERDRIVE,
  POLLING_LEVEL_TO_HZ,
  POLLING_RATES,
  CMD_PROFILE_GET,
  CMD_PROFILE_SET,
  CMD_PROFILE_NAME_GET,
  CMD_PROFILE_NAME_SET,
  PROFILE_COUNT,
  CMD_TRAVEL_GET,
  CMD_TRAVEL_SET,
  TRAVEL_KEYS_PER_REQ,
  CMD_RT_GET,
  CMD_RT_SET,
  RT_KEYS_PER_REQ,
  CMD_SAFE_AREA_GET,
  CMD_SAFE_AREA_SET,
  SAFE_AREA_KEYS_PER_REQ,
  CMD_KEYS_GET,
  CMD_KEYS_SET,
  KEYS_PER_REQ,
  CMD_COLOR_GET,
  CMD_COLOR_SET,
  COLORS_PER_REQ,
  CMD_LIVE,
  LIVE_MAX_KEYS,
  REPORT_ID,
  DEFAULT_PRECISION_STEP_MM,
} from '../protocol/constants';
import {
  DeviceInfo,
  LightConfig,
  SideLightConfig,
  KeyActuation,
  RapidTriggerConfig,
  DeadZoneConfig,
  LiveKeyReading,
} from '../types/protocol';
import { KEY_POSITION_LIST, FACTORY_KEYMAP_LAYER_0, FACTORY_KEYMAP_LAYER_1 } from '../protocol/keyCodes';
import { buildPayload } from './packetCodec';

export class Cool68Service {
  private precisionMm = DEFAULT_PRECISION_STEP_MM;

  public isConnected(): boolean {
    return hidTransport.isConnected();
  }

  public async connect(): Promise<DeviceInfo> {
    await hidTransport.requestDevice();
    return await this.fetchDeviceInfo();
  }

  public async autoConnect(): Promise<DeviceInfo | null> {
    const dev = await hidTransport.autoConnect();
    if (!dev) return null;
    return await this.fetchDeviceInfo();
  }

  public async disconnect(): Promise<void> {
    await this.stopLiveTravel();
    await hidTransport.disconnect();
  }

  /**
   * Fetches full device hardware info: firmware, ID, active profile, polling rate, toggles.
   */
  public async fetchDeviceInfo(): Promise<DeviceInfo> {
    // 1. Firmware version (cmd 0x82, sub 2)
    const fwRep = await hidTransport.transfer(CMD_INFO_GET, SUB_INFO_FIRMWARE);
    const fwBytes = fwRep.data;
    const rawFirmware = (fwBytes[1] << 8) | fwBytes[0]; // 16-bit little-endian
    const fwMajor = (rawFirmware >> 8) & 0xFF;
    const fwMinor = rawFirmware & 0xFF;
    const firmwareVersion = `0x${rawFirmware.toString(16).padStart(4, '0').toUpperCase()} (v${fwMajor}.${fwMinor.toString(16)})`;

    // 2. Device ID (cmd 0x82, sub 1)
    const idRep = await hidTransport.transfer(CMD_INFO_GET, SUB_INFO_DEVICE_ID);
    const idBytes = idRep.data;
    let rawDeviceId = 0n;
    for (let i = 0; i < Math.min(idBytes.length, 6); i++) {
      rawDeviceId = (rawDeviceId << 8n) | BigInt(idBytes[i]);
    }
    const deviceId = rawDeviceId.toString(16).toUpperCase().padStart(12, '0');

    // 3. Precision (cmd 0x82, sub 6 / 8)
    try {
      const precRep = await hidTransport.transfer(CMD_INFO_GET, SUB_INFO_RT_PRECISION);
      const prec = precRep.data[0] || 5;
      this.precisionMm = prec / 1000.0;
    } catch {
      this.precisionMm = DEFAULT_PRECISION_STEP_MM;
    }

    // 4. Polling rate (cmd 0x84, sub 0x17)
    let pollingRateHz = 1000;
    try {
      const pollRep = await hidTransport.transfer(CMD_GET, SUB_POLLING);
      pollingRateHz = POLLING_LEVEL_TO_HZ[pollRep.data[0]] || 1000;
    } catch (e) {
      console.warn('[COOL68] Could not read polling rate:', e);
    }

    // 5. Windows Key Lock
    let winLock = false;
    try {
      const wlRep = await hidTransport.transfer(CMD_GET, SUB_WIN_LOCK);
      winLock = wlRep.data[0] === 1;
    } catch {}

    // 6. Mac Mode
    let macMode = false;
    try {
      const macRep = await hidTransport.transfer(CMD_GET, SUB_MAC_MODE);
      macMode = macRep.data[0] === 1;
    } catch {}

    // 7. Auto-calibrate
    let autoCalibrate = false;
    try {
      const acRep = await hidTransport.transfer(CMD_GET, SUB_AUTO_CALIBRATE);
      autoCalibrate = acRep.data[0] === 1;
    } catch {}

    // 8. Overdrive
    let overdrive = false;
    try {
      const odRep = await hidTransport.transfer(CMD_GET, SUB_OVERDRIVE);
      overdrive = odRep.data[0] === 1;
    } catch {}

    // 9. Active Profile & Names (cmd 0x90)
    let activeProfile = 0;
    try {
      const profRep = await hidTransport.transfer(CMD_PROFILE_GET, 0);
      activeProfile = profRep.data[0] || 0;
    } catch {}

    const profileNames: string[] = ['Profile 1', 'Profile 2', 'Profile 3'];
    for (let i = 0; i < PROFILE_COUNT; i++) {
      try {
        const nameRep = await hidTransport.transfer(CMD_PROFILE_NAME_GET, i);
        const len = nameRep.data[0];
        if (len > 0 && len !== 255) {
          const dec = new TextDecoder('utf-8').decode(nameRep.data.slice(1, 1 + len));
          if (dec.trim().length > 0) profileNames[i] = dec.trim();
        }
      } catch {}
    }

    return {
      firmwareVersion,
      rawFirmware,
      deviceId,
      rawDeviceId,
      pollingRateHz,
      winLock,
      macMode,
      autoCalibrate,
      overdrive,
      activeProfile,
      profileNames,
      precisionUm: Math.round(this.precisionMm * 1000),
    };
  }

  // --- Lighting Methods ---
  public async getLight(): Promise<LightConfig> {
    const rep = await hidTransport.transfer(CMD_GET, SUB_LIGHT);
    const d = rep.data;
    return {
      mode: d[0],
      mix: d[1] === 7,
      mixMask: d[1],
      r: d[2],
      g: d[3],
      b: d[4],
      brightness: d[5],
      speed: d[6],
    };
  }

  public async setLight(config: Partial<LightConfig>): Promise<void> {
    const current = await this.getLight();
    const updated: LightConfig = { ...current, ...config };
    const mixByte = updated.mix ? 7 : 0;
    const data = [
      updated.mode,
      mixByte,
      updated.r,
      updated.g,
      updated.b,
      updated.brightness,
      updated.speed,
    ];
    await hidTransport.transfer(CMD_SET, SUB_LIGHT, data);
  }

  public async getSideLight(): Promise<SideLightConfig> {
    const rep = await hidTransport.transfer(CMD_GET, SUB_SIDE_LIGHT);
    const d = rep.data;
    return {
      mode: d[0],
      mix: d[1] === 7,
      r: d[2],
      g: d[3],
      b: d[4],
      brightness: d[5],
      speed: d[6],
    };
  }

  public async setSideLight(config: Partial<SideLightConfig>): Promise<void> {
    const current = await this.getSideLight();
    const updated: SideLightConfig = { ...current, ...config };
    const mixByte = updated.mix ? 7 : 0;
    const data = [
      updated.mode,
      mixByte,
      updated.r,
      updated.g,
      updated.b,
      updated.brightness,
      updated.speed,
    ];
    await hidTransport.transfer(CMD_SET, SUB_SIDE_LIGHT, data);
  }

  public async getPerKeyColors(): Promise<Record<number, { r: number; g: number; b: number }>> {
    const out: Record<number, { r: number; g: number; b: number }> = {};
    const positions = KEY_POSITION_LIST;

    for (let i = 0; i < positions.length; i += COLORS_PER_REQ) {
      const chunk = positions.slice(i, i + COLORS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(p => data.push((p >> 8) & 0xFF, p & 0xFF));
      
      const rep = await hidTransport.transfer(CMD_COLOR_GET, 0, data);
      const d = rep.data;
      for (let j = 0; j < chunk.length; j++) {
        const offset = j * 5;
        if (offset + 5 <= d.length) {
          const echoedPos = (d[offset] << 8) | d[offset + 1];
          if (echoedPos === chunk[j]) {
            out[chunk[j]] = { r: d[offset + 2], g: d[offset + 3], b: d[offset + 4] };
          }
        }
      }
    }
    return out;
  }

  public async setPerKeyColors(colors: Record<number, { r: number; g: number; b: number }>): Promise<void> {
    const flat: number[] = [];
    for (const [posStr, col] of Object.entries(colors)) {
      const pos = parseInt(posStr, 10);
      flat.push((pos >> 8) & 0xFF, pos & 0xFF, col.r, col.g, col.b);
    }

    const chunkSize = 55;
    const chunks: number[][] = [];
    for (let i = 0; i < flat.length; i += chunkSize) {
      chunks.push(flat.slice(i, i + chunkSize));
    }

    for (let idx = 0; idx < chunks.length; idx++) {
      await hidTransport.transfer(
        CMD_COLOR_SET,
        0,
        chunks[idx],
        1200,
        0,
        chunks.length,
        idx
      );
    }
  }

  // --- Hall Effect & Performance Methods ---
  public async getTravel(positions?: number[]): Promise<Record<number, KeyActuation>> {
    const list = positions || KEY_POSITION_LIST;
    const result: Record<number, KeyActuation> = {};

    for (let i = 0; i < list.length; i += TRAVEL_KEYS_PER_REQ) {
      const chunk = list.slice(i, i + TRAVEL_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(p => data.push((p >> 8) & 0xFF, p & 0xFF));

      const rep = await hidTransport.transfer(CMD_TRAVEL_GET, 0, data);
      const d = rep.data;
      for (let j = 0; j < chunk.length; j++) {
        const offset = j * 5;
        if (offset + 5 <= d.length) {
          const echoedPos = (d[offset] << 8) | d[offset + 1];
          if (echoedPos === chunk[j]) {
            const rawDist = (d[offset + 2] << 8) | d[offset + 3];
            const useGlobal = d[offset + 4] === 1;
            const distanceMm = +(rawDist * this.precisionMm).toFixed(3);
            result[chunk[j]] = {
              pos: chunk[j],
              distanceUm: Math.round(distanceMm * 1000),
              distanceMm,
              useGlobal,
            };
          }
        }
      }
    }
    return result;
  }

  public async setTravel(mappings: { pos: number; distanceMm: number; useGlobal: boolean }[]): Promise<void> {
    for (let i = 0; i < mappings.length; i += TRAVEL_KEYS_PER_REQ) {
      const chunk = mappings.slice(i, i + TRAVEL_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(m => {
        const raw = Math.round(m.distanceMm / this.precisionMm);
        data.push((m.pos >> 8) & 0xFF, m.pos & 0xFF, (raw >> 8) & 0xFF, raw & 0xFF, m.useGlobal ? 1 : 0);
      });
      await hidTransport.transfer(CMD_TRAVEL_SET, 0, data);
    }
  }

  public async getRapidTrigger(positions?: number[]): Promise<Record<number, RapidTriggerConfig>> {
    const list = positions || KEY_POSITION_LIST;
    const result: Record<number, RapidTriggerConfig> = {};

    for (let i = 0; i < list.length; i += RT_KEYS_PER_REQ) {
      const chunk = list.slice(i, i + RT_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(p => data.push((p >> 8) & 0xFF, p & 0xFF));

      const rep = await hidTransport.transfer(CMD_RT_GET, 0, data);
      const d = rep.data;
      for (let j = 0; j < chunk.length; j++) {
        const offset = j * 8;
        if (offset + 8 <= d.length) {
          const echoedPos = (d[offset] << 8) | d[offset + 1];
          if (echoedPos === chunk[j]) {
            const enable = d[offset + 2] === 1;
            const rawUp = (d[offset + 3] << 8) | d[offset + 4];
            const rawDown = (d[offset + 5] << 8) | d[offset + 6];
            const useGlobal = d[offset + 7] === 1;

            result[chunk[j]] = {
              pos: chunk[j],
              enable,
              pressSensitivityMm: +(rawDown * this.precisionMm).toFixed(3),
              releaseSensitivityMm: +(rawUp * this.precisionMm).toFixed(3),
              rawUp,
              rawDown,
              useGlobal,
            };
          }
        }
      }
    }
    return result;
  }

  public async setRapidTrigger(configs: RapidTriggerConfig[]): Promise<void> {
    for (let i = 0; i < configs.length; i += RT_KEYS_PER_REQ) {
      const chunk = configs.slice(i, i + RT_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(c => {
        const rawUp = Math.round(c.releaseSensitivityMm / this.precisionMm);
        const rawDown = Math.round(c.pressSensitivityMm / this.precisionMm);
        data.push(
          (c.pos >> 8) & 0xFF,
          c.pos & 0xFF,
          c.enable ? 1 : 0,
          (rawUp >> 8) & 0xFF,
          rawUp & 0xFF,
          (rawDown >> 8) & 0xFF,
          rawDown & 0xFF,
          c.useGlobal ? 1 : 0
        );
      });
      await hidTransport.transfer(CMD_RT_SET, 0, data);
    }
  }

  public async getSafeArea(positions?: number[]): Promise<Record<number, DeadZoneConfig>> {
    const list = positions || KEY_POSITION_LIST;
    const result: Record<number, DeadZoneConfig> = {};

    for (let i = 0; i < list.length; i += SAFE_AREA_KEYS_PER_REQ) {
      const chunk = list.slice(i, i + SAFE_AREA_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(p => data.push((p >> 8) & 0xFF, p & 0xFF));

      const rep = await hidTransport.transfer(CMD_SAFE_AREA_GET, 0, data);
      const d = rep.data;
      for (let j = 0; j < chunk.length; j++) {
        const offset = j * 8;
        if (offset + 8 <= d.length) {
          const echoedPos = (d[offset] << 8) | d[offset + 1];
          if (echoedPos === chunk[j]) {
            const rawUp = (d[offset + 2] << 8) | d[offset + 3];
            const rawDown = (d[offset + 4] << 8) | d[offset + 5];
            const useGlobal = d[offset + 6] === 1;
            const enable = d[offset + 7] === 1;

            result[chunk[j]] = {
              pos: chunk[j],
              enable,
              topMm: +(rawUp * this.precisionMm).toFixed(3),
              bottomMm: +(rawDown * this.precisionMm).toFixed(3),
              rawUp,
              rawDown,
              useGlobal,
            };
          }
        }
      }
    }
    return result;
  }

  public async setSafeArea(configs: DeadZoneConfig[]): Promise<void> {
    for (let i = 0; i < configs.length; i += SAFE_AREA_KEYS_PER_REQ) {
      const chunk = configs.slice(i, i + SAFE_AREA_KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(c => {
        const rawUp = Math.round(c.topMm / this.precisionMm);
        const rawDown = Math.round(c.bottomMm / this.precisionMm);
        data.push(
          (c.pos >> 8) & 0xFF,
          c.pos & 0xFF,
          (rawUp >> 8) & 0xFF,
          rawUp & 0xFF,
          (rawDown >> 8) & 0xFF,
          rawDown & 0xFF,
          c.useGlobal ? 1 : 0,
          c.enable ? 1 : 0
        );
      });
      await hidTransport.transfer(CMD_SAFE_AREA_SET, 0, data);
    }
  }

  // --- Live Key Travel Stream ---
  public async startLiveTravel(
    keysToTrack: number[],
    onReading: (reading: LiveKeyReading) => void
  ): Promise<() => void> {
    const tracked = keysToTrack.slice(0, LIVE_MAX_KEYS);
    
    // Command 0x98 sub 0 (start stream)
    await hidTransport.sendOnly(CMD_LIVE, 0);
    await new Promise(r => setTimeout(r, 60));

    // Command 0x98 sub 1 (set tracked key IDs)
    const listData: number[] = [];
    tracked.forEach(p => listData.push((p >> 8) & 0xFF, p & 0xFF));
    await hidTransport.sendOnly(CMD_LIVE, 1, listData);

    const unsub = hidTransport.addLiveListener(report => {
      const d = report.data;
      const count = Math.floor(d.length / 6);
      for (let i = 0; i < count; i++) {
        const offset = i * 6;
        const pos = (d[offset] << 8) | d[offset + 1];
        const rawDist = (d[offset + 2] << 8) | d[offset + 3];
        const sensorWord = (d[offset + 4] << 8) | d[offset + 5];
        const pressed = (sensorWord & 0x8000) !== 0;
        const sensorValue = sensorWord & 0x7FFF;

        onReading({
          pos,
          distanceMm: +(rawDist * this.precisionMm).toFixed(3),
          rawDistance: rawDist,
          sensorValue,
          pressed,
          timestamp: Date.now(),
        });
      }
    });

    return async () => {
      unsub();
      await this.stopLiveTravel();
    };
  }

  public async stopLiveTravel(): Promise<void> {
    try {
      await hidTransport.sendOnly(CMD_LIVE, 2);
    } catch {}
  }

  // --- Keymap Layer Methods ---
  public async getKeymap(layer: number, positions?: number[]): Promise<Record<number, number>> {
    const list = positions || KEY_POSITION_LIST;
    const result: Record<number, number> = {};

    for (let i = 0; i < list.length; i += KEYS_PER_REQ) {
      const chunk = list.slice(i, i + KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(p => data.push((p >> 8) & 0xFF, p & 0xFF));

      const rep = await hidTransport.transfer(CMD_KEYS_GET, layer, data);
      const d = rep.data;
      for (let j = 0; j < chunk.length; j++) {
        const offset = j * 6;
        if (offset + 6 <= d.length) {
          const echoedPos = (d[offset] << 8) | d[offset + 1];
          if (echoedPos === chunk[j]) {
            const code =
              ((d[offset + 2] << 24) >>> 0) |
              (d[offset + 3] << 16) |
              (d[offset + 4] << 8) |
              d[offset + 5];
            result[chunk[j]] = code;
          }
        }
      }
    }
    return result;
  }

  public async setKeys(layer: number, mapping: Record<number, number>): Promise<void> {
    const entries = Object.entries(mapping);
    for (let i = 0; i < entries.length; i += KEYS_PER_REQ) {
      const chunk = entries.slice(i, i + KEYS_PER_REQ);
      const data: number[] = [];
      chunk.forEach(([posStr, code]) => {
        const pos = parseInt(posStr, 10);
        data.push(
          (pos >> 8) & 0xFF,
          pos & 0xFF,
          (code >>> 24) & 0xFF,
          (code >>> 16) & 0xFF,
          (code >>> 8) & 0xFF,
          code & 0xFF
        );
      });
      await hidTransport.transfer(CMD_KEYS_SET, layer, data);
    }
  }

  public async restoreLayer(layer: number): Promise<void> {
    const defaults = layer === 1 ? FACTORY_KEYMAP_LAYER_1 : FACTORY_KEYMAP_LAYER_0;
    await this.setKeys(layer, defaults);
  }

  // --- Device Settings ---
  public async setPollingRate(hz: number): Promise<void> {
    const level = POLLING_RATES[hz];
    if (level === undefined) throw new Error(`Unsupported polling rate ${hz}Hz`);
    // Writing polling rate causes keyboard to re-enumerate on USB; ignore drop
    try {
      await hidTransport.sendOnly(CMD_SET, SUB_POLLING, [level]);
    } catch {}
  }

  public async setWinLock(enabled: boolean): Promise<void> {
    await hidTransport.transfer(CMD_SET, SUB_WIN_LOCK, [enabled ? 1 : 0]);
  }

  public async setMacMode(enabled: boolean): Promise<void> {
    await hidTransport.transfer(CMD_SET, SUB_MAC_MODE, [enabled ? 1 : 0]);
  }

  public async setAutoCalibrate(enabled: boolean): Promise<void> {
    await hidTransport.transfer(CMD_SET, SUB_AUTO_CALIBRATE, [enabled ? 1 : 0]);
  }

  public async setOverdrive(enabled: boolean): Promise<void> {
    await hidTransport.transfer(CMD_SET, SUB_OVERDRIVE, [enabled ? 1 : 0]);
  }

  public async setSleepTimeout(level: number): Promise<void> {
    await hidTransport.sendOnly(CMD_SET, 0x13, [level]);
  }

  public async switchProfile(idx: number): Promise<void> {
    await hidTransport.transfer(CMD_PROFILE_SET, 0, [idx]);
  }

  public async setProfileName(idx: number, name: string): Promise<void> {
    const enc = new TextEncoder().encode(name.slice(0, 50));
    const data = [enc.length, ...Array.from(enc)];
    while (data.length < 56) data.push(0);
    await hidTransport.transfer(CMD_PROFILE_NAME_SET, idx, data);
  }
}

export const cool68Service = new Cool68Service();
