// Executed inside the product's inspection browser. Returns data, never executable page instructions.
export function measurePage() {
  const props = [
    'display',
    'position',
    'width',
    'height',
    'max-width',
    'min-height',
    'padding',
    'margin',
    'gap',
    'grid-template-columns',
    'flex-direction',
    'align-items',
    'justify-content',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'letter-spacing',
    'color',
    'background-color',
    'background-image',
    'border',
    'border-radius',
    'box-shadow',
    'opacity',
    'transform',
    'overflow',
    'z-index',
  ];
  const visible = (el) => {
    const r = el.getBoundingClientRect(),
      s = getComputedStyle(el);
    return (
      r.width > 0 &&
      r.height > 0 &&
      s.display !== 'none' &&
      s.visibility !== 'hidden'
    );
  };
  let seq = Number(document.documentElement.dataset.fusionSeq || 0);
  document.querySelectorAll('body *').forEach((el) => {
    if (!el.dataset.fusionNode) el.dataset.fusionNode = String(++seq);
  });
  document.documentElement.dataset.fusionSeq = String(seq);
  const node = (el) => {
    const r = el.getBoundingClientRect(),
      cs = getComputedStyle(el);
    return {
      id: el.dataset.fusionNode,
      tag: el.tagName.toLowerCase(),
      name:
        el.getAttribute('data-framer-name') ||
        el.getAttribute('aria-label') ||
        '',
      text: el.textContent.trim().slice(0, 180),
      rect: { x: r.x, y: r.y + scrollY, width: r.width, height: r.height },
      style: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])),
    };
  };
  const headings = [...document.querySelectorAll('h1,h2,h3')]
    .filter(visible)
    .map(node);
  const candidates = [
    ...document.querySelectorAll('section,header,footer,[data-framer-name]'),
  ]
    .filter(visible)
    .filter(
      (el) =>
        el.getBoundingClientRect().width > innerWidth * 0.55 &&
        el.getBoundingClientRect().height > 180 &&
        el.querySelector('h1,h2,h3'),
    );
  const outer = candidates.filter(
    (el) =>
      !candidates.some(
        (other) =>
          other !== el &&
          other.contains(el) &&
          other.getBoundingClientRect().height <
            document.documentElement.scrollHeight * 0.8,
      ),
  );
  const sections = [];
  for (const el of outer) {
    const r = el.getBoundingClientRect();
    if (r.height > document.documentElement.scrollHeight * 0.8) continue;
    if (
      sections.some(
        (s) =>
          Math.abs(s.rect.y - (r.y + scrollY)) < 12 &&
          Math.abs(s.rect.height - r.height) < 12,
      )
    )
      continue;
    sections.push({
      ...node(el),
      heading: el.querySelector('h1,h2,h3')?.textContent.trim() || '',
    });
  }
  const elements = [
    ...document.querySelectorAll(
      'h1,h2,h3,p,a,button,img,video,section,header,footer',
    ),
  ]
    .filter(visible)
    .slice(0, 650)
    .map(node);
  const animations = document
    .getAnimations()
    .slice(0, 100)
    .map((a) => ({
      target: a.effect?.target?.dataset?.fusionNode,
      keyframes: a.effect?.getKeyframes?.(),
      timing: (() => {
        const t = a.effect?.getTiming?.();
        return t
          ? {
              ...t,
              iterations: t.iterations === Infinity ? 'Infinity' : t.iterations,
            }
          : null;
      })(),
    }));
  return {
    width: innerWidth,
    height: innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    headings,
    sections: sections.sort((a, b) => a.rect.y - b.rect.y),
    elements,
    controls: [
      ...document.querySelectorAll(
        'button,[role="button"],summary,[tabindex="0"][data-highlight]',
      ),
    ]
      .filter(visible)
      .slice(0, 100)
      .map(node),
    animations,
  };
}
export function serializePage() {
  const clone = document.body.cloneNode(true);
  clone
    .querySelectorAll('script,style,link,meta,iframe,noscript,object,embed')
    .forEach((n) => n.remove());
  clone.querySelectorAll('*').forEach((n) => {
    [...n.attributes].forEach((a) => {
      if (
        /^on/i.test(a.name) ||
        ['srcdoc', 'action', 'formaction'].includes(a.name)
      )
        n.removeAttribute(a.name);
    });
    for (const attr of ['src', 'poster', 'href']) {
      const value = n.getAttribute(attr);
      if (!value || value.startsWith('#') || value.startsWith('data:'))
        continue;
      try {
        const u = new URL(value, location.href);
        if (
          attr === 'href' &&
          u.origin === location.origin &&
          u.pathname === location.pathname &&
          u.hash
        )
          n.setAttribute(attr, u.hash);
        else if (['https:', 'mailto:', 'tel:'].includes(u.protocol))
          n.setAttribute(attr, u.href);
        else n.removeAttribute(attr);
      } catch {
        n.removeAttribute(attr);
      }
    }
  });
  const css = [];
  const visit = (sheet) => {
    try {
      css.push([...sheet.cssRules].map((r) => r.cssText).join('\n'));
    } catch {
      /* Cross-origin styles are recorded in stylesheetUrls. */
    }
  };
  [...document.styleSheets].forEach(visit);
  const assets = [...document.querySelectorAll('img,video,source')].map(
    (n) => ({
      tag: n.tagName.toLowerCase(),
      url: n.currentSrc || n.src,
      srcset: n.srcset || '',
      alt: n.alt || '',
      poster: n.poster || '',
      width: n.naturalWidth || n.videoWidth || 0,
      height: n.naturalHeight || n.videoHeight || 0,
    }),
  );
  return {
    title: document.title,
    description:
      document.querySelector('meta[name=description]')?.content || '',
    html: clone.innerHTML,
    bodyAttributes: [...clone.attributes]
      .filter((a) => !a.name.startsWith('on'))
      .map((a) => [a.name, a.value]),
    css: css.join('\n'),
    assets,
    stylesheetUrls: [...document.styleSheets]
      .map((s) => s.href)
      .filter(Boolean),
    links: [...document.querySelectorAll('a[href]')].map((a) => ({
      text: a.textContent.trim().slice(0, 100),
      url: a.href,
    })),
    fonts: [...document.fonts].map((f) => ({
      family: f.family,
      weight: f.weight,
      style: f.style,
      status: f.status,
    })),
  };
}
