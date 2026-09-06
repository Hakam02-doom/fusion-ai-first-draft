import { parseFragment, serialize } from 'parse5';
const getId = (n) => n.attrs?.find((a) => a.name === 'data-fusion-node')?.value;
function index(html, baseURL) {
  const tree = parseFragment(html),
    nodes = new Map();
  function walk(n) {
    if (n.childNodes)
      n.childNodes = n.childNodes.filter(
        (c) =>
          ![
            'script',
            'iframe',
            'object',
            'embed',
            'style',
            'link',
            'meta',
            'base',
          ].includes(c.tagName),
      );
    if (n.attrs)
      n.attrs = n.attrs.filter(
        (a) =>
          !a.name.startsWith('on') &&
          !['srcdoc', 'action', 'formaction'].includes(a.name) &&
          !(
            ['href', 'src'].includes(a.name) && /^\s*javascript:/i.test(a.value)
          ),
      );
    if (baseURL)
      for (const a of n.attrs || []) {
        if (
          ['href', 'src', 'poster'].includes(a.name) &&
          a.value &&
          !a.value.startsWith('#') &&
          !a.value.startsWith('data:')
        ) {
          try {
            const u = new URL(a.value, baseURL),
              base = new URL(baseURL);
            a.value =
              a.name === 'href' &&
              u.origin === base.origin &&
              u.pathname === base.pathname &&
              u.hash
                ? u.hash
                : u.href;
          } catch {}
        }
      }
    if (getId(n)) nodes.set(getId(n), n);
    n.childNodes?.forEach(walk);
  }
  walk(tree);
  return nodes;
}
function attributes(n) {
  return Object.fromEntries(
    (n.attrs || [])
      .filter(
        (a) =>
          !a.name.startsWith('on') &&
          !['action', 'formaction', 'srcdoc'].includes(a.name),
      )
      .map((a) => [a.name, a.value]),
  );
}
export function compileAction(action) {
  const before = index(action.before, action.baseURL),
    after = index(action.after, action.baseURL),
    patches = [];
  for (const [id, a] of before) {
    const b = after.get(id);
    if (!b) continue;
    const oldAttrs = attributes(a),
      newAttrs = attributes(b);
    const attrs = [
      ...new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]),
    ]
      .filter((k) => oldAttrs[k] !== newAttrs[k])
      .map((name) => ({
        name,
        before: oldAttrs[name] ?? null,
        after: newAttrs[name] ?? null,
      }));
    const signature = (n) =>
      (n.childNodes || [])
        .map((c) => (c.tagName ? getId(c) || c.tagName : c.value))
        .join('|');
    const changedChildren = signature(a) !== signature(b);
    if (attrs.length || changedChildren)
      patches.push({
        id,
        attrs,
        ...(changedChildren
          ? { before: serialize(a), after: serialize(b) }
          : {}),
      });
  }
  // An ancestor content replacement contains its descendants; avoid applying stale child patches.
  const roots = patches.filter((p) => p.before !== undefined);
  const compact = patches.filter(
    (p) =>
      !roots.some(
        (r) => r.id !== p.id && r.before.includes(`data-fusion-node="${p.id}"`),
      ),
  );
  return {
    kind: action.kind || 'click',
    root: action.root,
    target: action.target,
    label: action.label,
    patches: compact,
  };
}
