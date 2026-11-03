// DAREU COOL68 Packet Framing, Checksum & Parsing

import { REPORT_ID, REPORT_PAYLOAD_LEN } from '../protocol/constants';

export interface DecodedReport {
  cmd: number;
  sub: number;
  advType: number;
  totalChunks: number;
  chunkIndex: number;
  dataLength: number;
  data: Uint8Array;
  checksum: number;
  isValidChecksum: boolean;
}

/**
 * Builds a 63-byte payload buffer for WebHID device.sendReport(REPORT_ID, payload).
 */
export function buildPayload(
  cmd: number,
  sub: number,
  data: number[] | Uint8Array = [],
  advType: number = 0,
  totalChunks: number = 1,
  chunkIndex: number = 0,
  customDataLen?: number
): Uint8Array {
  const payload = new Uint8Array(REPORT_PAYLOAD_LEN);
  const dataLen = customDataLen !== undefined ? customDataLen : data.length;
  
  // Header bytes 0..5 of payload (corresponding to frame bytes 1..6)
  payload[0] = cmd & 0xFF;
  payload[1] = sub & 0xFF;
  payload[2] = advType & 0xFF;
  payload[3] = totalChunks & 0xFF;
  payload[4] = chunkIndex & 0xFF;
  payload[5] = dataLen & 0xFF;

  // Data bytes start at index 6
  if (data instanceof Uint8Array) {
    payload.set(data.subarray(0, Math.min(data.length, 56)), 6);
  } else {
    for (let i = 0; i < Math.min(data.length, 56); i++) {
      payload[6 + i] = data[i] & 0xFF;
    }
  }

  // Calculate checksum across REPORT_ID (0x09) and payload bytes 0..61
  let sum = REPORT_ID;
  for (let i = 0; i < 62; i++) {
    sum += payload[i];
  }
  payload[62] = (255 - (sum % 256)) & 0xFF;

  return payload;
}

/**
 * Parses an incoming WebHID InputReport DataView (63 bytes) into a DecodedReport.
 */
export function parseInputReport(dataView: DataView): DecodedReport {
  const bytes = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength);
  
  const cmd = bytes[0];
  const sub = bytes[1];
  const advType = bytes[2];
  const totalChunks = bytes[3];
  const chunkIndex = bytes[4];
  const dataLength = bytes[5];

  const dataEnd = Math.min(6 + dataLength, 62);
  const data = bytes.slice(6, dataEnd);
  const checksum = bytes[62];

  let sum = REPORT_ID;
  for (let i = 0; i < 62; i++) {
    sum += bytes[i];
  }
  const expectedChecksum = (255 - (sum % 256)) & 0xFF;
  const isValidChecksum = checksum === expectedChecksum;

  return {
    cmd,
    sub,
    advType,
    totalChunks,
    chunkIndex,
    dataLength,
    data,
    checksum,
    isValidChecksum,
  };
}
