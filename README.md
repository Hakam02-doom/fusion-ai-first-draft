# Fusion AI — first draft

A runnable fidelity-first capture of the user-specified reference:
https://fusionai.framer.website/

## Run

```sh
npm install
npm run dev
```

```sh
npm run build
npm start
```

## Vercel

The Vercel deployment serves the same captured frontend as static files, including
the local animation runtime. It does not require a Cloudflare Worker or package
installation. `vercel.json` selects the static build and clean page URLs.

```sh
npm run build:vercel
```

Output: `dist-vercel/`. Import the GitHub repository into Vercel; the committed
configuration supplies the build settings. Contact and waitlist submissions stay
preview-only. The deployment is excluded from search indexing.

## Implementation

- Vinext/Vite project with the Sites and shadcn scaffold retained.
- `app/[[...path]]/route.ts` serves each full document without layout wrappers.
- `reference/pages/` contains the published HTML and exact responsive styles.
- `public/vendor/` contains local images, webfonts, and compiled Framer/React/Motion components. Their relative imports remain intact.
- `reference/manifest.json` records asset sources and SHA-256 hashes.
- `scripts/capture-reference.py` refreshes the capture from the supplied site.
- `public/draft-forms.js` keeps preview forms from submitting to the original site's service.

The draft preserves the published frontend, including navigation, visual component variants, scroll reveals, hover effects, tickers, prompt animation, FAQ, and mobile layouts. It is **not** a hand-authored component rebuild or an editable Framer project. The captured component code is compiled; future structural changes should progressively replace it with maintained components.

The original site's external links remain external. No AI service, account system, email delivery, or payment backend is included. Source-site promotional badges and factual copy are retained to match the reference. The original analytics script is omitted, and this review copy is marked noindex.
