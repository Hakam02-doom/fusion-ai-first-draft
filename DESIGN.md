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
rounded:
  button-small: "8px"
  button: "12px"
  navigation: "12px"
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

## Colors

### Primary

Orange supplies the warm glow accent. Deep orange and blue participate in the captured gradient layers; preserve their original placement and blending.

### Neutral

Canvas, surface, and raised surface supply the dark tonal layers. White supplies the principal text color. Keep per-element opacity and translucent border assignments from the capture instead of treating every text or border element as fully opaque.

## Typography

The frontmatter records the measured desktop hero, body, navigation, and brand roles, plus the captured tablet and mobile hero styles. The tablet hero was observed at a viewport width of 1021px and the mobile hero at 390px. Preserve the actual local font files and source line breaks; do not replace these roles with scaffold defaults.

## Layout

Captured layout variants use desktop at a minimum width of 1200px, tablet from 810px through 1199.98px, and mobile through 809.98px. The heading's own source media queries use integer upper bounds of 1199px and 809px; preserve the captured CSS rather than normalizing it. Navigation has a captured maximum width of 1240px. Retain source container widths, spacing, and responsive visibility rules. This pass does not prescribe a new global spacing scale.

## Elevation & Depth

Depth comes from dark tonal layers, blurred colored glow assets, and translucent borders. Navigation uses an 8px backdrop blur and a translucent black fill. Keep gradient and blur composition in the captured frontend; no new shadow or motion scale is established by this documentation.

## Shapes

Navigation and the outlined pricing button have gently rounded corners. The small navigation CTA uses the smaller button radius. Keep each captured component's own border and clipping behavior; the listed radii are not a mandate to restyle other components.

## Components

The outlined “View Pricing” link uses the frontmatter button token and a solid 1px border in `rgba(255, 255, 255, 0.2)`. Its text container clips to a single line with a CSS hover treatment in the React implementation.

Navigation combines the captured brand, Inter links, and CTA. Resting navigation link text has 0.7 opacity. Its solid 1px border is `rgba(255, 255, 255, 0.1)`. Preserve its existing responsive variant and menu behavior.

The small “Get Started” CTA retains its captured layered gradient, blurred glow, black inset fill, and duplicate-text treatment. The sidecar includes only simple source-grounded specimens; it documents the reference appearance. Shared controls now have React state, keyboard focus styles, and reduced-motion support; their motion timings are approximations of the published behavior.

## Do's and Don'ts

### Do:
- Do treat the supplied reference and captured frontend as the visual authority.
- Do preserve the local fonts, original assets, responsive variants, and React interactions.
- Do verify future visual edits against the reference at the affected viewport sizes.

### Don't:
- Don't substitute unused scaffold tokens or component styles for the captured design.
- Don't invent a new palette, spacing scale, motion system, or brand metaphor.
- Don't interpret this first-viewport documentation as a complete component or accessibility audit.
