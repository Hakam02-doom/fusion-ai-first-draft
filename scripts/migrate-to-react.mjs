/** One-time migration utility. The generated JSX is checked in and editable;
 * neither HTML snapshots nor the captured Framer runtime run in the React app. */
import { parse } from 'parse5';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const source = 'reference/pages';
const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
const text = (node) =>
  node.nodeName === '#text'
    ? node.value
    : (node.childNodes ?? []).map(text).join('');
const walk = (node, fn) => {
  fn(node);
  node.childNodes?.forEach((n) => walk(n, fn));
};
const names = {
  index: 'Home',
  404: 'NotFound',
  'about-us': 'About',
  pricing: 'Pricing',
  integrations: 'Integrations',
  blog: 'Blog',
  contact: 'Contact',
  waitlist: 'Waitlist',
  'privacy-policy': 'Privacy',
  'terms-conditions': 'Terms',
  changelog: 'Changelog',
};
const pascal = (s) =>
  s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join('');
const quote = (s) =>
  JSON.stringify(s).replaceAll('<', '\\u003c').replaceAll('>', '\\u003e');
const voids = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const booleans = new Set([
  'allowFullScreen',
  'autoFocus',
  'controls',
  'default',
  'defer',
  'disabled',
  'formNoValidate',
  'hidden',
  'loop',
  'multiple',
  'muted',
  'noValidate',
  'open',
  'playsInline',
  'readOnly',
  'required',
  'reversed',
  'scoped',
  'seamless',
]);
const aliases = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  fetchpriority: 'fetchPriority',
  autocomplete: 'autoComplete',
  autofocus: 'autoFocus',
  maxlength: 'maxLength',
  minlength: 'minLength',
  readonly: 'readOnly',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',
  formnovalidate: 'formNoValidate',
  novalidate: 'noValidate',
  inputmode: 'inputMode',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  datetime: 'dateTime',
  referrerpolicy: 'referrerPolicy',
  frameborder: 'frameBorder',
  'xlink:href': 'xlinkHref',
};
const camel = (key) =>
  key.startsWith('--')
    ? key
    : key
        .replace(/^-ms-/, 'ms-')
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function styles(value = '') {
  const result = {};
  let start = 0,
    depth = 0,
    q = '';
  for (let i = 0; i <= value.length; i++) {
    const c = value[i];
    if (q) {
      if (c === q && value[i - 1] !== '\\') q = '';
    } else if (c === '"' || c === "'") q = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    if ((c === ';' && !q && !depth) || i === value.length) {
      const part = value.slice(start, i),
        colon = part.indexOf(':');
      if (colon > 0)
        result[camel(part.slice(0, colon).trim())] = part
          .slice(colon + 1)
          .trim();
      start = i + 1;
    }
  }
  return result;
}
let route = '/',
  currentName = '',
  sections = [],
  used = new Set();
