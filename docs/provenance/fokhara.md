# FOKHARA — EXHIBITION SOURCE PROVENANCE

Canonical repository:
`omarkhair70-droid/Fokhara`

Canonical snapshot:
`f66bbd8c85bb6c4129e7e348ee6124cc56b6c665`

Accepted production gate:
`VP10 — FINAL VISUAL ACCEPTANCE`

Exhibition fragment:
`HOME — OBJECT-FIRST THESIS`

Pinned source:
- `components/HomeObjectEntry.tsx`
- `components/ProductVisual.tsx`
- `lib/products.ts`
- `lib/visual/material-state.ts`
- `lib/visual/image-choreography.ts`
- `app/globals.css`
- `docs/visual/VP0_PRODUCT_MEDIA_SNAPSHOT.json`
- `docs/visual/VP10_FINAL_VISUAL_ACCEPTANCE.md`

Frozen exhibition object:
- Nebula Espresso Cup
- Woo id 4848
- official image from the accepted VP0 source snapshot

Integration policy:
- source files are copied first;
- source imports / commerce edges may be adapted only after pinning;
- the exhibition does not duplicate Fokhara commerce;
- source visual decisions remain authoritative;
- rejected WebGL / 3D material experiments remain rejected.


## Exhibition integration adaptations

Applied after the byte-for-byte source pin:

1. `ProductVisual.tsx`
   - imports point at the pinned Fokhara source namespace inside this repository;
   - render logic and source visual-role behavior are unchanged.

2. `HomeObjectEntry.tsx`
   - the source composition, copy, product frame and object caption are retained;
   - internal Fokhara navigation edges are redirected to the canonical full work;
   - the source Carry navigation is intentionally not recreated inside the exhibition;
   - the real Carry system remains available in the full Fokhara work.

3. Product media
   - the official Nebula Espresso Cup image referenced by the accepted VP0 snapshot is pinned locally for deterministic exhibition rendering.

4. Styles
   - the full accepted source stylesheet is preserved under `docs/source/fokhara/globals.snapshot.css`;
   - only selectors required by the Home object-first fragment are namespaced under the exhibition room so source CSS cannot leak into the global exhibition shell.

5. Exhibition wrapper
   - owns SERAPH arrival trace;
   - owns room label / CONTEXT / CONTINUE;
   - owns the small material-point exit toward Habba.

No WebGL, clay shader, 3D carry theatre or rejected VP10 experiment is reintroduced.
