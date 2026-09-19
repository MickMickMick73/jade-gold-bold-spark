let titleShown = false;
export function shouldPlayTitle(): boolean {
  if (titleShown) return false;
  titleShown = true;
  return true;
}

export interface Cinematic {
  src: string;
  poster: string;
  title: string;
  body: string;
  onDone: "play" | "end" | "menu";
}

const asset = (id: string) => ({
  src: `/cinematics/${id}.mp4`,
  poster: `/cinematics/${id}.jpg`,
});

const BRIEFS: Record<string, { title: string; body: string }> = {
  pioneer: {
    title: "The Iron Pioneer",
    body: "1830. A green continent, a pocket of silver, and the first charter. Connect the towns before the wilderness swallows them.",
  },
  transcon: {
    title: "Sea to Sea",
    body: "1866. East must meet west. Span the continent before the rivals drive the golden spike.",
  },
  coal: {
    title: "The Coal Rush",
    body: "The hills are coughing black gold. Haul four hundred loads before the boom fades and the mines go quiet.",
  },
  mail: {
    title: "Royal Mail",
    body: "Albion, 1829. The Postmaster will pay the first company to bind the realm with iron and a reliable bag.",
  },
  barons: {
    title: "Robber Barons",
    body: "Three companies. One continent. Bankrupt the others — or be eaten on the exchange.",
  },
  steel: {
    title: "The Steel Age",
    body: "Iron, coal, fire. Complete the chain and flood the cities with steel and finished goods.",
  },
  frontier: {
    title: "Frontier Charter",
    body: "Four lonely towns on a harsh map. Survive the grades, then thrive.",
  },
  empire: {
    title: "A Twenty-Year Empire",
    body: "Rivals at your heels. Be the richest house when the century turns.",
  },
  outback: {
    title: "Southern Gauge",
    body: "A wide dry country and long, thirsty hauls. Link the coast to the interior, and move the cattle.",
  },
  sandbox: {
    title: "A New Charter",
    body: "The age of steam is open. Lay iron, serve the towns, and write your own legend.",
  },
};

export function introCinematic(scenarioId: string): Cinematic {
  const id = BRIEFS[scenarioId] ? scenarioId : "sandbox";
  const brief = BRIEFS[id]!;
  const clip = id === "sandbox" ? "title" : id;
  return { ...asset(clip), title: brief.title, body: brief.body, onDone: "play" };
}

export function endingCinematic(won: boolean, scenarioTitle: string): Cinematic {
  if (won) {
    return {
      ...asset("win"),
      title: "Charter fulfilled",
      body: `${scenarioTitle}. The board toasts a new baron of the iron road.`,
      onDone: "end",
    };
  }
  return {
    ...asset("lose"),
    title: "The line is lost",
    body: `${scenarioTitle}. Bondholders take the keys. The engines go cold.`,
    onDone: "end",
  };
}

export function titleCinematic(): Cinematic {
  return {
    ...asset("title"),
    title: "Iron Baron",
    body: "A railroad charter. Dirt into dividends. Skip whenever you like.",
    onDone: "menu",
  };
}

export function scenarioPoster(id: string): string {
  return BRIEFS[id] ? `/cinematics/${id}.jpg` : "/cinematics/title.jpg";
}
