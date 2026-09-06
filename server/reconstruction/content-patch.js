import { parseFragment, serialize, serializeOuter } from 'parse5';

// Copy and link edits have separate targets so a brand/copy rewrite cannot corrupt a URL.
export function patchContent(html, change) {
  const root = parseFragment(html);
  let hits = 0;
  function walk(node) {
    if (change.scope === 'text' && node.nodeName === '#text') {
      const value = serializeOuter(node);
      // Visible-copy replacements may cover phrases, but never fragments of a
      // different word (for example, "Coach" inside "Coaching").
      const word = /[\p{L}\p{N}_]/u;
      const startWord = word.test([...change.find][0] || '');
      const endWord = word.test([...change.find].at(-1) || '');
      let count = 0,
        cursor = 0,
        replacement = '';
      for (
        let at = value.indexOf(change.find);
        at >= 0;
        at = value.indexOf(change.find, at + change.find.length)
      ) {
        if (
          (startWord && word.test([...value.slice(0, at)].at(-1) || '')) ||
          (endWord &&
            word.test([...value.slice(at + change.find.length)][0] || ''))
        )
          continue;
        replacement += value.slice(cursor, at) + change.replace;
        cursor = at + change.find.length;
        count++;
      }
      replacement += value.slice(cursor);
      if (count) {
        const parsed = parseFragment(replacement);
        if (parsed.childNodes.some((n) => n.nodeName !== '#text'))
          throw Error('A copy edit must contain text, not HTML.');
        node.value = parsed.childNodes.map((n) => n.value).join('');
        hits += count;
      }
    }
    if (change.scope === 'link') {
      const attr = node.attrs?.find((a) => a.name === 'href');
      if (attr?.value === change.find) {
        attr.value = change.replace;
        hits++;
      }
    }
    node.childNodes?.forEach(walk);
  }
  walk(root);
  return { html: hits ? serialize(root) : html, hits };
}

export function patchWordmark(html, mark) {
  const root = parseFragment(html);
  let hits = 0;
  function walk(node) {
    if (
      node.attrs?.some(
        (a) => a.name === 'data-fusion-node' && a.value === mark.id,
      )
    ) {
      if (
        node.tagName !== 'img' &&
        !node.attrs.some((a) => a.name === 'data-fusion-wordmark')
      )
        throw Error('The selected wordmark must be a captured logo image.');
      const keep = node.attrs.filter((a) =>
        ['class', 'data-fusion-node'].includes(a.name),
      );
      node.tagName = node.nodeName = 'span';
      node.attrs = [
        ...keep,
        { name: 'data-fusion-wordmark', value: 'true' },
        { name: 'role', value: 'img' },
        { name: 'aria-label', value: mark.text },
        {
          name: 'style',
          value: `display:flex;width:100%;height:100%;align-items:center;white-space:nowrap;font-family:${mark.fontFamily || 'inherit'};font-size:${mark.fontSize || 30}px;font-weight:800;letter-spacing:-.04em;line-height:1;color:${mark.color || 'inherit'}`,
        },
      ];
      node.childNodes = [
        { nodeName: '#text', value: mark.text, parentNode: node },
      ];
      hits++;
    } else node.childNodes?.forEach(walk);
  }
  walk(root);
  return { html: hits ? serialize(root) : html, hits };
}

// The interaction runtime is application-owned. Only its serialized state data is updated.
export function patchInteractionContent(js, changes = [], wordmarks = []) {
  const match = js.match(/const data=(.*?);const controller=/s);
  if (!match) return js;
  const data = JSON.parse(match[1]);
  for (const action of data.actions || []) {
    for (const patch of action.patches || []) {
      for (const key of ['before', 'after']) {
        if (typeof patch[key] !== 'string') continue;
        for (const change of changes)
          patch[key] = patchContent(patch[key], change).html;
        for (const mark of wordmarks)
          patch[key] = patchWordmark(patch[key], mark).html;
      }
      for (const attr of patch.attrs || []) {
        if (attr.name !== 'href') continue;
        for (const change of changes.filter((c) => c.scope === 'link'))
          for (const key of ['before', 'after'])
            if (attr[key] === change.find) attr[key] = change.replace;
      }
    }
  }
  return js.replace(
    match[0],
    () =>
      `const data=${JSON.stringify(data).replace(/<\//g, '<\\/')};const controller=`,
  );
}