const sharedNodes = {};
let renderingPrompt = false;
const promptNodes = new Map();
let navButton;
function props(node) {
  const result = [];
  if (
    ['a', 'button', 'label'].includes(node.tagName) &&
    !attr(node, 'aria-label')
  ) {
    let label = text(node).replace(/\s+/g, ' ').trim();
    if (
      label.length % 2 === 0 &&
      label.slice(0, label.length / 2) === label.slice(label.length / 2)
    )
      label = label.slice(0, label.length / 2);
    if (!label && node.tagName === 'a')
      label = attr(node, 'href')?.includes('instagram')
        ? 'Instagram'
        : attr(node, 'href')?.includes('facebook')
          ? 'Facebook'
          : attr(node, 'href')?.includes('linkedin')
            ? 'LinkedIn'
            : attr(node, 'href')?.includes('x.com')
              ? 'X'
              : attr(node, 'data-framer-name') || 'Learn more';
    if (label) result.push(`aria-label={${quote(label)}}`);
  }
  for (const a of node.attrs ?? []) {
    let name = a.prefix ? `${a.prefix}:${a.name}` : a.name,
      value = a.value;
    if (
      name.startsWith('on') ||
      name.startsWith('data-framer-hydrate') ||
      [
        'data-framer-appear-id',
        'parentsize',
        '_constraints',
        'rotation',
        'shadows',
        'data-framer-cursor',
      ].includes(name)
    )
      continue;
    if (
      name === 'tabindex' &&
      !['a', 'button', 'input', 'select', 'textarea'].includes(node.tagName)
    )
      continue;
    if (name === 'alt')
      value = value
        .replace(/\b(image|photo|picture)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    name =
      aliases[name] ??
      (name.startsWith('data-') || name.startsWith('aria-')
        ? name
        : camel(name));
    if (name === 'style') {
      const style = styles(value);
      if (
        attr(node, 'data-framer-appear-id') ||
        (style.opacity !== undefined && Number(style.opacity) < 0.01)
      ) {
        delete style.opacity;
        delete style.transform;
        delete style.filter;
        delete style.willChange;
      }
      result.push(`style={${JSON.stringify(style)}}`);
      continue;
    }
    if (
      name === 'href' &&
      node.tagName === 'a' &&
      value &&
      !value.startsWith('#')
    ) {
      const url = new URL(value, `https://fusionai.framer.website${route}`);
      if (url.origin === 'https://fusionai.framer.website')
        value = url.pathname + url.search + url.hash;
    }
    if (name === 'href' && node.tagName === 'use') name = 'href';
    if (
      name === 'value' &&
      ['input', 'textarea', 'select'].includes(node.tagName)
    )
      name = 'defaultValue';
    if (name === 'checked') name = 'defaultChecked';
    if (name === 'selected') continue;
    if (name === 'aria-hidden' && node.tagName === 'li') continue;
    if (booleans.has(name) || name === 'defaultChecked')
      result.push(`${name}={true}`);
    else result.push(`${name}={${quote(value)}}`);
  }
  return result.join(' ');
}
function render(node, allowSection = true, shared = false) {
  if (node.nodeName === '#text') {
    if (!node.value.trim())
      return node.value.includes('\n') ? '' : `{${quote(node.value)}}`;
    if (currentName === 'Pricing' && ['$22', '$69'].includes(node.value))
      return `<PlanPrice monthly={${quote(node.value)}} />`;
    return `{${quote(node.value)}}`;
  }
  if (!node.tagName) return '';
  if (['script', 'style', 'link', 'template'].includes(node.tagName)) return '';
  if (attr(node, 'id') === 'overlay' || attr(node, 'id') === 'template-overlay')
    return '';
  const name = attr(node, 'data-framer-name') ?? '',
    cls = attr(node, 'class') ?? '';
  if (node.tagName === 'nav' && name === 'Navigation') {
    if (!navButton)
      walk(node, (n) => {
        if (!navButton && n.tagName === 'a' && text(n).includes('Get Started'))
          navButton = n;
      });
    return '<Navigation />';
  }
  if (!shared && node.tagName === 'footer') {
    sharedNodes.Footer ??= node;
    return '<Footer />';
  }
  if (!shared && node.tagName === 'section' && name === 'CTA') {
    sharedNodes.CallToAction ??= node;
    return '<CallToAction />';
  }
  if (cls.split(' ').includes('framer-slideshow')) {
    let list;
    walk(node, (n) => {
      if (n.tagName === 'ul' && !list) list = n;
    });
    return `<Slideshow>${(list?.childNodes ?? [])
      .filter((n) => n.tagName === 'li')
      .map((n) => render(n))
      .join('\n')}</Slideshow>`;
  }
  if (cls.split(' ').includes('framer-8LnrN')) return '<ChatSequence />';
  if (cls.split(' ').includes('framer-db5EB'))
    return `<FAQList ${props(node)} />`;
  if (cls.split(' ').includes('framer-aOvZl')) return '<BillingToggle />';
  if (cls.split(' ').includes('framer-PLzz3') && !renderingPrompt) {
    promptNodes.set(cls.match(/framer-v-[\w-]+/)[0], node);
    return `<PromptDemo ${props(node)} />`;
  }
  if (renderingPrompt && cls.includes('framer-vqyd67-container'))
    return `<div ${props(node)}><input className="reference-prompt-input" aria-label="AI prompt demo" value={value} onChange={onChange} onKeyDown={event => { if (event.key === 'Enter') onSend(); }} />{!value && <span className="reference-prompt-typewriter" aria-hidden="true">{placeholder}<span className="reference-prompt-cursor">|</span></span>}</div>`;
  if (
    node.tagName === 'canvas' ||
    attr(node, 'data-framer-component-type') === 'Shader'
  ) {
    let parent = node.parentNode,
      preset;
    while (parent && !preset) {
      preset = (attr(parent, 'class') ?? '')
        .split(' ')
        .find((c) =>
          [
            'framer-2c8pm2-container',
            'framer-meh7xt-container',
            'framer-16amyoj-container',
            'framer-cifcpl-container',
            'framer-1nu49vs-container',
            'framer-1ypbnk5-container',
          ].includes(c),
        );
      parent = parent.parentNode;
    }
    if (preset)
      return node.tagName === 'canvas'
        ? `<ShaderCanvas preset={${quote(preset)}} ${props(node)} />`
        : `<div ${props(node)}><ShaderCanvas preset={${quote(preset)}} style={{display:'block', width:'100%', height:'100%'}} /></div>`;
  }
  if (node.tagName === 'video') return `<AmbientVideo ${props(node)} />`;
  if (
    allowSection &&
    ['header', 'section'].includes(node.tagName) &&
    name &&
    !['Desktop', 'Tablet', 'Phone'].includes(name)
  ) {
    let component = currentName + pascal(name),
      n = 2;
    while (used.has(component)) component = currentName + pascal(name) + n++;
    used.add(component);
    sections.push(
      `function ${component}() {\n  return (${render(node, false, shared)});\n}`,
    );
    return `<${component} />`;
  }
  let tag = node.tagName,
    extra = '';
  if (name === 'Promo Card (Delete This)') tag = 'PromoCard';
  if (name === 'X Icon') return '';
  if (tag === 'form') tag = 'PreviewForm';
  if (
    tag === 'ul' &&
    (node.attrs ?? []).some(
      (a) => a.name === 'style' && a.value.includes('display:flex'),
    )
  )
    tag = 'Ticker';
  if (
    attr(node, 'data-framer-appear-id') &&
    ![
      'svg',
      'path',
      'input',
      'img',
      'PromoCard',
      'Ticker',
      'PreviewForm',
    ].includes(tag)
  ) {
    extra = ` as={${quote(tag)}}`;
    tag = 'Reveal';
  }
  const attributes =
    props(node) +
    (renderingPrompt && node.tagName === 'button'
      ? ' type="button" onClick={onSend}'
      : '');
  if (voids.has(node.tagName)) return `<${tag} ${attributes} />`;
  const children = (node.childNodes ?? [])
    .map((n) => render(n, allowSection, shared))
    .filter(Boolean)
    .join('\n');
  return `<${tag}${extra} ${attributes}>\n${children}\n</${tag}>`;
}
await mkdir('src/pages', { recursive: true });
await mkdir('src/styles', { recursive: true });
await mkdir('src/data', { recursive: true });
await mkdir('src/components', { recursive: true });
const files = (await readdir(source))
  .filter((f) => f.endsWith('.html'))
  .sort((a, b) =>
    a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b),
  );
