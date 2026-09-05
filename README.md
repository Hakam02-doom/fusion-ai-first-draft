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
- `src/components/Interactions.jsx`: React navigation, mobile menu, FAQ, billing state, preview forms, prompt demo, reveals, tickers, testimonial carousel, and dismissible promotion.
- `src/components/SiteChrome.jsx`: shared footer and closing call to action.
- `src/App.jsx`: lazy page routing, browser history, page titles, error recovery, and anchor navigation.
- `src/components/ReferenceMotion.jsx`: local hero video, original liquid/logo shaders, offscreen loop control, and scroll transforms.
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

All 18 routes, including seven articles, are included. Shared interactions are implemented in React/CSS/Web Animations with reduced-motion support. Contact, waitlist, and AI prompt controls are preview-only and explicitly say that no submission or AI action was performed. No authentication, payments, email delivery, or AI backend is connected. Reference copy and external promotional links remain as supplied. The preview is excluded from search indexing.

## Motion fidelity pass — 2026-09-05

Restored the autoplaying hero film, responsive prompt compositions, animated liquid border, five logo shaders, conic badge lights, revolving card borders, globe rotations, fixed navigation, button label rollovers, the clipped “Powered” heading, and the five-message dashboard conversation (1s/4s/3s/3s progression). These run through React, WebGL2, CSS, and Web Animations; no captured Framer runtime is loaded. The original fragment shaders and numeric presets are retained, with precomputed logo height fields. Expensive loops pause outside the viewport; reduced motion retains readable still imagery. Scroll interpolation remains a React implementation of the original target transforms.
