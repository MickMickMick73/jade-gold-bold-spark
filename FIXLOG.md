# Iron Baron — fix log

Mick and B2½ are playtesting the **deployed arcade build** (multiplayer) at
`https://ironbaron.mixapps.store/`. Nothing below is deployed until Mick says
"deploy".

Deploy facts (2026-09-21): the repo is `github.com/MickMickMick73/jade-gold-bold-spark`
and every commit so far is "Export from Grok" — the game was built in Grok's builder
and exported; there is no deploy script, CI workflow or hosting config in the tree,
so the live site is on Grok's hosting behind the subdomain. CONFIRMED 2026-09-21: the live page loads
`https://grok.com/grok-app-builder/extensions.js` — the game is hosted and built by
**Grok's App Builder**; this repo is a one-way export. The live bundles do NOT
contain strings that are in this export (e.g. "Pick at least two stations"), so the
builder's source has moved on from the export. **Deploy recipe (settled 2026-09-21, Mick: "it's on the BinaryLane server").**
`ironbaron.mixapps.store` → the AU box (103.100.39.228), nginx vhost
`/etc/nginx/sites-available/ironbaron`: static files from `/opt/ironbaron/public`,
everything else proxied to `ironbaron.service` (`node /opt/ironbaron/server/index.mjs`,
port 8792, user root). The repo is the source (push it too, `2041ec4`); Grok does not
apply fixes; the Grok script tag in the page is just part of the export.
Build: `VITE_AUTH_ENABLED=false npx vite build` (the `with-app-env` wrapper cannot
spawn vite on Windows; the flag is all it adds). **The box needs the node-server preset** — `vite.config.ts` pinned
`preset: "vercel"`, whose `index.mjs` is a request handler that exits at once (the
service crash-looped "Deactivated successfully" and nginx gave 502 for a few minutes
on 2026-09-21 21:09 until last night's `server` was restored from the backup). Now
`preset: process.env.NITRO_PRESET ?? "vercel"`, so build with
`NITRO_PRESET=node-server VITE_AUTH_ENABLED=false npx vite build` → `.output/public`
= `public`, `.output/server` (`index.mjs` ~59 KB, listens on PORT) = `server`. Deploy: tar both, upload with
`tools/ssh-mixmods-au.py --upload`, `cp -a /opt/ironbaron /opt/ironbaron.bak-<date>`,
overlay `static/.` onto `public/` (the box's `public/sfx` is not in the build — never
replace `public` whole), replace `server/` whole, `systemctl restart ironbaron`, then
confirm the live page references the new `routes-*.js` and that asset contains the
new string. `db:migrate` is not part of a client-only deploy.

## Ready (in source, type-check clean, not deployed)

1. **Route stations toggle.** Clicking a station already in the route removes it —
   map click (`engine.pickStationForRoute`) and the station buttons in the Buy
   panel. Toast says Added/Removed. Before: a second click did nothing, so a wrong
   pick meant Clear and start again.
2. **Buy panel keeps your work when the buy fails.** `TrainBuy.launch` now clears
   the route and closes only when a train was actually added; on failure (cash,
   fewer than two stations, stations not linked by track) it stays open with the
   route intact and the engine's toast says why. Before: it cleared and closed
   regardless, which looked like "bought it and it reset".

## To build (scoped, waiting on two answers)

3. **Edit trains in circulation** — change a running train's route, cars and
   locomotive without scrapping it. Needs: a Trains panel listing the player's
   trains (name, loco, cars, route, where it is); per-train actions Change route
   (reuse the route draft), Change cars, Change locomotive, Scrap; an engine
   command (`NetCmd` op, e.g. `refit`) so both players see it; and simulation
   rules for a train that is mid-journey. Two decisions before it is built:
   - Money: does a locomotive change cost the price difference (refund the old
     one at some fraction), or full price? Do added cars cost anything?
   - Timing: do changes apply immediately wherever the train is, or at its next
     station stop (cleaner: cargo already loaded stays consistent)?

4. **Open sandbox mode** — Mick 2026-09-21: NOT unlimited cash. Unlimited
   *time*: normal money and normal economy, but no scenario goals, no game-over
   or "you lost" screen, no forced end — the calendar simply runs to the end of
   the game clock and the player builds the empire. Mick, later the same day:
   the scenario goals ("connect 14 cities" etc.) end the game just as it gets
   going — so the **win condition is the host's choice at game start**: pick a
   scenario goal, or none (open-ended). Needs: a "Win condition" option in the
   new-game/lobby screen (host only), a flag on `GameState`, the goal/end checks
   in `simulation.ts` honouring it, multiplayer snapshot carrying it.

5. **Station cargo notice is vague** — "cargo is waiting at the station" without
   saying what. The inspector already has the answer (`describeStation`:
   `Waiting  Grain 12 · Coal 4`); the notice should carry the same list.
   NOTE: no such string exists in this export of the source (the only "waiting"
   text is the inspector, which does list cargo). Either the live build differs
   from this repo, or the notice is worded differently — need the exact
   on-screen words and where they appear. If the live build is ahead of the
   repo, a push from here would regress it; settle that before any deploy.

6. **Host pause pauses everyone.** Inherent: one shared simulation, one clock;
   `speed` (including 0 = pause) is a broadcast `NetCmd`, so it cannot be
   per-player without splitting the world. What is missing is the message:
   show "Paused by <host name>" to every other player while speed is 0, and
   either restrict pause/speed to the host or show who changed it. Decide with
   Mick whether clients should be able to change speed at all.

## Reported, not yet looked at

- (add B2½'s findings here as they come in)
