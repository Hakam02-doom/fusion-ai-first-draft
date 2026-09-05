// Keep the actual backdrop in its page stacking context, behind the content.
// A screenshot layer above the page would also cover the entering headings.
export function routeGradient(root) {
  const candidates =
    root?.querySelectorAll(
      'img[data-gradient-surface][src*="UIpX3"], img[data-gradient-surface][src*="Be2eOL"]',
    ) ?? [];
  return [...candidates]
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(
      ({ rect }) =>
        rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight,
    )
    .sort(
      (a, b) =>
        Number(b.node.src.includes('UIpX3')) -
        Number(a.node.src.includes('UIpX3')),
    )[0];
}

export function moveRouteGradient(previous, next) {
  if (!previous || !next) return null;
  const { node, rect } = next;
  const x = previous.rect.left - rect.left;
  const y = previous.rect.top - rect.top;
  const sx = previous.rect.width / rect.width;
  const sy = previous.rect.height / rect.height;
  node.dataset.routeGradient = 'moving';
  const animation = node.animate(
    [
      {
        transformOrigin: '0 0',
        transform: `translate(${x}px, ${y}px) scale(${sx}, ${sy})`,
      },
      { transformOrigin: '0 0', transform: 'translate(0, 0) scale(1, 1)' },
    ],
    // The original site's global page transition uses this duration and curve.
    { duration: 500, easing: 'cubic-bezier(.27, 0, .51, 1)' },
  );
  animation.finished
    .finally(() => {
      node.dataset.routeGradient = 'settled';
    })
    .catch(() => {});
  return animation;
}
