// Optional host compatibility probe. No project storage or model credentials are used.
import { createServer } from 'node:http';
import { openBrowser } from '../server/reconstruction/session.js';
const session = await openBrowser();
try {
  const page = await session.browser.newPage();
  await page.setContent('<h1>Browser host ready</h1>');
  await page.screenshot();
} finally {
  await session.close();
}
const result = JSON.stringify({
  browser: 'ready',
  sandbox: process.env.FUSION_CHROMIUM_SANDBOX !== 'false',
  architecture: process.arch,
  nonRoot: process.getuid?.() !== 0,
});
console.log(result);
const server = createServer((req, res) => {
  res.writeHead(req.url === '/healthz' ? 200 : 404, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(req.url === '/healthz' ? result : '{}');
});
server.listen(Number(process.env.PORT || 3101), '0.0.0.0');
process.on('SIGTERM', () => server.close());
