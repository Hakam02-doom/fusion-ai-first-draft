# Fusion builder implementation

The dashboard and chat editor now use a server API instead of preset local edits. The marketing site remains intact.

## Runtime

- React + Vite frontend; one Vercel Node function at `/api/builder`.
- SiliconFlow is the default provider. Set `SILICONFLOW_API_KEY` and `FUSION_MODEL` privately on the server. No model is selected until its availability and pricing are checked in the account. `SILICONFLOW_BASE_URL` supports the global `.com` or China `.cn` API; keys must match their region. `FUSION_MODEL_VISION=true` enables screenshot input only for a vision-capable model. Text models receive the extracted reference evidence and asset metadata. There is no automatic paid fallback.
- Later, explicitly set `FUSION_AI_PROVIDER=vercel` (deployment OIDC or `AI_GATEWAY_API_KEY`) or `FUSION_AI_PROVIDER=openai` (`OPENAI_API_KEY`) and update `FUSION_MODEL`. Saved projects and the editor do not depend on the provider.
- Private Vercel Blob store `fusion-builder-private` for projects, versions, reference inspection cache and publication snapshots. Local disk fallback is development-only and is refused on Vercel.
- Workspaces use a browser-generated 256-bit recovery key. The server hashes that key to identify private storage. Users can open the same workspace on another device with their key. Email login, password recovery and team accounts are not implemented.
- Uploaded image URLs are unguessable capability links so the images can appear in generated/public sites. Avoid uploading confidential images. Project/chat/history endpoints require the workspace key.

## Flow

1. Create a cloud project from the prompt. Category matching is currently deterministic keyword matching, with a manual category override.
2. Fetch the selected Framer marketplace category, resolve up to nine listing pages, rank them against the brief and return three references. Selection is stable per project; reroll uses a fresh seed. Category cache lasts 24 hours, with disclosed stale-cache fallback.
3. Inspect the chosen live preview in isolated Chromium at desktop and mobile widths. Capture three screenshots, heading/font/color evidence, links and running animation timings. Inspection cache lasts seven days. Only Framer-hosted preview domains are supported automatically; custom domains fall back to listing evidence and this is disclosed in the editor.
4. Ask the model for complete HTML, CSS, JavaScript and a summary, using the brief, extracted reference evidence, selected reference and asset choices (plus screenshots for a configured vision model). This reconstructs a frontend from visual evidence; it does not download an editable Framer project or promise pixel-perfect fidelity. The model uses original implementation and user-specific branding/content.
5. Parse and validate output; remove embedded scripts, handlers, frames and form submission. Preview code runs in a sandboxed iframe with restrictive CSP and no network API access or parent access.
6. Browser-check desktop/mobile overflow, one main heading, missing images, invalid section links and JS exceptions. Attempt one model repair if necessary. Failed designs never replace the previous version.
7. Save up to 12 complete versions and 80 chat messages. Restore supports undo/redo. Requests are locked per project and committed generation request IDs are idempotent.
8. Publish a snapshot through an unguessable shared URL. Future edits remain drafts until republished. Unpublish revokes the snapshot. Export includes editable JSX, CSS, JS, a Vite project and standalone HTML; uploaded images are embedded, external stock imagery/fonts require internet.

## Limits and known boundaries

- Personal beta: up to 15 generation attempts per workspace/day and 40 across the deployment/day (`FUSION_DAILY_LIMIT` overrides the global cap). A generation may make two model requests when a repair is needed. These request caps are not dollar-denominated billing budgets.
- Up to 100 project records/workspace, six uploaded images/project, 1.2 MB/image and a 6,000-character prompt. Deletion is soft; it revokes publication but retains the project record.
- Discovery, assets and project operations work independently of AI billing. AI provider errors are surfaced directly with retry; no simulated AI fallback is used.
- Automated browser checks are structural, not a comprehensive visual-fidelity or accessibility certification. Motion inspection captures sampled evidence, not every interaction on every reference page.
- Marketplace preview access does not grant template redistribution rights. The reference listing and its license remain visible; generation does not acquire a template license.
- Previous local drafts remain in localStorage and can be imported from Settings. The legacy sample URLs import the existing design into the cloud instead of losing the original appearance.
- Cross-device access requires the recovery key. Losing it means losing access to that workspace; no email recovery exists in this beta.

## Local setup

Use Node 22.13+ (Node 24 recommended):

```sh
npm ci
npx vercel env pull .env.local --yes
npm run dev -- --port 3000
```

Vite mounts the same API handler used on Vercel. The local browser worker uses the installed Google Chrome executable on macOS. Production uses `@sparticuz/chromium`. Local OIDC tokens expire; pull the environment again if authentication expires. Never put API keys in `VITE_` variables.

## Validation

```sh
npm run lint
npm run test:builder
npm run test:generator
npm run build
```

The generator suite tests catalog parsing/ranking, network destination restrictions, markup sanitization/CSP, valid React export, ownership isolation, version restore, publication/revocation, and the full streaming generation/validation/save path using an explicitly mocked model response. Provider tests cover explicit routing, no fallback, text/vision payloads, regional endpoints, authentication/rate-limit/credit errors and truncated output. Live provider verification is separate and requires account access and an available model.

## Deployment verification

Verified on Vercel: cloud project creation, marketplace discovery and a real Chromium desktop/mobile reference inspection all complete. The live AI request then returns the provider's billing-required error (HTTP 403 upstream). This is an account activation blocker, not a simulated model success. The user then selected SiliconFlow instead. Its adapter is implemented and the owner signed in successfully. A dedicated Fusion AI API key passed a real authenticated `/v1/models` request (HTTP 200, 78 available models). The key is stored privately in `.env.local` and Vercel environment configuration. The global account shows $0 balance and no active coupons or credit packs. Qwen3-8B has nonzero pricing; the only catalog entry labelled free is a deprecated translation model. No suitable free website-generation model was verified, so `FUSION_MODEL` remains unset. Live generation and chat-edit acceptance testing remain blocked on a suitable free model or credit allowance. No paid model, card or top-up was activated.

Also verified in the browser: reference shortlist and selection, importing the approved original design, publication opening from a different origin without workspace access, and section links staying inside the sandboxed preview. The regression suites pass with a controlled model response. Existing marketing routes continue to build.
