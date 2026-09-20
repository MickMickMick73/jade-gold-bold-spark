import type { Resource, Terrain } from "./types";

export interface SpriteBank {
  terrain: Record<Terrain, HTMLImageElement>;
  trees: HTMLImageElement[];
  loco: HTMLImageElement[];
  freight: HTMLImageElement[];
  coach: HTMLImageElement[];
  diesel: HTMLImageElement;
  station: HTMLImageElement;
  town: HTMLImageElement;
  factory: HTMLImageElement;
  mountain: HTMLImageElement;
  cargo: Record<string, HTMLImageElement>;
  ships: HTMLImageElement[];
  planes: HTMLImageElement[];
  port: HTMLImageElement | null;
  airport: HTMLImageElement | null;
}

let bank: SpriteBank | null = null;
let loading: Promise<SpriteBank | null> | null = null;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

export function getSprites(): SpriteBank | null {
  return bank;
}

export function loadSprites(): Promise<SpriteBank | null> {
  if (bank) return Promise.resolve(bank);
  if (loading) return loading;
  const terrains: Terrain[] = [
    "plains",
    "forest",
    "hills",
    "mountains",
    "desert",
    "swamp",
    "coast",
    "ocean",
    "river",
  ];
  loading = (async () => {
    const [
      plains,
      forest,
      hills,
      mountains,
      desert,
      swamp,
      coast,
      ocean,
      river,
      t1,
      t2,
      t3,
      t4,
      l1,
      l2,
      l3,
      l4,
      f1,
      f2,
      f3,
      f4,
      c1,
      c2,
      c3,
      c4,
      diesel,
      station,
      town,
      factory,
      mountain,
      coal,
      iron,
      steel,
      grain,
      cattle,
      lumber,
      oil,
      mail,
      goods,
    ] = await Promise.all([
      ...terrains.map((t) => loadImg(`/sprites/terrain-${t}.png`)),
      loadImg("/sprites/tree-1.png"),
      loadImg("/sprites/tree-2.png"),
      loadImg("/sprites/tree-3.png"),
      loadImg("/sprites/tree-4.png"),
      loadImg("/sprites/loco-1.png"),
      loadImg("/sprites/loco-2.png"),
      loadImg("/sprites/loco-3.png"),
      loadImg("/sprites/loco-4.png"),
      loadImg("/sprites/freight-1.png"),
      loadImg("/sprites/freight-2.png"),
      loadImg("/sprites/freight-3.png"),
      loadImg("/sprites/freight-4.png"),
      loadImg("/sprites/coach-1.png"),
      loadImg("/sprites/coach-2.png"),
      loadImg("/sprites/coach-3.png"),
      loadImg("/sprites/coach-4.png"),
      loadImg("/sprites/diesel.png"),
      loadImg("/sprites/station.png"),
      loadImg("/sprites/town.png"),
      loadImg("/sprites/factory.png"),
      loadImg("/sprites/mountain.png"),
      loadImg("/sprites/cargo-coal.png"),
      loadImg("/sprites/cargo-iron.png"),
      loadImg("/sprites/cargo-steel.png"),
      loadImg("/sprites/cargo-grain.png"),
      loadImg("/sprites/cargo-cattle.png"),
      loadImg("/sprites/cargo-lumber.png"),
      loadImg("/sprites/cargo-oil.png"),
      loadImg("/sprites/cargo-mail.png"),
      loadImg("/sprites/cargo-goods.png"),
    ]);
    bank = {
      terrain: { plains, forest, hills, mountains, desert, swamp, coast, ocean, river },
      trees: [t1, t2, t3, t4],
      loco: [l1, l2, l3, l4],
      freight: [f1, f2, f3, f4],
      coach: [c1, c2, c3, c4],
      diesel,
      station,
      town,
      factory,
      mountain,
      cargo: { coal, iron, steel, grain, cattle, lumber, oil, mail, goods, pax: mail },
      ships: [],
      planes: [],
      port: null,
      airport: null,
    };
    const extra = await Promise.allSettled([
      loadImg("/sprites/ship-1.png"),
      loadImg("/sprites/ship-2.png"),
      loadImg("/sprites/ship-3.png"),
      loadImg("/sprites/ship-4.png"),
      loadImg("/sprites/plane-1.png"),
      loadImg("/sprites/plane-2.png"),
      loadImg("/sprites/plane-3.png"),
      loadImg("/sprites/plane-4.png"),
      loadImg("/sprites/port.png"),
      loadImg("/sprites/airport.png"),
    ]);
    const ok = extra.map((r) => (r.status === "fulfilled" ? r.value : null));
    bank.ships = ok.slice(0, 4).filter((x): x is HTMLImageElement => !!x);
    bank.planes = ok.slice(4, 8).filter((x): x is HTMLImageElement => !!x);
    bank.port = ok[8] ?? null;
    bank.airport = ok[9] ?? null;
    return bank;
  })().catch((err) => {
    console.warn("Sprite load failed", err);
    loading = null;
    return null;
  });
  return loading;
}

export function hash2(x: number, y: number): number {
  return Math.abs((Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) | 0);
}

export function headingDir(heading: number): number {
  // Grid atan2 → isometric sprite index. Dominant axis, not round-to-quadrant:
  // a N/S tangent with a tiny x wobble used to snap to east and put coaches
  // 90° across the locomotive.
  //   0  loco-1 / coach-1  screen down-left  = grid south
  //   1  loco-2 / coach-2  screen down-right = grid east
  //   2  loco-3 / coach-3  screen up-right   = grid north
  //   3  loco-4 / coach-4  screen up-left    = grid west
  const dx = Math.cos(heading);
  const dy = Math.sin(heading);
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 1 : 3;
  return dy >= 0 ? 0 : 2;
}

/** Same four facings as the locomotive — coaches have N/S art, do not reuse E/W. */
export function carDir(heading: number): { idx: number; flipX: boolean } {
  return { idx: headingDir(heading), flipX: false };
}

export function cargoSprite(bank: SpriteBank, res: Resource | string): HTMLImageElement | undefined {
  return bank.cargo[res];
}
