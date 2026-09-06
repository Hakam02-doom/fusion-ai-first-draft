import { parseFragment } from 'parse5';
import { zipSync, strToU8 } from 'fflate';
import { siteDocument } from '../shared/site.js';
const aliases = {
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
      return bool.has(a.name)
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
export function reactArchive(site, assets = []) {
  site = { ...site };
  for (const a of assets) {
    if (a.data) {
      site.html = site.html.replaceAll(a.url, a.data);
      site.css = site.css.replaceAll(a.url, a.data);
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
    'src/site.css': site.css,
    'src/interactions.js': `export function initializeSite(){\n${site.js}\n}`,
    'standalone.html': siteDocument(site),
    'README.md':
      '# Your Fusion website\n\nRun npm install then npm run dev. Build with npm run build.\n\nEditable React markup lives in src/App.jsx, styles in src/site.css, and interactions in src/interactions.js.\n\nThis is a frontend website. External stock images and Google Fonts require an internet connection. Uploaded images are embedded. Forms, checkout and other backend services are not connected.\n',
  };
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)])),
  );
}
