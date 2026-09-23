# OMAR KHAIR — LIVING EXHIBITION / PREPRODUCTION SYSTEM

Status: **PREPRODUCTION V1 LOCKED**
Date: 2026-09-23

Parents:
- `docs/OMAR_SELECTED_WORKS_LIVING_EXHIBITION_CURRATION.md`
- `docs/LIVING_EXHIBITION_EXPERIENCE_ARCHITECTURE.md`
- `docs/LIVING_EXHIBITION_ROOM_AUTHORSHIP_MATRIX.md`

This document closes the last global decisions before a separate exhibition repository is created.

---

# 1. PUBLIC NAMING STRATEGY

Do not force a poetic title before the work exists.

## Public working title

**OMAR KHAIR — SELECTED WORKS**

Secondary descriptor, used sparingly:

**LIVING EXHIBITION / 2026**

The public experience should not depend on the phrase "living exhibition" being understood.

The work itself must justify the term.

## Internal codename

**EXHIBITION 01**

Use this in docs / branches / technical labels only.

Do not invent a lore-heavy brand name before the rooms exist.

---

# 2. RELATIONSHIP TO THE EXISTING PORTFOLIO

The existing Omar portfolio remains the primary explanatory portfolio.

It is not redesigned for this project.

The exhibition is a separate site / deployment / repository.

## Main portfolio -> exhibition

After the exhibition is complete, the main portfolio may add one new project:

**Omar Khair — Selected Works / Living Exhibition**

That case study explains:
- curation;
- room design;
- interaction systems;
- 3D / sound / motion architecture;
- source relationships;
- implementation;
- exhibition QA.

## Exhibition -> main portfolio

Every room may expose:
- CONTEXT
- FULL CASE

The exhibition never duplicates full case-study explanation.

---

# 3. GLOBAL SHELL IDENTITY

The shell must be quiet enough to disappear inside seven different worlds.

## Shell typography

Keep one structural family across the exhibition.

V1 direction:
- **Manrope** for shell, INDEX, context labels, system text;
- **Instrument Serif** may appear only as a restrained authored accent where the exhibition itself speaks, not as a mandatory room font.

Room typography may diverge where the source work has a stronger truthful language.

Do not force every room to use the shell typography for its expressive layer.

## Shell mark

Persistent identity:
- OMAR KHAIR
- INDEX

No logo animation required.

No global emblem is needed before one emerges naturally from the exhibition.

---

# 4. SHELL COLOUR BEHAVIOUR

The shell has no permanent decorative colour system.

Every room provides two semantic tokens:

```
--shell-fg
--shell-accent
```

The shell adapts to the room.

Rules:
- readable contrast always wins;
- no uncontrolled mix-blend-mode as the only contrast strategy;
- INDEX always opens into a stable orientation field;
- context panels use a stable neutral field regardless of room spectacle.

## INDEX field

Base:
- warm mineral / paper;
- near-black type;
- one restrained signal accent.

The INDEX acts as orientation reset.

---

# 5. SOUND CONSENT

Sound is a medium, not a website feature toggle.

The Entrance presents two equal paths:

```
ENTER WITH SOUND
ENTER IN SILENCE
```

No modal.
No warning paragraph.
No "best experienced with headphones" pressure.

If sound is enabled:
- one shared AudioContext is unlocked;
- room audio buses may use it;
- the shell exposes one quiet SOUND ON / OFF control.

If sound is disabled:
- no room nags again;
- the visitor can opt in later from the shell.

Session only.
No account preference.

---

# 6. SESSION MEMORY MODEL

The exhibition may store only the minimum state needed for continuity.

V1 state:

```ts
type ExhibitionSession = {
  soundEnabled: boolean;
  visitedRooms: string[];
  roomOrder: string[];
  roomResidues: Record<string, string | number | boolean>;
};
```

Storage:
- React state;
- sessionStorage for refresh continuity.

No remote analytics are required for the artwork to function.

If analytics are added later, they must be separated from creative state and documented independently.

---

# 7. SHARED TECHNICAL STACK

