import type { Region } from "./types";

const CITIES: Record<Region, string[]> = {
  columbia: [
    "Harrisburg", "Trenton", "Albany", "Providence", "Newhaven", "Camden",
    "Lancaster", "Wilmington", "Reading", "Scranton", "Utica", "Syracuse",
    "Rochester", "Buffalo", "Erie", "Pittsburgh", "Wheeling", "Cincinnati",
    "Columbus", "Cleveland", "Toledo", "Detroit", "Chicago", "Milwaukee",
    "Indianapolis", "Louisville", "Nashville", "Memphis", "St Louis",
    "Kansas City", "Omaha", "Des Moines", "Minneapolis", "Duluth", "Baltimore",
    "Richmond", "Norfolk", "Raleigh", "Charleston", "Savannah", "Atlanta",
    "Mobile", "New Orleans", "Boston", "Portland", "Concord", "Hartford",
  ],
  frontier: [
    "Independence", "Council Bluffs", "Cheyenne", "Laramie", "Ogden", "Salt Lake",
    "Promontory", "Reno", "Sacramento", "Oakland", "San Francisco", "Los Angeles",
    "San Diego", "Tucson", "Santa Fe", "Albuquerque", "Denver", "Pueblo",
    "Leadville", "Virginia City", "Boise", "Spokane", "Portland", "Seattle",
    "Tacoma", "Helena", "Butte", "Billings", "Fargo", "Bismarck", "Deadwood",
    "Dodge City", "Abilene", "Fort Worth", "Dallas", "Houston", "Galveston",
    "El Paso", "Tombstone", "Prescott", "Yuma", "Stockton", "Fresno",
  ],
  albion: [
    "Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool", "Bristol",
    "Newcastle", "Nottingham", "Leicester", "Coventry", "Bradford", "Hull",
    "Stoke", "Wolverhampton", "Derby", "Southampton", "Portsmouth", "Plymouth",
    "Exeter", "Oxford", "Cambridge", "Norwich", "Ipswich", "York", "Preston",
    "Blackburn", "Bolton", "Stockport", "Oldham", "Sunderland", "Middlesbrough",
    "Cardiff", "Swansea", "Glasgow", "Edinburgh", "Dundee", "Aberdeen",
    "Belfast", "Crewe", "Swindon", "Doncaster", "Peterborough", "Reading",
  ],
  continent: [
    "Lyon", "Marseille", "Bordeaux", "Lille", "Strasbourg", "Toulouse",
    "Cologne", "Frankfurt", "Hamburg", "Munich", "Leipzig", "Dresden",
    "Breslau", "Hanover", "Stuttgart", "Antwerp", "Brussels", "Liege",
    "Amsterdam", "Rotterdam", "Utrecht", "Milan", "Turin", "Genoa",
    "Venice", "Florence", "Naples", "Vienna", "Prague", "Budapest",
    "Warsaw", "Krakow", "Zurich", "Basel", "Geneva", "Barcelona",
    "Madrid", "Valencia", "Lisbon", "Porto", "Copenhagen", "Stockholm",
  ],
  outback: [
    "Newcastle", "Wollongong", "Bathurst", "Goulburn", "Albury", "Wagga",
    "Broken Hill", "Dubbo", "Tamworth", "Toowoomba", "Rockhampton", "Townsville",
    "Cairns", "Bundaberg", "Maryborough", "Gympie", "Ipswich", "Southport",
    "Ballarat", "Bendigo", "Geelong", "Warrnambool", "Mildura", "Shepparton",
    "Launceston", "Burnie", "Hobart", "Adelaide", "Port Augusta", "Whyalla",
    "Kalgoorlie", "Fremantle", "Albany", "Geraldton", "Darwin", "Alice Springs",
    "Mount Isa", "Charters Towers", "Mackay", "Coffs Harbour", "Orange",
  ],
};

const AI_LINES = [
  "Apex & Pacific",
  "Blackstone Line",
  "Continental Freight",
  "Pioneer & Western",
  "Redwood Central",
  "Northern Star",
  "Empire Trunk",
  "Sable River Co.",
  "Crown & Gauge",
  "Iron Compass",
];

const TRAIN_NAMES = [
  "Morning Star", "Night Mail", "Copperhead", "The Governor", "Prairie Hawk",
  "Black Diamond", "Silver Flyer", "The Commodore", "Iron Duchess", "Westbound",
  "The Mercury", "Coal Queen", "Harbor Limited", "The Pioneer", "Red Signal",
  "Timberwolf", "The Senator", "Gulf Wind", "Overland", "The Crescent",
];

export function cityNames(
  region: Region,
  rng: { shuffle: <T>(a: T[]) => T[] },
  count: number,
): string[] {
  const pool = [...CITIES[region]];
  rng.shuffle(pool);
  return pool.slice(0, count);
}

export function extraTownName(
  region: Region,
  rng: { pick: <T>(a: T[]) => T; int: (a: number, b: number) => number },
  used: Set<string>,
): string {
  const prefixes = ["New", "West", "East", "North", "South", "Upper", "Port", "Fort", "Little", "Mount"];
  const pool = CITIES[region];
  for (let i = 0; i < 40; i++) {
    const n = `${rng.pick(prefixes)} ${rng.pick(pool)}`;
    if (!used.has(n)) return n;
  }
  return `Millford ${rng.int(2, 80)}`;
}

export function aiCompanyName(rng: { pick: <T>(a: T[]) => T }, used: Set<string>): string {
  const pool = AI_LINES.filter((n) => !used.has(n));
  return pool.length ? rng.pick(pool) : `Line ${used.size + 1}`;
}

export function trainName(rng: { pick: <T>(a: T[]) => T }, used: Set<string>): string {
  const pool = TRAIN_NAMES.filter((n) => !used.has(n));
  return pool.length ? rng.pick(pool) : `Train ${used.size + 1}`;
}
