// DAREU COOL68 WebHID Transport Layer

import {
  COOL68_VID,
  COOL68_PID,
  COOL68_USAGE_PAGE,
  REPORT_ID,
  CMD_LIVE,
} from '../protocol/constants';
import { buildPayload, parseInputReport, DecodedReport } from './packetCodec';

export interface PacketLogEntry {
  direction: 'TX' | 'RX';
  timestamp: number;
  cmd: number;
  sub: number;
  length: number;
  hex: string;
}

type LiveReportListener = (report: DecodedReport) => void;
type DisconnectListener = () => void;

interface PendingRequest {
  cmd: number;
  sub: number;
  resolve: (report: DecodedReport) => void;
  reject: (err: Error) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

class HIDTransport {
  private device: HIDDevice | null = null;
  private pendingQueue: PendingRequest[] = [];
  private liveListeners: Set<LiveReportListener> = new Set();
  private disconnectListeners: Set<DisconnectListener> = new Set();
  private packetLogs: PacketLogEntry[] = [];
  private isProcessing = false;
  private requestQueue: (() => Promise<void>)[] = [];

  constructor() {
    if (typeof navigator !== 'undefined' && 'hid' in navigator) {
      navigator.hid.addEventListener('disconnect', (event: HIDConnectionEvent) => {
        if (this.device && event.device === this.device) {
          console.warn('[WebHID] Device disconnected:', event.device.productName);
          this.handleDeviceDisconnected();
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'hid' in navigator;
  }

  public isConnected(): boolean {
    return this.device !== null && this.device.opened;
  }

  public getDevice(): HIDDevice | null {
    return this.device;
  }

  public getLogs(): PacketLogEntry[] {
    return [...this.packetLogs];
  }

  public clearLogs(): void {
    this.packetLogs = [];
  }

  public addLiveListener(fn: LiveReportListener): () => void {
    this.liveListeners.add(fn);
    return () => this.liveListeners.delete(fn);
  }

  public addDisconnectListener(fn: DisconnectListener): () => void {
    this.disconnectListeners.add(fn);
    return () => this.disconnectListeners.delete(fn);
  }

  /**
   * Prompts user via browser native modal to select the COOL68 keyboard.
   */
  public async requestDevice(): Promise<HIDDevice> {
    if (!this.isSupported()) {
      throw new Error('WebHID is not supported in this browser. Please use Google Chrome or Microsoft Edge on Windows 11.');
    }

    const devices = await navigator.hid.requestDevice({
      filters: [
        { vendorId: COOL68_VID, productId: COOL68_PID, usagePage: COOL68_USAGE_PAGE },
        { vendorId: COOL68_VID, productId: COOL68_PID },
      ],
    });

    if (!devices || devices.length === 0) {
      throw new Error('No device selected');
    }

    // Prefer the vendor interface (Usage Page 0xFF60)
    let selectedDevice = devices.find(d =>
      d.collections?.some(c => c.usagePage === COOL68_USAGE_PAGE)
    );

    if (!selectedDevice) {
      selectedDevice = devices[0];
    }

    await this.connectDevice(selectedDevice);
    return selectedDevice;
  }

  /**
   * Automatically connects to an already paired device if available on startup.
   */
  public async autoConnect(): Promise<HIDDevice | null> {
    if (!this.isSupported()) return null;

    const paired = await navigator.hid.getDevices();
    const cool68 = paired.find(d =>
      d.vendorId === COOL68_VID &&
      d.productId === COOL68_PID &&
      d.collections?.some(c => c.usagePage === COOL68_USAGE_PAGE)
    );

    if (cool68) {
      try {
        await this.connectDevice(cool68);
        return cool68;
      } catch (err) {
        console.warn('[WebHID] Auto-connect failed:', err);
      }
    }
    return null;
  }

  public async connectDevice(dev: HIDDevice): Promise<void> {
    if (this.device && this.device.opened) {
      await this.disconnect();
    }

    this.device = dev;
    if (!this.device.opened) {
      await this.device.open();
    }

    this.device.oninputreport = this.handleInputReport.bind(this);
    console.log('[WebHID] Opened COOL68 configuration channel:', dev.productName);
  }

  public async disconnect(): Promise<void> {
    if (this.device) {
      try {
        if (this.device.opened) {
          await this.device.close();
        }
      } catch (e) {
        console.error('[WebHID] Error while closing device:', e);
      } finally {
        this.device = null;
        this.flushPendingRequests(new Error('Device disconnected'));
      }
    }
  }

  private handleDeviceDisconnected(): void {
    this.device = null;
    this.flushPendingRequests(new Error('Device disconnected'));
    this.disconnectListeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error(e);
      }
    });
  }

  private flushPendingRequests(err: Error): void {
    while (this.pendingQueue.length > 0) {
      const p = this.pendingQueue.shift()!;
      clearTimeout(p.timeoutId);
      p.reject(err);
    }
  }

  private handleInputReport(event: HIDInputReportEvent): void {
    if (event.reportId !== REPORT_ID) return;

    const report = parseInputReport(event.data);

    // Record in diagnostics log
    this.logPacket('RX', report.cmd, report.sub, event.data);

    // If this is a live key travel packet (0x98, sub 1), stream it directly to live subscribers
    if (report.cmd === CMD_LIVE && report.sub === 1) {
      this.liveListeners.forEach(fn => fn(report));
      return;
    }

    // Match against pending command responses (FIFO queue matching cmd and sub)
    const matchIndex = this.pendingQueue.findIndex(
      p => p.cmd === report.cmd && p.sub === report.sub
    );

    if (matchIndex !== -1) {
      const [pending] = this.pendingQueue.splice(matchIndex, 1);
      clearTimeout(pending.timeoutId);
      pending.resolve(report);
    }
  }

  /**
   * Enqueues and executes a request-response transfer with retry and timeouts.
   */
  public async transfer(
    cmd: number,
    sub: number,
    data: number[] | Uint8Array = [],
    timeoutMs = 1200,
    advType = 0,
    totalChunks = 1,
    chunkIndex = 0
  ): Promise<DecodedReport> {
    return new Promise<DecodedReport>((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const res = await this.executeTransferWithRetry(
            cmd,
            sub,
            data,
            timeoutMs,
            advType,
            totalChunks,
            chunkIndex
          );
          resolve(res);
        } catch (err) {
          reject(err);
        }
      });
      this.processQueue();
    });
  }

  /**
   * Fire-and-forget command without waiting for an echo (e.g. live start/stop or polling rate switch).
   */
  public async sendOnly(
    cmd: number,
    sub: number,
    data: number[] | Uint8Array = []
  ): Promise<void> {
    if (!this.device || !this.device.opened) {
      throw new Error('Device not connected');
    }
    const payload = buildPayload(cmd, sub, data);
    this.logPacket('TX', cmd, sub, payload);
    await this.device.sendReport(REPORT_ID, payload as unknown as BufferSource);
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    this.isProcessing = true;
    while (this.requestQueue.length > 0) {
      const task = this.requestQueue.shift();
      if (task) {
        try {
          await task();
        } catch (e) {
          console.warn('[WebHID Queue Error]', e);
        }
      }
    }
    this.isProcessing = false;
  }

  private async executeTransferWithRetry(
    cmd: number,
    sub: number,
    data: number[] | Uint8Array,
    timeoutMs: number,
    advType: number,
    totalChunks: number,
    chunkIndex: number
  ): Promise<DecodedReport> {
    let lastError: Error | null = null;

    // Retry once on timeout because commands are idempotent
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!this.device || !this.device.opened) {
        throw new Error('Keyboard is not connected or disconnected');
      }

      try {
        return await this.sendAndAwaitEcho(
          cmd,
          sub,
          data,
          timeoutMs,
          advType,
          totalChunks,
          chunkIndex
        );
      } catch (err: any) {
        lastError = err;
        // Small backoff before retry
        await new Promise(r => setTimeout(r, 60));
      }
    }

    throw lastError || new Error(`No response from keyboard for cmd 0x${cmd.toString(16)} sub 0x${sub.toString(16)}`);
  }

  private sendAndAwaitEcho(
    cmd: number,
    sub: number,
    data: number[] | Uint8Array,
    timeoutMs: number,
    advType: number,
    totalChunks: number,
    chunkIndex: number
  ): Promise<DecodedReport> {
    return new Promise<DecodedReport>((resolve, reject) => {
      const payload = buildPayload(cmd, sub, data, advType, totalChunks, chunkIndex);

      const timeoutId = setTimeout(() => {
        const idx = this.pendingQueue.findIndex(p => p.timeoutId === timeoutId);
        if (idx !== -1) {
          this.pendingQueue.splice(idx, 1);
        }
        reject(new Error(`Timeout waiting for echo of cmd 0x${cmd.toString(16)} sub 0x${sub.toString(16)}`));
      }, timeoutMs);

      this.pendingQueue.push({
        cmd,
        sub,
        resolve,
        reject,
        timeoutId,
      });

      this.logPacket('TX', cmd, sub, payload);
      this.device!.sendReport(REPORT_ID, payload as unknown as BufferSource).catch((err: any) => {
        clearTimeout(timeoutId);
        const idx = this.pendingQueue.findIndex(p => p.timeoutId === timeoutId);
        if (idx !== -1) this.pendingQueue.splice(idx, 1);
        reject(err);
      });
    });
  }

  private logPacket(
    direction: 'TX' | 'RX',
    cmd: number,
    sub: number,
    raw: DataView | Uint8Array
  ): void {
    const bytes = raw instanceof DataView
      ? new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength)
      : raw;

    let hex = '';
    for (let i = 0; i < Math.min(bytes.length, 16); i++) {
      hex += bytes[i].toString(16).padStart(2, '0').toUpperCase() + ' ';
    }
    if (bytes.length > 16) hex += '...';

    this.packetLogs.unshift({
      direction,
      timestamp: Date.now(),
      cmd,
      sub,
      length: bytes.length,
      hex: hex.trim(),
    });

    if (this.packetLogs.length > 100) {
      this.packetLogs.pop();
    }
  }
}

export const hidTransport = new HIDTransport();