Base:
- Next.js
- React
- TypeScript

Shared systems:
- GSAP / ScrollTrigger for authored finite transitions where useful;
- Web Audio API for shared sound graph;
- React state / context for exhibition session;
- CSS / DOM for shell and accessible content;
- route-level code splitting.

Optional room engines:
- Three.js / React Three Fiber;
- PixiJS / Canvas;
- SVG;
- native DOM / CSS;
- video;
- Blender-authored GLB assets;
- GLSL only when a room specifically earns it.

Do not create a single giant renderer.

---

# 8. ROOM ENGINE BOUNDARIES

## ENTRANCE
Engine:
- DOM / CSS
- small Canvas / SVG only if needed

Reason:
the threshold must not spend the heaviest technology before the first work appears.

## FIRST CONTACT
Engine:
- React Three Fiber / Three.js
- Web Audio
- haptics on supported mobile

Reason:
object / spatial relation / signal / third thing are genuinely spatial.

## SERAPH
Engine:
- React Three Fiber / Three.js
- current canonical SERAPH assets / behaviour
- Web Audio

Reason:
embodied 3D presence is core source truth.

## FOKHARA
Engine:
- DOM / CSS
- high-quality media
- GSAP where needed
- optional SVG / Canvas trace

No WebGL requirement.

Reason:
accepted Fokhara production direction explicitly removed shader-led material spectacle.

## HABBA
Engine:
- PixiJS or lightweight Canvas / DOM hybrid
- optional simple physics written in-house or a very small bounded solver

Avoid adding a full physics framework until the interaction proves it needs one.

Reason:
many tactile 2D / pseudo-physical objects, but not a 3D world.

## WAVEZERO
Engine:
- DOM / CSS
- Web Audio
- Canvas / SVG for listening trace if needed

No full app embed.

## HILTECH
Engine:
- Three.js / R3F for one spatial path where meaningful
- SVG / DOM for measurement / proof states
- GSAP for state continuity

Do not keep WebGL alive through the entire room if SVG / DOM communicates later states better.

## NOVA
Engine:
- PixiJS / Canvas preferred for orbit / presence field
- DOM for sparse labels / context

No fake 3D social universe required.

## AFTERIMAGE
Engine:
- lightweight Canvas / SVG / DOM
- reads session residue state

The final room should be computationally lighter than SERAPH.

---

# 9. SOURCE ASSET LEDGER — V1 SNAPSHOT

Every source must be re-checked immediately before extraction.

The SHAs below record the current reviewed source snapshot.

## SERAPH
Repository:
`omarkhair70-droid/seraph`

Reviewed main:
`e49d37c0d7567f0bf780f033aa5f7311d290bc96`

Candidate exports:
- canonical GLB / current accepted body or relic;
- canonical topology / material definitions;
- approved voice / sound assets if still canonical;
- current THE BODY behaviour contract;
- current WAKING RELIC behaviour only if used.

Do not copy obsolete experiments automatically.

## FOKHARA
Repository:
`omarkhair70-droid/Fokhara`

Reviewed main:
`f66bbd8c85bb6c4129e7e348ee6124cc56b6c665`

Candidate exports:
- accepted studio / workshop photography;
- selected product / collection evidence;
- accepted material-state colours;
- typography / layout laws.

Explicitly do not export rejected Material Memory WebGL as production truth.

## FIRST CONTACT
Repository:
`omarkhair70-droid/FIRST-CONTACT`

Reviewed main:
`cb48eb061efa76f3225b1117d3d08f0fd1fea39f`

Candidate exports:
- OBJECT 001 form / fabrication proportions;
- signal / angle / third-thing spatial logic;
- source sound language;
- any reusable exhibition-safe geometry.

Neighbour-specific copy and recipient-specific identity are excluded.

## WAVEZERO
Repository:
`omarkhair70-droid/wavezero`

Reviewed main:
`64119a8047ce6267f824de81dfd50d5f9b8b8cdd`

