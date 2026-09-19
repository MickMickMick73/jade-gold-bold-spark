export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string | number): number {
  if (typeof input === "number" && Number.isFinite(input)) return input >>> 0;
  return xmur3(String(input))();
}

export function makeRng(seed: number | string, salt = 0) {
  const s = (hashSeed(seed) ^ (salt >>> 0)) >>> 0;
  const rng = mulberry32(s || 1);
  return {
    seed: s,
    next: rng,
    float(a = 0, b = 1) {
      return a + rng() * (b - a);
    },
    int(a: number, b: number) {
      return Math.floor(a + rng() * (b - a + 1));
    },
    pick<T>(arr: readonly T[]): T {
      return arr[Math.floor(rng() * arr.length)]!;
    },
    chance(p: number) {
      return rng() < p;
    },
    shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
      }
      return arr;
    },
  };
}

export type Rng = ReturnType<typeof makeRng>;
