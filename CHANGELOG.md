# Changelog

What each release of Warism brought, for players. Play it at https://richyuen.github.io/Warism/

## release-2026-11-11 — history replayed: 1938 to 1953

**New**
- **World, 1938 — Historical**, on the title screen: the Second World War and the start of the Cold War as they went,
  from March 1938 to the Korean armistice on 27 July 1953. Each event comes on its day: the Anschluss, Munich, the
  invasion of Poland, the fall of France by mid-June 1940, Barbarossa, Pearl Harbor, Stalingrad, D-Day, Hiroshima and
  Nagasaki, the zones of Germany, India's and Israel's independence, the Chinese civil war and Korea.
- A line under the date names the next event and its day; the History and the ticker tell the events in their own
  words, and the replay's turning points have their sound.
- Your first act ends the replay — taking a nation, a God Mode act, an edit, a command — and the world goes on from
  there as a game of its own. The form, Take control, the God Mode bar and the editor say so before; the ticker
  tells when it ends. Left alone, the replay ends in July 1953 and the world is the AI's.

**Changed**
- Landings: the notices of a landing waiting for its transports say when they come back, and the transports sail
  again only with the troops told they wait for them.
- On a phone on its side, the nation panel's foot and a landing's bar no longer cover the bottom bar or each other.

**Fixes**
- A scenario file chosen on the title screen starts with the big Start; a broken file is told as broken.
- History's rows of the same day read in order; ticker order rows are dated as the war rows are.
- A strike whose dead fall on no nation's land says so plainly.

## release-2026-11-10 — landings you order, and the landings bar

**New**
- Landings you can order: select divisions and click a coast across the sea. Transports come to
  the troops at a port, an escort sails with them, and the voyage is drawn on the map. The
  divisions of one click land together, and a click again on the same landing keeps it.
- The landing is marked on the map while you choose it, with a pointer from the screen's edge when
  it is off the screen. Escape takes the mark away; on a touch screen an order over the sea takes
  two taps.
- The landings bar: a row for each landing, saying when it sails and lands, how many are ashore and
  where, who holds it up in a sea battle and when it turns back. Open a row to cancel the landing.
- Every order that is refused or changed says why: a port refusing or bombed shut, troops lost with
  their sunk transports, a division left for the next voyage "in about 5 days". A formation's
  panel keeps its last notice, dated, and greys it after three days.
- The nation you play has a Build tab for its production, by kind of unit.
- History has "My wars only" for the nation you play, shows the newest hour first, and tells a war
  an ally was pulled into.
- In the Actions tab, Offer peace is greyed while the enemy would refuse, with the reason under the
  war's row.
- Nation traits now do what they say, are shown on the panel, and God can set them.
- Breakthrough corridors are drawn on the map, and God's Breakthrough is told in the ticker.
- The editor's nation lists have a typed filter; a scenario file without nation traits starts.

**Changed**
- Allies and puppets join a war only when they can reach it. The AI no longer lands at an enemy port
  that an enemy fleet guards, and a rising against an overrun overlord frees the nation.
- On a phone on its side the nation panel is wide and tall, with Build in four columns and Actions in
  two, and the news stands beside it. On a phone a tap opens an order row to its full words.
- At the fastest speed, units glide between updates.
- The relations graph's labels never cover one another and answer a tap; the ranking and the History
  keep their text whole.

**Fixes**
- A landing on a neutral coast is no longer undone overnight.
- Two blocks of troops no longer stand inside each other.
- A sunk sea hero does not come back under an enemy fleet.

## release-2026-11-03b — the relations graph, and heroes you can follow

**New**
- The relations graph (Relations, in the bottom bar): every living nation a node sized by its
  land, and a line for each war, alliance, guarantee, puppet bond and truce, each its own colour.
  Filter by kind or by nation, click a line to read it ("X is at war beside Y"), zoom and pan with
  the wheel, a pinch or −/+. It reads on a phone too.
- Puppets rise against an overlord that is losing: the AI's puppets now fight wars of
  independence on their own, not only when God moves the loyalty slider.
- The History says when a nation defaults on its debts.

**Heroes** (the new-game option)
- Heroes are famous ships and tanks of the era, such as Bismarck, Yamato and the Maus, that a new
  game can give their nations. Each is a single unit with its own name that fights, is lost and
  comes back.
- A hero's counter is drawn at its place on the map, never pushed across a continent, and only a
  nation's own heroes fold together; tapping a folded counter again opens each of its heroes in
  turn, on a phone as on a desk.
- A hero stays its nation's: when its nation is annexed it does not change flags.
- A sunk sea hero comes back at a port on its own sea, never on the Caspian or a lake; while it
  waits, its row says why.
- The ticker and the History tell when a hero is lost and when it is back, with Go to.
- A hero's panel and map tag show its health; the option's hint is shown as text.
- Carrier wings stay with their carrier when it moves in a battle or is sent home.

**Fixes**
- A Force war that breaks a bond no longer calls a nation in on its enemy's side.
- A puppet never has puppets of its own.
- The bottom bar fits on one row from 1024 px.

## release-2026-11-03 — the first release

A browser world war simulator: watch the world of 1938 (or a random world) fight it out for
decades, step in with God Mode, or build your own scenario.

**The world**
- The 1938 world with its nations, borders, alliances, puppets, guarantees and starting forces, or
  a random world of up to hundreds of nations.
- An AI that expands, declares war and makes peace, forms and breaks alliances, guarantees its
  friends, makes and frees puppets, and suffers revolts, collapse and revival from its cores.
- An economy of gold, income, upkeep and production; exhaustion and bankruptcy that bring peace;
  terrain that shapes every fight; named cities and capitals.

**War, at every scale**
- Semantic zoom from the whole world down to single soldiers, tanks, ships and planes: the same
  battle seen as a front, as army counters, as formations of units, and as men firing and falling.
- Navies of destroyers, cruisers, battleships, carriers, submarines and transports, with sea
  control, blockades, convoys and amphibious invasions.
- Light, medium and heavy armour fighting beside infantry, artillery and air.
- Fighters, bombers, ground attack and carrier air groups, with air superiority, interception and
  strategic bombing.
- Nuclear weapons the AI researches, builds and uses, weighing retaliation and its alliances, with
  blast, fallout and their consequences.

**Your tools**
- God Mode: rename, force war, peace or alliance, collapse or revive a nation, spawn nations,
  revolts and battles, grant buffs, take control of any nation, switch the AI or nukes off.
- A scenario editor with brush, bucket and line, undo, cities, gold, cores, alliances, puppets and
  flags; scenarios save and load as files.
- Map modes for politics, terrain, wars, diplomacy, alliances, puppets, income and revolts.
- Statistics and charts, a filterable and exportable history, a news ticker.
- Speeds up to max, autosave, screenshots, UI size, keyboard, mouse and touch controls.
- Seeded, deterministic worlds: the same seed plays out the same way.
