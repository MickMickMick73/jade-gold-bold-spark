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
builder's source has moved on from the export. Therefore: deploy = apply the fixes
inside the builder (Grok applies the patch under Claude's review, per the standing
rule) and republish. Never push this repo over the live game. Patch file for the
two ready fixes: `fixes/2026-09-21-route-toggle-and-launch-guard.patch`. Ask Mick
whether the builder is linked to the GitHub repo (repo → builder), which would
change this.

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
   the game clock and the player builds the empire. Needs: a "Sandbox" choice at
   new game, a flag on `GameState`, the goal/bankruptcy/end checks in
   `simulation.ts` honouring it, multiplayer snapshot carrying it.

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
