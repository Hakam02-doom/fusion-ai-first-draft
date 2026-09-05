import { parse } from '@babel/parser';
import { readFile, writeFile } from 'node:fs/promises';

const routes = JSON.parse(await readFile('src/data/routes.json', 'utf8'));
const preloads = {};
for (const route of routes) {
  const ast = parse(
    await readFile(`src/pages/${route.component}.jsx`, 'utf8'),
    { sourceType: 'module', plugins: ['jsx'] },
  );
  const hero = ast.program.body.find(
    (node) => node.type === 'FunctionDeclaration',
  );
  const images = new Map();
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'JSXOpeningElement' && node.name.name === 'img') {
      const attribute = (name) => {
        const value = node.attributes.find((a) => a.name?.name === name)?.value;
        return value?.expression?.value ?? value?.value;
      };
      const src = attribute('src');
      if (src?.startsWith('/vendor/'))
        images.set(src, {
          src,
          srcSet: attribute('srcSet'),
          sizes: attribute('sizes'),
        });
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc') continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(hero);
  preloads[route.path] = [...images.values()].slice(0, 3);
}
await writeFile(
  'src/data/route-preloads.json',
  JSON.stringify(preloads, null, 2) + '\n',
);
