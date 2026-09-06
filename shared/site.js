export const SITE_CSP =
  "default-src 'none'; img-src data: blob: https://images.unsplash.com https://framerusercontent.com https://*.public.blob.vercel-storage.com https://*.vercel.app http://localhost:3000 http://127.0.0.1:3000; media-src https://framerusercontent.com https://*.public.blob.vercel-storage.com; font-src https://fonts.gstatic.com https://framerusercontent.com data:; style-src 'unsafe-inline' https://fonts.googleapis.com; script-src 'nonce-fusion-preview'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const anchorNavigation = `document.addEventListener('click', function(event) { const anchor=event.target.closest('a[href^="#"]'); if(!anchor)return; event.preventDefault(); let id;try{id=decodeURIComponent(anchor.getAttribute('href').slice(1));}catch{return;} const target=id?document.getElementById(id):document.body; if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); });`;
export function siteDocument(site) {
  const escape = (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
  const responsive = site.variants?.length
    ? `const variants=${JSON.stringify(site.variants.map(({ js: _js, ...v }) => v)).replace(/<\//g, '<\\/')};const initializers=[${site.variants.map((v) => 'function(){' + v.js + '}').join(',')}];let active=-1,cleanup;function renderVariant(){const next=variants.findIndex(v=>innerWidth>=v.minWidth);if(next===active)return;cleanup?.();active=next;document.body.innerHTML=variants[next].html;document.getElementById('fusion-site-css').textContent=variants[next].css;cleanup=initializers[next]();}renderVariant();addEventListener('resize',renderVariant);`
    : String(site.js || '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${escape(SITE_CSP)}"><title>${escape(site.title)}</title><meta name="description" content="${escape(site.description)}"><style id="fusion-site-css">${String(site.css).replace(/<\/style/gi, '<\\/style')}[hidden]:not([hidden="until-found"]){display:none!important}</style></head><body>${site.html}<script nonce="fusion-preview">(()=>{${anchorNavigation}${responsive.replace(/<\/script/gi, '<\\/script')}})();</script></body></html>`;
}
