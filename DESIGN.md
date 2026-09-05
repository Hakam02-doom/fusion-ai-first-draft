---
name: Fusion AI reference draft
description: Captured visual system of the user-specified Fusion AI reference.
colors:
  canvas: "#000"
  text: "#fff"
  surface: "#060606"
  surface-raised: "#191919"
  orange: "#da4e24"
  orange-deep: "#a22904"
  blue: "#0098f3"
  builder-text: "#f6f6f6"
  builder-border: "#262626"
  builder-inset: "#050505"
  builder-focus: "#42aaff"
  builder-input-focus: "#6586a1"
  preview-paper: "#f3eee5"
  preview-ink: "#16130f"
  preview-accent: "#26211a"
typography:
  display:
    fontFamily: '"General Sans", "General Sans Placeholder", sans-serif'
    fontSize: "62px"
    fontWeight: 500
    lineHeight: "1.1em"
    letterSpacing: "0px"
  display-tablet:
    fontFamily: '"General Sans", "General Sans Placeholder", sans-serif'
    fontSize: "58px"
    fontWeight: 500
    lineHeight: "1.1em"
    letterSpacing: "0px"
  display-mobile:
    fontFamily: '"General Sans", "General Sans Placeholder", sans-serif'
    fontSize: "45px"
    fontWeight: 500
    lineHeight: "1.1em"
    letterSpacing: "0px"
  body:
    fontFamily: '"Inter", "Inter Placeholder", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  label:
    fontFamily: '"Inter", "Inter Placeholder", sans-serif'
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "26px"
  brand:
    fontFamily: '"General Sans", "General Sans Placeholder", sans-serif'
    fontSize: "22px"
    fontWeight: 500
    lineHeight: "22px"
  builder-heading:
    fontFamily: '"General Sans", Inter, sans-serif'
    fontSize: "38px"
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: "-0.025em"
  builder-body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    lineHeight: 1.55
  builder-chat:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    lineHeight: 1.65
  preview-heading:
    fontFamily: '"Times New Roman", serif'
    fontSize: "clamp(40px, 8.1cqw, 80px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  preview-body:
    fontFamily: "Georgia, serif"
    fontSize: "16px"
    lineHeight: 1.5
rounded:
  button-small: "8px"
  button: "12px"
  navigation: "12px"
  builder-control: "7px"
  builder-action: "9px"
  builder-panel: "14px"
  builder-composer: "17px"
  builder-dialog: "16px"
components:
  button-outline:
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "12px 42px"
  navigation:
    backgroundColor: "rgba(0, 0, 0, 0.15)"
    typography: "{typography.label}"
    rounded: "{rounded.navigation}"
    padding: "10px 16px"
  builder-glow:
    textColor: "{colors.text}"
    rounded: "{rounded.builder-action}"
    padding: "10px 19px"
  builder-input:
    rounded: "{rounded.button-small}"
    padding: "11px 12px"
  builder-composer:
    rounded: "{rounded.builder-composer}"
    padding: "20px 24px"
  builder-project-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.builder-action}"
---

# Design System: Fusion AI reference draft

## Overview

**Creative North Star: "The supplied Fusion AI reference"**

The binding visual authority is https://fusionai.framer.website/, captured on 2026-09-05. Preserve its typography, colors, assets, responsive composition, and animations. The black canvas, white copy, orange and blue glow assets, and fine translucent borders describe the captured appearance; they do not establish a new brand direction.

This document records the first viewport and a small set of its shared primitives. The implementation now uses editable React JSX in `src/pages/`, shared React controls, and the preserved responsive CSS in `src/styles/reference.css`. `reference/pages/index.html` and local assets remain the visual reference; archived runtime modules are not shipped.

**Key Characteristics:**
- Black and near-black surfaces with white typography.
- General Sans display and brand text paired with Inter body and control text.
- Colored glow layers and fine translucent borders.
- Published responsive variants retained; shared motion rebuilt with CSS and Web Animations.

### Builder application extension

The approved dashboard and chat-workspace comps extend the same Fusion AI identity to `/dashboard`, `/workspace`, and `/site`. The shipped application uses the existing orb, General Sans, Inter, black chrome, and orange-to-blue illumination. The sample website has its own cream editorial identity. Authority: `.impeccable/surfaces/builder.md`; implementation: `src/styles/builder.css` and `src/components/builder/`.

## Colors

### Primary

Orange supplies the warm glow accent. Deep orange and blue participate in the captured gradient layers; preserve their original placement and blending.

### Neutral

Canvas, surface, and raised surface supply the dark tonal layers. White supplies the principal text color. Keep per-element opacity and translucent border assignments from the capture instead of treating every text or border element as fully opaque.

### Builder and preview

Builder text, border, inset, and focus tokens apply to the application chrome. Orange-left and blue-right gradients illuminate primary controls and the dashboard background. Preview paper, ink, and accent belong to the Lumina sample; its dark and alternate project themes remain preview content, not global brand tokens.

## Typography

The frontmatter records the measured desktop hero, body, navigation, and brand roles, plus the captured tablet and mobile hero styles. The tablet hero was observed at a viewport width of 1021px and the mobile hero at 390px. Preserve the actual local font files and source line breaks; do not replace these roles with scaffold defaults.

