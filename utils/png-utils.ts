import { unzlibSync, zlibSync } from 'fflate';

// CRC32 table, computed once
const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c;
    }
    return t;
})();

function crc32(data: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(out: Uint8Array, pos: number, type: string, data: Uint8Array): number {
    const view = new DataView(out.buffer);
    view.setUint32(pos, data.length, false);
    pos += 4;
    for (let i = 0; i < 4; i++) out[pos + i] = type.charCodeAt(i);
    pos += 4;
    out.set(data, pos);
    pos += data.length;
    const crcBuf = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) crcBuf[i] = type.charCodeAt(i);
    crcBuf.set(data, 4);
    view.setUint32(pos, crc32(crcBuf), false);
    return pos + 4;
}

// Re-compresses the IDAT stream at zlib level 9 (browser canvas uses level 6).
// Falls back to the original data URL silently on any error.
export function recompressPng(dataUrl: string): string {
    try {
        const base64 = dataUrl.split(',')[1];
        if (!base64) return dataUrl;

        // Decode base64 → bytes
        const binaryStr = atob(base64);
        const src = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) src[i] = binaryStr.charCodeAt(i);

        // Parse PNG chunks
        let pos = 8; // skip 8-byte PNG signature
        const preIdat: Array<{ type: string; data: Uint8Array }> = [];
        const postIdat: Array<{ type: string; data: Uint8Array }> = [];
        const idatParts: Uint8Array[] = [];
        let seenIdat = false;

        while (pos + 12 <= src.length) {
            const len = ((src[pos] << 24) | (src[pos + 1] << 16) | (src[pos + 2] << 8) | src[pos + 3]) >>> 0;
            const type = String.fromCharCode(src[pos + 4], src[pos + 5], src[pos + 6], src[pos + 7]);
            const data = src.slice(pos + 8, pos + 8 + len);
            pos += 12 + len;

            if (type === 'IDAT') {
                idatParts.push(data);
                seenIdat = true;
            } else if (!seenIdat) {
                preIdat.push({ type, data });
            } else {
                postIdat.push({ type, data });
            }
        }

        if (idatParts.length === 0) return dataUrl;

        // Concatenate all IDAT chunks into one zlib stream
        const totalLen = idatParts.reduce((s, p) => s + p.length, 0);
        const combined = new Uint8Array(totalLen);
        let off = 0;
        for (const p of idatParts) { combined.set(p, off); off += p.length; }

        // Decompress zlib (RFC 1950 — what PNG IDAT uses) then recompress at level 9
        const raw = unzlibSync(combined);
        const recompressed = zlibSync(raw, { level: 9 });

        // Reconstruct PNG bytes
        const chunkBytes = (data: Uint8Array) => 12 + data.length;
        let totalSize = 8;
        for (const c of preIdat) totalSize += chunkBytes(c.data);
        totalSize += chunkBytes(recompressed);
        for (const c of postIdat) totalSize += chunkBytes(c.data);

        const out = new Uint8Array(totalSize);
        out.set([137, 80, 78, 71, 13, 10, 26, 10], 0); // PNG signature
        let outPos = 8;

        for (const c of preIdat) outPos = writeChunk(out, outPos, c.type, c.data);
        outPos = writeChunk(out, outPos, 'IDAT', recompressed);
        for (const c of postIdat) outPos = writeChunk(out, outPos, c.type, c.data);

        // Encode bytes → base64 data URL (chunked to avoid call-stack overflow)
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < out.length; i += chunkSize) {
            binary += String.fromCharCode(...Array.from(out.subarray(i, Math.min(i + chunkSize, out.length))));
        }
        return 'data:image/png;base64,' + btoa(binary);
    } catch {
        return dataUrl; // fall back silently on any parse/decompress error
    }
}
