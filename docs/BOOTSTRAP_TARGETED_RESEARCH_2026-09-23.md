# BOOTSTRAP TARGETED RESEARCH — 2026-09-23

Status: **CLOSED / IMPLEMENTATION-SUPPORTING**

This is not a new art-direction search pass.

Global curation, exhibition architecture, room authorship and preproduction are already locked.

This pass checks only implementation-sensitive questions before the shared exhibition shell is built.

## 1. Sound consent

Browser autoplay policies generally require audible media / Web Audio to begin or resume from a user gesture.

Decision:
- keep the authored entrance choice:
  - ENTER WITH SOUND
  - ENTER IN SILENCE
- create / resume the shared AudioContext only inside the sound opt-in gesture;
- silence remains a complete first-class path;
- no room nags the visitor after silence was chosen.

Reference checked:
- MDN Autoplay guide for media and Web Audio
- MDN Web Audio best practices

## 2. Heavy-room loading

Next.js supports deferring Client Components and external client libraries with dynamic imports.

Decision:
- the shell remains light;
- room-specific renderers are loaded only when a room needs them;
- R3F / Three.js / PixiJS are not installed into the bootstrap merely to make the repository look "creative";
- heavy room code will later be dynamically imported at explicit room boundaries.

Reference checked:
- current Next.js App Router lazy-loading guidance.

## 3. Mixed-renderer architecture

No new research justified one universal renderer.

Decision remains:
- DOM / CSS for shell and accessible orientation;
- Three.js / R3F only for spatial rooms that earn it;
- Web Audio as a shared native browser medium;
- Canvas / Pixi / SVG only when a room-specific interaction requires them;
- dispose / suspend heavy room resources when they leave the active room.

## 4. Stack alignment with Omar-owned source work

Current source check:

SERAPH:
- Next.js 16.3.5
- React 19.2.8
- R3F 9.7.0
- Drei 10.7.8
- Three.js 0.186.0

FIRST CONTACT:
- same Next / React / R3F / Drei / Three baseline
- GSAP 3.15.0

Decision:
- bootstrap the exhibition on the same Next / React generation;
- do not install the 3D stack until the first spatial room implementation gate;
- this keeps later owned-code adaptation easier without front-loading unused dependencies.

TARGETED_RESEARCH = CLOSED
NEXT = SHARED_SHELL_BOOTSTRAP
