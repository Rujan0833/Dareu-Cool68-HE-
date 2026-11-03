// DAREU COOL68 USB Protocol Constants

// USB Identifiers
export const COOL68_VID = 0x372E;
export const COOL68_PID = 0x1083;
export const COOL68_USAGE_PAGE = 0xFF60;
export const COOL68_USAGE = 0x61;
export const COOL68_INTERFACE = 2; // Vendor Configuration Interface
export const REPORT_ID = 0x09;
export const REPORT_PAYLOAD_LEN = 63; // 1 byte report id + 63 bytes payload = 64 bytes total

// Primary Protocol Commands
export const CMD_SET = 0x04;
export const CMD_GET = 0x84;

// Sub-commands for 0x04 / 0x84
export const SUB_LIGHT = 0x01;
export const SUB_SIDE_LIGHT = 0x06;
export const SUB_MAC_MODE = 0x11;
export const SUB_SLEEP = 0x13;
export const SUB_WIN_LOCK = 0x15;
export const SUB_POLLING = 0x17;
export const SUB_KEY_COMBO = 0x18;
export const SUB_AUTO_CALIBRATE = 0x19;
export const SUB_OVERDRIVE = 0x1F;

// Info Commands
export const CMD_INFO_GET = 0x82;
export const SUB_INFO_DEVICE_ID = 0x01;
export const SUB_INFO_FIRMWARE = 0x02;
export const SUB_INFO_RT_PRECISION = 0x06;
export const SUB_INFO_TRAVEL_PRECISION = 0x08;

// Per-Key Hall Effect Commands
export const CMD_TRAVEL_SET = 0x13;
export const CMD_TRAVEL_GET = 0x93;
export const TRAVEL_KEYS_PER_REQ = 11;

export const CMD_RT_SET = 0x19;
export const CMD_RT_GET = 0x99;
export const RT_KEYS_PER_REQ = 6;

export const CMD_SAFE_AREA_SET = 0x16;
export const CMD_SAFE_AREA_GET = 0x96;
export const SAFE_AREA_KEYS_PER_REQ = 6;

// Keymap Commands
export const CMD_KEYS_SET = 0x03;
export const CMD_KEYS_GET = 0x83;
export const KEYS_PER_REQ = 9;

// Per-Key Color Commands
export const CMD_COLOR_SET = 0x06;
export const CMD_COLOR_GET = 0x86;
export const COLORS_PER_REQ = 11;
export const LIGHT_MODE_CUSTOM = 19;

// Profile Commands
export const CMD_PROFILE_SET = 0x10;
export const CMD_PROFILE_GET = 0x90;
export const CMD_PROFILE_NAME_SET = 0x1A;
export const CMD_PROFILE_NAME_GET = 0x9A;
export const PROFILE_COUNT = 3;

// Live Key Travel Stream
export const CMD_LIVE = 0x98;
export const LIVE_MAX_KEYS = 9; // Max 9 keys safely tracked simultaneously

// Advanced Keys
export const CMD_ADVANCED_SET = 0x12;
export const CMD_ADVANCED_GET = 0x92;

// Polling Rate Map: Hz -> raw level byte
export const POLLING_RATES: Record<number, number> = {
  1000: 0,
  2000: 6,
  4000: 5,
  8000: 4,
};

export const POLLING_LEVEL_TO_HZ: Record<number, number> = {
  0: 1000,
  6: 2000,
  5: 4000,
  4: 8000,
};

// Sleep Timeouts: label -> units of 30 seconds (0 = never)
export const SLEEP_TIMEOUTS: Record<string, number> = {
  'Never': 0,
  '30 Seconds': 1,
  '1 Minute': 2,
  '2 Minutes': 4,
  '5 Minutes': 10,
  '10 Minutes': 20,
  '15 Minutes': 30,
  '30 Minutes': 60,
};

// Light Modes
export const LIGHT_MODES: Record<number, string> = {
  0: "Off",
  1: "Always on",
  2: "Breathing",
  3: "Neon",
  4: "Burst",
  5: "Rain",
  6: "Rainbow wheel",
  7: "Key ripples",
  8: "Starry sky",
  9: "Snow trail",
  10: "Flow",
  11: "Drift",
  12: "Follow",
  13: "Sine wave",
  14: "Scan",
  15: "Windmill",
  16: "Waterfall",
  17: "Bloom",
  18: "Spin storm",
  19: "Custom (Per-key RGB)",
};

// Travel and Sensitivities limits (in mm)
export const MIN_ACTUATION_MM = 0.1;
export const MAX_ACTUATION_MM = 4.0;
export const DEFAULT_PRECISION_STEP_MM = 0.005; // 5 um
export const MIN_RT_SENSITIVITY_MM = 0.02;
export const MAX_RT_SENSITIVITY_MM = 4.0;
export const MAX_DEAD_ZONE_MM = 0.5;
