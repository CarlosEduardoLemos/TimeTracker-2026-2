import path from 'node:path';
import { fileURLToPath } from 'node:url';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');

function location(filename) {
  const relative = path.relative(src, filename);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
    return null;
  return relative.split(path.sep);
}

export const architecture = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep app, features and shared dependencies within their layers' },
    messages: {
      layer: '{{source}} cannot import {{target}}',
    },
  },
  create(context) {
    const source = location(context.filename);
    if (!source || !['app', 'features', 'shared'].includes(source[0])) return {};

    function check(node, specifier) {
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) return;
      const target = location(path.resolve(path.dirname(context.filename), specifier));
      if (!target) {
        context.report({
          node,
          messageId: 'layer',
          data: { source: source.slice(0, 2).join('/'), target: 'outside src' },
        });
        return;
      }
      const targetLayer = target[0];
      const forbidden =
        (source[0] === 'shared' && targetLayer !== 'shared') ||
        (source[0] === 'features' &&
          targetLayer !== 'shared' &&
          !(targetLayer === 'features' && source[1] === target[1])) ||
        (source[0] === 'app' && !['app', 'features', 'shared'].includes(targetLayer));
      if (forbidden) {
        context.report({
          node,
          messageId: 'layer',
          data: { source: source.slice(0, 2).join('/'), target: target.slice(0, 2).join('/') },
        });
      }
    }

    return {
      ImportDeclaration(node) {
        check(node.source, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node.source, node.source.value);
      },
      ExportAllDeclaration(node) {
        check(node.source, node.source.value);
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal') check(node.source, node.source.value);
      },
    };
  },
};