const routes = [];
const sharedStyles = new Set();
for (const file of files) {
  const key = file.slice(0, -5);
  currentName = names[key] ?? pascal(key);
  route = key === 'index' ? '/' : '/' + key.replaceAll('__', '/');
  sections = [];
  used = new Set();
  const doc = parse(await readFile(path.join(source, file), 'utf8'));
  let main, symbols, badge, title, description;
  const css = [];
  walk(doc, (n) => {
    if (attr(n, 'id') === 'main') main = n;
    if (attr(n, 'id') === 'svg-templates') symbols = n;
    if (attr(n, 'id') === '__framer-badge-container') badge = n;
    if (n.tagName === 'style') css.push(text(n));
    if (n.tagName === 'title') title = text(n);
    if (n.tagName === 'meta' && attr(n, 'name') === 'description')
      description = attr(n, 'content');
  });
  if (!main) throw new Error(`No page content in ${file}`);
  const jsx =
    render(main) +
    (symbols ? render(symbols) : '') +
    (badge ? render(badge) : '');
  for (const sheet of css) sharedStyles.add(sheet);
  await writeFile(
    `src/pages/${currentName}.jsx`,
    `import { Navigation, FAQList, BillingProvider, BillingToggle, PlanPrice, PreviewForm, PromptDemo, Reveal, Ticker, Slideshow, PromoCard } from '../components/Interactions.jsx';\nimport { Footer, CallToAction } from '../components/SiteChrome.jsx';\nimport { ShaderCanvas, AmbientVideo } from '../components/ReferenceMotion.jsx';\nimport ChatSequence from '../components/ChatSequence.jsx';\n\nexport default function ${currentName}() {\n  return (<BillingProvider><>${jsx}</></BillingProvider>);\n}\n\n${sections.join('\n\n')}\n`,
  );
  routes.push({ path: route, component: currentName, title, description });
}
currentName = 'Shared';
route = '/';
sections = [];
used = new Set();
await writeFile(
  'src/components/SiteChrome.jsx',
  `import { Reveal } from './Interactions.jsx';\n\n${Object.entries(sharedNodes)
    .map(
      ([name, node]) =>
        `export function ${name}() { return (${render(node, false, true)}); }`,
    )
    .join('\n\n')}\n`,
);
await writeFile('src/styles/reference.css', [...sharedStyles].join('\n'));
await writeFile('src/data/routes.json', JSON.stringify(routes, null, 2) + '\n');
const faqSource = await readFile(
  'reference/runtime/sites/20WxERL9JPvJ1vzzITXNw1/hNfZZslyL.CZEH91C8.mjs',
  'utf8',
);
const faq = [
  ...faqSource.matchAll(
    /T8rQFvSBR:`([^`]+)`,variant:`[^`]+`,W88zB8mIG:`([^`]+)`/g,
  ),
].map((m) => ({ question: m[2], answer: m[1] }));
await writeFile('src/data/faq.json', JSON.stringify(faq, null, 2) + '\n');
console.log(
  `Migrated ${routes.length} routes to editable JSX with ${faq.length} FAQ answers.`,
);

// Keep the generated imports as small and readable as their actual component use.
for (const file of [
  ...routes.map((r) => `src/pages/${r.component}.jsx`),
  'src/components/SiteChrome.jsx',
]) {
  let code = await readFile(file, 'utf8');
  if (!code.includes('<ChatSequence'))
    code = code.replace(/import ChatSequence[^;]+;\n/, '');
  code = code.replace(
    /import \{ ([^}]+) \} from ([^;]+);/g,
    (_, imports, from) => {
      const needed = imports
        .split(', ')
        .filter(
          (name) =>
            (code.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length > 1,
        );
      return needed.length
        ? `import { ${needed.join(', ')} } from ${from};`
        : '';
    },
  );
  await writeFile(file, code);
}

// Preserve each original responsive input composition.
renderingPrompt = true;
const promptVariants = [...promptNodes]
  .map(
    ([variant, node]) =>
      `if (props.className.includes('${variant}')) return (${render(node, false, true).replace(/^<div[^>]*>/, '<div {...props}>')});`,
  )
  .join('\n');
await writeFile(
  'src/components/PromptShell.jsx',
  `import { ShaderCanvas } from './ReferenceMotion.jsx';
export default function PromptShell({value, onChange, placeholder, onSend, ...props}) { ${promptVariants} return null; }\n`,
);
renderingPrompt = false;
await writeFile(
  'src/components/NavButton.jsx',
  `export default function NavButton() { return (${render(navButton, false, true)}); }\n`,
);
