import { parseFragment } from 'parse5';
import { parse as parseJS } from '@babel/parser';
import { zipSync, strToU8 } from 'fflate';
import { siteDocument } from '../shared/site.js';
const aliases = {
  'xlink:href': 'xlinkHref',
  'xmlns:xlink': 'xmlnsXlink',
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  viewbox: 'viewBox',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  srcset: 'srcSet',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
};
const bool = new Set([
  'hidden',
  'inert',
  'disabled',
  'checked',
  'selected',
  'multiple',
  'required',
  'autofocus',
  'controls',
  'loop',
  'muted',
  'autoplay',
  'playsinline',
  'open',
  'readonly',
]);
function jsx(n) {
  if (n.nodeName === '#text') return `{${JSON.stringify(n.value)}}`;
  if (!n.tagName) return (n.childNodes || []).map(jsx).join('');
  const attrs = (n.attrs || [])
    .map((a) => {
      let name = aliases[a.name] || a.name;
      if (!name.startsWith('data-') && !name.startsWith('aria-'))
        name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (name === 'style') {
        const o = {};
        for (const part of a.value.split(';')) {
          const i = part.indexOf(':');
          if (i < 0) continue;
          const k = part.slice(0, i).trim();
          o[
            k.startsWith('--')
              ? k
              : k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
          ] = part.slice(i + 1).trim();
        }
        return ` style={${JSON.stringify(o)}}`;
      }
      return bool.has(a.name) &&
        !(a.name === 'hidden' && a.value === 'until-found')
        ? ` ${name}={true}`
        : ` ${name}={${JSON.stringify(a.value)}}`;
    })
    .join('');
  if (
    [
      'img',
      'input',
      'br',
      'hr',
      'source',
      'area',
      'wbr',
      'col',
      'track',
    ].includes(n.tagName)
  )
    return `<${n.tagName}${attrs} />`;
  return `<${n.tagName}${attrs}>${(n.childNodes || []).map(jsx).join('')}</${n.tagName}>`;
}
// Export effects run after React mounts, potentially after DOMContentLoaded.
export function exportInteractions(source) {
  const ast = parseJS(source, {
    sourceType: 'script',
    allowReturnOutsideFunction: true,
  });
  const replacements = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      node.callee.object.type === 'Identifier' &&
      node.callee.object.name === 'document' &&
      !node.callee.computed &&
      node.callee.property.name === 'addEventListener' &&
      node.arguments[0]?.value === 'DOMContentLoaded'
    ) {
      replacements.push([node.callee.start, node.callee.end]);
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(walk);
      else if (value && typeof value === 'object') walk(value);
    }
  };
  walk(ast);
  for (const [start, end] of replacements.sort((a, b) => b[0] - a[0]))
    source = source.slice(0, start) + 'fusionOnReady' + source.slice(end);
  return `function fusionOnReady(type, listener, options) {
    if(document.readyState === 'loading') document.addEventListener(type, listener, options);
    else if (!options?.signal?.aborted) {
      const event = new Event(type);
      if(typeof listener === 'function') listener.call(document,event);
      else listener?.handleEvent(event);
    }
  }\n${source}`;
}
export function reactArchive(site, assets = []) {
  site = { ...site };
  for (const a of assets) {
    if (a.data) {
      site.html = site.html.replaceAll(a.url, a.data);
      site.css = site.css.replaceAll(a.url, a.data);
      if (site.variants)
        site.variants = site.variants.map((variant) => ({
          ...variant,
          html: variant.html.replaceAll(a.url, a.data),
          css: variant.css.replaceAll(a.url, a.data),
        }));
    }
  }
  const files = {
    'package.json': JSON.stringify(
      {
        name: 'fusion-generated-site',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite --host 0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: { react: '19.2.6', 'react-dom': '19.2.6' },
        devDependencies: { vite: '8.2.2', '@vitejs/plugin-react': '6.0.2' },
      },
      null,
      2,
    ),
    'index.html':
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Website</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
    'vite.config.js':
      "import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';export default defineConfig({plugins:[react()]});",
    'src/main.jsx':
      "import React from 'react';import {createRoot} from 'react-dom/client';import App from './App.jsx';createRoot(document.getElementById('root')).render(<App/>);",
    'src/App.jsx': `import {useEffect} from 'react';\nimport './site.css';\nimport {initializeSite} from './interactions.js';\nexport default function App(){useEffect(()=>{document.title=${JSON.stringify(site.title)};return initializeSite();},[]);return <>${jsx(parseFragment(site.html))}</>;}`,
    'src/site.css':
      site.css +
      '\n[hidden]:not([hidden="until-found"]){display:none!important}',
    'src/interactions.js': `export function initializeSite(){\n${exportInteractions(site.js)}\n}`,
    'standalone.html': siteDocument(site),
    'README.md':
      '# Your Fusion website\n\nRun npm install then npm run dev. Build with npm run build.\n\nEditable React markup lives in src/App.jsx, styles in src/site.css, and interactions in src/interactions.js.\n\nThis is a frontend website. External stock images and Google Fonts require an internet connection. Uploaded images are embedded. Forms, checkout and other backend services are not connected.\n',
  };
  if (site.variants?.length) {
    const choices = site.variants;
    const names = choices.map((v, i) => `Viewport${i}`);
    choices.forEach((variant, i) => {
      files[`src/Viewport${i}.jsx`] =
        `import React from 'react';\nexport default function Viewport${i}(){return <>${jsx(parseFragment(variant.html))}</>;}`;
    });
    files['src/site.css'] = site.css + '\n[hidden]{display:none!important}';
    files['src/viewport-styles.js'] =
      `export const styles=${JSON.stringify(choices.map((v) => v.css + '\n[hidden]:not([hidden="until-found"]){display:none!important}'))};`;
    files['src/interactions.js'] =
      `export const initializers=[${choices.map((v) => 'function(){' + exportInteractions(v.js) + '}').join(',')}];`;
    files['src/App.jsx'] =
      `import {useEffect,useState} from 'react';\nimport {styles} from './viewport-styles.js';\nimport {initializers} from './interactions.js';\n${names.map((n, i) => `import ${n} from './Viewport${i}.jsx';`).join('\n')}\nconst components=[${names.join(',')}],breakpoints=${JSON.stringify(choices.map((v) => v.minWidth))};\nconst choose=()=>Math.max(0,breakpoints.findIndex(w=>innerWidth>=w));\nexport default function App(){const [index,setIndex]=useState(choose);useEffect(()=>{const resize=()=>{if(innerWidth>1&&innerHeight>1)setIndex(choose());};addEventListener('resize',resize);return()=>removeEventListener('resize',resize);},[]);useEffect(()=>{document.title=${JSON.stringify(site.title)};return initializers[index]();},[index]);const View=components[index];return <><style>{styles[index]}</style><View key={index}/></>;}`;
    files['README.md'] +=
      "\nThis reconstruction preserves the measured breakpoint variants as editable JSX components. Reference assets and fonts currently use their captured URLs. Interactive states are reconstructed from observed browser changes; refer to the builder's coverage report for unverified behavior.\n";
  }
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])),
  );
}
