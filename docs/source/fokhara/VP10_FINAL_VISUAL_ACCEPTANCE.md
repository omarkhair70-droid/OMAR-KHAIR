# VP10 — FINAL VISUAL ACCEPTANCE

Date: 2026-09-03

## Status

**VISUALLY ACCEPTED / READY FOR FINAL MERGE GATE**

The final VP10 review was made from the current branch running as a local
production build, not from stale preview deployment evidence.

Final reviewed visual branch before the accessibility/subtraction pass:

`e4bc3435c2ca9b3f0c7798f14de9dcd7defc93ad`

The branch then received only final accessibility/subtraction changes:
- primary navigation exposes `aria-current`
- a keyboard skip-to-content target was added
- dead `.prototypeNote` CSS was removed

No new visual direction or experiment was added after acceptance.

## Final rendered evidence

The final uploaded `vp10-review.zip` contained:

- 24 route captures: 12 public routes × Desktop + Mobile
- 6 integrated interaction records: collection memory, carry micro-depth,
  studio evidence × Desktop + Mobile
- 0 route failures
- 0 horizontal-overflow flags
- 0 page errors
- 0 console errors

Recorded failed requests were `net::ERR_ABORTED` Next/RSC prefetch requests
cancelled during navigation and screenshot sweeps. They did not correspond to
failed pages or failed public route responses.

## Accepted production visual decisions

### Studio evidence — KEEP

The Studio page now uses current Fokhara studio/workshop photography as a real
compositional engine instead of another neutral editorial panel.

The first production integration used too many images. Subtraction reduced it
to four stronger evidence frames so the sequence keeps authority without
becoming a repeated gallery.

### Collection memory — KEEP / REWRITTEN

The Lab version proved that a selected collection could causally affect the
destination.

A full-width arrival bar was rejected because the rendered result read like a
loading/progress indicator. The accepted production version reuses the
collection's existing material trace under the collection name. It briefly
carries the chosen material state, then settles back into the normal trace.

No extra navigation chrome survives.

### Carry micro-depth — KEEP

The useful part of Carry Becomes Space survives as a very small finite lift:
slight vertical separation plus restrained shadow during lift/navigation.

The Lab's larger 3D/perspective theatre was not integrated.

The final Desktop and Mobile interaction captures showed no horizontal
overflow regression.

### Material Memory WebGL — DELETE

Rejected after rendered review. The interaction read more clearly as shader
technology than as Fokhara material memory.

No production WebGL requirement remains.

### Kiln Threshold — DELETE AS A FULL EXPERIENCE

The four-stage scroll treatment did not earn enough meaning to justify its
length. No full Kiln Threshold experience was integrated.

A future factual process threshold may be reconsidered only if new process
photography provides stronger evidence. It is not a current production task.

## Page-level acceptance

The final fold review confirms distinct but related public surfaces:

- Home: object-first thesis and two clear OWN / MAKE paths
- Shop: material chapters rather than one equal-weight product stream
- Collections: fired-surface browsing with varied rhythm
- Collection Detail: identity and lead image arrive together
- Product Detail: object, identity, price and action share the first viewport
- Workshops: process choice remains primary
- Workshop Detail: real workshop evidence and commitment remain legible
- Booking: truthful request flow, not fake availability
- Studio: real photographic evidence now materially changes the page identity
- Visit: practical place/contact information remains direct
- Cart: truthful selected-object / empty states
- Workshop Policies: commitment rules remain readable

## Subtraction result

The final system does **not** include:

- shader-driven material memory
- full-screen inherited collection color wash
- progress-like collection arrival bar
- 3D carry theatre
- four-stage Kiln scroll experience
- duplicate Studio evidence frames
- customer-facing VP / P1 / P2 / Woo / prototype language
- fake live workshop availability
- fake online payment success

The surviving gestures are small enough that removing them would remove a
specific piece of meaning rather than merely reduce spectacle.

## Final production gates

Completed on VP10:
- rendered Desktop review
- rendered Mobile review
- VP10 regression fixes visually rechecked
- accepted Lab concepts selectively re-authored
- subtraction pass
- touch/compact overflow review
- reduced-motion branches remain authored
- TypeScript / production build CI gate
- final keyboard navigation semantics pass

Remaining after merge:
1. production deployment of the merged `main`
2. live production smoke for the public routes
3. runtime/log check on the production deployment
4. payment verification remains a separate external owner/credential gate and
   is not represented as complete by the site

## Merge rule

PR #14 may move out of draft after its final CI is green.

PR #15 remains a disposable Lab branch and must not be merged wholesale.
Accepted ideas have already been re-authored selectively into VP10.
