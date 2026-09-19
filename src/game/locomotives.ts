export interface LocoDef {
  id: string;
  name: string;
  year: number;
  cost: number;
  speed: number;
  power: number;
  reliability: number;
  capacity: number;
  maint: number;
  kind: "steam" | "diesel";
  blurb: string;
}

export const LOCOMOTIVES: LocoDef[] = [
  {
    id: "pioneer",
    name: "Pioneer 0-4-0",
    year: 1829,
    cost: 18000,
    speed: 28,
    power: 1,
    reliability: 0.72,
    capacity: 3,
    maint: 1200,
    kind: "steam",
    blurb: "A rattling original. Slow, cheap, and proud of it.",
  },
  {
    id: "ironhorse",
    name: "Iron Horse 4-2-0",
    year: 1835,
    cost: 28000,
    speed: 38,
    power: 2,
    reliability: 0.76,
    capacity: 4,
    maint: 1600,
    kind: "steam",
    blurb: "The workhorse of the first boom years.",
  },
  {
    id: "atlantic",
    name: "Atlantic 4-4-0",
    year: 1848,
    cost: 42000,
    speed: 52,
    power: 3,
    reliability: 0.8,
    capacity: 5,
    maint: 2200,
    kind: "steam",
    blurb: "America's engine. Fast enough to matter.",
  },
  {
    id: "tenwheel",
    name: "Ten-Wheeler 4-6-0",
    year: 1860,
    cost: 58000,
    speed: 58,
    power: 4,
    reliability: 0.82,
    capacity: 6,
    maint: 2800,
    kind: "steam",
    blurb: "Passenger flyer with a freight spine.",
  },
  {
    id: "consolidation",
    name: "Consolidation 2-8-0",
    year: 1866,
    cost: 64000,
    speed: 42,
    power: 6,
    reliability: 0.84,
    capacity: 7,
    maint: 3200,
    kind: "steam",
    blurb: "Grades, coal, and iron. Built to haul.",
  },
  {
    id: "pacific",
    name: "Pacific 4-6-2",
    year: 1902,
    cost: 92000,
    speed: 78,
    power: 5,
    reliability: 0.88,
    capacity: 7,
    maint: 4200,
    kind: "steam",
    blurb: "Express varnish. Cities grow wherever it stops.",
  },
  {
    id: "mikado",
    name: "Mikado 2-8-2",
    year: 1911,
    cost: 98000,
    speed: 55,
    power: 7,
    reliability: 0.9,
    capacity: 8,
    maint: 4600,
    kind: "steam",
    blurb: "The freight standard of the new century.",
  },
  {
    id: "hudson",
    name: "Hudson 4-6-4",
    year: 1927,
    cost: 128000,
    speed: 92,
    power: 6,
    reliability: 0.91,
    capacity: 8,
    maint: 5400,
    kind: "steam",
    blurb: "Streamlined prestige on six-foot drivers.",
  },
  {
    id: "northern",
    name: "Northern 4-8-4",
    year: 1930,
    cost: 148000,
    speed: 88,
    power: 8,
    reliability: 0.93,
    capacity: 8,
    maint: 6200,
    kind: "steam",
    blurb: "Dual-service giant. Last of the steam royalty.",
  },
  {
    id: "streamliner",
    name: "Streamliner Diesel",
    year: 1938,
    cost: 165000,
    speed: 98,
    power: 7,
    reliability: 0.95,
    capacity: 8,
    maint: 5800,
    kind: "diesel",
    blurb: "No water stops. No cinders. The future, humming.",
  },
  {
    id: "switcher",
    name: "Road Switcher",
    year: 1950,
    cost: 142000,
    speed: 72,
    power: 8,
    reliability: 0.97,
    capacity: 8,
    maint: 4800,
    kind: "diesel",
    blurb: "Ugly, cheap to keep, and it never sleeps.",
  },
];

export function locosForYear(year: number): LocoDef[] {
  return LOCOMOTIVES.filter((l) => l.year <= year);
}

export function locoById(id: string): LocoDef {
  return LOCOMOTIVES.find((l) => l.id === id) ?? LOCOMOTIVES[0]!;
}

export function locoPortrait(id: string): string {
  return `/locos/${id}.jpg`;
}

export function locoFilm(id: string): string {
  return `/locos/${id}.mp4`;
}

export function tilesPerYear(loco: LocoDef): number {
  return 36 + loco.speed * 1.15 + loco.power * 4;
}
