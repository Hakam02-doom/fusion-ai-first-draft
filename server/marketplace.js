import { parse } from 'parse5';
import { createHash } from 'node:crypto';
import { read, write } from './storage.js';
import { categories } from '../shared/categories.js';
export { categories };
const base = 'https://www.framer.com';
const text = (n) =>
  n.nodeName === '#text' ? n.value : (n.childNodes || []).map(text).join(' ');
const attr = (n, k) => n?.attrs?.find((a) => a.name === k)?.value;
export function elements(n, predicate) {
  const result = [];
  const visit = (n) => {
    if (predicate(n)) result.push(n);
    for (const c of n.childNodes || []) visit(c);
  };
  visit(n);
  return result;
}
export function listingLinks(html) {
  const tree = parse(html);
  const map = new Map();
  for (const a of elements(tree, (n) => n.tagName === 'a')) {
    let url;
    try {
      url = new URL(attr(a, 'href'), base);
    } catch {
      continue;
    }
    if (
      url.origin !== base ||
      !/^\/marketplace\/templates\/[a-z0-9-]+\/$/.test(url.pathname)
    )
      continue;
    const name = text(a).trim();
    const image = elements(a, (n) => n.tagName === 'img')[0];
    const title = name || attr(image, 'alt');
    if (!title) continue;
    map.set(url.href, {
      name: title.replace(/\s+/g, ' '),
      listingUrl: url.href,
      thumbnail: attr(image, 'src') || map.get(url.href)?.thumbnail || null,
    });
  }
  return [...map.values()];
}
export function parseListing(html, url) {
  const tree = parse(html);
  const anchors = elements(tree, (n) => n.tagName === 'a');
  const preview = anchors.find((n) => /show preview/i.test(text(n)));
  const title = text(elements(tree, (n) => n.tagName === 'h1')[0] || {}).trim();
  const meta = elements(tree, (n) => n.tagName === 'meta');
  const description =
    attr(
      meta.find((n) => attr(n, 'name') === 'description') || {},
      'content',
    ) || '';
  const thumbnail = attr(
    meta.find((n) => attr(n, 'property') === 'og:image') || {},
    'content',
  );
  const body = text(tree).replace(/\s+/g, ' ');
  return {
    name: title,
    listingUrl: url,
    previewUrl: attr(preview || {}, 'href') || null,
    description: description.slice(0, 1200),
    thumbnail,
    license: /single.use/i.test(body) ? 'Single-use' : 'See creator terms',
    price:
      body.match(/Buy for \$[\d.]+/)?.[0] ||
      (/Use for Free|Use for free/.test(body) ? 'Free' : 'See listing'),
  };
}
async function fetchHtml(url) {
  const r = await fetch(url, {
    signal: AbortSignal.timeout(16000),
    headers: { 'User-Agent': 'FusionAI-ReferenceDiscovery/1.0' },
    redirect: 'error',
  });
  if (!r.ok) throw new Error(`Marketplace returned ${r.status}`);
  const s = await r.text();
  if (s.length > 4000000) throw new Error('Marketplace page is too large');
  return s;
}
export async function discover(category) {
  if (!categories.includes(category))
    throw Object.assign(new Error('Choose a supported category.'), {
      status: 400,
    });
  const key = `catalog/${category}.json`;
  const cached = await read(key);
  if (cached && Date.now() - cached.updatedAt < 86400000)
    return { ...cached, cached: true };
  try {
    const url = `${base}/marketplace/templates/categories/${category}/`;
    const candidates = listingLinks(await fetchHtml(url)).slice(0, 9);
    const results = await Promise.allSettled(
      candidates.map(async (c) => ({
        ...c,
        ...parseListing(await fetchHtml(c.listingUrl), c.listingUrl),
      })),
    );
    const items = results
      .filter((r) => r.status === 'fulfilled' && r.value.previewUrl)
      .map((r) => r.value);
    if (!items.length)
      throw new Error('No live previews found in this category.');
    const catalog = { category, items, updatedAt: Date.now(), cached: false };
    await write(key, catalog);
    return catalog;
  } catch (e) {
    if (cached) return { ...cached, cached: true, stale: true };
    throw e;
  }
}
export function categoryFor(prompt) {
  const p = prompt.toLowerCase();
  const rules = [
    ['architecture', /architect|interior|building design/],
    ['restaurants', /restaurant|cafe|coffee|bakery|dining/],
    ['saas', /saas|software|analytics|startup/],
    ['ai', /\bai\b|artificial intelligence/],
    ['fitness', /fitness|gym|personal trainer/],
    ['medical', /doctor|clinic|dentist|medical/],
    ['legal', /lawyer|law firm|legal/],
    ['furniture', /furniture|home decor|objects/],
    ['fashion', /fashion|clothing|apparel/],
    ['real-estate', /real estate|property|realtor/],
    ['photography', /photograph/],
    ['designers', /designer|portfolio/],
    ['hotels', /hotel|resort/],
    ['education', /education|course|school/],
    ['weddings', /wedding/],
    ['consulting', /consult/],
    ['agency', /agency|studio/],
    ['apps', /\bapp\b|mobile application/],
    ['ecommerce', /store|shop|ecommerce/],
  ];
  return rules.find(([, r]) => r.test(p))?.[0] || 'professional-services';
}
export function rankCandidates(items, prompt, seed) {
  const words = prompt
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  return items
    .map((item) => {
      const hay = (item.name + ' ' + item.description).toLowerCase();
      const score = words.filter((w) => hay.includes(w)).length;
      const tie =
        parseInt(
          createHash('sha256')
            .update(seed + item.listingUrl)
            .digest('hex')
            .slice(0, 8),
          16,
        ) / 0xffffffff;
      return {
        ...item,
        score: score + tie,
        reason: `Matches this category${score ? ` and ${score} details in your brief` : ''}.`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
