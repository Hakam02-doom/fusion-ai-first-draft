# Fusion builder implementation

Hosted worker implementation is now available; see [WORKER-HOSTING.md](WORKER-HOSTING.md). The local app is connected to it on port 3101. The deployment history and earlier experiments below remain historical; no cloud deployment was performed for this change.

The dashboard and chat editor now use a server API instead of preset local edits. The marketing site remains intact.

Current local reference reconstruction is documented in [RECONSTRUCTION.md](RECONSTRUCTION.md). It captures live browser structure and styles, reconstructs observed controls, compares three viewport sizes, and runs independently of the chat connection. Local Chromium is explicitly selected while Browserbase signup is unavailable. Kimi K3 remains the local model. The provider history below includes earlier deployed configurations; no deployment is part of the reconstruction changes.

## Runtime

- React + Vite frontend; one Vercel Node function at `/api/builder`.
- The deployed provider is OpenRouter with `minimax/minimax-m3:free`, image input enabled, and `OPENROUTER_API_KEY` stored only on the server. `FUSION_ALLOW_PAID_MODELS=false` rejects non-free model IDs and constrains provider prices to zero; it never switches to a paid model automatically. OpenRouter calls have a 200-second limit within a 270-second overall generation budget.
- SiliconFlow remains available as an alternative provider. Set `SILICONFLOW_API_KEY` and `FUSION_MODEL` privately on the server. No model is selected until its availability and pricing are checked in the account. `SILICONFLOW_BASE_URL` supports the global `.com` or China `.cn` API; keys must match their region. `FUSION_MODEL_VISION=true` enables screenshot input only for a vision-capable model. Text models receive the extracted reference evidence and asset metadata. There is no automatic paid fallback.
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

- Personal beta: up to 15 generation attempts per workspace/day and 40 across the deployment/day (`FUSION_DAILY_LIMIT` overrides the global cap). A new Kimi website uses six compact model requests, plus one targeted repair if needed. Saved continuations count as one logical generation; failed-step retries can make additional provider calls. Other providers retain the earlier single-response path. These request caps are not dollar-denominated billing budgets.
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

The generator suite tests catalog parsing/ranking, network destination restrictions, markup sanitization/CSP, valid React export, ownership isolation, version restore, publication/revocation, and the full streaming generation/validation/save path using an explicitly mocked model response. Provider tests cover explicit routing, no paid fallback, zero-price OpenRouter routing, text/vision payloads, regional endpoints, unavailable free providers, authentication/rate-limit/credit errors and truncated output. Live provider verification is separate and requires account access and an available model.

## Deployment verification

Verified on Vercel: cloud project creation, marketplace discovery and a real Chromium desktop/mobile reference inspection all complete. The live AI request then returns the provider's billing-required error (HTTP 403 upstream). This is an account activation blocker, not a simulated model success. The user then selected SiliconFlow instead. Its adapter is implemented and the owner signed in successfully. A dedicated Fusion AI API key passed a real authenticated `/v1/models` request (HTTP 200, 78 available models). The key is stored privately in `.env.local` and Vercel environment configuration. The global account shows $0 balance and no active coupons or credit packs. Qwen3-8B has nonzero pricing; the only catalog entry labelled free is a deprecated translation model. No suitable free website-generation model was verified, so `FUSION_MODEL` remains unset. Live generation and chat-edit acceptance testing remain blocked on a suitable free model or credit allowance. No paid model, card or top-up was activated.

Also verified in the browser: reference shortlist and selection, importing the approved original design, publication opening from a different origin without workspace access, and section links staying inside the sandboxed preview. The regression suites pass with a controlled model response. Existing marketing routes continue to build.


## OpenRouter activation — 2026-09-06

The owner approved MiniMax M3’s free endpoint through OpenRouter. Google sign-in and a dedicated Fusion AI key are complete. A live key check returned HTTP 200 and `is_free_tier: true`; MiniMax returned a valid JSON response at zero cost. Local live acceptance testing passed: reference-based generation, desktop/mobile structural checks, a requested heading edit, two saved versions and React export. MiniMax reasoning is disabled for this JSON-code task because the initial thinking-enabled request consumed its output budget without returning code. The exported React app builds; local browser review exposed and fixed hidden-attribute and DOM-ready initialization differences in the exporter. These newer changes are local only. OpenRouter documents 50 free requests/day for accounts without purchased credits, shared across applications; our app’s lower request caps still apply. Free model capacity and availability may change.

