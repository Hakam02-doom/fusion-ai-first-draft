# Fusion AI — React site

An editable React 19 + Vite implementation of https://fusionai.framer.website/, preserving its layouts, local fonts, artwork, and responsive styles.

## Run locally

```sh
npm ci
npm run dev
```

## Build and deploy

```sh
npm run lint
npm run build
npm start
```

Vite builds `dist/`. Vercel uses the committed build settings and SPA rewrite, so direct links to every page and article work. GitHub: https://github.com/Hakam02-doom/fusion-ai-first-draft. Live: https://fusion-ai-first-draft.vercel.app.

## Edit the site

- `src/pages/`: 18 editable JSX page components, organized into named page sections.
- `src/components/Interactions.jsx`: React navigation, mobile menu, FAQ, billing state, preview forms, prompt demo, reveals, tickers, and testimonial carousel.
- `src/components/SiteChrome.jsx`: shared footer and closing call to action.
- `src/App.jsx`: lazy page routing, browser history, page titles, error recovery, and anchor navigation.
- `src/components/ReferenceMotion.jsx`: local hero video, original liquid/logo shaders, offscreen loop control, and scroll transforms.
- `src/components/EntranceMotion.jsx`: word/line reveals and spring entrances using extracted reference timing.
- `src/components/ProductShowcase.jsx`: three interactive product screens with seven-second progress indicators.
- `src/shaders/`: reference GLSL with the original colors and effect parameters.
- `scripts/build-heightmaps.mjs`: builds the five logo height textures from their original masks.
- `src/data/`: route metadata and FAQ content.
- `src/styles/reference.css`: original responsive design rules, kept for visual fidelity.
- `src/styles/interactions.css`: styles for the maintained React controls and motion.
- `public/vendor/`: local images and fonts.

The app renders JSX through React `createRoot`; it does not serve HTML snapshots, use `dangerouslySetInnerHTML`, or load the captured Framer runtime or CMS. Existing CSS class names are retained to preserve the supplied design.

## Reference archive

`reference/pages/` and `reference/runtime/` retain the original capture as migration evidence, outside the published assets. `reference/manifest.json` records its original asset URL mapping and checksums; captured `/vendor/framer/sites/` and `/vendor/framer/modules/` files are now archived in `reference/runtime/`. `scripts/capture-reference.py` refreshes the reference archive. `scripts/migrate-to-react.mjs` is the one-time HTML-to-JSX migration utility; it is not part of the build. Re-running it overwrites page components, so retain manual edits first.

## Scope

All 18 routes, including seven articles, are included. Shared interactions are implemented in React/CSS/Web Animations with reduced-motion support. Contact, waitlist, and AI prompt controls are preview-only and explicitly say that no submission or AI action was performed. No authentication, payments, email delivery, or AI backend is connected. Reference copy is retained; the floating template promotion and Framer badge are removed. The preview is excluded from search indexing.

## Motion fidelity pass — 2026-09-05

Restored the autoplaying hero film, responsive prompt compositions, animated liquid border, five logo shaders, conic badge lights, revolving card borders, globe rotations, fixed navigation, button label rollovers, the clipped “Powered” heading, and the five-message dashboard conversation (1s/4s/3s/3s progression). These run through React, WebGL2, CSS, and Web Animations; no captured Framer runtime is loaded. The original fragment shaders and numeric presets are retained, with precomputed logo height fields. Expensive loops pause outside the viewport; reduced motion retains readable still imagery. Scroll interpolation remains a React implementation of the original target transforms.

## Recording review — 2026-09-06

Reviewed the supplied 88-second recording in sequence against the archived reference settings:

- 4–10s: hero word blur, line reveals, delayed buttons, video fade, and spring entrances for the prompt and dashboard.
- 12–18s: feature cards enter with 0/.2/.4/.6-second stagger; the clipped “Powered” heading rises on scroll.
- 20–30s: five chat messages appear in order, with the original 500/60/.1 spring and character reveal.
- 33–40s: sticky feature cards shrink behind the next card using the reference 422/69/2.3 spring.
- 43–56s: Workflow → Analytics → Integration previews, seven seconds per screen, clickable captions and progress controls.
- 60–74s: opposing integration tickers, rotating globe, and moving testimonials retained.
- 74–86s: three-step card stagger, expanding FAQ rows, plus/minus transition, and closing word reveal followed by copy and buttons.

`scripts/extract-motion.mjs` reads archived source as syntax data and writes `src/data/reference-motion.json`; the archive is never executed in the app. Viewport triggers use the source visibility thresholds. A clipped decorative border no longer creates an internal scroll offset when its card receives focus. Browser checks cover desktop and mobile layouts, preview controls and automatic cycling, FAQ transitions, and console errors. Timing and spring targets use original values; the React/Web Animations implementation is independently maintained.

## Integration and gradient corrections — 2026-09-06

The integration globe now composes centering before rotation, preserving its center through a full 20-second turn. The first logo row moves right and the second moves left at the original 50px/s, including while hovered. Their original spacing, responsive sizes, masks, and artwork are retained.

Seven decorative images use the original CDN’s browser-optimized AVIF renditions, saved locally by `scripts/fetch-gradient-assets.mjs` with source URLs and checksums in `src/data/gradient-assets.json`. Full-section backdrops receive a 2px diffusion filter to remove visible palette grain; globe edges and foreground artwork remain crisp. These replacements apply across all pages, and inaccurate source-set width descriptors have been removed for these files. The template advertisement and Framer badge are omitted during migration and absent from every rendered route.

Verified the section and backdrop on desktop and mobile, including zero globe-center drift, no horizontal overflow, and removal of the floating promotion. Production build and lint pass.


## Carousel hover behavior — 2026-09-06

All tickers and testimonial slideshows continue autoplay on pointer hover. Keyboard-focus and reduced-motion behavior remain available. The “2. Connect your apps” preview uses the reference’s independent row settings: right at 25px/s above, left at 50px/s below, on desktop and mobile. Verified a ticker’s position changing and a slideshow advancing with `:hover` still active; lint and production build pass.
