import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as TrainFront, c as Play, d as Map$1, f as FastForward, i as Trash2, l as Pause, m as BookOpen, n as Wallet, o as Settings, p as Building2, s as Search, t as X, u as Newspaper } from "../_libs/lucide-react.mjs";
import { t as createNoise2D } from "../_libs/simplex-noise.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CY5fIVtA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CARGOS = [
	"pax",
	"mail",
	"coal",
	"iron",
	"steel",
	"grain",
	"cattle",
	"lumber",
	"goods",
	"oil"
];
var DIRS = [
	{
		bit: 1,
		dx: 0,
		dy: -1,
		opp: 4
	},
	{
		bit: 2,
		dx: 1,
		dy: 0,
		opp: 8
	},
	{
		bit: 4,
		dx: 0,
		dy: 1,
		opp: 1
	},
	{
		bit: 8,
		dx: -1,
		dy: 0,
		opp: 2
	}
];
var CARGO_LABEL = {
	pax: "Passengers",
	mail: "Mail",
	coal: "Coal",
	iron: "Iron",
	steel: "Steel",
	grain: "Grain",
	cattle: "Livestock",
	lumber: "Lumber",
	goods: "Goods",
	oil: "Oil"
};
var CARGO_COLOR = {
	pax: "#d8d3c4",
	mail: "#c4a574",
	coal: "#2a2a28",
	iron: "#6a5a4a",
	steel: "#8a949c",
	grain: "#c4b46a",
	cattle: "#8a5a42",
	lumber: "#4a6a3a",
	goods: "#6a6a8a",
	oil: "#3a3a32"
};
var COMPANY_COLORS = [
	"#9aa4ae",
	"#8f4d42",
	"#4a5c40",
	"#5c6b7a"
];
function xmur3(str) {
	let h = 1779033703 ^ str.length;
	for (let i = 0; i < str.length; i++) {
		h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
		h = h << 13 | h >>> 19;
	}
	return () => {
		h = Math.imul(h ^ h >>> 16, 2246822507);
		h = Math.imul(h ^ h >>> 13, 3266489909);
		h ^= h >>> 16;
		return h >>> 0;
	};
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hashSeed(input) {
	if (typeof input === "number" && Number.isFinite(input)) return input >>> 0;
	return xmur3(String(input))();
}
function makeRng(seed, salt = 0) {
	const s = (hashSeed(seed) ^ salt >>> 0) >>> 0;
	const rng = mulberry32(s || 1);
	return {
		seed: s,
		next: rng,
		float(a = 0, b = 1) {
			return a + rng() * (b - a);
		},
		int(a, b) {
			return Math.floor(a + rng() * (b - a + 1));
		},
		pick(arr) {
			return arr[Math.floor(rng() * arr.length)];
		},
		chance(p) {
			return rng() < p;
		},
		shuffle(arr) {
			for (let i = arr.length - 1; i > 0; i--) {
				const j = Math.floor(rng() * (i + 1));
				[arr[i], arr[j]] = [arr[j], arr[i]];
			}
			return arr;
		}
	};
}
var CITIES = {
	columbia: [
		"Harrisburg",
		"Trenton",
		"Albany",
		"Providence",
		"Newhaven",
		"Camden",
		"Lancaster",
		"Wilmington",
		"Reading",
		"Scranton",
		"Utica",
		"Syracuse",
		"Rochester",
		"Buffalo",
		"Erie",
		"Pittsburgh",
		"Wheeling",
		"Cincinnati",
		"Columbus",
		"Cleveland",
		"Toledo",
		"Detroit",
		"Chicago",
		"Milwaukee",
		"Indianapolis",
		"Louisville",
		"Nashville",
		"Memphis",
		"St Louis",
		"Kansas City",
		"Omaha",
		"Des Moines",
		"Minneapolis",
		"Duluth",
		"Baltimore",
		"Richmond",
		"Norfolk",
		"Raleigh",
		"Charleston",
		"Savannah",
		"Atlanta",
		"Mobile",
		"New Orleans",
		"Boston",
		"Portland",
		"Concord",
		"Hartford"
	],
	frontier: [
		"Independence",
		"Council Bluffs",
		"Cheyenne",
		"Laramie",
		"Ogden",
		"Salt Lake",
		"Promontory",
		"Reno",
		"Sacramento",
		"Oakland",
		"San Francisco",
		"Los Angeles",
		"San Diego",
		"Tucson",
		"Santa Fe",
		"Albuquerque",
		"Denver",
		"Pueblo",
		"Leadville",
		"Virginia City",
		"Boise",
		"Spokane",
		"Portland",
		"Seattle",
		"Tacoma",
		"Helena",
		"Butte",
		"Billings",
		"Fargo",
		"Bismarck",
		"Deadwood",
		"Dodge City",
		"Abilene",
		"Fort Worth",
		"Dallas",
		"Houston",
		"Galveston",
		"El Paso",
		"Tombstone",
		"Prescott",
		"Yuma",
		"Stockton",
		"Fresno"
	],
	albion: [
		"Manchester",
		"Birmingham",
		"Leeds",
		"Sheffield",
		"Liverpool",
		"Bristol",
		"Newcastle",
		"Nottingham",
		"Leicester",
		"Coventry",
		"Bradford",
		"Hull",
		"Stoke",
		"Wolverhampton",
		"Derby",
		"Southampton",
		"Portsmouth",
		"Plymouth",
		"Exeter",
		"Oxford",
		"Cambridge",
		"Norwich",
		"Ipswich",
		"York",
		"Preston",
		"Blackburn",
		"Bolton",
		"Stockport",
		"Oldham",
		"Sunderland",
		"Middlesbrough",
		"Cardiff",
		"Swansea",
		"Glasgow",
		"Edinburgh",
		"Dundee",
		"Aberdeen",
		"Belfast",
		"Crewe",
		"Swindon",
		"Doncaster",
		"Peterborough",
		"Reading"
	],
	continent: [
		"Lyon",
		"Marseille",
		"Bordeaux",
		"Lille",
		"Strasbourg",
		"Toulouse",
		"Cologne",
		"Frankfurt",
		"Hamburg",
		"Munich",
		"Leipzig",
		"Dresden",
		"Breslau",
		"Hanover",
		"Stuttgart",
		"Antwerp",
		"Brussels",
		"Liege",
		"Amsterdam",
		"Rotterdam",
		"Utrecht",
		"Milan",
		"Turin",
		"Genoa",
		"Venice",
		"Florence",
		"Naples",
		"Vienna",
		"Prague",
		"Budapest",
		"Warsaw",
		"Krakow",
		"Zurich",
		"Basel",
		"Geneva",
		"Barcelona",
		"Madrid",
		"Valencia",
		"Lisbon",
		"Porto",
		"Copenhagen",
		"Stockholm"
	],
	outback: [
		"Newcastle",
		"Wollongong",
		"Bathurst",
		"Goulburn",
		"Albury",
		"Wagga",
		"Broken Hill",
		"Dubbo",
		"Tamworth",
		"Toowoomba",
		"Rockhampton",
		"Townsville",
		"Cairns",
		"Bundaberg",
		"Maryborough",
		"Gympie",
		"Ipswich",
		"Southport",
		"Ballarat",
		"Bendigo",
		"Geelong",
		"Warrnambool",
		"Mildura",
		"Shepparton",
		"Launceston",
		"Burnie",
		"Hobart",
		"Adelaide",
		"Port Augusta",
		"Whyalla",
		"Kalgoorlie",
		"Fremantle",
		"Albany",
		"Geraldton",
		"Darwin",
		"Alice Springs",
		"Mount Isa",
		"Charters Towers",
		"Mackay",
		"Coffs Harbour",
		"Orange"
	]
};
var AI_LINES = [
	"Apex & Pacific",
	"Blackstone Line",
	"Continental Freight",
	"Pioneer & Western",
	"Redwood Central",
	"Northern Star",
	"Empire Trunk",
	"Sable River Co.",
	"Crown & Gauge",
	"Iron Compass"
];
var TRAIN_NAMES = [
	"Morning Star",
	"Night Mail",
	"Copperhead",
	"The Governor",
	"Prairie Hawk",
	"Black Diamond",
	"Silver Flyer",
	"The Commodore",
	"Iron Duchess",
	"Westbound",
	"The Mercury",
	"Coal Queen",
	"Harbor Limited",
	"The Pioneer",
	"Red Signal",
	"Timberwolf",
	"The Senator",
	"Gulf Wind",
	"Overland",
	"The Crescent"
];
function cityNames(region, rng, count) {
	const pool = [...CITIES[region]];
	rng.shuffle(pool);
	return pool.slice(0, count);
}
function aiCompanyName(rng, used) {
	const pool = AI_LINES.filter((n) => !used.has(n));
	return pool.length ? rng.pick(pool) : `Line ${used.size + 1}`;
}
function trainName(rng, used) {
	const pool = TRAIN_NAMES.filter((n) => !used.has(n));
	return pool.length ? rng.pick(pool) : `No. ${used.size + 1}`;
}
var SCENARIOS = [
	{
		id: "pioneer",
		title: "The Iron Pioneer",
		blurb: "1830. A green continent and a pocket of silver. Connect the cities, grow an empire, and die rich.",
		region: "columbia",
		size: "medium",
		year: 1830,
		difficulty: "normal",
		rivals: 1,
		cash: 5e5,
		goals: [{
			kind: "networth",
			target: 1e6,
			label: "Reach $1,000,000 net worth"
		}, {
			kind: "connect",
			target: 6,
			label: "Serve 6 cities with stations"
		}]
	},
	{
		id: "transcon",
		title: "Sea to Sea",
		blurb: "1866. Span the continent before the rivals do. East must meet west.",
		region: "frontier",
		size: "large",
		year: 1866,
		difficulty: "normal",
		rivals: 2,
		cash: 75e4,
		mapHint: "wide",
		timeLimit: 1885,
		goals: [{
			kind: "connect",
			target: 10,
			label: "Serve 10 cities"
		}, {
			kind: "networth",
			target: 2e6,
			label: "Reach $2,000,000 net worth"
		}]
	},
	{
		id: "coal",
		title: "The Coal Rush",
		blurb: "Mines are coughing black gold. Haul 400 loads of coal before the boom fades.",
		region: "columbia",
		size: "medium",
		year: 1852,
		difficulty: "normal",
		rivals: 2,
		cash: 42e4,
		timeLimit: 1872,
		goals: [{
			kind: "cargo",
			target: 400,
			cargo: "coal",
			label: "Deliver 400 loads of coal"
		}]
	},
	{
		id: "mail",
		title: "Royal Mail",
		blurb: "Albion, 1829. The Postmaster will pay the first company to bind the realm with iron.",
		region: "albion",
		size: "small",
		year: 1829,
		difficulty: "easy",
		rivals: 1,
		cash: 38e4,
		mapHint: "dense",
		goals: [{
			kind: "connect",
			target: 8,
			label: "Serve 8 towns"
		}, {
			kind: "cargo",
			target: 200,
			cargo: "mail",
			label: "Deliver 200 bags of mail"
		}]
	},
	{
		id: "barons",
		title: "Robber Barons",
		blurb: "Three companies. One continent. Bankrupt the others or be eaten.",
		region: "columbia",
		size: "medium",
		year: 1870,
		difficulty: "hard",
		rivals: 3,
		cash: 4e5,
		goals: [{
			kind: "bankrupt_ai",
			target: 3,
			label: "Drive every rival into bankruptcy"
		}]
	},
	{
		id: "steel",
		title: "The Steel Age",
		blurb: "Iron, coal, fire. Complete the industrial chain and flood the cities with steel and goods.",
		region: "continent",
		size: "medium",
		year: 1875,
		difficulty: "normal",
		rivals: 2,
		cash: 55e4,
		goals: [{
			kind: "cargo",
			target: 180,
			cargo: "steel",
			label: "Deliver 180 loads of steel"
		}, {
			kind: "cargo",
			target: 120,
			cargo: "goods",
			label: "Deliver 120 loads of goods"
		}]
	},
	{
		id: "frontier",
		title: "Frontier Charter",
		blurb: "Four lonely towns on a harsh map. Survive, then thrive.",
		region: "frontier",
		size: "small",
		year: 1869,
		difficulty: "hard",
		rivals: 1,
		cash: 28e4,
		mapHint: "islands",
		goals: [{
			kind: "connect",
			target: 4,
			label: "Serve every town"
		}, {
			kind: "networth",
			target: 8e5,
			label: "Reach $800,000 net worth"
		}]
	},
	{
		id: "empire",
		title: "A Twenty-Year Empire",
		blurb: "Large map. Rivals at your heels. Be the richest house when the century turns.",
		region: "columbia",
		size: "large",
		year: 1880,
		difficulty: "normal",
		rivals: 3,
		cash: 6e5,
		timeLimit: 1900,
		goals: [{
			kind: "year_worth",
			target: 3e6,
			label: "Hold $3,000,000 net worth by 1900"
		}]
	},
	{
		id: "outback",
		title: "Southern Gauge",
		blurb: "A wide dry country and long, thirsty hauls. Link the coast to the interior.",
		region: "outback",
		size: "medium",
		year: 1865,
		difficulty: "normal",
		rivals: 1,
		cash: 48e4,
		goals: [{
			kind: "connect",
			target: 7,
			label: "Serve 7 towns"
		}, {
			kind: "cargo",
			target: 150,
			cargo: "cattle",
			label: "Deliver 150 loads of livestock"
		}]
	}
];
var DIFFICULTY_META = {
	easy: {
		label: "Easy",
		cash: 75e4,
		rev: 1.3,
		cost: .8,
		rivals: 1
	},
	normal: {
		label: "Normal",
		cash: 5e5,
		rev: 1,
		cost: 1,
		rivals: 2
	},
	hard: {
		label: "Hard",
		cash: 32e4,
		rev: .85,
		cost: 1.15,
		rivals: 3
	},
	magnate: {
		label: "Magnate",
		cash: 18e4,
		rev: .7,
		cost: 1.3,
		rivals: 3
	}
};
var SIZE_META = {
	small: {
		w: 48,
		h: 48,
		cities: [6, 8],
		label: "Small"
	},
	medium: {
		w: 64,
		h: 64,
		cities: [10, 14],
		label: "Medium"
	},
	large: {
		w: 80,
		h: 80,
		cities: [16, 22],
		label: "Large"
	}
};
function fbm(noise, x, y, oct = 5) {
	let v = 0;
	let a = 1;
	let f = 1;
	let s = 0;
	for (let i = 0; i < oct; i++) {
		v += a * noise(x * f, y * f);
		s += a;
		a *= .5;
		f *= 2;
	}
	return v / s;
}
function emptyCargo() {
	const o = {};
	for (const c of CARGOS) o[c] = 0;
	return o;
}
function generateWorld(opts) {
	const seed = opts.seed ?? (Math.floor(Math.random() * 4294967295) || 1);
	const rng = makeRng(seed, 1);
	const nElev = createNoise2D(makeRng(seed, 11).next);
	const nMoist = createNoise2D(makeRng(seed, 22).next);
	const nRes = createNoise2D(makeRng(seed, 33).next);
	const sc = opts.scenario;
	const size = sc?.size ?? opts.size;
	let w = SIZE_META[size].w;
	let h = SIZE_META[size].h;
	const hint = sc?.mapHint ?? "standard";
	if (hint === "wide") {
		w = 96;
		h = 48;
	}
	const tiles = new Array(w * h);
	const island = hint === "islands";
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
		const nx = x / w;
		const ny = y / h;
		const dx = (nx - .5) * 2;
		const dy = (ny - .5) * 2;
		let mask = 1 - Math.pow(Math.min(1, Math.hypot(dx, dy) * (island ? 1.05 : .92)), 1.6);
		if (hint === "wide") {
			const edge = Math.min(nx, 1 - nx, ny * 2, (1 - ny) * 2);
			mask = Math.min(1, edge * 3);
		}
		let elev = (fbm(nElev, x * .035, y * .035) + 1) * .5;
		elev = Math.pow(elev, 1.15) * (.35 + mask * .75);
		const moist = (fbm(nMoist, x * .04 + 40, y * .04) + 1) * .5;
		let t;
		if (elev < .28) t = "ocean";
		else if (elev < .32) t = "coast";
		else if (elev > .78) t = "mountains";
		else if (elev > .62) t = "hills";
		else if (moist < .28 && elev > .36) t = "desert";
		else if (moist > .72 && elev < .5) t = "swamp";
		else if (moist > .52) t = "forest";
		else t = "plains";
		tiles[y * w + x] = {
			t,
			h: elev,
			track: 0,
			owner: 0,
			bridge: false,
			tunnel: false
		};
	}
	const riverRng = makeRng(seed, 44);
	const riverCount = size === "large" ? 7 : size === "medium" ? 5 : 3;
	for (let r = 0; r < riverCount; r++) {
		let x = riverRng.int(4, w - 5);
		let y = riverRng.int(4, h - 5);
		let best = -1;
		for (let k = 0; k < 40; k++) {
			const tx = riverRng.int(2, w - 3);
			const ty = riverRng.int(2, h - 3);
			const e = tiles[ty * w + tx].h;
			if (e > best) {
				best = e;
				x = tx;
				y = ty;
			}
		}
		for (let step = 0; step < w + h; step++) {
			const t = tiles[y * w + x];
			if (t.t === "ocean") break;
			if (t.t !== "mountains") t.t = "river";
			let nx = x;
			let ny = y;
			let nh = t.h + 1;
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, 1],
				[-1, 1],
				[1, -1],
				[-1, -1]
			]) {
				const xx = x + dx;
				const yy = y + dy;
				if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
				const e = tiles[yy * w + xx].h;
				if (e < nh) {
					nh = e;
					nx = xx;
					ny = yy;
				}
			}
			if (nx === x && ny === y) break;
			x = nx;
			y = ny;
		}
	}
	const seen = new Uint8Array(w * h);
	let bestId = 0;
	let bestSize = 0;
	const idOf = new Int32Array(w * h);
	let landId = 1;
	const isLand = (t) => t !== "ocean";
	for (let i = 0; i < w * h; i++) {
		if (seen[i] || !isLand(tiles[i].t)) continue;
		const q = [i];
		seen[i] = 1;
		let n = 0;
		const my = landId++;
		while (q.length) {
			const c = q.pop();
			idOf[c] = my;
			n++;
			const cx = c % w;
			const cy = c / w | 0;
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1]
			]) {
				const nx = cx + dx;
				const ny = cy + dy;
				if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
				const ni = ny * w + nx;
				if (seen[ni] || !isLand(tiles[ni].t)) continue;
				seen[ni] = 1;
				q.push(ni);
			}
		}
		if (n > bestSize) {
			bestSize = n;
			bestId = my;
		}
	}
	const goodCity = (x, y) => {
		const t = tiles[y * w + x];
		if (idOf[y * w + x] !== bestId) return false;
		if (t.t === "ocean" || t.t === "mountains" || t.t === "river") return false;
		return t.t === "plains" || t.t === "coast" || t.t === "forest" || t.t === "hills" || t.t === "desert";
	};
	const cityCountRange = SIZE_META[size].cities;
	const nCities = rng.int(cityCountRange[0], cityCountRange[1]);
	const names = cityNames(opts.region, rng, nCities + 4);
	const cities = [];
	const minDist = size === "small" ? 6 : size === "medium" ? 7 : 8;
	let attempts = 0;
	while (cities.length < nCities && attempts < 4e3) {
		attempts++;
		const x = rng.int(2, w - 3);
		const y = rng.int(2, h - 3);
		if (!goodCity(x, y)) continue;
		if (cities.some((c) => Math.hypot(c.x - x, c.y - y) < minDist)) continue;
		if (![
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
			[2, 0],
			[0, 2]
		].some(([dx, dy]) => {
			const t = tiles[(y + dy) * w + (x + dx)];
			return t && (t.t === "river" || t.t === "coast" || t.t === "ocean");
		}) && rng.chance(.55) && attempts < 2500) continue;
		const name = names[cities.length] ?? `Town ${cities.length + 1}`;
		const pop = rng.int(4, 18) * 1e3;
		const industries = [];
		if (rng.chance(.35)) industries.push({
			kind: "Factory",
			produces: "goods",
			consumes: [
				"steel",
				"lumber",
				"coal"
			]
		});
		if (rng.chance(.2)) industries.push({
			kind: "Steel mill",
			produces: "steel",
			consumes: ["iron", "coal"]
		});
		const demand = emptyCargo();
		demand.pax = 8 + Math.round(pop / 2e3);
		demand.mail = 4 + Math.round(pop / 4e3);
		demand.goods = 3 + Math.round(pop / 5e3);
		demand.grain = 3;
		demand.coal = 2;
		const supply = emptyCargo();
		supply.pax = demand.pax;
		supply.mail = demand.mail;
		cities.push({
			id: cities.length + 1,
			name,
			x,
			y,
			pop,
			industries,
			demand,
			supply,
			served: false
		});
		tiles[y * w + x].t = "plains";
	}
	if ((opts.year ?? sc?.year ?? 1830) >= 1869) {}
	for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
		const t = tiles[y * w + x];
		if (t.t === "ocean" || t.t === "river" || t.t === "mountains") continue;
		if (cities.some((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1)) continue;
		const n = nRes(x * .09, y * .09);
		if (n > .62) {
			if (t.t === "hills") t.res = n > .78 ? "iron" : "coal";
			else if (t.t === "forest") t.res = "lumber";
			else if (t.t === "desert") t.res = "oil";
			else if (t.t === "plains") t.res = rng.chance(.5) ? "grain" : "cattle";
		} else if (t.t === "forest" && n > .35) t.res = "lumber";
		else if (t.t === "plains" && n < -.55) t.res = rng.chance(.5) ? "grain" : "cattle";
		else if (t.t === "hills" && n < -.5) t.res = rng.chance(.5) ? "coal" : "iron";
	}
	const year = opts.year ?? sc?.year ?? 1830;
	const playerName = opts.companyName.trim() || "Player Line";
	const used = /* @__PURE__ */ new Set([playerName]);
	const rivals = sc?.rivals ?? opts.rivals;
	const companies = [{
		id: 1,
		name: playerName,
		color: COMPANY_COLORS[0],
		cash: sc?.cash ?? optsCash(opts),
		ai: false,
		stockPrice: 10,
		shares: 1e3,
		playerShares: 600,
		trackTiles: 0,
		trainsBuilt: 0,
		revenueYtd: 0,
		expenseYtd: 0,
		bonds: [],
		bankrupt: false
	}];
	for (let i = 0; i < rivals; i++) {
		const name = aiCompanyName(rng, used);
		used.add(name);
		companies.push({
			id: i + 2,
			name,
			color: COMPANY_COLORS[(i + 1) % COMPANY_COLORS.length],
			cash: companies[0].cash * (.7 + rng.float(0, .3)),
			ai: true,
			stockPrice: 8 + rng.float(0, 4),
			shares: 1e3,
			playerShares: 0,
			trackTiles: 0,
			trainsBuilt: 0,
			revenueYtd: 0,
			expenseYtd: 0,
			bonds: [],
			bankrupt: false
		});
	}
	const emptyStats = emptyCargo();
	return {
		version: 1,
		seed,
		year,
		month: 0,
		day: 1,
		speed: 1,
		mapW: w,
		mapH: h,
		tiles,
		cities,
		stations: [],
		trains: [],
		companies,
		playerId: 1,
		nextId: 100,
		scenarioId: sc?.id ?? "sandbox",
		scenarioTitle: sc?.title ?? "Sandbox Empire",
		goals: sc?.goals ?? [{
			kind: "networth",
			target: 15e5,
			label: "Reach $1,500,000 net worth"
		}, {
			kind: "connect",
			target: Math.min(8, cities.length),
			label: `Serve ${Math.min(8, cities.length)} cities`
		}],
		timeLimit: sc?.timeLimit,
		events: [{
			year,
			month: 0,
			headline: `${playerName} chartered`,
			body: `A new railroad company has been formed with a war chest and a map of ${opts.region}. The age of steam begins.`
		}],
		difficulty: sc?.difficulty ?? opts.difficulty,
		region: opts.region,
		won: false,
		lost: false,
		loseReason: "",
		playTime: 0,
		stats: {
			cargoDelivered: emptyStats,
			citiesConnected: 0,
			peakCash: companies[0].cash
		},
		introSeen: false
	};
}
function optsCash(opts) {
	return {
		easy: 75e4,
		normal: 5e5,
		hard: 32e4,
		magnate: 18e4
	}[opts.difficulty];
}
var LOCOMOTIVES = [
	{
		id: "pioneer",
		name: "Pioneer 0-4-0",
		year: 1829,
		cost: 18e3,
		speed: 28,
		power: 1,
		reliability: .72,
		capacity: 3,
		maint: 1200,
		kind: "steam",
		blurb: "A rattling original. Slow, cheap, and proud of it."
	},
	{
		id: "ironhorse",
		name: "Iron Horse 4-2-0",
		year: 1835,
		cost: 28e3,
		speed: 38,
		power: 2,
		reliability: .76,
		capacity: 4,
		maint: 1600,
		kind: "steam",
		blurb: "The workhorse of the first boom years."
	},
	{
		id: "atlantic",
		name: "Atlantic 4-4-0",
		year: 1848,
		cost: 42e3,
		speed: 52,
		power: 3,
		reliability: .8,
		capacity: 5,
		maint: 2200,
		kind: "steam",
		blurb: "America's engine. Fast enough to matter."
	},
	{
		id: "tenwheel",
		name: "Ten-Wheeler 4-6-0",
		year: 1860,
		cost: 58e3,
		speed: 58,
		power: 4,
		reliability: .82,
		capacity: 6,
		maint: 2800,
		kind: "steam",
		blurb: "Passenger flyer with a freight spine."
	},
	{
		id: "consolidation",
		name: "Consolidation 2-8-0",
		year: 1866,
		cost: 64e3,
		speed: 42,
		power: 6,
		reliability: .84,
		capacity: 7,
		maint: 3200,
		kind: "steam",
		blurb: "Grades, coal, and iron. Built to haul."
	},
	{
		id: "pacific",
		name: "Pacific 4-6-2",
		year: 1902,
		cost: 92e3,
		speed: 78,
		power: 5,
		reliability: .88,
		capacity: 7,
		maint: 4200,
		kind: "steam",
		blurb: "Express varnish. Cities grow wherever it stops."
	},
	{
		id: "mikado",
		name: "Mikado 2-8-2",
		year: 1911,
		cost: 98e3,
		speed: 55,
		power: 7,
		reliability: .9,
		capacity: 8,
		maint: 4600,
		kind: "steam",
		blurb: "The freight standard of the new century."
	},
	{
		id: "hudson",
		name: "Hudson 4-6-4",
		year: 1927,
		cost: 128e3,
		speed: 92,
		power: 6,
		reliability: .91,
		capacity: 8,
		maint: 5400,
		kind: "steam",
		blurb: "Streamlined prestige on six-foot drivers."
	},
	{
		id: "northern",
		name: "Northern 4-8-4",
		year: 1930,
		cost: 148e3,
		speed: 88,
		power: 8,
		reliability: .93,
		capacity: 8,
		maint: 6200,
		kind: "steam",
		blurb: "Dual-service giant. Last of the steam royalty."
	},
	{
		id: "streamliner",
		name: "Streamliner Diesel",
		year: 1938,
		cost: 165e3,
		speed: 98,
		power: 7,
		reliability: .95,
		capacity: 8,
		maint: 5800,
		kind: "diesel",
		blurb: "No water stops. No cinders. The future, humming."
	},
	{
		id: "switcher",
		name: "Road Switcher",
		year: 1950,
		cost: 142e3,
		speed: 72,
		power: 8,
		reliability: .97,
		capacity: 8,
		maint: 4800,
		kind: "diesel",
		blurb: "Ugly, cheap to keep, and it never sleeps."
	}
];
function locosForYear(year) {
	return LOCOMOTIVES.filter((l) => l.year <= year);
}
function locoById(id) {
	return LOCOMOTIVES.find((l) => l.id === id) ?? LOCOMOTIVES[0];
}
function tilesPerYear(loco) {
	return 36 + loco.speed * 1.15 + loco.power * 4;
}
function idx(state, x, y) {
	return y * state.mapW + x;
}
function inBounds(state, x, y) {
	return x >= 0 && y >= 0 && x < state.mapW && y < state.mapH;
}
function tileAt(state, x, y) {
	if (!inBounds(state, x, y)) return null;
	return state.tiles[idx(state, x, y)] ?? null;
}
var MinHeap = class {
	k = [];
	v = [];
	n = 0;
	push(key, val) {
		let i = this.n++;
		this.k[i] = key;
		this.v[i] = val;
		while (i > 0) {
			const p = i - 1 >> 1;
			if (this.k[p] <= this.k[i]) break;
			this.swap(i, p);
			i = p;
		}
	}
	pop() {
		if (this.n === 0) return void 0;
		const out = this.v[0];
		this.n--;
		if (this.n > 0) {
			this.k[0] = this.k[this.n];
			this.v[0] = this.v[this.n];
			this.down(0);
		}
		return out;
	}
	swap(i, j) {
		const tk = this.k[i];
		const tv = this.v[i];
		this.k[i] = this.k[j];
		this.v[i] = this.v[j];
		this.k[j] = tk;
		this.v[j] = tv;
	}
	down(i) {
		for (;;) {
			let s = i;
			const l = i * 2 + 1;
			const r = l + 1;
			if (l < this.n && this.k[l] < this.k[s]) s = l;
			if (r < this.n && this.k[r] < this.k[s]) s = r;
			if (s === i) break;
			this.swap(i, s);
			i = s;
		}
	}
};
function terrainBuildCost(t) {
	if (t.t === "ocean") return null;
	switch (t.t) {
		case "plains":
		case "coast": return 2e3;
		case "desert": return 2500;
		case "forest": return 3200;
		case "hills": return 5500;
		case "swamp": return 7e3;
		case "river": return 14e3;
		case "mountains": return 18e3;
		default: return 3e3;
	}
}
function terrainTravelCost(t) {
	if (t.t === "ocean") return 1e9;
	switch (t.t) {
		case "plains":
		case "coast": return 1;
		case "desert": return 1.2;
		case "forest": return 1.6;
		case "hills": return 2.4;
		case "swamp": return 3;
		case "river": return 4;
		case "mountains": return 6;
		default: return 2;
	}
}
function astar(state, sx, sy, tx, ty, passable) {
	if (!inBounds(state, sx, sy) || !inBounds(state, tx, ty)) return null;
	const w = state.mapW;
	const h = state.mapH;
	const size = w * h;
	const start = sy * w + sx;
	const goal = ty * w + tx;
	const g = new Float32Array(size);
	g.fill(Infinity);
	g[start] = 0;
	const came = new Int32Array(size);
	came.fill(-1);
	const heap = new MinHeap();
	const heur = (i) => {
		const x = i % w;
		const y = i / w | 0;
		return Math.abs(x - tx) + Math.abs(y - ty);
	};
	heap.push(heur(start), start);
	let found = false;
	while (heap.n > 0) {
		const cur = heap.pop();
		if (cur === goal) {
			found = true;
			break;
		}
		const cx = cur % w;
		const cy = cur / w | 0;
		const ct = state.tiles[cur];
		for (const d of DIRS) {
			const nx = cx + d.dx;
			const ny = cy + d.dy;
			if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
			const ni = ny * w + nx;
			const nt = state.tiles[ni];
			const step = passable(nt, nx, ny, ct);
			if (step === null) continue;
			const ng = g[cur] + step;
			if (ng < g[ni]) {
				g[ni] = ng;
				came[ni] = cur;
				heap.push(ng + heur(ni), ni);
			}
		}
	}
	if (!found) return null;
	const path = [];
	let c = goal;
	while (c !== -1) {
		path.push({
			x: c % w,
			y: c / w | 0
		});
		if (c === start) break;
		c = came[c];
	}
	path.reverse();
	return path;
}
function pathOnTrack(state, sx, sy, tx, ty, companyId) {
	return astar(state, sx, sy, tx, ty, (tile) => {
		if (tile.track === 0) return null;
		if (tile.owner !== companyId && tile.owner !== 0) return null;
		return 1;
	});
}
function pathForSurvey(state, sx, sy, tx, ty) {
	return astar(state, sx, sy, tx, ty, (tile) => {
		if (tile.t === "ocean") return null;
		return terrainTravelCost(tile);
	});
}
/** 4-connected grid line — never steps x and y together, so rails always share an edge. */
function line4(x0, y0, x1, y1) {
	const out = [{
		x: x0,
		y: y0
	}];
	let x = x0;
	let y = y0;
	const nx = Math.abs(x1 - x0);
	const ny = Math.abs(y1 - y0);
	const sx = x0 === x1 ? 0 : x0 < x1 ? 1 : -1;
	const sy = y0 === y1 ? 0 : y0 < y1 ? 1 : -1;
	let ix = 0;
	let iy = 0;
	while (ix < nx || iy < ny) {
		if ((nx === 0 ? Number.POSITIVE_INFINITY : (ix + .5) / nx) <= (ny === 0 ? Number.POSITIVE_INFINITY : (iy + .5) / ny)) {
			x += sx;
			ix++;
		} else {
			y += sy;
			iy++;
		}
		out.push({
			x,
			y
		});
		if (out.length > 800) break;
	}
	return out;
}
function revMul(d) {
	return DIFFICULTY_META[d].rev;
}
function costMul(d) {
	return DIFFICULTY_META[d].cost;
}
function netWorth(state, companyId) {
	const c = state.companies.find((x) => x.id === companyId);
	if (!c) return 0;
	const track = c.trackTiles * 1200;
	const trains = state.trains.filter((t) => t.companyId === companyId).length * 25e3;
	const stations = state.stations.filter((s) => s.companyId === companyId).length * 15e3;
	const stock = c.playerShares * c.stockPrice;
	const bonds = c.bonds.reduce((s, b) => s + b.amount, 0);
	if (c.ai) return c.cash + track + trains + stations - bonds;
	return c.cash + track + trains + stations + stock - bonds;
}
function playerCompany(state) {
	return state.companies.find((c) => c.id === state.playerId);
}
function buildCostFor(state, tile) {
	const base = terrainBuildCost(tile);
	if (base === null) return null;
	let c = base;
	if (tile.t === "river") c = 14e3;
	if (tile.t === "mountains") c = 18e3;
	return Math.round(c * costMul(state.difficulty));
}
function stationCost(level, d) {
	return Math.round({
		1: 22e3,
		2: 55e3,
		3: 11e4
	}[level] * costMul(d));
}
function cargoRate(cargo, dist, year) {
	const base = {
		pax: 28,
		mail: 36,
		coal: 14,
		iron: 16,
		steel: 24,
		grain: 12,
		cattle: 18,
		lumber: 13,
		goods: 26,
		oil: 30
	};
	const inflation = 1 + Math.max(0, year - 1830) * .004;
	const d = Math.max(2, dist);
	return base[cargo] * d * inflation;
}
function daysInMonth(month) {
	return [
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	][month] ?? 30;
}
var noop = {
	float: () => {},
	news: () => {},
	sfx: () => {}
};
function nextId(state) {
	return state.nextId++;
}
function charge(state, companyId, amount, asExpense = true) {
	const c = state.companies.find((x) => x.id === companyId);
	if (!c || c.bankrupt) return false;
	if (c.cash < amount) return false;
	c.cash -= amount;
	if (asExpense) c.expenseYtd += amount;
	return true;
}
function pay(state, companyId, amount, hooks, x, y) {
	const c = state.companies.find((x) => x.id === companyId);
	if (!c || c.bankrupt) return;
	const v = Math.round(amount * (c.ai ? .9 : revMul(state.difficulty)));
	c.cash += v;
	c.revenueYtd += v;
	if (companyId === state.playerId) {
		state.stats.peakCash = Math.max(state.stats.peakCash, c.cash);
		if (x !== void 0 && y !== void 0 && v > 0) {
			hooks.float(x, y, `+$${v.toLocaleString("en-US")}`, "#7d9a72");
			hooks.sfx("cash");
		}
	}
}
function recomputeTrackBits(state, x, y) {
	const t = tileAt(state, x, y);
	if (!t || t.track === 0) return;
	let bits = 0;
	for (const d of DIRS) {
		const n = tileAt(state, x + d.dx, y + d.dy);
		if (!n || n.track === 0) continue;
		if (n.owner && t.owner && n.owner !== t.owner) continue;
		bits |= d.bit;
	}
	t.track = bits === 0 ? 5 : bits;
}
function refreshConnections(state, x, y) {
	recomputeTrackBits(state, x, y);
	for (const d of DIRS) recomputeTrackBits(state, x + d.dx, y + d.dy);
}
function recomputeAllTracks(state) {
	for (let y = 0; y < state.mapH; y++) for (let x = 0; x < state.mapW; x++) if (state.tiles[y * state.mapW + x].track) recomputeTrackBits(state, x, y);
}
function placeTrack(state, x, y, companyId, hooks = noop) {
	if (!inBounds(state, x, y)) return false;
	const t = state.tiles[idx(state, x, y)];
	if (t.track && t.owner && t.owner !== companyId) return false;
	if (t.track && t.owner === companyId) {
		refreshConnections(state, x, y);
		return true;
	}
	const cost = buildCostFor(state, t);
	if (cost === null) return false;
	if (!charge(state, companyId, cost)) return false;
	t.track = 5;
	t.owner = companyId;
	t.bridge = t.t === "river" || t.t === "coast";
	t.tunnel = t.t === "mountains";
	refreshConnections(state, x, y);
	const c = state.companies.find((x) => x.id === companyId);
	if (c) c.trackTiles += 1;
	if (companyId === state.playerId) hooks.sfx("build");
	return true;
}
function placeTrackLine(state, x0, y0, x1, y1, companyId, hooks = noop) {
	let n = 0;
	for (const p of line4(x0, y0, x1, y1)) if (placeTrack(state, p.x, p.y, companyId, hooks)) n++;
	return n;
}
function bulldoze(state, x, y, companyId, hooks = noop) {
	const t = tileAt(state, x, y);
	if (!t || t.owner !== companyId) return false;
	const st = state.stations.find((s) => s.x === x && s.y === y && s.companyId === companyId);
	if (st) {
		if (state.trains.some((tr) => tr.route.includes(st.id))) return false;
		state.stations = state.stations.filter((s) => s.id !== st.id);
	}
	if (t.track) {
		const refund = Math.round((buildCostFor(state, t) ?? 0) * .25);
		t.track = 0;
		t.owner = 0;
		t.bridge = false;
		t.tunnel = false;
		for (const d of DIRS) recomputeTrackBits(state, x + d.dx, y + d.dy);
		const c = state.companies.find((x) => x.id === companyId);
		if (c) {
			c.trackTiles = Math.max(0, c.trackTiles - 1);
			c.cash += refund;
		}
		hooks.sfx("build");
		return true;
	}
	return false;
}
function placeStation(state, x, y, companyId, hooks = noop) {
	const t = tileAt(state, x, y);
	if (!t || t.track === 0 || t.owner !== companyId) return null;
	if (state.stations.some((s) => s.x === x && s.y === y)) return null;
	if (!charge(state, companyId, stationCost(1, state.difficulty))) return null;
	let city = state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 2);
	if (!city) {} else city.served = true;
	const waiting = {};
	for (const c of CARGOS) waiting[c] = 0;
	const st = {
		id: nextId(state),
		x,
		y,
		cityId: city?.id ?? 0,
		companyId,
		waiting,
		name: city ? `${city.name} Station` : `Halt ${x},${y}`,
		level: 1
	};
	state.stations.push(st);
	refreshConnected(state);
	if (companyId === state.playerId) {
		hooks.sfx("bell");
		hooks.float(x, y, st.name, "#e8e4d8");
	}
	return st;
}
function refreshConnected(state) {
	for (const c of state.cities) c.served = false;
	for (const s of state.stations) if (s.cityId) {
		const city = state.cities.find((c) => c.id === s.cityId);
		if (city) city.served = true;
	}
	const playerStations = new Set(state.stations.filter((s) => s.companyId === state.playerId && s.cityId).map((s) => s.cityId));
	state.stats.citiesConnected = playerStations.size;
}
function buyTrain(state, companyId, locoId, cargos, route, hooks = noop) {
	const loco = locoById(locoId);
	if (loco.year > state.year) return null;
	const cars = cargos.slice(0, loco.capacity).map((c) => ({
		cargo: c,
		amount: 0
	}));
	if (cars.length === 0) return null;
	if (route.length < 2) return null;
	const a = state.stations.find((s) => s.id === route[0]);
	const b = state.stations.find((s) => s.id === route[1]);
	if (!a || !b) return null;
	const path = pathOnTrack(state, a.x, a.y, b.x, b.y, companyId);
	if (!path || path.length < 2) return null;
	if (!charge(state, companyId, loco.cost + cars.length * 2500)) return null;
	const used = new Set(state.trains.map((t) => t.name));
	const rng = makeRng(state.seed + state.nextId, 9);
	const tr = {
		id: nextId(state),
		name: trainName(rng, used),
		locoId,
		cars,
		route,
		routeIdx: 0,
		path,
		pathIdx: 0,
		segT: 0,
		x: a.x,
		y: a.y,
		heading: 0,
		companyId,
		status: "running",
		brokenFor: 0,
		profit: 0,
		lastPayout: 0,
		age: 0
	};
	state.trains.push(tr);
	const co = state.companies.find((c) => c.id === companyId);
	if (co) co.trainsBuilt += 1;
	if (companyId === state.playerId) hooks.sfx("bell");
	return tr;
}
function stationOf(state, id) {
	return state.stations.find((s) => s.id === id);
}
function rebuildPath(state, tr) {
	const from = stationOf(state, tr.route[tr.routeIdx]);
	const to = stationOf(state, tr.route[(tr.routeIdx + 1) % tr.route.length]);
	if (!from || !to) return false;
	const path = pathOnTrack(state, from.x, from.y, to.x, to.y, tr.companyId);
	if (!path || path.length < 2) {
		tr.status = "waiting";
		tr.path = [];
		return false;
	}
	tr.path = path;
	tr.pathIdx = 0;
	tr.segT = 0;
	tr.status = "running";
	tr.x = path[0].x;
	tr.y = path[0].y;
	return true;
}
function distTiles(a, b) {
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
function nearbySupply(state, st) {
	const add = {};
	for (const c of CARGOS) add[c] = 0;
	const city = state.cities.find((c) => c.id === st.cityId);
	if (city) {
		add.pax += Math.min(12, city.supply.pax);
		add.mail += Math.min(8, city.supply.mail);
		for (const ind of city.industries) if (ind.produces) add[ind.produces] += 6;
	}
	for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
		const t = tileAt(state, st.x + dx, st.y + dy);
		if (!t?.res) continue;
		const cargo = t.res;
		add[cargo] += 4;
	}
	return add;
}
function cityWants(state, st, cargo) {
	const city = state.cities.find((c) => c.id === st.cityId);
	if (!city) return false;
	if (city.demand[cargo] > 0) return true;
	for (const ind of city.industries) if (ind.consumes.includes(cargo)) return true;
	return cargo === "pax" || cargo === "mail";
}
function handleArrival(state, tr, st, hooks) {
	const dest = st;
	let payout = 0;
	const from = stationOf(state, tr.route[tr.routeIdx]);
	const dist = from ? Math.max(3, distTiles(from, dest)) : 8;
	for (const car of tr.cars) {
		if (car.amount <= 0) continue;
		if (cityWants(state, dest, car.cargo)) {
			const rate = cargoRate(car.cargo, dist, state.year);
			payout += rate * car.amount;
			state.stats.cargoDelivered[car.cargo] += car.amount;
			car.amount = 0;
		}
	}
	if (payout > 0) {
		tr.profit += payout;
		tr.lastPayout = payout;
		pay(state, tr.companyId, payout, hooks, st.x, st.y);
		const city = state.cities.find((c) => c.id === dest.cityId);
		if (city) city.pop += Math.round(payout / 800);
	}
	const nextStops = tr.route.map((id) => stationOf(state, id)).filter(Boolean);
	const supply = nearbySupply(state, dest);
	for (const car of tr.cars) {
		if (car.amount > 0) continue;
		if (!nextStops.some((s) => s.id !== dest.id && cityWants(state, s, car.cargo))) continue;
		const take = Math.min(8, supply[car.cargo] || 0, dest.waiting[car.cargo] || 99);
		if (take <= 0 && (supply[car.cargo] || 0) <= 0) continue;
		const got = Math.max(take, Math.min(6, supply[car.cargo] || 0));
		car.amount = got;
		dest.waiting[car.cargo] = Math.max(0, (dest.waiting[car.cargo] || 0) - got);
	}
	tr.routeIdx = (tr.routeIdx + 1) % tr.route.length;
	rebuildPath(state, tr);
}
function gradeFactor(state, x, y) {
	const t = tileAt(state, x, y);
	if (!t) return .6;
	if (t.tunnel) return .55;
	if (t.t === "hills") return .7;
	if (t.t === "mountains") return .5;
	if (t.bridge) return .85;
	return 1;
}
function moveTrains(state, days, hooks) {
	for (const tr of state.trains) {
		const co = state.companies.find((c) => c.id === tr.companyId);
		if (!co || co.bankrupt) continue;
		if (tr.status === "broken") {
			tr.brokenFor -= days;
			if (tr.brokenFor <= 0) {
				tr.status = "running";
				rebuildPath(state, tr);
			}
			continue;
		}
		if (tr.path.length < 2) {
			rebuildPath(state, tr);
			if (tr.path.length < 2) continue;
		}
		const loco = locoById(tr.locoId);
		let tiles = tilesPerYear(loco) * days / 365;
		const rng = makeRng(state.seed + tr.id + (state.year * 12 + state.month | 0), 3);
		if (rng.next() < (1 - loco.reliability) * days * .002) {
			tr.status = "broken";
			tr.brokenFor = 8 + rng.int(0, 20);
			if (tr.companyId === state.playerId) {
				hooks.news(`${tr.name} disabled`, `A mechanical failure has stopped ${tr.name} on the line. Repairs are underway.`);
				hooks.sfx("break");
			}
			continue;
		}
		while (tiles > 0 && tr.path.length >= 2) {
			const a = tr.path[tr.pathIdx];
			const b = tr.path[tr.pathIdx + 1];
			if (!b) {
				const st = state.stations.find((s) => s.x === a.x && s.y === a.y && tr.route.includes(s.id));
				if (st) handleArrival(state, tr, st, hooks);
				else {
					tr.routeIdx = (tr.routeIdx + 1) % tr.route.length;
					rebuildPath(state, tr);
				}
				break;
			}
			const stepNeed = 1 - tr.segT;
			const gf = gradeFactor(state, b.x, b.y);
			const can = tiles * gf;
			if (can >= stepNeed) {
				tiles -= stepNeed / gf;
				tr.segT = 0;
				tr.pathIdx += 1;
				tr.x = b.x;
				tr.y = b.y;
				tr.heading = Math.atan2(b.y - a.y, b.x - a.x);
				const st = state.stations.find((s) => s.x === b.x && s.y === b.y && tr.route.includes(s.id));
				if (st && tr.pathIdx >= tr.path.length - 1) {
					handleArrival(state, tr, st, hooks);
					tiles = 0;
				}
			} else {
				tr.segT += can;
				tiles = 0;
				tr.x = a.x + (b.x - a.x) * tr.segT;
				tr.y = a.y + (b.y - a.y) * tr.segT;
				tr.heading = Math.atan2(b.y - a.y, b.x - a.x);
			}
		}
	}
}
function spawnCargo(state) {
	for (const st of state.stations) {
		const sup = nearbySupply(state, st);
		for (const c of CARGOS) st.waiting[c] = Math.min(40, (st.waiting[c] || 0) + Math.round((sup[c] || 0) * .35));
	}
	for (const city of state.cities) {
		city.supply.pax = Math.min(40, 6 + Math.round(city.pop / 2500));
		city.supply.mail = Math.min(24, 3 + Math.round(city.pop / 4e3));
		city.demand.pax = city.supply.pax;
		city.demand.mail = city.supply.mail;
		city.demand.goods = 4 + Math.round(city.pop / 5e3);
	}
}
function aiThink(state, hooks) {
	const rng = makeRng(state.seed + state.year * 100 + state.month, 77);
	for (const co of state.companies) {
		if (!co.ai || co.bankrupt) continue;
		if (co.cash < 3e4) {
			if (co.bonds.length < 3 && co.cash < 1e4) issueBond(state, co.id, 1e5);
			continue;
		}
		const myStations = state.stations.filter((s) => s.companyId === co.id);
		const unserved = state.cities.filter((c) => !state.stations.some((s) => s.cityId === c.id && s.companyId === co.id));
		if (myStations.length < 2 && unserved.length >= 2) {
			rng.shuffle(unserved);
			const a = unserved[0];
			const b = unserved[1];
			const path = pathForSurvey(state, a.x, a.y, b.x, b.y);
			if (path) {
				const budgetTiles = Math.min(path.length, 8);
				for (let i = 0; i < budgetTiles; i++) {
					const p = path[i];
					placeTrack(state, p.x, p.y, co.id, hooks);
				}
				const start = path[0];
				const end = path[Math.min(path.length - 1, budgetTiles - 1)];
				if (!state.stations.some((s) => s.x === start.x && s.y === start.y)) placeStation(state, start.x, start.y, co.id, hooks);
				if (budgetTiles === path.length && !state.stations.some((s) => s.x === end.x && s.y === end.y)) placeStation(state, end.x, end.y, co.id, hooks);
			}
			continue;
		}
		if (myStations.length >= 1 && unserved.length) {
			const from = rng.pick(myStations);
			let best = null;
			let bestD = 1e9;
			for (const c of unserved) {
				const d = Math.abs(c.x - from.x) + Math.abs(c.y - from.y);
				if (d < bestD) {
					bestD = d;
					best = c;
				}
			}
			if (best) {
				const path = pathForSurvey(state, from.x, from.y, best.x, best.y);
				if (path) {
					const n = Math.min(6, path.length);
					for (let i = 0; i < n; i++) {
						const p = path[i];
						placeTrack(state, p.x, p.y, co.id, hooks);
					}
					const last = path[n - 1];
					if (n === path.length) placeStation(state, last.x, last.y, co.id, hooks);
				}
			}
		}
		const sts = state.stations.filter((s) => s.companyId === co.id);
		const myTrains = state.trains.filter((t) => t.companyId === co.id && !state.companies.find((c) => c.id === t.companyId)?.bankrupt);
		if (sts.length >= 2 && myTrains.length < Math.max(1, Math.floor(sts.length / 2))) {
			const locos = locosForYear(state.year);
			const loco = locos[locos.length - 1];
			const sa = sts[rng.int(0, sts.length - 1)];
			let sb = sts[0];
			for (const s of sts) if (s.id !== sa.id && distTiles(s, sa) > distTiles(sb, sa)) sb = s;
			if (sa.id !== sb.id) {
				const cargos = [
					"pax",
					"mail",
					"goods"
				];
				if (state.year >= 1850) cargos.push("coal");
				buyTrain(state, co.id, loco.id, cargos.slice(0, loco.capacity), [sa.id, sb.id], hooks);
			}
		}
	}
}
function issueBond(state, companyId, amount = 1e5) {
	const c = state.companies.find((x) => x.id === companyId);
	if (!c || c.bonds.length >= 5) return false;
	const rate = .05 + c.bonds.length * .01 + (state.difficulty === "magnate" ? .02 : 0);
	c.bonds.push({
		amount,
		rate,
		yearIssued: state.year
	});
	c.cash += amount;
	return true;
}
function repayBond(state, companyId, index) {
	const c = state.companies.find((x) => x.id === companyId);
	if (!c) return false;
	const b = c.bonds[index];
	if (!b) return false;
	if (!charge(state, companyId, b.amount, false)) return false;
	c.bonds.splice(index, 1);
	return true;
}
function tradeStock(state, companyId, shares) {
	const c = state.companies.find((x) => x.id === companyId);
	const p = playerCompany(state);
	if (!c) return false;
	const cost = Math.round(Math.abs(shares) * c.stockPrice);
	if (shares > 0) {
		if (c.playerShares + shares > c.shares) return false;
		if (!charge(state, p.id, cost, false)) return false;
		c.playerShares += shares;
		c.stockPrice *= 1.01;
		return true;
	}
	if (c.playerShares < -shares) return false;
	c.playerShares += shares;
	p.cash += cost;
	c.stockPrice *= .99;
	return true;
}
function monthEnd(state, hooks) {
	spawnCargo(state);
	aiThink(state, hooks);
	for (const c of state.companies) {
		const interest = c.bonds.reduce((s, b) => s + b.amount * b.rate / 12, 0);
		if (interest > 0) {
			c.cash -= interest;
			c.expenseYtd += interest;
		}
		const trackMaint = c.trackTiles * 8 * costMul(state.difficulty) / 12;
		c.cash -= trackMaint;
		c.expenseYtd += trackMaint;
		const profit = c.revenueYtd / Math.max(1, state.month + 1) - c.expenseYtd / Math.max(1, state.month + 1);
		c.stockPrice = Math.max(2, c.stockPrice * (1 + Math.max(-.04, Math.min(.05, profit / 2e5))));
		if (c.cash < -8e4) {
			c.bankrupt = true;
			hooks.news(`${c.name} bankrupt`, `${c.name} can no longer meet its obligations and has been struck from the exchange.`);
		}
	}
	if (Math.random() < .08) randomEvent(state, hooks);
	checkGoals(state, hooks);
}
function yearEnd(state, hooks) {
	for (const c of state.companies) {
		for (const tr of state.trains.filter((t) => t.companyId === c.id)) {
			const m = locoById(tr.locoId).maint * costMul(state.difficulty);
			c.cash -= m;
			c.expenseYtd += m;
			tr.age += 1;
		}
		const div = Math.max(0, (c.revenueYtd - c.expenseYtd) * .08);
		if (div > 0 && c.playerShares > 0) {
			const cut = div * c.playerShares / c.shares;
			playerCompany(state).cash += cut;
		}
		c.revenueYtd = 0;
		c.expenseYtd = 0;
	}
	const newly = locosForYear(state.year).filter((l) => l.year === state.year);
	for (const l of newly) hooks.news(`${l.name} introduced`, `${l.blurb} Available for purchase at $${l.cost.toLocaleString("en-US")}.`);
	if (state.year === 1869) hooks.news("Oil discovered", "Black gold seeps from the desert. Oil fields now appear on the map.");
	if (state.timeLimit && state.year >= state.timeLimit && !state.won) {
		checkGoals(state, hooks);
		if (!state.won) {
			const worth = netWorth(state, playerCompany(state).id);
			const yearGoal = state.goals.find((g) => g.kind === "year_worth");
			if (yearGoal && worth >= yearGoal.target) {
				state.won = true;
				hooks.news("Empire secured", "The ledgers close in your favour.");
			} else if (yearGoal) {
				state.lost = true;
				state.loseReason = "The charter expired before the books were strong enough.";
			}
		}
	}
	checkGoals(state, hooks);
}
function randomEvent(state, hooks) {
	const rng = makeRng(state.seed + state.year * 13 + state.month, 5);
	const city = rng.pick(state.cities);
	const roll = rng.next();
	if (roll < .25) {
		city.pop = Math.round(city.pop * 1.15);
		hooks.news(`${city.name} booms`, `Industry and newcomers swell ${city.name}. Passenger demand is up.`);
	} else if (roll < .4) {
		for (const c of state.companies) c.stockPrice *= .88;
		hooks.news(`Panic of ${state.year}`, "Share prices tumble across the exchange. The timid sell; the bold buy.");
	} else if (roll < .55) {
		for (const c of state.companies) c.stockPrice *= 1.08;
		hooks.news("A gilded season", "Optimism returns to the markets. Railroad shares advance.");
	} else if (roll < .7) hooks.news(`Strike at ${city.name}`, "Labour unrest slows shipments this month. Coal and steel wait on sidings.");
	else if (roll < .85 && state.cities.length) {
		city.pop = Math.max(2e3, Math.round(city.pop * .92));
		hooks.news(`Fever in ${city.name}`, "A hard winter thins the streets. Passenger lists shrink.");
	} else hooks.news("Surveyors' gazette", "New grades have been charted through the hills. Expansion is cheaper this season.");
}
function checkGoals(state, hooks = noop) {
	if (state.won || state.lost) return;
	const p = playerCompany(state);
	if (p.bankrupt || p.cash < -5e4) {
		state.lost = true;
		state.loseReason = "The company is insolvent. Bondholders have seized the line.";
		return;
	}
	const worth = netWorth(state, p.id);
	let all = true;
	for (const g of state.goals) {
		if (g.kind === "networth" && worth < g.target) all = false;
		if (g.kind === "connect" && state.stats.citiesConnected < g.target) all = false;
		if (g.kind === "cargo" && g.cargo && state.stats.cargoDelivered[g.cargo] < g.target) all = false;
		if (g.kind === "bankrupt_ai") {
			if (state.companies.filter((c) => c.ai && c.bankrupt).length < g.target) all = false;
		}
		if (g.kind === "year_worth") {
			if (state.timeLimit && state.year < state.timeLimit) all = false;
			else if (worth < g.target) all = false;
		}
		if (g.kind === "link_cities") all = state.stats.citiesConnected >= g.target;
	}
	if (all && state.goals.length) {
		state.won = true;
		hooks.news("Charter fulfilled", "The board toasts a new baron of the iron road.");
	}
}
function goalProgress(state) {
	const worth = netWorth(state, playerCompany(state).id);
	return state.goals.map((g) => {
		let current = 0;
		if (g.kind === "networth" || g.kind === "year_worth") current = worth;
		if (g.kind === "connect" || g.kind === "link_cities") current = state.stats.citiesConnected;
		if (g.kind === "cargo" && g.cargo) current = state.stats.cargoDelivered[g.cargo];
		if (g.kind === "bankrupt_ai") current = state.companies.filter((c) => c.ai && c.bankrupt).length;
		return {
			label: g.label,
			current,
			target: g.target,
			done: current >= g.target
		};
	});
}
function simulate(state, days, hooks = noop) {
	if (state.won || state.lost) return;
	if (days <= 0) return;
	moveTrains(state, days, hooks);
	state.day += days;
	while (state.day >= daysInMonth(state.month)) {
		state.day -= daysInMonth(state.month);
		state.month += 1;
		monthEnd(state, hooks);
		while (state.month >= 12) {
			state.month -= 12;
			state.year += 1;
			yearEnd(state, hooks);
		}
	}
}
function daysPerSecond(speed) {
	return speed === 0 ? 0 : speed * 7;
}
var bank = null;
var loading = null;
function loadImg(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = "async";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(src));
		img.src = src;
	});
}
function getSprites() {
	return bank;
}
function loadSprites() {
	if (bank) return Promise.resolve(bank);
	if (loading) return loading;
	const terrains = [
		"plains",
		"forest",
		"hills",
		"mountains",
		"desert",
		"swamp",
		"coast",
		"ocean",
		"river"
	];
	loading = (async () => {
		const [plains, forest, hills, mountains, desert, swamp, coast, ocean, river, t1, t2, t3, t4, l1, l2, l3, l4, f1, f2, f3, f4, c1, c2, c3, c4, diesel, station, town, factory, mountain, coal, iron, steel, grain, cattle, lumber, oil, mail, goods] = await Promise.all([
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
			loadImg("/sprites/cargo-goods.png")
		]);
		bank = {
			terrain: {
				plains,
				forest,
				hills,
				mountains,
				desert,
				swamp,
				coast,
				ocean,
				river
			},
			trees: [
				t1,
				t2,
				t3,
				t4
			],
			loco: [
				l1,
				l2,
				l3,
				l4
			],
			freight: [
				f1,
				f2,
				f3,
				f4
			],
			coach: [
				c1,
				c2,
				c3,
				c4
			],
			diesel,
			station,
			town,
			factory,
			mountain,
			cargo: {
				coal,
				iron,
				steel,
				grain,
				cattle,
				lumber,
				oil,
				mail,
				goods,
				pax: mail
			}
		};
		return bank;
	})().catch((err) => {
		console.warn("Sprite load failed", err);
		loading = null;
		return null;
	});
	return loading;
}
function hash2(x, y) {
	return Math.abs(Math.imul(x, 73856093) ^ Math.imul(y, 19349663) | 0);
}
function headingDir(heading) {
	return [
		1,
		2,
		3,
		0
	][(Math.round(heading / (Math.PI / 2)) % 4 + 4) % 4];
}
function cargoSprite(bank, res) {
	return bank.cargo[res];
}
function iso(x, y, h = 0) {
	return {
		sx: (x - y) * 24,
		sy: (x + y) * 12 - h * 18
	};
}
function worldToScreen(cam, x, y, h, cw, ch) {
	const p = iso(x, y, h);
	return {
		x: (p.sx - cam.x) * cam.zoom + cw / 2,
		y: (p.sy - cam.y) * cam.zoom + ch / 2
	};
}
function screenToWorld(cam, px, py, cw, ch) {
	const sx = (px - cw / 2) / cam.zoom + cam.x;
	const sy = (py - ch / 2) / cam.zoom + cam.y;
	const x = sx / 24 + sy / 12;
	const y = sy / 12 - sx / 24;
	return {
		x: x / 2,
		y: y / 2
	};
}
function diamond(ctx, x, y, fill, stroke) {
	ctx.beginPath();
	ctx.moveTo(x, y - 12);
	ctx.lineTo(x + 24, y);
	ctx.lineTo(x, y + 12);
	ctx.lineTo(x - 24, y);
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = .6;
		ctx.stroke();
	}
}
function terrainColor(t, time) {
	switch (t.t) {
		case "ocean": return [shade("#1a3a42", .04 * Math.sin(time * 1.4 + t.h * 20)), "#142f36"];
		case "coast": return ["#3d6a62", "#2f564f"];
		case "plains": return ["#4e6a3c", "#3f5630"];
		case "forest": return ["#2f4a2c", "#243b22"];
		case "hills": return ["#5a6340", "#4a5234"];
		case "mountains": return ["#6a6e68", "#545850"];
		case "desert": return ["#b09a6a", "#8e7c54"];
		case "swamp": return ["#3a4a34", "#2c3a28"];
		case "river": return ["#2a5a62", "#1e464c"];
		default: return ["#4e6a3c", "#3f5630"];
	}
}
function shade(hex, amt) {
	const n = parseInt(hex.slice(1), 16);
	const r = Math.max(0, Math.min(255, (n >> 16 & 255) * (1 + amt)));
	const g = Math.max(0, Math.min(255, (n >> 8 & 255) * (1 + amt)));
	const b = Math.max(0, Math.min(255, (n & 255) * (1 + amt)));
	return `rgb(${r | 0},${g | 0},${b | 0})`;
}
function drawTree(ctx, x, y, s) {
	ctx.fillStyle = "#2a3a20";
	ctx.beginPath();
	ctx.ellipse(x, y + 4, 4 * s, 2 * s, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = "#3d6a38";
	ctx.beginPath();
	ctx.moveTo(x, y - 14 * s);
	ctx.lineTo(x + 7 * s, y + 2 * s);
	ctx.lineTo(x - 7 * s, y + 2 * s);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#4a7c42";
	ctx.beginPath();
	ctx.moveTo(x, y - 11 * s);
	ctx.lineTo(x + 5 * s, y);
	ctx.lineTo(x - 5 * s, y);
	ctx.closePath();
	ctx.fill();
}
function drawPeak(ctx, x, y, h) {
	const peak = 10 + h * 22;
	ctx.beginPath();
	ctx.moveTo(x - 16, y + 4);
	ctx.lineTo(x, y - peak);
	ctx.lineTo(x + 16, y + 4);
	ctx.closePath();
	ctx.fillStyle = "#6e726c";
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(x, y - peak);
	ctx.lineTo(x + 16, y + 4);
	ctx.lineTo(x + 6, y + 4);
	ctx.closePath();
	ctx.fillStyle = "#5a5e58";
	ctx.fill();
	if (h > .82) {
		ctx.fillStyle = "#d8d4cc";
		ctx.beginPath();
		ctx.moveTo(x, y - peak);
		ctx.lineTo(x + 5, y - peak + 8);
		ctx.lineTo(x - 5, y - peak + 8);
		ctx.closePath();
		ctx.fill();
	}
}
function drawBuilding(ctx, x, y, w, d, h, color) {
	ctx.fillStyle = shade(color, -.15);
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + w, y - w * .5);
	ctx.lineTo(x + w, y - w * .5 - h);
	ctx.lineTo(x, y - h);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x - d, y - d * .5);
	ctx.lineTo(x - d, y - d * .5 - h);
	ctx.lineTo(x, y - h);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = shade(color, .18);
	ctx.beginPath();
	ctx.moveTo(x, y - h);
	ctx.lineTo(x + w, y - w * .5 - h);
	ctx.lineTo(x + w - d, y - w * .5 - d * .5 - h);
	ctx.lineTo(x - d, y - d * .5 - h);
	ctx.closePath();
	ctx.fill();
}
/** Screen offset from a tile center to the shared edge with a 4-neighbor. */
function isoArm(bit) {
	switch (bit) {
		case 1: return [12, -6];
		case 2: return [12, 6];
		case 4: return [-12, 6];
		case 8: return [-12, -6];
		default: return [0, 0];
	}
}
function drawFoot(ctx, x, y, rx, ry) {
	ctx.save();
	ctx.fillStyle = "rgba(12,13,11,0.32)";
	ctx.beginPath();
	ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawAnchored(ctx, img, x, y, w, h) {
	ctx.drawImage(img, x - w / 2, y - h, w, h);
}
function drawTexturedDiamond(ctx, img, tileX, tileY, time, watery) {
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(0, -12);
	ctx.lineTo(24, 0);
	ctx.lineTo(0, 12);
	ctx.lineTo(-24, 0);
	ctx.closePath();
	ctx.clip();
	const sw = 110;
	const max = Math.max(1, img.width - sw);
	let ox = Math.abs(hash2(tileX, tileY)) % max;
	let oy = Math.abs(hash2(tileY, tileX + 3)) % max;
	if (watery) {
		ox = (ox + (time * 18 | 0)) % max;
		oy = (oy + (time * 9 | 0)) % max;
	}
	ctx.drawImage(img, ox, oy, sw, sw, -26, -14, 52, 28);
	ctx.restore();
}
function drawTrack(ctx, x, y, bits, color, opts) {
	const arms = [];
	for (const d of DIRS) if (bits & d.bit) arms.push(isoArm(d.bit));
	if (!arms.length) arms.push(isoArm(1), isoArm(4));
	const ext = 1.08;
	const spans = [];
	if (bits === 5 || bits === 10) {
		const a = isoArm(bits & 3);
		const b = isoArm(bits & 12);
		spans.push([
			x + a[0] * ext,
			y + a[1] * ext,
			x + b[0] * ext,
			y + b[1] * ext
		]);
	} else for (const a of arms) spans.push([
		x,
		y,
		x + a[0] * ext,
		y + a[1] * ext
	]);
	ctx.save();
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	if (opts?.bridge) {
		ctx.strokeStyle = "#4a3a2a";
		ctx.lineWidth = 7;
		for (const s of spans) {
			ctx.beginPath();
			ctx.moveTo(s[0], s[1]);
			ctx.lineTo(s[2], s[3]);
			ctx.stroke();
		}
	}
	ctx.strokeStyle = opts?.tunnel ? "#2a2824" : "#3a342c";
	ctx.lineWidth = 5.4;
	for (const s of spans) {
		ctx.beginPath();
		ctx.moveTo(s[0], s[1]);
		ctx.lineTo(s[2], s[3]);
		ctx.stroke();
	}
	ctx.strokeStyle = "#5c4c3a";
	ctx.lineWidth = 1.35;
	for (const s of spans) {
		const dx = s[2] - s[0];
		const dy = s[3] - s[1];
		const len = Math.hypot(dx, dy) || 1;
		const px = -dy / len * 3.1;
		const py = dx / len * 3.1;
		for (const t of [
			.22,
			.5,
			.78
		]) {
			const sx = s[0] + dx * t;
			const sy = s[1] + dy * t;
			ctx.beginPath();
			ctx.moveTo(sx + px, sy + py);
			ctx.lineTo(sx - px, sy - py);
			ctx.stroke();
		}
	}
	ctx.strokeStyle = color;
	ctx.lineWidth = 1.35;
	for (const s of spans) {
		const dx = s[2] - s[0];
		const dy = s[3] - s[1];
		const len = Math.hypot(dx, dy) || 1;
		const px = -dy / len * 1.65;
		const py = dx / len * 1.65;
		ctx.beginPath();
		ctx.moveTo(s[0] + px, s[1] + py);
		ctx.lineTo(s[2] + px, s[3] + py);
		ctx.moveTo(s[0] - px, s[1] - py);
		ctx.lineTo(s[2] - px, s[3] - py);
		ctx.stroke();
	}
	if (arms.length >= 3) {
		ctx.fillStyle = "#3a342c";
		ctx.beginPath();
		ctx.arc(x, y, 3.4, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.15;
		ctx.stroke();
	}
	ctx.restore();
}
function drawTrainSprite(ctx, x, y, heading, color, steam, time, cars) {
	ctx.save();
	ctx.translate(x, y);
	const ang = heading;
	const fx = Math.cos(ang);
	const fy = Math.sin(ang);
	for (let i = cars; i >= 0; i--) {
		const bx = -fx * i * 11;
		const by = -fy * i * 6;
		ctx.fillStyle = i === 0 ? color : shade(color, -.2);
		ctx.beginPath();
		ctx.roundRect(bx - 7, by - 5, 14, 9, 2);
		ctx.fill();
		ctx.fillStyle = "#1a1c18";
		ctx.fillRect(bx - 6, by + 3, 12, 2);
		if (i === 0) {
			ctx.fillStyle = "#2a2c28";
			ctx.fillRect(bx + 2, by - 10, 4, 6);
			ctx.fillStyle = shade(color, .2);
			ctx.fillRect(bx - 6, by - 8, 7, 6);
			if (steam) {
				const p = (time * 3 + i) % 1;
				ctx.globalAlpha = .35 * (1 - p);
				ctx.fillStyle = "#d8d4cc";
				ctx.beginPath();
				ctx.arc(bx + 4, by - 12 - p * 10, 3 + p * 3, 0, Math.PI * 2);
				ctx.fill();
				ctx.globalAlpha = 1;
			}
		}
	}
	ctx.restore();
}
function renderWorld(ctx, state, cam, extras, viewW, viewH) {
	const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const cw = viewW;
	const ch = viewH;
	const g = ctx.createLinearGradient(0, 0, 0, ch);
	g.addColorStop(0, "#141812");
	g.addColorStop(1, "#0c0d0b");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, cw, ch);
	const z = cam.zoom;
	const corners = [
		screenToWorld(cam, 0, 0, cw, ch),
		screenToWorld(cam, cw, 0, cw, ch),
		screenToWorld(cam, 0, ch, cw, ch),
		screenToWorld(cam, cw, ch, cw, ch)
	];
	const minX = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.x)) - 2));
	const maxX = Math.min(state.mapW - 1, Math.ceil(Math.max(...corners.map((c) => c.x)) + 2));
	const minY = Math.max(0, Math.floor(Math.min(...corners.map((c) => c.y)) - 2));
	const maxY = Math.min(state.mapH - 1, Math.ceil(Math.max(...corners.map((c) => c.y)) + 2));
	const order = [];
	for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) order.push({
		x,
		y
	});
	order.sort((a, b) => a.x + a.y - (b.x + b.y));
	const spr = getSprites();
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";
	ctx.save();
	for (const { x, y } of order) {
		const tile = state.tiles[y * state.mapW + x];
		const p = worldToScreen(cam, x, y, tile.t === "mountains" ? .35 : tile.t === "hills" ? .15 : 0, cw, ch);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.scale(z, z);
		const [top, side] = terrainColor(tile, extras.time);
		const tex = spr?.terrain[tile.t];
		if (tex) {
			ctx.fillStyle = side;
			ctx.beginPath();
			ctx.moveTo(-24, 0);
			ctx.lineTo(0, 12);
			ctx.lineTo(24, 0);
			ctx.lineTo(24, 5);
			ctx.lineTo(0, 17);
			ctx.lineTo(-24, 5);
			ctx.closePath();
			ctx.fill();
			drawTexturedDiamond(ctx, tex, x, y, extras.time, tile.t === "ocean" || tile.t === "river");
			if (extras.showGrid) diamond(ctx, 0, 0, "transparent", "rgba(232,228,216,0.12)");
		} else {
			diamond(ctx, 0, 0, top, extras.showGrid ? "rgba(232,228,216,0.08)" : void 0);
			ctx.fillStyle = side;
			ctx.beginPath();
			ctx.moveTo(-24, 0);
			ctx.lineTo(0, 12);
			ctx.lineTo(24, 0);
			ctx.lineTo(24, 4);
			ctx.lineTo(0, 16);
			ctx.lineTo(-24, 4);
			ctx.closePath();
			ctx.fill();
		}
		if (tile.track) diamond(ctx, 0, 0, "rgba(58,52,44,0.38)");
		if (tile.t === "forest" && !tile.track) {
			if (spr) {
				const n = 1 + hash2(x, y) % 2;
				for (let i = 0; i < n; i++) {
					const img = spr.trees[hash2(x + i * 3, y) % spr.trees.length];
					const ox = (hash2(x + 9, y + i) % 15 - 7) * .7;
					const oy = (hash2(x, y + 4 + i) % 9 - 3) * .45;
					drawFoot(ctx, ox, oy + 6, 6, 2.5);
					drawAnchored(ctx, img, ox, oy + 6, 18 + hash2(x, i) % 6, 26 + hash2(y, i) % 6);
				}
			} else {
				drawTree(ctx, -6, -2, .7);
				drawTree(ctx, 6, 0, .85);
				drawTree(ctx, 0, -6, .6);
			}
		} else if (tile.t === "mountains") {
			if (spr && (tile.h > .55 || (x + y) % 2 === 0)) {
				drawFoot(ctx, 0, 6, 9, 3.5);
				drawAnchored(ctx, spr.mountain, 0, 8, 26, 36);
			} else if (!spr) drawPeak(ctx, 0, 2, tile.h);
		} else if (tile.t === "hills" && spr && hash2(x, y) % 5 === 0 && !tile.track) drawAnchored(ctx, spr.mountain, 2, 6, 16, 20);
		else if (tile.t === "ocean" || tile.t === "river") {
			ctx.strokeStyle = "rgba(180,210,210,0.18)";
			ctx.lineWidth = .8;
			ctx.beginPath();
			ctx.moveTo(-10, Math.sin(extras.time * 2 + x) * 1.5);
			ctx.lineTo(10, Math.sin(extras.time * 2 + x + 1) * 1.5);
			ctx.stroke();
		}
		if (tile.res && !tile.track) {
			const cimg = spr ? cargoSprite(spr, tile.res) : void 0;
			if (cimg) drawAnchored(ctx, cimg, 6, 4, 14, 14);
			else {
				ctx.fillStyle = CARGO_COLOR[tile.res] ?? "#888";
				ctx.beginPath();
				ctx.arc(4, 2, 3.2, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = "rgba(12,13,11,0.5)";
				ctx.stroke();
			}
		}
		ctx.restore();
	}
	for (const { x, y } of order) {
		const tile = state.tiles[y * state.mapW + x];
		if (!tile.track) continue;
		const p = worldToScreen(cam, x, y, tile.t === "mountains" ? .35 : tile.t === "hills" ? .15 : 0, cw, ch);
		const co = state.companies.find((c) => c.id === tile.owner);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.scale(z, z);
		drawTrack(ctx, 0, 0, tile.track, co?.color ?? "#9aa4ae", {
			bridge: tile.bridge,
			tunnel: tile.tunnel
		});
		ctx.restore();
	}
	if (extras.ghost && extras.ghost.length) {
		ctx.save();
		ctx.globalAlpha = .72;
		const occ = new Set(extras.ghost.map((g) => `${g.x},${g.y}`));
		for (const g of extras.ghost) {
			let bits = 0;
			for (const d of DIRS) if (occ.has(`${g.x + d.dx},${g.y + d.dy}`)) bits |= d.bit;
			if (!bits) bits = 5;
			const p = worldToScreen(cam, g.x, g.y, 0, cw, ch);
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.scale(z, z);
			diamond(ctx, 0, 0, "rgba(201,205,198,0.28)");
			drawTrack(ctx, 0, 0, bits, "#d8d4cc");
			ctx.restore();
		}
		ctx.restore();
	}
	if (extras.hover && inMap(state, extras.hover.x, extras.hover.y)) {
		tileAt(state, extras.hover.x, extras.hover.y);
		const p = worldToScreen(cam, extras.hover.x, extras.hover.y, 0, cw, ch);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.scale(z, z);
		diamond(ctx, 0, 0, "rgba(232,228,216,0.16)", "rgba(232,228,216,0.7)");
		ctx.restore();
	}
	for (const city of state.cities) {
		const p = worldToScreen(cam, city.x, city.y, .1, cw, ch);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.scale(z, z);
		const mill = city.industries.some((i) => /factory|steel|mill/i.test(i.kind));
		if (spr) {
			drawFoot(ctx, 0, 8, 12, 5);
			drawAnchored(ctx, mill ? spr.factory : spr.town, 0, 8, mill ? 32 : 34, mill ? 36 : 30);
		} else {
			drawBuilding(ctx, 0, 4, 10, 8, 12, city.served ? "#8a8070" : "#6a6054");
			drawBuilding(ctx, -10, 6, 7, 6, 8, "#7a7064");
			drawBuilding(ctx, 8, 8, 6, 5, 7, "#5a5248");
		}
		ctx.restore();
	}
	for (const st of state.stations) {
		const p = worldToScreen(cam, st.x, st.y, 0, cw, ch);
		const co = state.companies.find((c) => c.id === st.companyId);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.scale(z, z);
		if (spr) {
			drawFoot(ctx, 0, 6, 11, 4);
			drawAnchored(ctx, spr.station, 0, 6, 30, 22);
			ctx.fillStyle = co?.color ?? "#ccc";
			ctx.fillRect(-6, 7, 12, 3);
		} else {
			ctx.fillStyle = co?.color ?? "#ccc";
			ctx.fillRect(-8, -6, 16, 8);
			ctx.fillStyle = "#1a1c18";
			ctx.fillRect(-10, 2, 20, 3);
		}
		if (extras.selectedStation === st.id) {
			ctx.strokeStyle = "#e8e4d8";
			ctx.strokeRect(-16, -28, 32, 36);
		}
		ctx.restore();
	}
	for (const tr of state.trains) {
		const p = worldToScreen(cam, tr.x, tr.y, 0, cw, ch);
		const co = state.companies.find((c) => c.id === tr.companyId);
		const loco = locoById(tr.locoId);
		const dir = headingDir(tr.heading);
		if (spr) {
			const ang = isoHeading(tr.heading);
			const fx = Math.cos(ang);
			const fy = Math.sin(ang);
			for (let i = tr.cars.length; i >= 0; i--) {
				const bx = p.x + -fx * i * 12 * z;
				const by = p.y + -fy * i * 7 * z;
				const car = tr.cars[i - 1];
				const isPax = !car || car.cargo === "pax" || car.cargo === "mail";
				const sheet = i === 0 ? loco.kind === "diesel" ? null : spr.loco : isPax ? spr.coach : spr.freight;
				ctx.save();
				if (i === 0 && loco.kind === "diesel") {
					ctx.translate(bx, by);
					if (dir === 2 || dir === 3) ctx.scale(-1, 1);
					drawAnchored(ctx, spr.diesel, 0, 5 * z, 30 * z, 20 * z);
				} else if (sheet) drawAnchored(ctx, sheet[dir], bx, by + 5 * z, (i === 0 ? 28 : 22) * z, (i === 0 ? 18 : 14) * z);
				ctx.restore();
				if (i === 0 && loco.kind === "steam" && tr.status === "running") {
					const puff = extras.time * 3 % 1;
					ctx.globalAlpha = .35 * (1 - puff);
					ctx.fillStyle = "#d8d4cc";
					ctx.beginPath();
					ctx.arc(bx + 4 * z, by - 14 * z - puff * 10 * z, (3 + puff * 3) * z, 0, Math.PI * 2);
					ctx.fill();
					ctx.globalAlpha = 1;
				}
			}
			ctx.fillStyle = co?.color ?? "#ccc";
			ctx.fillRect(p.x - 5 * z, p.y + 8 * z, 10 * z, 2 * z);
		} else drawTrainSprite(ctx, p.x, p.y, isoHeading(tr.heading), co?.color ?? "#aaa", loco.kind === "steam" && tr.status === "running", extras.time, tr.cars.length);
		if (extras.selectedTrain === tr.id) {
			ctx.strokeStyle = "#e8e4d8";
			ctx.beginPath();
			ctx.arc(p.x, p.y, 16 * z, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
	ctx.font = `${Math.max(10, 11 * Math.min(z, 1.4))}px Figtree, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	for (const city of state.cities) {
		const p = worldToScreen(cam, city.x, city.y, .2, cw, ch);
		ctx.fillStyle = "rgba(12,13,11,0.65)";
		const w = ctx.measureText(city.name).width;
		ctx.fillRect(p.x - w / 2 - 4, p.y - 44 * z - 12, w + 8, 16);
		ctx.fillStyle = city.served ? "#e8e4d8" : "#c9cdc6";
		ctx.fillText(city.name, p.x, p.y - 44 * z);
	}
	ctx.font = `600 ${12 * z}px Figtree, sans-serif`;
	ctx.textAlign = "center";
	for (const f of extras.floats) {
		const p = worldToScreen(cam, f.x, f.y, 0, cw, ch);
		ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
		ctx.fillStyle = f.color;
		ctx.fillText(f.text, p.x, p.y - (1 - f.life) * 24);
		ctx.globalAlpha = 1;
	}
	const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * .35, cw / 2, ch / 2, Math.max(cw, ch) * .72);
	vg.addColorStop(0, "rgba(12,13,11,0)");
	vg.addColorStop(1, "rgba(12,13,11,0.28)");
	ctx.fillStyle = vg;
	ctx.fillRect(0, 0, cw, ch);
	ctx.restore();
}
function isoHeading(gridHeading) {
	const fx = Math.cos(gridHeading);
	const fy = Math.sin(gridHeading);
	const sx = (fx - fy) * 24;
	const sy = (fx + fy) * 12;
	return Math.atan2(sy, sx);
}
function inMap(state, x, y) {
	return x >= 0 && y >= 0 && x < state.mapW && y < state.mapH;
}
function renderMinimap(ctx, state, cam, viewW, viewH) {
	const w = ctx.canvas.width;
	const h = ctx.canvas.height;
	ctx.fillStyle = "#10120f";
	ctx.fillRect(0, 0, w, h);
	const sx = w / state.mapW;
	const sy = h / state.mapH;
	for (let y = 0; y < state.mapH; y++) for (let x = 0; x < state.mapW; x++) {
		const t = state.tiles[y * state.mapW + x];
		let c = "#1a3a42";
		if (t.t === "plains") c = "#4e6a3c";
		else if (t.t === "forest") c = "#2f4a2c";
		else if (t.t === "hills") c = "#5a6340";
		else if (t.t === "mountains") c = "#6a6e68";
		else if (t.t === "desert") c = "#b09a6a";
		else if (t.t === "swamp") c = "#3a4a34";
		else if (t.t === "river" || t.t === "coast") c = "#2a5a62";
		if (t.track) c = state.companies.find((k) => k.id === t.owner)?.color ?? "#ccc";
		ctx.fillStyle = c;
		ctx.fillRect(x * sx, y * sy, sx + .5, sy + .5);
	}
	ctx.fillStyle = "#e8e4d8";
	for (const city of state.cities) ctx.fillRect(city.x * sx - 1, city.y * sy - 1, 3, 3);
	for (const tr of state.trains) {
		ctx.fillStyle = state.companies.find((c) => c.id === tr.companyId)?.color ?? "#fff";
		ctx.fillRect(tr.x * sx, tr.y * sy, 2, 2);
	}
	const center = screenToWorld(cam, viewW / 2, viewH / 2, viewW, viewH);
	const vw = viewW / cam.zoom / 48 * 1.2;
	const vh = viewH / cam.zoom / 24 * 1.2;
	ctx.strokeStyle = "rgba(232,228,216,0.8)";
	ctx.strokeRect((center.x - vw / 2) * sx, (center.y - vh / 2) * sy, vw * sx, vh * sy);
}
var PREFIX = "iron-baron-v1";
var SETTINGS_KEY = `${PREFIX}-settings`;
var SLOTS = 3;
var defaultSettings = {
	master: .7,
	music: .35,
	sfx: .7,
	edgePan: true,
	showGrid: false
};
function safeParse(raw, fallback) {
	if (!raw) return fallback;
	try {
		return {
			...fallback,
			...JSON.parse(raw)
		};
	} catch {
		return fallback;
	}
}
function loadSettings() {
	if (typeof window === "undefined") return defaultSettings;
	try {
		return safeParse(localStorage.getItem(SETTINGS_KEY), defaultSettings);
	} catch {
		return defaultSettings;
	}
}
function saveSettings(s) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
	} catch {}
}
function slotKey(slot) {
	return `${PREFIX}-slot-${slot}`;
}
function metaKey(slot) {
	return `${PREFIX}-meta-${slot}`;
}
function listSaves() {
	if (typeof window === "undefined") return Array.from({ length: SLOTS }, () => null);
	const out = [];
	for (let i = 0; i < SLOTS; i++) try {
		const raw = localStorage.getItem(metaKey(i));
		out.push(raw ? JSON.parse(raw) : null);
	} catch {
		out.push(null);
	}
	return out;
}
function saveSlot(slot, state) {
	try {
		const blob = JSON.stringify(state);
		const prev = localStorage.getItem(slotKey(slot));
		if (prev) localStorage.setItem(`${slotKey(slot)}-bak`, prev);
		localStorage.setItem(slotKey(slot), blob);
		const co = state.companies.find((c) => c.id === state.playerId);
		const meta = {
			slot,
			title: state.scenarioTitle,
			year: state.year,
			month: state.month,
			company: co?.name ?? "Line",
			cash: co?.cash ?? 0,
			savedAt: Date.now()
		};
		localStorage.setItem(metaKey(slot), JSON.stringify(meta));
		return true;
	} catch {
		return false;
	}
}
function loadSlot(slot) {
	try {
		const raw = localStorage.getItem(slotKey(slot));
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!data || typeof data !== "object") return null;
		if ((data.version ?? 1) !== 1) data.version = 1;
		return data;
	} catch {
		return null;
	}
}
function deleteSlot(slot) {
	try {
		localStorage.removeItem(slotKey(slot));
		localStorage.removeItem(metaKey(slot));
	} catch {}
}
var ctx = null;
var master = null;
var musicBus = null;
var sfxBus = null;
var unlocked = false;
var musicTimer = null;
var settings = loadSettings();
function ac() {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const C = window.AudioContext || window.webkitAudioContext;
		if (!C) return null;
		ctx = new C({ latencyHint: "interactive" });
		master = ctx.createGain();
		musicBus = ctx.createGain();
		sfxBus = ctx.createGain();
		musicBus.connect(master);
		sfxBus.connect(master);
		master.connect(ctx.destination);
		applySettings(settings);
	}
	return ctx;
}
function ramp(g, v) {
	if (!ctx) return;
	g.gain.setTargetAtTime(v, ctx.currentTime, .03);
}
function applySettings(s) {
	settings = s;
	if (!master || !musicBus || !sfxBus) return;
	ramp(master, s.master * s.master);
	ramp(musicBus, s.music * s.music);
	ramp(sfxBus, s.sfx * s.sfx);
}
function unlockAudio() {
	const c = ac();
	if (!c) return;
	if (c.state === "suspended") c.resume();
	unlocked = true;
	startMusic();
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function envGain(bus, attack, dur, peak = .2) {
	if (!ctx) return null;
	const g = ctx.createGain();
	g.gain.setValueAtTime(1e-4, ctx.currentTime);
	g.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + attack);
	g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + dur);
	g.connect(bus);
	return g;
}
function sfx(name) {
	const c = ac();
	if (!c || !sfxBus || !unlocked) return;
	const now = c.currentTime;
	if (name === "click") {
		const o = c.createOscillator();
		o.type = "square";
		o.frequency.value = 720;
		const g = envGain(sfxBus, .005, .05, .06);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .06);
	} else if (name === "build") {
		const o = c.createOscillator();
		o.type = "triangle";
		o.frequency.setValueAtTime(180, now);
		o.frequency.exponentialRampToValueAtTime(90, now + .08);
		const g = envGain(sfxBus, .004, .1, .1);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .1);
	} else if (name === "cash") {
		const o = c.createOscillator();
		o.type = "sine";
		o.frequency.setValueAtTime(880, now);
		o.frequency.exponentialRampToValueAtTime(1320, now + .12);
		const g = envGain(sfxBus, .01, .18, .09);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .18);
	} else if (name === "bell") {
		const o = c.createOscillator();
		o.type = "sine";
		o.frequency.value = 620;
		const g = envGain(sfxBus, .01, .5, .08);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .5);
	} else if (name === "break") {
		const o = c.createOscillator();
		o.type = "sawtooth";
		o.frequency.setValueAtTime(140, now);
		o.frequency.exponentialRampToValueAtTime(40, now + .3);
		const g = envGain(sfxBus, .01, .32, .1);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .32);
	} else if (name === "whistle") {
		const o = c.createOscillator();
		o.type = "sine";
		o.frequency.setValueAtTime(480, now);
		o.frequency.linearRampToValueAtTime(560, now + .25);
		const g = envGain(sfxBus, .02, .45, .07);
		if (!g) return;
		o.connect(g);
		o.start(now);
		o.stop(now + .45);
	}
}
function playChord(freqs, dur, vol) {
	const c = ac();
	if (!c || !musicBus || !unlocked) return;
	const now = c.currentTime;
	for (const f of freqs) {
		const o = c.createOscillator();
		o.type = "sine";
		o.frequency.value = f;
		const g = c.createGain();
		g.gain.setValueAtTime(1e-4, now);
		g.gain.exponentialRampToValueAtTime(vol, now + .04);
		g.gain.exponentialRampToValueAtTime(1e-4, now + dur);
		o.connect(g);
		g.connect(musicBus);
		o.start(now);
		o.stop(now + dur + .02);
	}
}
var THEME = [
	[
		196,
		247,
		294
	],
	[
		175,
		220,
		262
	],
	[
		196,
		233,
		311
	],
	[
		165,
		196,
		247
	]
];
function startMusic() {
	if (musicTimer !== null) return;
	let i = 0;
	const tick = () => {
		if (!unlocked) return;
		playChord(THEME[i % THEME.length], 1.8, .035);
		i++;
		musicTimer = window.setTimeout(tick, 2e3);
	};
	tick();
}
if (typeof window !== "undefined") document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "visible") resumeAudio();
});
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatCash(n) {
	const sign = n < 0 ? "-" : "";
	const v = Math.abs(Math.round(n));
	if (v >= 1e9) return `${sign}$${(v / 1e9).toFixed(2)}B`;
	if (v >= 1e6) return `${sign}$${(v / 1e6).toFixed(2)}M`;
	if (v >= 1e4) return `${sign}$${(v / 1e3).toFixed(1)}k`;
	return `${sign}$${v.toLocaleString("en-US")}`;
}
function formatCashFull(n) {
	return `${n < 0 ? "-" : ""}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}
var MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
function snapHud(state) {
	const p = playerCompany(state);
	const last = state.events[state.events.length - 1] ?? null;
	return {
		cash: formatCash(p.cash),
		cashRaw: p.cash,
		worth: formatCash(netWorth(state, p.id)),
		date: `${MONTHS[state.month]} ${state.year}`,
		year: state.year,
		month: state.month,
		speed: state.speed,
		company: p.name,
		cities: state.stats.citiesConnected,
		trains: state.trains.filter((t) => t.companyId === p.id).length,
		won: state.won,
		lost: state.lost,
		loseReason: state.loseReason,
		scenario: state.scenarioTitle,
		goals: goalProgress(state),
		news: last
	};
}
var useGameStore = create((set) => ({
	screen: "menu",
	overlay: null,
	tool: "inspect",
	selectedTrain: null,
	selectedStation: null,
	selectedCity: null,
	hud: null,
	settings: typeof window === "undefined" ? defaultSettings : loadSettings(),
	toast: null,
	trainDraft: {
		locoId: "pioneer",
		cars: ["pax", "mail"],
		route: []
	},
	inspectText: "",
	setScreen: (screen) => set({
		screen,
		overlay: null
	}),
	setOverlay: (overlay) => set({ overlay }),
	setTool: (tool) => set({ tool }),
	setSelected: (kind, id) => set(kind === "clear" ? {
		selectedTrain: null,
		selectedStation: null,
		selectedCity: null
	} : kind === "train" ? {
		selectedTrain: id ?? null,
		selectedStation: null,
		selectedCity: null
	} : kind === "station" ? {
		selectedStation: id ?? null,
		selectedTrain: null,
		selectedCity: null
	} : {
		selectedCity: id ?? null,
		selectedTrain: null,
		selectedStation: null
	}),
	setHud: (hud) => set({ hud }),
	setSettings: (s) => set((st) => ({ settings: {
		...st.settings,
		...s
	} })),
	setToast: (toast) => set({ toast }),
	setDraft: (d) => set((st) => ({ trainDraft: {
		...st.trainDraft,
		...d
	} })),
	setInspect: (inspectText) => set({ inspectText })
}));
var PAN = 420;
var singleton = null;
function getEngine() {
	return singleton;
}
var Engine = class {
	canvas;
	ctx;
	mini = null;
	miniCtx = null;
	state = null;
	cam = {
		x: 0,
		y: 0,
		zoom: 1
	};
	keys = /* @__PURE__ */ new Set();
	injected = /* @__PURE__ */ new Set();
	hover = null;
	paintFrom = null;
	ghost = null;
	floats = [];
	running = false;
	raf = 0;
	last = 0;
	acc = 0;
	time = 0;
	mode = "demo";
	pointers = /* @__PURE__ */ new Map();
	pinch0 = 0;
	dragCam = null;
	autosaveAt = 0;
	hudClock = 0;
	onResize;
	constructor(canvas) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("No 2d context");
		this.ctx = ctx;
		this.onResize = () => this.resize();
		window.addEventListener("resize", this.onResize);
		this.bind();
		this.resize();
		this.startDemo();
		this.loop = this.loop.bind(this);
		this.running = true;
		this.raf = requestAnimationFrame(this.loop);
		this.installProbe();
		singleton = this;
		loadSprites();
	}
	setSpeed(s) {
		if (this.state) this.state.speed = s;
	}
	attachMinimap(c) {
		this.mini = c;
		this.miniCtx = c?.getContext("2d") ?? null;
	}
	destroy() {
		this.running = false;
		cancelAnimationFrame(this.raf);
		window.removeEventListener("resize", this.onResize);
		this.unbind();
		if (singleton === this) singleton = null;
		if (typeof window !== "undefined") delete window.__controlsTest;
		if (typeof window !== "undefined") delete window.__ironBaron;
	}
	resize() {
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const r = this.canvas.getBoundingClientRect();
		this.canvas.width = Math.max(1, Math.floor(r.width * dpr));
		this.canvas.height = Math.max(1, Math.floor(r.height * dpr));
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	startDemo() {
		this.mode = "demo";
		this.state = generateWorld({
			companyName: "Demo Line",
			size: "small",
			difficulty: "easy",
			region: "columbia",
			rivals: 1,
			seed: 1848,
			year: 1860
		});
		this.centerOnMap();
		this.cam.zoom = .85;
		const cities = this.state.cities;
		if (cities.length >= 2) {
			const a = cities[0];
			const b = cities[1];
			const id = this.state.playerId;
			const path = pathForSurvey(this.state, a.x, a.y, b.x, b.y);
			if (path) for (const p of path) placeTrackLine(this.state, p.x, p.y, p.x, p.y, id);
			else placeTrackLine(this.state, a.x, a.y, b.x, b.y, id);
			placeStation(this.state, a.x, a.y, id);
			placeStation(this.state, b.x, b.y, id);
			const sa = this.state.stations[0];
			const sb = this.state.stations[1];
			if (sa && sb) buyTrain(this.state, id, "atlantic", [
				"pax",
				"mail",
				"goods"
			], [sa.id, sb.id]);
		}
	}
	startPlay(state) {
		this.mode = "play";
		this.state = state;
		this.floats = [];
		this.centerOnMap();
		useGameStore.getState().setHud(snapHud(state));
		useGameStore.getState().setScreen("playing");
		useGameStore.getState().setTool("track");
	}
	centerOnMap() {
		if (!this.state) return;
		const p = iso(this.state.mapW / 2, this.state.mapH / 2, 0);
		this.cam.x = p.sx;
		this.cam.y = p.sy;
		this.cam.zoom = 1;
	}
	centerOn(x, y) {
		const p = iso(x, y, 0);
		this.cam.x = p.sx;
		this.cam.y = p.sy;
	}
	hooks() {
		return {
			float: (x, y, text, color) => {
				this.floats.push({
					x,
					y,
					text,
					life: 1,
					color: color ?? "#e8e4d8"
				});
			},
			news: (headline, body) => {
				if (!this.state) return;
				this.state.events.push({
					year: this.state.year,
					month: this.state.month,
					headline,
					body
				});
				if (this.state.events.length > 40) this.state.events.shift();
				useGameStore.getState().setToast(headline);
			},
			sfx: (n) => sfx(n)
		};
	}
	tileFromEvent(e) {
		const r = this.canvas.getBoundingClientRect();
		const px = e.clientX - r.left;
		const py = e.clientY - r.top;
		const w = r.width;
		const h = r.height;
		const g = screenToWorld(this.cam, px, py, w, h);
		return {
			x: Math.round(g.x),
			y: Math.round(g.y),
			px,
			py
		};
	}
	bind() {
		const c = this.canvas;
		c.addEventListener("pointerdown", this.onDown);
		c.addEventListener("pointermove", this.onMove);
		c.addEventListener("pointerup", this.onUp);
		c.addEventListener("pointercancel", this.onUp);
		c.addEventListener("wheel", this.onWheel, { passive: false });
		c.addEventListener("contextmenu", this.onMenu);
		window.addEventListener("keydown", this.onKey);
		window.addEventListener("keyup", this.onUpKey);
		window.addEventListener("blur", this.clearKeys);
		document.addEventListener("visibilitychange", this.onVis);
	}
	unbind() {
		const c = this.canvas;
		c.removeEventListener("pointerdown", this.onDown);
		c.removeEventListener("pointermove", this.onMove);
		c.removeEventListener("pointerup", this.onUp);
		c.removeEventListener("pointercancel", this.onUp);
		c.removeEventListener("wheel", this.onWheel);
		c.removeEventListener("contextmenu", this.onMenu);
		window.removeEventListener("keydown", this.onKey);
		window.removeEventListener("keyup", this.onUpKey);
		window.removeEventListener("blur", this.clearKeys);
		document.removeEventListener("visibilitychange", this.onVis);
	}
	playingUi() {
		const s = useGameStore.getState();
		return s.screen === "playing" && !s.overlay;
	}
	onDown = (e) => {
		unlockAudio();
		this.canvas.setPointerCapture(e.pointerId);
		this.pointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (this.pointers.size === 2) {
			const pts = [...this.pointers.values()];
			this.pinch0 = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
			this.paintFrom = null;
			this.dragCam = null;
			return;
		}
		if (e.button === 1 || e.button === 2 || !this.playingUi()) {
			this.dragCam = {
				x: e.clientX,
				y: e.clientY,
				cx: this.cam.x,
				cy: this.cam.y
			};
			return;
		}
		const tool = useGameStore.getState().tool;
		const t = this.tileFromEvent(e);
		if (tool === "track" || tool === "bulldoze") {
			this.paintFrom = {
				x: t.x,
				y: t.y
			};
			this.applyPaint(t.x, t.y, t.x, t.y);
		} else if (tool === "station") this.tryStation(t.x, t.y);
		else if (tool === "train") this.pickStationForRoute(t.x, t.y);
		else this.inspect(t.x, t.y);
	};
	onMove = (e) => {
		if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (this.pointers.size === 2 && this.pinch0) {
			const pts = [...this.pointers.values()];
			const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
			const f = d / this.pinch0;
			this.cam.zoom = Math.max(.4, Math.min(2.4, this.cam.zoom * f));
			this.pinch0 = d;
			return;
		}
		if (this.dragCam) {
			const dx = (e.clientX - this.dragCam.x) / this.cam.zoom;
			const dy = (e.clientY - this.dragCam.y) / this.cam.zoom;
			this.cam.x = this.dragCam.cx - dx;
			this.cam.y = this.dragCam.cy - dy;
			return;
		}
		const t = this.tileFromEvent(e);
		this.hover = {
			x: t.x,
			y: t.y
		};
		if (this.paintFrom && this.playingUi()) this.ghost = line4(this.paintFrom.x, this.paintFrom.y, t.x, t.y);
	};
	onUp = (e) => {
		this.pointers.delete(e.pointerId);
		if (this.paintFrom && this.playingUi()) {
			const t = this.tileFromEvent(e);
			this.applyPaint(this.paintFrom.x, this.paintFrom.y, t.x, t.y);
		}
		this.paintFrom = null;
		this.ghost = null;
		this.dragCam = null;
		this.pinch0 = 0;
	};
	onWheel = (e) => {
		e.preventDefault();
		const f = e.deltaY > 0 ? .92 : 1.08;
		this.cam.zoom = Math.max(.4, Math.min(2.4, this.cam.zoom * f));
	};
	onMenu = (e) => e.preventDefault();
	onKey = (e) => {
		if (e.repeat && (e.code === "Space" || e.code.startsWith("Digit"))) return;
		this.keys.add(e.code);
		const tag = e.target?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA") return;
		if ([
			"Space",
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight"
		].includes(e.code)) e.preventDefault();
		if (!this.playingUi() && useGameStore.getState().screen !== "playing") return;
		const st = useGameStore.getState();
		if (e.code === "Escape") {
			if (st.overlay) st.setOverlay(null);
			else st.setOverlay("pause");
			return;
		}
		if (st.overlay) return;
		if (e.code === "Space") {
			if (!this.state) return;
			this.state.speed = this.state.speed === 0 ? 1 : 0;
		}
		if (e.code === "Digit1") st.setTool("inspect");
		if (e.code === "Digit2") st.setTool("track");
		if (e.code === "Digit3") st.setTool("station");
		if (e.code === "Digit4") st.setTool("train");
		if (e.code === "Digit5") st.setTool("bulldoze");
		if (e.code === "KeyL") st.setOverlay("ledger");
		if (e.code === "KeyR") st.setOverlay("roster");
		if (e.code === "KeyN") st.setOverlay("news");
		if (e.code === "Equal" || e.code === "NumpadAdd") this.bumpSpeed(1);
		if (e.code === "Minus" || e.code === "NumpadSubtract") this.bumpSpeed(-1);
	};
	onUpKey = (e) => {
		this.keys.delete(e.code);
	};
	clearKeys = () => {
		this.keys.clear();
		this.injected.clear();
	};
	onVis = () => {
		if (document.visibilityState === "hidden") {
			this.clearKeys();
			if (this.mode === "play" && this.state) saveSlot(0, this.state);
		}
	};
	bumpSpeed(dir) {
		if (!this.state) return;
		const order = [
			0,
			1,
			2,
			4,
			8
		];
		const i = order.indexOf(this.state.speed);
		this.state.speed = order[Math.max(0, Math.min(order.length - 1, i + dir))];
	}
	applyPaint(x0, y0, x1, y1) {
		if (!this.state || this.mode !== "play") return;
		const tool = useGameStore.getState().tool;
		const id = this.state.playerId;
		if (tool === "track") placeTrackLine(this.state, x0, y0, x1, y1, id, this.hooks());
		else if (tool === "bulldoze") for (const p of line4(x0, y0, x1, y1)) bulldoze(this.state, p.x, p.y, id, this.hooks());
	}
	tryStation(x, y) {
		if (!this.state || this.mode !== "play") return;
		const st = placeStation(this.state, x, y, this.state.playerId, this.hooks());
		if (!st) useGameStore.getState().setToast("Need owned track, clear ground, and cash.");
		else useGameStore.getState().setSelected("station", st.id);
	}
	pickStationForRoute(x, y) {
		if (!this.state) return;
		const st = this.state.stations.find((s) => s.x === x && s.y === y && s.companyId === this.state.playerId);
		if (!st) {
			useGameStore.getState().setToast("Click your stations to set a route.");
			useGameStore.getState().setOverlay("trainbuy");
			return;
		}
		const d = useGameStore.getState().trainDraft;
		if (d.route.includes(st.id)) return;
		useGameStore.getState().setDraft({ route: [...d.route, st.id] });
		useGameStore.getState().setToast(`Added ${st.name} to route`);
		useGameStore.getState().setOverlay("trainbuy");
	}
	inspect(x, y) {
		if (!this.state) return;
		const tr = this.state.trains.find((t) => Math.round(t.x) === x && Math.round(t.y) === y);
		if (tr) {
			useGameStore.getState().setSelected("train", tr.id);
			const loco = locoById(tr.locoId);
			const load = tr.cars.map((c) => `${CARGO_LABEL[c.cargo]} ${c.amount}`).join(" · ");
			useGameStore.getState().setInspect(`${tr.name}  ·  ${loco.name}\n${load}\nProfit ${formatCashFull(tr.profit)}`);
			return;
		}
		const st = this.state.stations.find((s) => s.x === x && s.y === y);
		if (st) {
			useGameStore.getState().setSelected("station", st.id);
			useGameStore.getState().setInspect(`${st.name}\nWaiting cargo on the platform.`);
			return;
		}
		const city = this.state.cities.find((c) => Math.abs(c.x - x) + Math.abs(c.y - y) <= 1);
		if (city) {
			useGameStore.getState().setSelected("city", city.id);
			useGameStore.getState().setInspect(`${city.name}\nPop ${city.pop.toLocaleString("en-US")}\n${city.industries.map((i) => i.kind).join(", ") || "Market town"}`);
			this.centerOn(city.x, city.y);
			return;
		}
		const tile = tileAt(this.state, x, y);
		if (tile) {
			useGameStore.getState().setSelected("clear");
			const res = tile.res ? `  ·  ${tile.res}` : "";
			useGameStore.getState().setInspect(`${tile.t}${res}${tile.track ? "  ·  track" : ""}`);
		}
	}
	held(code) {
		return this.keys.has(code) || this.injected.has(code);
	}
	loop = (now) => {
		if (!this.running) return;
		const dt = Math.min(.1, (now - (this.last || now)) / 1e3);
		this.last = now;
		this.time += dt;
		this.step(dt);
		this.draw();
		this.raf = requestAnimationFrame(this.loop);
	};
	step(dt) {
		const pan = PAN * dt / this.cam.zoom;
		let mx = 0;
		let my = 0;
		if (this.held("KeyW") || this.held("ArrowUp")) my -= 1;
		if (this.held("KeyS") || this.held("ArrowDown")) my += 1;
		if (this.held("KeyA") || this.held("ArrowLeft")) mx -= 1;
		if (this.held("KeyD") || this.held("ArrowRight")) mx += 1;
		if (mx || my) {
			const m = Math.hypot(mx, my) || 1;
			this.cam.x += mx / m * pan;
			this.cam.y += my / m * pan;
		}
		for (const f of this.floats) f.life -= dt * .7;
		this.floats = this.floats.filter((f) => f.life > 0);
		if (this.mode === "play" && this.state && this.playingUi()) {
			this.state.playTime += dt;
			const dps = daysPerSecond(this.state.speed);
			this.acc += dt;
			const step = 1 / 30;
			while (this.acc >= step) {
				this.acc -= step;
				if (dps > 0) simulate(this.state, dps * step, this.hooks());
			}
			this.hudClock += dt;
			if (this.hudClock > .2) {
				this.hudClock = 0;
				useGameStore.getState().setHud(snapHud(this.state));
				if (this.state.won || this.state.lost) useGameStore.getState().setOverlay("end");
			}
			this.autosaveAt += dt;
			if (this.autosaveAt > 20) {
				this.autosaveAt = 0;
				saveSlot(0, this.state);
			}
		} else if (this.mode === "demo" && this.state) simulate(this.state, 10 * dt, this.hooks());
	}
	draw() {
		if (!this.state) return;
		const st = useGameStore.getState();
		const cssW = this.canvas.getBoundingClientRect().width;
		const cssH = this.canvas.getBoundingClientRect().height;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		recomputeAllTracks(this.state);
		renderWorld(this.ctx, this.state, this.cam, {
			hover: this.mode === "play" ? this.hover : null,
			tool: st.tool,
			selectedTrain: st.selectedTrain,
			selectedStation: st.selectedStation,
			floats: this.floats,
			time: this.time,
			showGrid: st.settings.showGrid,
			ghost: this.ghost,
			demo: this.mode === "demo"
		}, cssW, cssH);
		if (this.mini && this.miniCtx && this.mode === "play") renderMinimap(this.miniCtx, this.state, this.cam, cssW, cssH);
	}
	installProbe() {
		window.__controlsTest = {
			getYaw: () => this.cam.x,
			getSpeed: () => this.cam.zoom,
			setKeys: (codes) => {
				this.injected = new Set(codes);
			}
		};
		window.__ironBaron = {
			getState: () => this.state,
			getMode: () => this.mode,
			setTool: (t) => useGameStore.getState().setTool(t),
			pan: () => ({
				x: this.cam.x,
				y: this.cam.y,
				z: this.cam.zoom
			}),
			centerOn: (x, y) => this.centerOn(x, y),
			setZoom: (z) => {
				this.cam.zoom = Math.max(.4, Math.min(2.4, z));
			}
		};
	}
};
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			secondary: "bg-elevated text-fg border border-border hover:border-border-strong",
			ghost: "text-fg hover:bg-elevated",
			danger: "bg-loss text-fg hover:opacity-90",
			paper: "bg-paper text-primary-fg hover:opacity-90"
		},
		size: {
			default: "h-11 px-4 text-sm rounded-md",
			sm: "h-9 px-3 text-xs rounded-sm",
			lg: "h-12 px-5 text-base rounded-lg",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function Panel({ title, children, onClose, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute inset-0 z-20 flex items-end justify-center p-3 sm:items-center sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-bg/70",
			"aria-label": "Close",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: cn("relative flex max-h-[88dvh] w-full flex-col overflow-hidden border border-border bg-surface shadow-panel", wide ? "max-w-3xl rounded-xl" : "max-w-lg rounded-lg"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold tracking-tight text-fg",
					children: title
				}), onClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-11 text-muted hover:text-fg",
					onClick: onClose,
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mx-auto size-5" })
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-5 py-4",
				children
			})]
		})]
	});
}
function MainMenu() {
	const setScreen = useGameStore((s) => s.setScreen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-6 sm:justify-center sm:p-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted",
					children: "Railroad empire"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl",
					children: "Iron Baron"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-sm text-sm leading-relaxed text-muted",
					children: "Lay iron, buy locomotives, and bankrupt the competition. A 19th-century railroad on a living map."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							onClick: () => {
								unlockAudio();
								sfx("click");
								setScreen("new");
							},
							children: "New empire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "secondary",
							onClick: () => {
								sfx("click");
								setScreen("scenarios");
							},
							children: "Scenarios"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setScreen("load"),
								children: "Load"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setScreen("howto"),
								children: "How to play"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setScreen("settings"),
							children: "Settings"
						})
					]
				})
			]
		})
	});
}
function NewGameMenu({ scenarioId }) {
	const setScreen = useGameStore((s) => s.setScreen);
	const sc = SCENARIOS.find((s) => s.id === scenarioId);
	const [name, setName] = (0, import_react.useState)(sc ? "Charter Line" : "Pioneer Line");
	const [size, setSize] = (0, import_react.useState)(sc?.size ?? "medium");
	const [diff, setDiff] = (0, import_react.useState)(sc?.difficulty ?? "normal");
	const [region, setRegion] = (0, import_react.useState)(sc?.region ?? "columbia");
	const [rivals, setRivals] = (0, import_react.useState)(sc?.rivals ?? 2);
	const [seed, setSeed] = (0, import_react.useState)(() => String(Math.floor(Math.random() * 999999) + 1));
	const start = () => {
		unlockAudio();
		sfx("bell");
		const engine = getEngine();
		if (!engine) return;
		const state = generateWorld({
			companyName: name,
			size,
			difficulty: diff,
			region,
			rivals: sc?.rivals ?? rivals,
			seed: Number(seed) || 1,
			year: sc?.year,
			scenario: sc
		});
		engine.startPlay(state);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: sc ? sc.title : "New empire",
		onClose: () => setScreen("menu"),
		wide: true,
		children: [
			sc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 text-sm text-muted",
				children: sc.blurb
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mb-1 block text-xs font-medium uppercase tracking-wider text-muted",
				children: "Company"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "mb-4 h-11 w-full rounded-md border border-border bg-inset px-3 text-sm text-fg",
				value: name,
				onChange: (e) => setName(e.target.value),
				maxLength: 28
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Map",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
							value: size,
							onChange: (v) => setSize(v),
							options: Object.entries(SIZE_META).map(([k, v]) => ({
								id: k,
								label: v.label
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Difficulty",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
							value: diff,
							onChange: (v) => setDiff(v),
							options: Object.entries(DIFFICULTY_META).map(([k, v]) => ({
								id: k,
								label: v.label
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Region",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
							value: region,
							onChange: (v) => setRegion(v),
							options: [
								{
									id: "columbia",
									label: "Columbia"
								},
								{
									id: "frontier",
									label: "Frontier"
								},
								{
									id: "albion",
									label: "Albion"
								},
								{
									id: "continent",
									label: "Continent"
								},
								{
									id: "outback",
									label: "Outback"
								}
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Rivals",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RowSelect, {
							value: String(rivals),
							onChange: (v) => setRivals(Number(v)),
							options: [
								{
									id: "0",
									label: "None"
								},
								{
									id: "1",
									label: "One"
								},
								{
									id: "2",
									label: "Two"
								},
								{
									id: "3",
									label: "Three"
								}
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mb-1 mt-4 block text-xs font-medium uppercase tracking-wider text-muted",
				children: "Map seed"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "h-11 flex-1 rounded-md border border-border bg-inset px-3 font-mono text-sm text-fg",
					value: seed,
					onChange: (e) => setSeed(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setSeed(String(Math.floor(Math.random() * 999999) + 1)),
					children: "Shuffle"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6 w-full",
				size: "lg",
				onClick: start,
				children: "Charter the company"
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-1 text-xs font-medium uppercase tracking-wider text-muted",
		children: label
	}), children] });
}
function RowSelect({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-1",
		children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(o.id),
			className: cn("h-9 rounded-sm px-3 text-xs font-medium", value === o.id ? "bg-primary text-primary-fg" : "bg-elevated text-muted hover:text-fg"),
			children: o.label
		}, o.id))
	});
}
function ScenarioMenu() {
	const setScreen = useGameStore((s) => s.setScreen);
	const [pick, setPick] = (0, import_react.useState)(null);
	if (pick) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewGameMenu, { scenarioId: pick });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Scenarios",
		onClose: () => setScreen("menu"),
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: SCENARIOS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setPick(s.id),
				className: "rounded-md border border-border bg-elevated p-4 text-left hover:border-border-strong",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-base font-semibold text-fg",
						children: s.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 text-xs text-muted",
						children: [
							s.year,
							" · ",
							s.region,
							" · ",
							DIFFICULTY_META[s.difficulty].label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: s.blurb
					})
				]
			}, s.id))
		})
	});
}
function LoadMenu() {
	const setScreen = useGameStore((s) => s.setScreen);
	const [saves, setSaves] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => setSaves(listSaves()), []);
	const load = (i) => {
		const st = loadSlot(i);
		const engine = getEngine();
		if (st && engine) {
			unlockAudio();
			engine.startPlay(st);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Load game",
		onClose: () => setScreen("menu"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-2",
			children: saves.map((s, i) => s ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-md border border-border bg-elevated p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-w-0 flex-1 text-left",
					onClick: () => load(i),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "truncate text-sm font-medium text-fg",
						children: s.company
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							s.title,
							" · ",
							MONTHS[s.month],
							" ",
							s.year,
							" · ",
							formatCash(s.cash)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "icon-sm",
					variant: "ghost",
					"aria-label": "Delete save",
					onClick: () => {
						deleteSlot(i);
						setSaves(listSaves());
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
				})]
			}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-dashed border-border px-3 py-4 text-sm text-subtle",
				children: ["Empty slot ", i + 1]
			}, i))
		})
	});
}
function HowTo() {
	const setScreen = useGameStore((s) => s.setScreen);
	const screen = useGameStore((s) => s.screen);
	const close = () => screen === "playing" ? useGameStore.getState().setOverlay(null) : setScreen("menu");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "How to play",
		onClose: close,
		wide: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 text-sm leading-relaxed text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-fg",
					children: "You are a railroad charter. Turn dirt into dividends."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "list-decimal space-y-2 pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Drag to lay track between towns. Hills, rivers and mountains cost more (bridges and tunnels)." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Build a station on your track next to a city so cargo will wait on the platform." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Buy a locomotive, hang cars, and click two or more stations for a route." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Unpause time. Trains haul passengers, mail and freight; distance and demand pay the bills." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Issue bonds if you are short. Buy rival stock in the ledger. Watch the newspaper." })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "WASD / arrows"
					}),
					" pan · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "wheel"
					}),
					" zoom ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "1–5"
					}),
					" tools · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "Space"
					}),
					" pause ·",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "L"
					}),
					" ledger · ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: "R"
					}),
					" roster"
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Rivals lay their own iron. Beat the charter goals before the money runs out." })
			]
		})
	});
}
function SettingsPanel() {
	const settings = useGameStore((s) => s.settings);
	const setSettings = useGameStore((s) => s.setSettings);
	const setScreen = useGameStore((s) => s.setScreen);
	const screen = useGameStore((s) => s.screen);
	const close = () => screen === "playing" ? useGameStore.getState().setOverlay(null) : setScreen("menu");
	const update = (p) => {
		const next = {
			...settings,
			...p
		};
		setSettings(next);
		saveSettings(next);
		applySettings(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Settings",
		onClose: close,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Master",
				value: settings.master,
				onChange: (v) => update({ master: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Music",
				value: settings.music,
				onChange: (v) => update({ music: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Effects",
				value: settings.sfx,
				onChange: (v) => update({ sfx: v })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex h-11 items-center gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.showGrid,
					onChange: (e) => update({ showGrid: e.target.checked })
				}), "Show tile grid"]
			})
		]
	});
}
function Slider({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mb-3 block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex justify-between text-xs uppercase tracking-wider text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular",
				children: Math.round(value * 100)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min: 0,
			max: 1,
			step: .01,
			value,
			onChange: (e) => onChange(Number(e.target.value)),
			className: "w-full accent-primary"
		})]
	});
}
var TOOLS = [
	{
		id: "inspect",
		label: "Survey",
		icon: Search,
		key: "1"
	},
	{
		id: "track",
		label: "Track",
		icon: Map$1,
		key: "2"
	},
	{
		id: "station",
		label: "Station",
		icon: Building2,
		key: "3"
	},
	{
		id: "train",
		label: "Train",
		icon: TrainFront,
		key: "4"
	},
	{
		id: "bulldoze",
		label: "Wreck",
		icon: Trash2,
		key: "5"
	}
];
function HUD() {
	const hud = useGameStore((s) => s.hud);
	const tool = useGameStore((s) => s.tool);
	const setTool = useGameStore((s) => s.setTool);
	const setOverlay = useGameStore((s) => s.setOverlay);
	const inspect = useGameStore((s) => s.inspectText);
	const toast = useGameStore((s) => s.toast);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const t = window.setTimeout(() => useGameStore.getState().setToast(null), 2800);
		return () => clearTimeout(t);
	}, [toast]);
	if (!hud) return null;
	const engine = getEngine();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto max-w-full rounded-md border border-border bg-surface/95 px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline gap-x-4 gap-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-muted",
							children: "Cash"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("font-display text-lg tabular", hud.cashRaw < 0 ? "text-loss" : "text-fg"),
							children: hud.cash
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-muted",
							children: "Net worth"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-lg tabular text-fg",
							children: hud.worth
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-wider text-muted",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm tabular text-fg",
							children: hud.date
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 truncate text-xs text-muted",
					children: [
						hud.company,
						" · ",
						hud.scenario
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto flex flex-wrap items-center gap-1",
				children: [
					[
						0,
						1,
						2,
						4,
						8
					].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: hud.speed === s ? "default" : "secondary",
						"aria-label": s === 0 ? "Pause" : `${s}x speed`,
						onClick: () => engine?.setSpeed(s),
						children: [s === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}) : s >= 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FastForward, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), s === 0 ? "Pause" : `${s}x`]
					}, s)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "secondary",
						"aria-label": "Ledger",
						onClick: () => setOverlay("ledger"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "secondary",
						"aria-label": "Newspaper",
						onClick: () => setOverlay("news"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon-sm",
						variant: "secondary",
						"aria-label": "Pause menu",
						onClick: () => setOverlay("pause"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {})
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute bottom-0 inset-x-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-2xl flex-col gap-2",
				children: [
					hud.goals.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none rounded-md border border-border bg-surface/90 px-3 py-2 text-xs text-muted",
						children: hud.goals.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: g.done ? "text-profit" : "",
								children: g.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular text-fg",
								children: [
									g.current >= 1e3 ? formatCash(g.current) : g.current,
									"/",
									g.target >= 1e3 ? formatCash(g.target) : g.target
								]
							})]
						}, g.label))
					}) : null,
					inspect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "whitespace-pre-line rounded-md border border-border bg-surface/95 px-3 py-2 text-xs text-fg",
						children: inspect
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-auto flex justify-center gap-1 rounded-lg border border-border bg-surface/95 p-1",
						children: TOOLS.map((t) => {
							const Icon = t.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									sfx("click");
									setTool(t.id);
									if (t.id === "train") setOverlay("trainbuy");
								},
								className: cn("flex min-w-11 flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-2 text-[10px] uppercase tracking-wide", tool === t.id ? "bg-primary text-primary-fg" : "text-muted hover:text-fg"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), t.label]
							}, t.id);
						})
					})
				]
			})
		}),
		toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-md border border-border bg-elevated px-4 py-2 text-sm text-fg",
			children: toast
		}) : null
	] });
}
function PauseMenu() {
	const setOverlay = useGameStore((s) => s.setOverlay);
	const setScreen = useGameStore((s) => s.setScreen);
	const engine = getEngine();
	const save = (slot) => {
		if (!engine?.state) return;
		const ok = saveSlot(slot, engine.state);
		useGameStore.getState().setToast(ok ? `Saved to slot ${slot + 1}` : "Save failed");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Paused",
		onClose: () => setOverlay(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOverlay(null),
					children: "Resume"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => save(0),
					children: "Quick save"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => save(1),
					children: "Save slot 2"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					onClick: () => setOverlay("howto"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-4" }), " How to play"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setOverlay("settings"),
					children: "Settings"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					onClick: () => {
						engine?.startDemo();
						setScreen("menu");
					},
					children: "Resign to menu"
				})
			]
		})
	});
}
function Ledger() {
	const setOverlay = useGameStore((s) => s.setOverlay);
	const state = getEngine()?.state;
	const [, bump] = (0, import_react.useState)(0);
	if (!state) return null;
	const p = playerCompany(state);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Company ledger",
		onClose: () => setOverlay(null),
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Cash",
						v: formatCashFull(p.cash)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Net worth",
						v: formatCashFull(netWorth(state, p.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Track",
						v: `${p.trackTiles} tiles`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "Trains",
						v: String(state.trains.filter((t) => t.companyId === p.id).length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 font-display text-base text-fg",
				children: "Bonds"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-col gap-2",
				children: [
					p.bonds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No paper on the street."
					}) : null,
					p.bonds.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-md bg-elevated px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							formatCashFull(b.amount),
							" @ ",
							Math.round(b.rate * 100),
							"% · ",
							b.yearIssued
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								repayBond(state, p.id, i);
								bump((n) => n + 1);
							},
							children: "Repay"
						})]
					}, i)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => {
							issueBond(state, p.id);
							bump((n) => n + 1);
						},
						children: "Issue $100,000 bond"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 font-display text-base text-fg",
				children: "Stock exchange"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: state.companies.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 rounded-md border border-border bg-elevated px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-full",
							style: { background: c.color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "truncate text-sm text-fg",
								children: [
									c.name,
									" ",
									c.bankrupt ? "(bankrupt)" : ""
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted tabular",
								children: [
									"$",
									c.stockPrice.toFixed(2),
									" · you own ",
									c.playerShares,
									"/",
									c.shares
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								tradeStock(state, c.id, 10);
								bump((n) => n + 1);
							},
							children: "Buy 10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								tradeStock(state, c.id, -10);
								bump((n) => n + 1);
							},
							children: "Sell 10"
						})
					]
				}, c.id))
			})
		]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-elevated px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-display tabular text-fg",
			children: v
		})]
	});
}
function NewsPanel() {
	const setOverlay = useGameStore((s) => s.setOverlay);
	const events = getEngine()?.state?.events ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Gazette",
		onClose: () => setOverlay(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-3",
			children: [...events].reverse().map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "border-b border-border pb-3 last:border-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[10px] uppercase tracking-wider text-muted",
						children: [
							MONTHS[e.month],
							" ",
							e.year
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-base text-fg",
						children: e.headline
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: e.body
					})
				]
			}, i))
		})
	});
}
function TrainBuy() {
	const setOverlay = useGameStore((s) => s.setOverlay);
	const draft = useGameStore((s) => s.trainDraft);
	const setDraft = useGameStore((s) => s.setDraft);
	const engine = getEngine();
	const state = engine?.state;
	const [, bump] = (0, import_react.useState)(0);
	if (!state || !engine) return null;
	const locos = locosForYear(state.year);
	const loco = locoById(draft.locoId);
	const stations = state.stations.filter((s) => s.companyId === state.playerId);
	const launch = () => {
		const tr = buyTrain(state, state.playerId, draft.locoId, draft.cars, draft.route, engine.hooks());
		if (!tr) useGameStore.getState().setToast("Need two linked stations, a consist, and cash.");
		else {
			useGameStore.getState().setToast(`${tr.name} on the line`);
			setDraft({ route: [] });
			setOverlay(null);
		}
		bump((n) => n + 1);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Buy a train",
		onClose: () => setOverlay(null),
		wide: true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted",
				children: "Locomotive"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid max-h-40 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2",
				children: locos.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setDraft({
						locoId: l.id,
						cars: draft.cars.slice(0, l.capacity)
					}),
					className: cn("rounded-md border px-3 py-2 text-left", draft.locoId === l.id ? "border-primary bg-elevated" : "border-border bg-inset"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-fg",
						children: l.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted",
						children: [
							formatCash(l.cost),
							" · ",
							l.speed,
							" mph · ",
							l.capacity,
							" cars"
						]
					})]
				}, l.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: loco.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted",
				children: "Consist"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex flex-wrap gap-1",
				children: CARGOS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: draft.cars.length >= loco.capacity,
					onClick: () => setDraft({ cars: [...draft.cars, c] }),
					className: "h-9 rounded-sm bg-elevated px-3 text-xs text-fg disabled:opacity-40",
					children: ["+ ", CARGO_LABEL[c]]
				}, c))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-1",
				children: draft.cars.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "h-8 rounded-sm bg-primary px-2 text-xs text-primary-fg",
					onClick: () => setDraft({ cars: draft.cars.filter((_, j) => j !== i) }),
					children: [CARGO_LABEL[c], " ×"]
				}, `${c}-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted",
				children: "Route — click stations on the map, or pick"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap gap-1",
				children: [stations.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (draft.route.includes(s.id)) return;
						setDraft({ route: [...draft.route, s.id] });
					},
					className: cn("h-9 rounded-sm px-3 text-xs", draft.route.includes(s.id) ? "bg-primary text-primary-fg" : "bg-elevated text-fg"),
					children: s.name
				}, s.id)), stations.length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: "Build two stations first."
				}) : null]
			}),
			draft.route.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mb-4 text-xs text-muted",
				onClick: () => setDraft({ route: [] }),
				children: "Clear route"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				onClick: launch,
				children: "Launch train"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterMini, {})
		]
	});
}
function RosterMini() {
	const state = getEngine()?.state;
	if (!state) return null;
	const list = state.trains.filter((t) => t.companyId === state.playerId);
	if (!list.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 border-t border-border pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-2 text-xs font-medium uppercase tracking-wider text-muted",
			children: "On the line"
		}), list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between py-1 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-fg",
				children: t.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular text-muted",
				children: [
					t.status,
					" · ",
					formatCash(t.profit)
				]
			})]
		}, t.id))]
	});
}
function EndScreen() {
	const hud = useGameStore((s) => s.hud);
	const setScreen = useGameStore((s) => s.setScreen);
	const won = hud?.won;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: won ? "Charter fulfilled" : "The line is lost",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: won ? "The board toasts a new baron. Iron, steam, and a fat ledger." : hud?.loseReason || "The bondholders have taken the keys."
			}),
			hud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "Net worth",
					v: hud.worth
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					k: "Date",
					v: hud.date
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6 w-full",
				onClick: () => {
					getEngine()?.startDemo();
					setScreen("menu");
				},
				children: "Return to menu"
			})
		]
	});
}
function OverlayRouter() {
	const screen = useGameStore((s) => s.screen);
	const which = useGameStore((s) => s.overlay) ?? (screen === "playing" ? null : screen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		screen === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HUD, {}) : null,
		which === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainMenu, {}) : null,
		which === "new" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewGameMenu, {}) : null,
		which === "scenarios" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenarioMenu, {}) : null,
		which === "load" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadMenu, {}) : null,
		which === "howto" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowTo, {}) : null,
		which === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {}) : null,
		which === "pause" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseMenu, {}) : null,
		which === "ledger" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ledger, {}) : null,
		which === "news" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewsPanel, {}) : null,
		which === "trainbuy" || which === "roster" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrainBuy, {}) : null,
		which === "end" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndScreen, {}) : null
	] });
}
function GameApp() {
	const canvasRef = (0, import_react.useRef)(null);
	const miniRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const screen = useGameStore((s) => s.screen);
	const settings = useGameStore((s) => s.settings);
	(0, import_react.useEffect)(() => {
		applySettings(settings);
	}, [settings]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = new Engine(canvas);
		engineRef.current = engine;
		engine.attachMinimap(miniRef.current);
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		engineRef.current?.attachMinimap(miniRef.current);
	}, [screen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "game-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "game-map h-full w-full",
				"aria-label": "Railroad map"
			}),
			screen === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: miniRef,
				width: 168,
				height: 168,
				className: "minimap pointer-events-none absolute right-3 top-24 z-10 hidden rounded-md border border-border bg-inset/90 sm:block",
				"aria-hidden": true
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayRouter, {})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameApp, {});
}
//#endregion
export { Home as component };