### Builder and preview

Builder body and conversation roles are denser than marketing copy. The dashboard heading uses the builder-heading token, reducing to 32px through 1250px, 29px through 900px, and 31px through 700px. Chat headings are 20px, reducing to 18px through 900px. The Lumina preview uses the preview-heading and preview-body roles; its approved default headline keeps two explicit lines. Preview headings become 43px at a container width through 650px.

## Layout

Captured layout variants use desktop at a minimum width of 1200px, tablet from 810px through 1199.98px, and mobile through 809.98px. The heading's own source media queries use integer upper bounds of 1199px and 809px; preserve the captured CSS rather than normalizing it. Navigation has a captured maximum width of 1240px. Retain source container widths, spacing, and responsive visibility rules. This pass does not prescribe a new global spacing scale.

### Builder and preview

Dashboard: 260px sidebar, 84px toolbar, three project columns with 17px gaps. Sidebar widths reduce to 220px through 1250px and 190px through 900px; project columns reduce to two through 900px and one through 700px. At mobile widths, a 250px drawer replaces the sidebar; its closed state uses hidden visibility to remove its controls from keyboard navigation.

Workspace: 88px toolbar above an 84px tool rail, 412px chat column, and flexible preview. Chat and preview scroll independently. Through 700px, Chat/Preview tabs replace the split view; the composer remains below the conversation in Chat. History has a separate rail control through 900px. Device preview widths are full available width, 768px, or 390px, capped to the available space. Preview layouts respond to a 650px container breakpoint; the three-image gallery becomes one column.

## Elevation & Depth

Depth comes from dark tonal layers, blurred colored glow assets, and translucent borders. Navigation uses an 8px backdrop blur and a translucent black fill. Keep gradient and blur composition in the captured frontend; no new shadow or motion scale is established by this documentation.

### Builder depth and motion

Primary actions use a black inset over an orange-to-blue border gradient with paired warm/cool shadows; composers use the same outline language. The dashboard has broad side illumination. Chat and preview rely on thin borders and dark layers. Menus, toasts, and native dialogs have distinct shadows recorded in the sidecar; dialogs add a dimmed, blurred backdrop. State transitions last 0.2s. Preview width changes are immediate; reduced-motion styles disable CSS animation and transitions.

## Shapes

Navigation and the outlined pricing button have gently rounded corners. The small navigation CTA uses the smaller button radius. Keep each captured component's own border and clipping behavior; the listed radii are not a mandate to restyle other components.

### Builder shapes

Builder controls use the control radius, actions and project cards the action radius, and chat/preview frames the panel radius. The large dashboard composer uses the composer radius; chat composers use the panel radius. Native dialogs use the dialog radius. Keep these scoped roles separate from captured marketing geometry.

## Components

The outlined “View Pricing” link uses the frontmatter button token and a solid 1px border in `rgba(255, 255, 255, 0.2)`. Its text container clips to a single line with a CSS hover treatment in the React implementation.

Navigation combines the captured brand, Inter links, and CTA. Resting navigation link text has 0.7 opacity. Its solid 1px border is `rgba(255, 255, 255, 0.1)`. Preserve its existing responsive variant and menu behavior.

The small “Get Started” CTA retains its captured layered gradient, blurred glow, black inset fill, and duplicate-text treatment. The sidecar includes only simple source-grounded specimens; it documents the reference appearance. Shared controls now have React state, keyboard focus styles, and reduced-motion support; hero video, shader parameters, rotation periods, and feature entrance timings now follow the published source. Scroll interpolation and carousel transitions are maintained React implementations.

### Builder application

Primary glow buttons, outlined secondary controls, search fields, suggestion chips, project cards, version cards, and icon rails share thin borders and visible keyboard focus. Buttons disable with reduced opacity. Dialogs use native modal behavior and an accessible name linked to the visible title. Project cards contain cropped approved artwork; all application controls and live website text remain editable React DOM. Keep all three selected-work crops, including the timber image.

The signature flow updates the adjacent live preview from supported local edits: quoted headings, theme/accent changes, and larger imagery with simplified navigation. Direct design fields edit heading, description, dark theme, and accent. Local project state, messages, and up to 30 versions support reload, undo/redo, and restoration. Publish opens preview/export choices; export downloads the current page as HTML with artwork still loaded from hosted app assets. Account, sharing, and attachment copy must retain the local-demo boundary: no general AI, image analysis, authentication, cross-device sync, or public project hosting is connected.

## Do's and Don'ts

### Do:
- Do treat the supplied reference and captured frontend as the visual authority.
- Do preserve the local fonts, original assets, responsive variants, and React interactions.
- Do verify future visual edits against the reference at the affected viewport sizes.

### Don't:
- Don't substitute unused scaffold tokens or component styles for the captured design.
- Don't invent a new palette, spacing scale, motion system, or brand metaphor.
- Don't interpret this first-viewport documentation as a complete component or accessibility audit.

### Builder guardrails:
- Do preserve the approved comps, scoped builder tokens, named dialogs, local-demo disclosures, and mobile access to version history.
- Don’t apply the sample website’s cream palette or serif typography to Fusion AI chrome.
- Don’t imply that a sample Published badge or preview address provides public project hosting.