Candidate exports:
- Porcelain design tokens;
- sculpted surface language;
- selected UI fragments;
- motion timing reference.

Audio for the exhibition is authored separately.

## HILTECH
Repository:
`omarkhair-labs/hiltech-eg-website`

Reviewed main:
`d5e565e04c3489e2a938639466f3ec747fe5e633`

Candidate exports:
- BUILD / ROUTE / TEST / PROVE logic;
- accepted public-site 3D / SVG / route assets;
- selected real infrastructure imagery;
- approved motion grammar.

Do not use HILTECH OS assets.

## HABBA
Repository:
`omarkhair70-droid/habba-store`

Reviewed main:
`abbff28f1e38d6388866224f677695f2f32ca2ba`

Candidate exports:
- real bead / product imagery;
- bead / thread / tray visual primitives;
- product-derived palette;
- selected handmade evidence.

Do not export commerce controls as exhibition content.

## NOVA
Repository:
`omarkhair-labs/nova`

Reviewed default branch:
`master`

Reviewed head:
`fdc2c29a29dfc5cda41bf104c73812a516433e40`

Candidate exports:
- Quiet Orbit motion / identity laws;
- approved violet / live colour system;
- Tonight atmosphere;
- Memories state logic;
- brand mark only if needed as source evidence.

No real-user content.

---

# 10. ASSET OWNERSHIP STRUCTURE IN NEW REPO

Proposed:

```
public/
  exhibition/
    first-contact/
    seraph/
    fokhara/
    habba/
    wavezero/
    hiltech/
    nova/

docs/
  provenance/
    first-contact.md
    seraph.md
    fokhara.md
    habba.md
    wavezero.md
    hiltech.md
    nova.md
```

Each provenance file records:
- source repo;
- source SHA;
- copied file;
- transformation;
- author / license if not wholly Omar-owned;
- whether AI generation was involved;
- audio ownership.

No mystery assets.

---

# 11. NEW REPOSITORY LAW

The exhibition must be created as a fresh repository.

Do not fork the current portfolio codebase as the conceptual starting point.

Reason:
- the exhibition has different information architecture;
- different performance architecture;
- different dependency profile;
- different source-provenance needs;
- different release cadence;
- the main portfolio must remain stable.

The current portfolio research branch becomes a documentation archive only.

Implementation from the earlier Home-opening experiment is not part of the exhibition source.

---

# 12. DEPLOYMENT RELATIONSHIP

V1:
- separate Vercel project;
- preview deployments per branch;
- production deployment isolated from the main portfolio.

Domain:
deferred until naming / first integrated room proves the public identity.

Possible later relationships:
- dedicated domain;
- subdomain of Omar's domain;
- linked standalone Vercel domain during development.

Do not bind the exhibition to the current portfolio route tree.

---

# 13. QA SYSTEM

The exhibition needs two separate QA truths.

## Technical truth
- lint;
- type;
- build;
- browser errors;
- performance;
- accessibility;
- audio lifecycle;
- renderer cleanup;
- mobile memory;
- route deep links.

## Artistic truth
- still frame;
- pacing;
- interaction consequence;
- sound;
- silence;
- residue;
- transition;
- room distinction;
- full-sequence afterimage.

Green CI cannot close a room.

A beautiful recording cannot close a broken runtime.

Both are required.

---

# 14. PREPRODUCTION EXIT

Preproduction V1 is closed when:

- seven works are curated;
- architecture is locked;
- room matrix is locked;
- naming strategy is sufficient;
- shell identity is sufficient;
- sound consent is locked;
- renderer boundaries are locked;
- source snapshots are recorded;
- new-repo law is locked;
- deployment separation is locked.

These conditions are now satisfied.

The next action is:

1. return the current portfolio branch to documentation-only state;
2. create the new exhibition repository;
3. install only the shared shell dependencies;
4. build the exhibition shell / INDEX / routing / sound state / session state;
5. do not implement a room until the shell is visually and technically real.

PREPRODUCTION_V1 = CLOSED
NEXT = NEW_REPOSITORY_BOOTSTRAP
