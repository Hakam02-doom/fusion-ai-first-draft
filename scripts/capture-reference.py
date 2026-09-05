"""Capture the user-specified published frontend, preserving its motion runtime.

This is a fidelity-first draft, not the original editable Framer project.
Run from the project root to refresh the captured frontend and asset manifest.
"""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from concurrent.futures import ThreadPoolExecutor
import re, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'https://fusionai.framer.website'
PAGES = ['/', '/about-us', '/pricing', '/integrations', '/blog', '/contact', '/waitlist', '/privacy-policy', '/terms-conditions', '/changelog', '/404']
ASSET_HOSTS = {'framerusercontent.com': '/vendor/framer', 'fonts.gstatic.com': '/vendor/fonts'}
asset_pattern = re.compile(r'https://(?:framerusercontent\.com|fonts\.gstatic\.com)/[^\s\"\x27`<>\\)]+')
module_pattern = re.compile(r'[\"\x27`](\./[^\"\x27`\s]+\.mjs)[\"\x27`]')
known, manifest, failures = set(), [], []

def request(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as r:
                return r.read(), r.headers.get('content-type', '')
        except HTTPError as error:
            if error.code == 404 and url == SOURCE + '/404':
                return error.read(), 'text/html'
            if attempt == 2: raise
        except Exception:
            if attempt == 2: raise

def local_url(url):
    u = urlsplit(url)
    return ASSET_HOSTS[u.netloc] + u.path

def rewrite(text):
    for origin, local in ASSET_HOSTS.items():
        text = text.replace('https://' + origin, local)
    return text.replace(SOURCE, '')

def discover(text, base):
    urls = {u.split('?')[0].rstrip(';},') for u in asset_pattern.findall(text)}
    urls.update(urljoin(base, p) for p in module_pattern.findall(text))
    return {u for u in urls if not u.endswith('/')}

def page(path):
    body, _ = request(SOURCE + path)
    text = body.decode()
    text = re.sub(r'<script[^>]*src="https://events\.framer\.com/[^>]*></script>', '', text)
    # No production form submissions are made from this review copy.
    text = text.replace('</head>', '<script src="/draft-forms.js" defer></script></head>')
    name = 'index' if path == '/' else path.strip('/').replace('/', '__')
    (ROOT / 'reference/pages').mkdir(parents=True, exist_ok=True)
    (ROOT / 'reference/pages' / (name + '.html')).write_text(rewrite(text))
    return discover(text, SOURCE + path)

def asset(url):
    body, content_type = request(url)
    local = local_url(url).lstrip('/')
    if local.startswith('vendor/framer/sites/') or local.startswith('vendor/framer/modules/'):
        path = ROOT / 'reference/runtime' / local.removeprefix('vendor/framer/')
    else:
        path = ROOT / 'public' / local
    path.parent.mkdir(parents=True, exist_ok=True)
    extra = set()
    if path.suffix in ('.mjs', '.js', '.css'):
        text = body.decode()
        extra = discover(text, url)
        body = rewrite(text).encode()
    path.write_bytes(body)
    return extra, {'source': url, 'local': local_url(url), 'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest()}

with ThreadPoolExecutor(max_workers=10) as pool:
    pending = set()
    for urls in pool.map(page, PAGES): pending.update(urls)
    blog = (ROOT / 'reference/pages/blog.html').read_text()
    article_paths = sorted(set('/blog/' + slug for slug in re.findall(r'href="\.?/blog/([^"?#]+)', blog)))
    for urls in pool.map(page, article_paths): pending.update(urls)
    PAGES.extend(article_paths)
    while pending:
        batch = sorted(pending - known)
        if not batch: break
        known.update(batch); pending = set()
        for url, future in [(u, pool.submit(asset, u)) for u in batch]:
            try:
                extra, record = future.result()
                pending.update(extra - known); manifest.append(record)
            except Exception as e:
                failures.append({'url': url, 'error': str(e)})
        print(f'Captured {len(manifest)} assets; next batch {len(pending)}', flush=True)

(ROOT / 'reference/manifest.json').write_text(json.dumps({'source': SOURCE, 'pages': PAGES, 'assets': manifest, 'failures': failures}, indent=2))
if failures: raise SystemExit(json.dumps(failures, indent=2))
print('Reference capture complete.', flush=True)
