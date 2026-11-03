// DAREU COOL68 68-Key Matrix, Physical Layout & Keycodes

import { KeyDefinition } from '../types/protocol';

export const COOL68_KEYS: KeyDefinition[] = [
  // Row 0 (Number Row)
  { pos: 1, label: 'Esc', row: 0, col: 0, width: 1, category: 'special' },
  { pos: 15, label: '1', sublabel: '!', row: 0, col: 1, width: 1, category: 'alphanumeric' },
  { pos: 16, label: '2', sublabel: '@', row: 0, col: 2, width: 1, category: 'alphanumeric' },
  { pos: 17, label: '3', sublabel: '#', row: 0, col: 3, width: 1, category: 'alphanumeric' },
  { pos: 18, label: '4', sublabel: '$', row: 0, col: 4, width: 1, category: 'alphanumeric' },
  { pos: 19, label: '5', sublabel: '%', row: 0, col: 5, width: 1, category: 'alphanumeric' },
  { pos: 20, label: '6', sublabel: '^', row: 0, col: 6, width: 1, category: 'alphanumeric' },
  { pos: 21, label: '7', sublabel: '&', row: 0, col: 7, width: 1, category: 'alphanumeric' },
  { pos: 22, label: '8', sublabel: '*', row: 0, col: 8, width: 1, category: 'alphanumeric' },
  { pos: 23, label: '9', sublabel: '(', row: 0, col: 9, width: 1, category: 'alphanumeric' },
  { pos: 24, label: '0', sublabel: ')', row: 0, col: 10, width: 1, category: 'alphanumeric' },
  { pos: 25, label: '-', sublabel: '_', row: 0, col: 11, width: 1, category: 'alphanumeric' },
  { pos: 26, label: '=', sublabel: '+', row: 0, col: 12, width: 1, category: 'alphanumeric' },
  { pos: 27, label: 'Backspace', row: 0, col: 13, width: 2, category: 'modifier' },
  { pos: 98, label: 'Ins', row: 0, col: 15, width: 1, category: 'navigation' },

  // Row 1 (QWERTY)
  { pos: 28, label: 'Tab', row: 1, col: 0, width: 1.5, category: 'modifier' },
  { pos: 29, label: 'Q', row: 1, col: 1.5, width: 1, category: 'alphanumeric' },
  { pos: 30, label: 'W', row: 1, col: 2.5, width: 1, category: 'alphanumeric' },
  { pos: 31, label: 'E', row: 1, col: 3.5, width: 1, category: 'alphanumeric' },
  { pos: 32, label: 'R', row: 1, col: 4.5, width: 1, category: 'alphanumeric' },
  { pos: 33, label: 'T', row: 1, col: 5.5, width: 1, category: 'alphanumeric' },
  { pos: 34, label: 'Y', row: 1, col: 6.5, width: 1, category: 'alphanumeric' },
  { pos: 35, label: 'U', row: 1, col: 7.5, width: 1, category: 'alphanumeric' },
  { pos: 36, label: 'I', row: 1, col: 8.5, width: 1, category: 'alphanumeric' },
  { pos: 37, label: 'O', row: 1, col: 9.5, width: 1, category: 'alphanumeric' },
  { pos: 38, label: 'P', row: 1, col: 10.5, width: 1, category: 'alphanumeric' },
  { pos: 39, label: '[', sublabel: '{', row: 1, col: 11.5, width: 1, category: 'alphanumeric' },
  { pos: 40, label: ']', sublabel: '}', row: 1, col: 12.5, width: 1, category: 'alphanumeric' },
  { pos: 41, label: '\\', sublabel: '|', row: 1, col: 13.5, width: 1.5, category: 'alphanumeric' },
  { pos: 99, label: 'Del', row: 1, col: 15, width: 1, category: 'navigation' },

  // Row 2 (Home Row)
  { pos: 42, label: 'Caps', row: 2, col: 0, width: 1.75, category: 'modifier' },
  { pos: 43, label: 'A', row: 2, col: 1.75, width: 1, category: 'alphanumeric' },
  { pos: 44, label: 'S', row: 2, col: 2.75, width: 1, category: 'alphanumeric' },
  { pos: 45, label: 'D', row: 2, col: 3.75, width: 1, category: 'alphanumeric' },
  { pos: 46, label: 'F', row: 2, col: 4.75, width: 1, category: 'alphanumeric' },
  { pos: 47, label: 'G', row: 2, col: 5.75, width: 1, category: 'alphanumeric' },
  { pos: 48, label: 'H', row: 2, col: 6.75, width: 1, category: 'alphanumeric' },
  { pos: 49, label: 'J', row: 2, col: 7.75, width: 1, category: 'alphanumeric' },
  { pos: 50, label: 'K', row: 2, col: 8.75, width: 1, category: 'alphanumeric' },
  { pos: 51, label: 'L', row: 2, col: 9.75, width: 1, category: 'alphanumeric' },
  { pos: 52, label: ';', sublabel: ':', row: 2, col: 10.75, width: 1, category: 'alphanumeric' },
  { pos: 53, label: '\'', sublabel: '"', row: 2, col: 11.75, width: 1, category: 'alphanumeric' },
  { pos: 54, label: 'Enter', row: 2, col: 12.75, width: 2.25, category: 'modifier' },
  { pos: 102, label: 'PgUp', row: 2, col: 15, width: 1, category: 'navigation' },

  // Row 3 (ZXCV Row)
  { pos: 55, label: 'LShift', row: 3, col: 0, width: 2.25, category: 'modifier' },
  { pos: 56, label: 'Z', row: 3, col: 2.25, width: 1, category: 'alphanumeric' },
  { pos: 57, label: 'X', row: 3, col: 3.25, width: 1, category: 'alphanumeric' },
  { pos: 58, label: 'C', row: 3, col: 4.25, width: 1, category: 'alphanumeric' },
  { pos: 59, label: 'V', row: 3, col: 5.25, width: 1, category: 'alphanumeric' },
  { pos: 60, label: 'B', row: 3, col: 6.25, width: 1, category: 'alphanumeric' },
  { pos: 61, label: 'N', row: 3, col: 7.25, width: 1, category: 'alphanumeric' },
  { pos: 62, label: 'M', row: 3, col: 8.25, width: 1, category: 'alphanumeric' },
  { pos: 63, label: ',', sublabel: '<', row: 3, col: 9.25, width: 1, category: 'alphanumeric' },
  { pos: 64, label: '.', sublabel: '>', row: 3, col: 10.25, width: 1, category: 'alphanumeric' },
  { pos: 65, label: '/', sublabel: '?', row: 3, col: 11.25, width: 1, category: 'alphanumeric' },
  { pos: 66, label: 'RShift', row: 3, col: 12.25, width: 1.75, category: 'modifier' },
  { pos: 74, label: 'Up', row: 3, col: 14, width: 1, category: 'navigation' },
  { pos: 103, label: 'PgDn', row: 3, col: 15, width: 1, category: 'navigation' },

  // Row 4 (Bottom Row)
  { pos: 67, label: 'LCtrl', row: 4, col: 0, width: 1.25, category: 'modifier' },
  { pos: 68, label: 'Win', row: 4, col: 1.25, width: 1.25, category: 'modifier' },
  { pos: 69, label: 'LAlt', row: 4, col: 2.5, width: 1.25, category: 'modifier' },
  { pos: 70, label: 'Space', row: 4, col: 3.75, width: 6.25, category: 'alphanumeric' },
  { pos: 71, label: 'RAlt', row: 4, col: 10, width: 1, category: 'modifier' },
  { pos: 72, label: 'Fn', row: 4, col: 11, width: 1, category: 'special' },
  { pos: 73, label: 'RCtrl', row: 4, col: 12, width: 1, category: 'modifier' },
  { pos: 76, label: 'Left', row: 4, col: 13, width: 1, category: 'navigation' },
  { pos: 75, label: 'Down', row: 4, col: 14, width: 1, category: 'navigation' },
  { pos: 77, label: 'Right', row: 4, col: 15, width: 1, category: 'navigation' },
];

