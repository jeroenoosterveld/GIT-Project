const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function base64Encode(value: string): string {
  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(unescape(encodeURIComponent(value)));
  }

  let output = '';
  let index = 0;
  const input = unescape(encodeURIComponent(value));

  while (index < input.length) {
    const byte1 = input.charCodeAt(index++);
    const byte2 = input.charCodeAt(index++);
    const byte3 = input.charCodeAt(index++);

    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = isNaN(byte2) ? 64 : ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = isNaN(byte3) ? 64 : byte3 & 63;

    output +=
      CHARS.charAt(enc1) +
      CHARS.charAt(enc2) +
      CHARS.charAt(enc3) +
      CHARS.charAt(enc4);
  }

  return output;
}