Deployment variables: `FUSION_AI_PROVIDER=openrouter`, `FUSION_MODEL=minimax/minimax-m3:free`, `FUSION_MODEL_VISION=true`, `FUSION_ALLOW_PAID_MODELS=false`, and private `OPENROUTER_API_KEY`. A later paid upgrade requires an explicit server configuration change.


## Local NVIDIA Kimi K3 trial — 2026-09-06

The user requested NVIDIA’s hosted `moonshotai/kimi-k3` endpoint. A dedicated NVIDIA key is saved only in the ignored `.env.local`; it has not been uploaded to Vercel. The authenticated model catalog returns HTTP 200 and includes Kimi K3. A streamed inference returned `connected` in 114 seconds; the preceding non-streaming probe timed out at 120 seconds. A full reference-based website generation request then timed out at the 200-second deadline, so Kimi has not passed end-to-end generation acceptance. The user subsequently requested switching to Kimi despite that trial timeout. The local configuration now selects NVIDIA Kimi K3, with no automatic MiniMax fallback. This measures endpoint responsiveness in this session, not a general model quality ranking.

Select this adapter explicitly with `FUSION_AI_PROVIDER=nvidia`, `FUSION_MODEL=moonshotai/kimi-k3`, and `NVIDIA_API_KEY`. It uses the NVIDIA hosted API, screenshot input, JSON output, low reasoning effort, a 20,000-token generation budget. Local Kimi requests now have an eight-minute model deadline and a ten-minute overall generation deadline; Vercel retains its earlier shorter deadlines. Project locks cover the full configured generation window. No partner deployment or paid fallback is used. Streamed reasoning is excluded from the returned website JSON. Provider latency can exhaust the deadline.

User instruction: keep these trials local. Do not push changes to the connected GitHub branch or deploy to Vercel; either could publish the current experiment.


## Live generation progress — 2026-09-06

NVIDIA SSE responses are consumed incrementally instead of buffering the entire response. The backend emits waiting, model-processing and code-reception stages plus elapsed time and received-code counts. Ten-second heartbeats keep the request status visible while the provider is quiet. The chat shows recent completed stages and a one-second elapsed timer. Raw provider reasoning never reaches the frontend. Browser validation and saving retain their own progress messages.

A regression test splits the stream across individual UTF-8 bytes, verifies progress arrives before the stream closes, and asserts private reasoning is absent from UI events. The local Chrome retry of Orbit Analytics visibly progressed through waiting, processing and code reception. These changes are local only.

Live retry outcome: Kimi streamed roughly 17 KB of website JSON over eight minutes but did not complete before the local model deadline. No partial website was saved. The progress UI accurately showed waiting, processing, code reception and elapsed time throughout; Kimi generation throughput remains an unresolved limitation.


## Resumable Kimi generation — 2026-09-06

New Kimi websites and redesigns use six separately checkpointed requests: a compact design plan (rendered locally into the responsive header/hero/footer foundation), three content sections, additional styling, and interactions. The plan contains branding, copy, colors, font and section IDs; it does not ask Kimi to write a large layout file. Each completed step is validated, saved privately on the project, and shown as an explicitly unfinished draft preview. The client automatically continues using the same logical request ID. Refresh restores the draft; Retry/Resume starts at the first unfinished step. Old validated versions remain intact until final browser validation passes. Sharing and export continue to use validated site versions.

Checkpoints are scoped to the owner/project and fingerprinted by prompt, redesign flag, revision, reference, assets, provider and model. Changing any of these prevents stale reuse. Each request retains its own timeout and lock; the six-step workflow does not share one eight-minute model deadline. Existing-site edits and browser repairs use bounded exact-match patches; ambiguous changes are rejected. A stopped/failed step retains previous checkpoints.

Tests cover a provider failure after the layout, resume without repeating the layout, one validated version commit, request idempotency, logical quota counting, invalidation, client continuations, cancellation and safe small edits. Mocked full-flow tests pass. Live Kimi verification is being evaluated separately. Local only; no push or Vercel deployment.