export const KEY_POSITION_LIST = COOL68_KEYS.map(k => k.pos);

// Factory Default Keymaps for Layer 0 & Layer 1 (Fn Layer)
export const FACTORY_KEYMAP_LAYER_0: Record<number, number> = {
  1: 0x00000029, 15: 0x0000001E, 16: 0x0000001F, 17: 0x00000020,
  18: 0x00000021, 19: 0x00000022, 20: 0x00000023, 21: 0x00000024,
  22: 0x00000025, 23: 0x00000026, 24: 0x00000027, 25: 0x0000002D,
  26: 0x0000002E, 27: 0x0000002A, 28: 0x0000002B, 29: 0x00000014,
  30: 0x0000001A, 31: 0x00000008, 32: 0x00000015, 33: 0x00000017,
  34: 0x0000001C, 35: 0x00000018, 36: 0x0000000C, 37: 0x00000012,
  38: 0x00000013, 39: 0x0000002F, 40: 0x00000030, 41: 0x00000031,
  42: 0x00000039, 43: 0x00000004, 44: 0x00000016, 45: 0x00000007,
  46: 0x00000009, 47: 0x0000000A, 48: 0x0000000B, 49: 0x0000000D,
  50: 0x0000000E, 51: 0x0000000F, 52: 0x00000033, 53: 0x00000034,
  54: 0x00000028, 55: 0x00020000, 56: 0x0000001D, 57: 0x0000001B,
  58: 0x00000006, 59: 0x00000019, 60: 0x00000005, 61: 0x00000011,
  62: 0x00000010, 63: 0x00000036, 64: 0x00000037, 65: 0x00000038,
  66: 0x00200000, 67: 0x00010000, 68: 0x00080000, 69: 0x00040000,
  70: 0x0000002C, 71: 0x00400000, 72: 0x0D000000, 73: 0x00100000,
  74: 0x00000052, 75: 0x00000051, 76: 0x00000050, 77: 0x0000004F,
  98: 0x00000049, 99: 0x0000004C, 102: 0x0000004B, 103: 0x0000004E,
};

