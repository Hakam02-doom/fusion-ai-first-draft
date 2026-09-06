# Browser-driven reference reconstruction

Hosted worker implementation is now available; see [WORKER-HOSTING.md](WORKER-HOSTING.md). The local app is connected to it on port 3101. The deployment history and earlier experiments below remain historical; no cloud deployment was performed for this change.

Local implementation and verification, 2026-09-06. The local browser is explicitly selected while Browserbase account setup is unavailable. These changes have not been deployed or pushed.

## Use it

Run the app with its private environment loaded:

```sh
node --env-file=.env.local node_modules/vite/bin/vite.js --host 0.0.0.0 --port 3000
```

New projects select a supported reference from the matching Framer category, reconstruct its homepage, compare the captured layout, apply the user’s brief with Kimi, and check the personalized result before saving. In an existing workspace, **Build from this reference** runs that complete sequence. **Reconstruct this reference** preserves the reference content unchanged as a baseline. Subsequent chat requests use the durable edit workflow.

The chat shows the six workflow stages, completed steps, and the current activity, including Kimi progress. Reloading reconnects to the same background job. Closing the tab does not cancel it; Stop explicitly cancels it. Previous saved versions remain available. The completed chat includes a side-by-side reference comparison at 1440, 768, and 390 pixels. After subsequent edits, this report is labelled as the captured baseline rather than claiming the edited version still matches it.

## What runs

1. `server/reconstruction/session.js` opens an isolated local Chromium session. The Browserbase adapter uses the same browser interface when configured.
2. `capture.js` scrolls the live page at three widths. `dom.js` collects rendered markup, stylesheet rules, fonts and asset URLs, element geometry, sections, Web Animation keyframes, and scroll samples. Capture also exercises bounded click and hover controls and records state changes.
3. `assemble.js` preserves those measured layouts as three breakpoint variants. `state-diff.js` compiles control observations into compact reversible patches. Application-owned code replays controls, looping animations, sampled entrance effects, and scroll transforms. The captured application’s scripts are removed.
4. `compare.js` renders the reconstruction in a fresh browser page, settles it with the same scroll procedure, and compares it with the captured reference. It checks headings and geometry, full-page images, overflow, missing images, anchors, and JavaScript errors.
5. One bounded Kimi repair is available when comparison fails. `agent.js` supplies the backend Impeccable policy, a strict patch contract, and limited live-browser inspection actions. Reference evidence is data rather than trusted instructions. Ambiguous edits fail without replacing the saved site.
6. A passing result becomes a new saved version. A failing result stays a reviewable draft with its comparison report. React export produces editable viewport JSX components, breakpoint-specific styles, and maintained interaction code.

`scripts/reconstruction-worker.mjs` runs outside the web request as a detached local Node process. `.fusion-jobs/` holds private owner-bound job metadata, checkpoints, cancellation markers, and screenshot artifacts. A versioned 24-hour capture cache avoids repeating a recent capture. Workflow checkpoints also retain a passing comparison and completed Kimi edits. A matching retry copies the previous owned checkpoint and does not consume a fresh generation quota. Changed prompts, references, assets, or project revisions start fresh. Jobs use project locks and existing generation quotas; duplicate requests reuse their job, and competing prompts receive a conflict response. Stale worker detection returns an actionable resume error; project revision checks prevent overwriting later edits.

## Verified Verseo baseline

Reference: https://verseo.framer.website/

| Viewport | Full-page height | Sampled pixels differing | Largest heading geometry difference |
| --- | ---: | ---: | ---: |
| 1440px | 13,462px | 0.0775% | 0.109px |
| 768px | 14,566px | 0.1034% | 0.030px |
| 390px | 15,460px | 0.1393% | 0.061px |

These are settled-layout measurements, not an animation fidelity score. Pixel comparison samples every third pixel, counts a difference when a color channel differs by more than 30, and includes dimension mismatches. Current acceptance limits are 8% differing samples and 12px heading geometry difference, with no missing headings, broken anchors, image failures, overflow, or JavaScript errors.

The capture recorded 63 control states: 25 hover and 38 click observations across the three widths. Three already-active Step 1 controls produced no bounded change and are reported as warnings. Direct browser checks verified mobile menu open/close, FAQ expansion, and monthly/annual pricing. The actual workspace job completed in 58 seconds using the capture cache, survived a refresh, saved a version, and displayed its authenticated comparison images. The editable React export built successfully.

A separate real NVIDIA Kimi K3 edit completed in 104 seconds. It changed “Write better content.” to “Artificial Intelligence” at all three breakpoints. Exact string comparison confirmed that the remainder of each HTML variant, every stylesheet, and all interaction code stayed unchanged. This test artifact did not replace the workspace’s verified reference baseline.

## Configuration and remaining limits

