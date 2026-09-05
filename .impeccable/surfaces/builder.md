# Website builder application

Mode: Operate. User approved the dashboard and chat-preview mockups and requested an exact React build. Established Fusion AI world is binding; no new identity. Approval: “ok build this exact”. Workflow explicitly confirmed: project dashboard plus chat beside live preview.

Approved comps: `../fusion-ai-app-design/dashboard.png` and `../fusion-ai-app-design/chat-workspace.png`, both 1586×992.

First viewport: dashboard has a 260px sidebar, 84px toolbar, prompt composer, suggestion controls, and three project thumbnails. Editor has an 88px project toolbar, 84px tool rail, 412px chat column, remaining live preview. Black canvas, original orb, General Sans headings, Inter body; 1px dark borders and orange-to-blue illuminated outlines. The sample website alone uses cream and a serif face. Photos and website thumbnails are CSS crops of approved artwork; all app controls and live website text are React DOM.

| Ingredient | Implementation |
| --- | --- |
| Brand and fonts | Existing local orb image, General Sans and Inter font files |
| Navigation and toolbars | React links, buttons, Lucide icons; dark 1px-bordered surfaces |
| Primary action and composer | CSS black inset and orange/blue outline, input and textarea |
| Projects | Local persisted records, filters/search/list view, rename/duplicate/delete |
| Thumbnail and architecture art | Approved comp artwork rendered through CSS crop, provenance embedded |
| Conversation | React message log and composer, honest local-demo disclosure |
| Website preview | Semantic live DOM, editable heading/theme, responsive device widths |
| Versions | Local snapshots, undo/redo/history restoration |
| Export | HTML download; artwork URLs refer back to hosted app assets |

Signature interaction: chat edits update the adjacent preview while history preserves prior versions. Mobile switches between Chat and Preview and retains the composer. Reduced motion disables nonessential transitions.

Scope: frontend implementation. Accounts, general AI generation, cross-device storage, and public project hosting are not connected; relevant actions disclose that in the UI. Demonstration projects and responses are synthetic. App deployment to the existing Vercel site is separately authorized in this conversation.

Functional validation: chat heading edit updates preview; undo returns previous heading; state survives reload; mobile preview tab works with no horizontal overflow. Additional checks recorded in review notes. Preview width changes are instantaneous to avoid continuous layout recalculation. Detector Inter warnings are pinned-font exceptions; colors inside sample websites belong to the approved preview content.