export const FACTORY_KEYMAP_LAYER_1: Record<number, number> = {
  1: 0x00000035, 15: 0x0000003A, 16: 0x0000003B, 17: 0x0000003C,
  18: 0x0000003D, 19: 0x0000003E, 20: 0x0000003F, 21: 0x00000040,
  22: 0x00000041, 23: 0x00000042, 24: 0x00000043, 25: 0x00000044,
  26: 0x00000045, 27: 0x0000002A, 28: 0x07000004, 29: 0x00000014,
  30: 0x0000001A, 31: 0x00000008, 32: 0x00000015, 33: 0x00000017,
  34: 0x0000001C, 35: 0x00000018, 36: 0x0000000C, 37: 0x00000012,
  38: 0x00000013, 39: 0x08000000, 40: 0x08020000, 41: 0x07000012,
  42: 0x00000039, 43: 0x00000004, 44: 0x00000016, 45: 0x00000007,
  46: 0x00000009, 47: 0x0000000A, 48: 0x0000000B, 49: 0x0000000D,
  50: 0x0000000E, 51: 0x0000000F, 52: 0x00000033, 53: 0x00000034,
  54: 0x00000028, 55: 0x00020000, 56: 0x020000B6, 57: 0x020000CD,
  58: 0x020000B5, 59: 0x020000E9, 60: 0x020000EA, 61: 0x020000E2,
  62: 0x00000010, 63: 0x00000036, 64: 0x00000037, 65: 0x00000038,
  66: 0x00200000, 67: 0x00010000, 68: 0x07000001, 69: 0x00040000,
  70: 0x08030000, 71: 0x08000001, 72: 0x0D000000, 73: 0x08020001,
  74: 0x08030101, 75: 0x08030201, 76: 0x08040200, 77: 0x08040100,
  98: 0x00000049, 99: 0x0000004C, 102: 0x0000004B, 103: 0x0000004E,
};