Current private settings include `FUSION_BROWSER_PROVIDER=local`, `FUSION_AI_PROVIDER=nvidia`, and `FUSION_MODEL=moonshotai/kimi-k3`. Credentials remain server-side. Browserbase support requires `BROWSERBASE_API_KEY`, optional `BROWSERBASE_PROJECT_ID`, and an explicit switch to `FUSION_BROWSER_PROVIDER=browserbase`. The adapter has not been verified against a live Browserbase account. No payment setup was completed.

- Capture currently supports public Framer preview hosts and one homepage, up to 35,000 pixels tall. It does not reconstruct linked pages or connect forms, authentication, payments, or other backend services. Linked destinations remain reference links.
- Asset and font URLs are retained remotely. A self-contained asset bundle and clean named section components are later work. Captured JSX is verbose; the Verseo React export currently builds to about 4.49 MB of JavaScript, 446 KB gzipped.
- A frozen full-page comparison does not prove all dynamic behavior matches. Scroll motion is sampled, custom canvas/WebGL output and third-party embeds may be incomplete, and unobserved control states are not invented. Wider template coverage needs additional benchmarks.
- This is a persistent local worker, not a deployed queue service. A production deployment needs a dedicated worker host and persistent job/artifact storage. The API refuses to launch detached reconstruction workers on Vercel serverless.
- Build mode now personalizes the captured design automatically. Exact clone mode remains available. Kimi receives a bounded inventory of copy, images, and source fragments; difficult requests can still need a follow-up edit. Uploaded asset metadata is available to it. The generator does not invent image URLs or connect backend services.

## Checks

```sh
npm run lint
npm run test:generator
npm run test:builder
npm run test:reconstruction
npm run build
```

Tests cover source sanitization, compact state patches, atomic edits, entrance classification, pixel differences, ownership boundaries, and breakpoint styles in React export, in addition to the existing provider, generation, storage, and version tests.

Current result: 57 automated tests pass; lint and the app build pass. The export build passes with a large-bundle warning, reflected in the limitations above.

## Durable build and edit workflow

`server/reconstruction/workflow.js` owns the sequence for build, clone, and edit modes. `verify.js` checks personalized layouts at all three widths. The worker waits for a durable start marker, serializes progress writes, preserves drafts on cancellation or failure, and commits one version only after checks pass. Captured comparison images retain their original job identity after later edits. A resumed request reconnects progress from persisted events and receives every newer draft checkpoint.

The workflow suite covers ordering, unchanged clone mode, edits without recapture, provider-failure recovery, bounded repair, cancellation, fingerprint invalidation, repeated draft updates, duplicate requests, conflicting prompts, and owned checkpoint reuse.

## Gym build benchmark

A new project was created through the dashboard with a FORGE gym brief. Automatic category discovery selected [HyperFit](https://hyperfit.framer.website/). The capture recorded 53 control states. Its settled baseline comparison passed at 1440, 768 and 390 pixels: 0.041%, 0% and 0.011% sampled pixel differences, respectively, with no missing headings, geometry failures, overflow or image failures. Repeated numbered headings exposed a comparator bug; matching now uses captured node identity and one-to-one nearest geometry. A cancelled run resumed its saved capture after that correction.

The resumed build completed in 423 seconds, including a real NVIDIA Kimi K3 personalization request. FORGE hero copy, service copy and trial CTAs appeared in the generated preview; all three structural browser checks passed. Visual and link review then found original logo pixels and contact copy incorrectly used as link destinations. This is why a structural pass is not a complete branding/content review.

The generator now offers scoped text and link patches, updates their restored interaction-state content, and accepts explicit visible wordmark replacements for captured logo images at each viewport. The browser verifier rejects malformed mailto/tel destinations. Header/footer logo evidence is prioritized before partner images. Complete provider responses persist before patch validation, and rejected patches can receive bounded corrections against the unchanged source. Regression tests cover these observed failures, including CSS pixel strings for logo font sizes.

The follow-up chat edit completed in 275 seconds after correcting the font-size validator. It saved a second version, kept the earlier baseline comparison, and updated all six header/footer wordmarks, trial destinations, and illustrative content labels. Final checks at 1440/768/390px each found 30 headings, no overflow, no missing images, no broken anchors, no malformed contact links, and no JavaScript errors. Direct browser checks confirmed the mobile menu opens/closes with FORGE branding and the hero trial CTA scrolls to the contact section. No publishing or deployment was performed.

One interaction limitation remains in this saved gym capture: its first FAQ question was skipped by the old action filter because it includes the word “join.” Capture version 4 distinguishes FAQ disclosures from signup/form actions and invalidates the old capture cache for new builds; that change is regression-tested. The saved FORGE version still uses the earlier captured interactions and needs a fresh interaction capture to cover that first FAQ. Other earlier warnings about bounded pricing/pagination states also remain visible in the comparison coverage. Bookings and form submission are frontend placeholders.