Live checkpoint verification: the compact plan produced a saved Orbit Analytics layout in under two minutes. The client began section 1 automatically. Stopping the request and reloading Chrome retained the 1/6 draft with its hero and typography; resumption was verified: after reload the client started step 2, then saved steps 2 and 3 without regenerating the layout. The earlier HTML/CSS layout request was too large, so the final first-step implementation uses a short plan and local shell rendering.

Final live trial result: 3/6 steps saved (plan/layout plus two content sections). NVIDIA returned HTTP 429 on the next request. The saved draft and checkpoints remain available; Retry resumes at step 4. Complete six-step generation, final browser validation and version commit passed with controlled provider responses in integration tests; the real provider run remains incomplete due to the upstream limit. All 29 automated tests pass, and lint/build pass.

The local draft foundation now includes a responsive visual hero immediately: an interactive, clearly labelled sample analytics preview for software briefs, or photography for other categories. Feature and workflow sections receive foundation styling before the later refinement step. Existing checkpoints are upgraded on read without changing saved sections, resume fingerprints, or validated versions. Orbit Analytics retains its 3/6 saved steps; this visual upgrade does not complete the remaining model requests.

Visual foundation verification: 30 automated tests pass, including preservation of checkpoint content and resume identity during upgrades. Lint and production build pass. Desktop/mobile browser inspection reports no horizontal overflow, missing images, broken internal targets, or JavaScript errors. The sample Week/Month control was exercised in the browser, and the upgraded 3/6 draft was verified in the actual local workspace. No deployment or GitHub push was performed.


## Backend design policy

`server/design-policy.js` contains a versioned, curated adaptation of Impeccable 4.1.1's design principles and craft floor, based on the local skill's SKILL.md and reference/craft-floor.md (reviewed 2026-09-06). It is bundled server code, independent of a developer's local skill installation. It intentionally excludes desktop commands, tool orchestration, hooks, delegation, filesystem context and approval workflows. Skill updates require reviewing this adaptation and retaining historical policy versions for resumable work.

All model generation paths (six staged requests, full generation, edits and repairs) compose this shared policy with their precise output contract. The policy prioritizes the user's reference, meaningful visuals, consistent design tokens, responsive layouts, accessibility and restrained motion; repair and edit guidance preserves unrelated work. It does not force Fusion branding onto generated sites.

New checkpoints store a policy version and bounded reference design context. The same fonts, colors, heading rhythm, animation observations and optional model-authored art direction reach subsequent steps. Reference evidence stays in the user task payload, never inside trusted system instructions. Legacy saved checkpoints adopt the policy on the next unfinished request without invalidating saved sections or the resume fingerprint. Finished sites are not changed automatically.

This is prompt-based design guidance, not a full Impeccable agent runtime or a guarantee of visual fidelity. Existing schema, sandbox, desktop/mobile browser checks and bounded repair remain the enforcement layer. No additional model call is added. Kimi's compact layout is still rendered by the current foundation, so prompt changes alone cannot express every reference composition. Prompt integration is verified with controlled model responses; no live NVIDIA request or deployment is made for this change.

## Live Impeccable policy trial — 2026-09-06

Resumed Orbit Analytics locally from checkpoint 3/6, using NVIDIA Kimi K3 and `impeccable-4.1.1-fusion-v1`. The remaining section, styling and interaction requests completed in approximately seven minutes. A real saved checkpoint confirmed the policy version and Verseo reference fonts, colors, headings and animation observations. All six steps completed, browser validation passed, and one final version was saved. This tests the resumed workflow; the original plan and first two sections predate the new policy.

The saved validation reports one h1, no horizontal overflow, no broken section targets, no missing images and no JavaScript errors at 1440px and 390px. A separate batched visual inspection reviewed the hero and new impact section at desktop/mobile widths. Direct browser interaction confirmed that Month updates the example sessions to 96,720, Week restores 24,180, and the Impact link navigates to its section. Progress advanced through waiting, processing, receiving code, checkpoint saves and completion.

Quality limitations found in the actual model output: the impact section repeats the workflow's stock laptop image; its “first week” outcome claim is unsupported by the brief; and the final interaction response repeats the foundation's chart listener verbatim, leaving two equivalent listeners in the assembled JS. These do not fail the current structural browser checks. No visual fidelity claim is made: this is a usable responsive draft, still shaped by the predefined foundation. The review did not silently edit the generated result or launch another generation. No deployment or GitHub push occurred.
