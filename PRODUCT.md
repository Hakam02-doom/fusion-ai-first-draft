# Fusion AI reference draft

<!-- impeccable:product-schema 1 -->

## Platform
web

## Product Purpose
Maintain an editable React implementation of https://fusionai.framer.website/ and extend its visual system into an AI website-builder frontend.

## Capabilities and Constraints
The user explicitly requires the same animations, components, typography, font sizes, colors, and appearance. Preserve the supplied published site's content and responsive behavior. The marketing site preserves the original reference. The builder now needs actual marketplace discovery, frontend generation, editing, storage, previews and export. The user approved a projects dashboard and a chat panel beside a live website preview, then requested their React implementation. The approved implementation phase connects a configurable AI provider (OpenRouter with MiniMax M3 free), private Blob storage, a browser inspection worker, cloud project versions, public snapshot links and React export. Generated sites are single-page frontends; their own forms, payments, CMS and databases remain out of scope. The user approved OpenRouter with MiniMax M3’s free endpoint for the initial no-payment phase, with paid models deferred. API credentials remain server-side and no paid fallback is allowed.

## Brand Commitments
The supplied reference is the binding visual authority. Do not redesign or replace its identity.

## Evidence on Hand
Editable JSX in src/, published HTML/CSS and compiled component evidence archived in reference/, and local fonts/images in public/vendor/. The original editable Framer project is not available.

Local testing constraint (2026-09-06): the user asked to try NVIDIA Kimi K3, with no further Vercel deployments or GitHub pushes for these experiments. Keep API keys private and provider selection explicit.

Current local provider: NVIDIA `moonshotai/kimi-k3`, explicitly selected at the user’s request. MiniMax is no longer active locally. No deployment accompanies this switch.

Kimi generation is resumable: six individually saved requests, visible draft previews, continuation after refresh/failure, and small exact-match patches for later edits. The first step is a compact design plan rendered into a local shell; the model supplies sections, styling and interactions. Real provider trials can still encounter upstream limits without losing completed steps.

The local draft foundation now includes a responsive visual hero immediately: an interactive, clearly labelled sample analytics preview for software briefs, or photography for other categories. Feature and workflow sections receive foundation styling before the later refinement step. Existing checkpoints are upgraded on read without changing saved sections, resume fingerprints, or validated versions. Orbit Analytics retains its 3/6 saved steps; this visual upgrade does not complete the remaining model requests.

Current local workflow (2026-09-06): new projects choose a supported Framer reference, reconstruct its live browser layout, compare three viewports, apply the brief with NVIDIA Kimi K3, validate the personalized frontend and save one version. Exact reconstruction is available separately. Later chat edits use the same durable worker. Resume preserves completed capture/comparison/model stages when the project and request still match. Browserbase remains pending; local Chromium is selected. Existing six-step generic drafts remain resumable for compatibility. No deployment or GitHub push is authorized for this work.