// Rebindable Categories & Key Choices
export interface RemapOption {
  code: number;
  label: string;
  category: string;
}

export const REMAP_CATEGORIES: { name: string; options: RemapOption[] }[] = [
  {
    name: 'Standard Keys',
    options: [
      { code: 0x00000004, label: 'A', category: 'Standard' },
      { code: 0x00000005, label: 'B', category: 'Standard' },
      { code: 0x00000006, label: 'C', category: 'Standard' },
      { code: 0x00000007, label: 'D', category: 'Standard' },
      { code: 0x00000008, label: 'E', category: 'Standard' },
      { code: 0x00000009, label: 'F', category: 'Standard' },
      { code: 0x0000000A, label: 'G', category: 'Standard' },
      { code: 0x0000000B, label: 'H', category: 'Standard' },
      { code: 0x0000000C, label: 'I', category: 'Standard' },
      { code: 0x0000000D, label: 'J', category: 'Standard' },
      { code: 0x0000000E, label: 'K', category: 'Standard' },
      { code: 0x0000000F, label: 'L', category: 'Standard' },
      { code: 0x00000010, label: 'M', category: 'Standard' },
      { code: 0x00000011, label: 'N', category: 'Standard' },
      { code: 0x00000012, label: 'O', category: 'Standard' },
      { code: 0x00000013, label: 'P', category: 'Standard' },
      { code: 0x00000014, label: 'Q', category: 'Standard' },
      { code: 0x00000015, label: 'R', category: 'Standard' },
      { code: 0x00000016, label: 'S', category: 'Standard' },
      { code: 0x00000017, label: 'T', category: 'Standard' },
      { code: 0x00000018, label: 'U', category: 'Standard' },
      { code: 0x00000019, label: 'V', category: 'Standard' },
      { code: 0x0000001A, label: 'W', category: 'Standard' },
      { code: 0x0000001B, label: 'X', category: 'Standard' },
      { code: 0x0000001C, label: 'Y', category: 'Standard' },
      { code: 0x0000001D, label: 'Z', category: 'Standard' },
      { code: 0x0000001E, label: '1 !', category: 'Standard' },
      { code: 0x0000001F, label: '2 @', category: 'Standard' },
      { code: 0x00000020, label: '3 #', category: 'Standard' },
      { code: 0x00000021, label: '4 $', category: 'Standard' },
      { code: 0x00000022, label: '5 %', category: 'Standard' },
      { code: 0x00000023, label: '6 ^', category: 'Standard' },
      { code: 0x00000024, label: '7 &', category: 'Standard' },
      { code: 0x00000025, label: '8 *', category: 'Standard' },
      { code: 0x00000026, label: '9 (', category: 'Standard' },
      { code: 0x00000027, label: '0 )', category: 'Standard' },
      { code: 0x00000028, label: 'Enter', category: 'Standard' },
      { code: 0x00000029, label: 'Escape', category: 'Standard' },
      { code: 0x0000002A, label: 'Backspace', category: 'Standard' },
      { code: 0x0000002B, label: 'Tab', category: 'Standard' },
      { code: 0x0000002C, label: 'Space', category: 'Standard' },
      { code: 0x0000002D, label: '- _', category: 'Standard' },
      { code: 0x0000002E, label: '= +', category: 'Standard' },
      { code: 0x0000002F, label: '[ {', category: 'Standard' },
      { code: 0x00000030, label: '] }', category: 'Standard' },
      { code: 0x00000031, label: '\\ |', category: 'Standard' },
      { code: 0x00000033, label: '; :', category: 'Standard' },
      { code: 0x00000034, label: '\' "', category: 'Standard' },
      { code: 0x00000035, label: '` ~', category: 'Standard' },
      { code: 0x00000036, label: ', <', category: 'Standard' },
      { code: 0x00000037, label: '. >', category: 'Standard' },
      { code: 0x00000038, label: '/ ?', category: 'Standard' },
      { code: 0x00000039, label: 'Caps Lock', category: 'Standard' },
    ]
  },
  {
    name: 'Modifiers',
    options: [
      { code: 0x00010000, label: 'Left Control', category: 'Modifiers' },
      { code: 0x00020000, label: 'Left Shift', category: 'Modifiers' },
      { code: 0x00040000, label: 'Left Alt', category: 'Modifiers' },
      { code: 0x00080000, label: 'Left Windows', category: 'Modifiers' },
      { code: 0x00100000, label: 'Right Control', category: 'Modifiers' },
      { code: 0x00200000, label: 'Right Shift', category: 'Modifiers' },
      { code: 0x00400000, label: 'Right Alt', category: 'Modifiers' },
      { code: 0x0D000000, label: 'Fn Key', category: 'Modifiers' },
    ]
  },
  {
    name: 'Navigation & Function',
    options: [
      { code: 0x0000003A, label: 'F1', category: 'Function' },
      { code: 0x0000003B, label: 'F2', category: 'Function' },
      { code: 0x0000003C, label: 'F3', category: 'Function' },
      { code: 0x0000003D, label: 'F4', category: 'Function' },
      { code: 0x0000003E, label: 'F5', category: 'Function' },
      { code: 0x0000003F, label: 'F6', category: 'Function' },
      { code: 0x00000040, label: 'F7', category: 'Function' },
      { code: 0x00000041, label: 'F8', category: 'Function' },
      { code: 0x00000042, label: 'F9', category: 'Function' },
      { code: 0x00000043, label: 'F10', category: 'Function' },
      { code: 0x00000044, label: 'F11', category: 'Function' },
      { code: 0x00000045, label: 'F12', category: 'Function' },
      { code: 0x00000049, label: 'Insert', category: 'Navigation' },
      { code: 0x0000004A, label: 'Home', category: 'Navigation' },
      { code: 0x0000004B, label: 'Page Up', category: 'Navigation' },
      { code: 0x0000004C, label: 'Delete', category: 'Navigation' },
      { code: 0x0000004D, label: 'End', category: 'Navigation' },
      { code: 0x0000004E, label: 'Page Down', category: 'Navigation' },
      { code: 0x0000004F, label: 'Arrow Right', category: 'Navigation' },
      { code: 0x00000050, label: 'Arrow Left', category: 'Navigation' },
      { code: 0x00000051, label: 'Arrow Down', category: 'Navigation' },
      { code: 0x00000052, label: 'Arrow Up', category: 'Navigation' },
    ]
  },
  {
    name: 'Media & Shortcuts',
    options: [
      { code: 0x020000CD, label: 'Play / Pause', category: 'Media' },
      { code: 0x020000B5, label: 'Next Track', category: 'Media' },
      { code: 0x020000B6, label: 'Previous Track', category: 'Media' },
      { code: 0x020000E9, label: 'Volume Up', category: 'Media' },
      { code: 0x020000EA, label: 'Volume Down', category: 'Media' },
      { code: 0x020000E2, label: 'Mute', category: 'Media' },
      { code: 0x07000001, label: 'Win Lock', category: 'Media' },
    ]
  },
  {
    name: 'Mouse Actions',
    options: [
      { code: 0x01010100, label: 'Mouse Left Click', category: 'Mouse' },
      { code: 0x01020100, label: 'Mouse Right Click', category: 'Mouse' },
      { code: 0x01040100, label: 'Mouse Middle Click', category: 'Mouse' },
    ]
  }
];

export function lookupKeyLabel(code: number): string {
  for (const cat of REMAP_CATEGORIES) {
    const found = cat.options.find(o => o.code === code);
    if (found) return found.label;
  }
  return `0x${code.toString(16).toUpperCase()}`;
}
