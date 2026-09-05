import { parse } from '@babel/parser';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = 'reference/runtime/sites/20WxERL9JPvJ1vzzITXNw1';
const result = { appear: {}, text: {} };
function visit(node, fn, parents = []) {
  if (!node || typeof node !== 'object') return;
  fn(node, parents);
  for (const [k, v] of Object.entries(node)) {
    if (k === 'loc') continue;
    if (Array.isArray(v)) v.forEach((n) => visit(n, fn, [node, ...parents]));
    else if (v && typeof v === 'object') visit(v, fn, [node, ...parents]);
  }
}
for (const file of readdirSync(dir).filter(
  (f) =>
    f.endsWith('.mjs') &&
    !/^(framer\.|motion\.|react\.|rolldown|shared)/.test(f),
)) {
  const source = readFileSync(`${dir}/${file}`, 'utf8'),
    ast = parse(source, { sourceType: 'module' }),
    bindings = new Map();
  visit(ast, (node) => {
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier')
      bindings.set(node.id.name, node.init);
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier')
      bindings.set(node.left.name, node.right);
  });
  const fields = (n) =>
    Object.fromEntries(
      (n?.properties || [])
        .filter((p) => p.type === 'ObjectProperty')
        .map((p) => [p.key.name || p.key.value, p.value]),
    );
  function value(n, depth = 0) {
    if (!n || depth > 8) return undefined;
    if (n.type === 'TemplateLiteral' && !n.expressions.length)
      return n.quasis[0].value.cooked;
    if (
      [
        'StringLiteral',
        'NumericLiteral',
        'BooleanLiteral',
        'NullLiteral',
      ].includes(n.type)
    )
      return n.value;
    if (n.type === 'Identifier') return value(bindings.get(n.name), depth + 1);
    if (n.type === 'UnaryExpression') {
      const v = value(n.argument, depth + 1);
      return n.operator === '!' ? !v : n.operator === '-' ? -v : undefined;
    }
    if (n.type === 'ArrayExpression')
      return n.elements.map((x) => value(x, depth + 1));
    if (n.type === 'ObjectExpression')
      return Object.fromEntries(
        Object.entries(fields(n)).map(([k, v]) => [k, value(v, depth + 1)]),
      );
  }
  visit(ast, (node, parents) => {
    if (node.type !== 'ObjectExpression') return;
    const props = fields(node),
      cls = value(props.className);
    if (
      typeof cls === 'string' &&
      !cls.includes(' ') &&
      ((props.initial && props.animate) ||
        value(props.__framer__styleAppearEffectEnabled))
    ) {
      const enter = value(props.initial || props.__framer__enter),
        animate = value(props.animate || props.__framer__animate);
      if (enter && typeof enter === 'object')
        result.appear[cls] = {
          enter,
          animate,
          trigger: props.initial ? 'mount' : 'inView',
          threshold: value(props.__framer__threshold),
          source: file,
        };
    }
    if (props.effect && typeof cls === 'string') {
      const effect = value(props.effect);
      if (effect) result.text[cls] = { effect, source: file };
    }
    if (props.effectOptions && props.text && props.type) {
      const parent = parents.find(
        (p) =>
          p.type === 'ObjectExpression' &&
          typeof value(fields(p).className) === 'string',
      );
      const selector = parent && value(fields(parent).className);
      if (selector)
        result.text[selector] = {
          text: value(props.text),
          effect: value(props.effectOptions),
          transition: value(props.transitionOptions),
          stagger: value(props.stagger),
          perWord: value(props.perWord),
          type: value(props.type),
          as: value(props.as),
          source: file,
        };
    }
  });
}
writeFileSync(
  'src/data/reference-motion.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(JSON.stringify(result, null, 2));
