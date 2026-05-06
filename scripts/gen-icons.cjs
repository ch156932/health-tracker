const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
  return Buffer.concat([len, typeB, data, crcBuf]);
}

function createPNG(size, bgR, bgG, bgB) {
  const sig = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const rows = [];
  const cx = size / 2, cy = size / 2;
  const cornerR = size * 0.18;
  const halfBox = size * 0.42;
  const barW = size * 0.09, barH = size * 0.30;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - cx) - halfBox;
      const dy = Math.abs(y - cy) - halfBox;
      const outside = (Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2) > cornerR ** 2
                      && (dx > 0 || dy > 0);

      const inCrossH = Math.abs(x - cx) < barH && Math.abs(y - cy) < barW;
      const inCrossV = Math.abs(x - cx) < barW && Math.abs(y - cy) < barH;
      const inCross = inCrossH || inCrossV;

      let pr, pg, pb;
      if (outside) {
        pr = 240; pg = 253; pb = 244;
      } else if (inCross) {
        pr = 255; pg = 255; pb = 255;
      } else {
        const factor = 1 - (y / size) * 0.18;
        pr = Math.min(255, Math.round(bgR * factor));
        pg = Math.min(255, Math.round(bgG * factor));
        pb = Math.min(255, Math.round(bgB * factor));
      }
      row[1 + x*3] = pr; row[1 + x*3+1] = pg; row[1 + x*3+2] = pb;
    }
    rows.push(row);
  }
  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([sig, makeChunk('IHDR', ihdr), makeChunk('IDAT', compressed), makeChunk('IEND', Buffer.alloc(0))]);
}

const dir = path.join(__dirname, '../public/icons');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), createPNG(192, 34, 197, 94));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createPNG(512, 34, 197, 94));
fs.writeFileSync(path.join(dir, 'icon-maskable.png'), createPNG(512, 34, 197, 94));
console.log('Icons generated!');
