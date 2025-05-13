import { Buffer } from 'buffer';
import process from 'process';
import { Readable } from 'stream';
import util from 'util';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    Readable: typeof Readable;
    util: typeof util;
  }
}

// Устанавливаем полифиллы глобально
globalThis.Buffer = Buffer;
globalThis.process = process;
globalThis.Readable = Readable;
globalThis.util = util;

// Также устанавливаем в window для совместимости
window.Buffer = Buffer;
window.process = process;
window.Readable = Readable;
window.util = util; 