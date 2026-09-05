/**
 * Serve the reference's published document without wrapping or re-rendering it.
 * This preserves its measured layout and lets its local Framer runtime own the
 * component tree, including responsive variants and animation state.
 */
const pages = import.meta.glob('../../reference/pages/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export async function GET(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname.replace(/^\/+|\/+$/g, '');
  const name = path ? path.replaceAll('/', '__') : 'index';
  const page = pages[`../../reference/pages/${name}.html`];
  const fallback = pages['../../reference/pages/404.html'];
  return new Response(page ?? fallback, {
    status: page && name !== '404' ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
