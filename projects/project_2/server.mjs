import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = Number(process.env.PORT || 5185);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const PROXY_ROUTES = [
  ['/proxy/osdr', 'https://osdr.nasa.gov'],
  ['/proxy/donki', 'https://ccmc.gsfc.nasa.gov'],
];

async function handleProxy(req, res, urlPath, search) {
  const match = PROXY_ROUTES.find(([prefix]) => urlPath.startsWith(prefix));
  if (!match) return false;

  const [prefix, origin] = match;
  const upstreamPath = urlPath.slice(prefix.length) || '/';
  const upstreamUrl = `${origin}${upstreamPath}${search}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: req.method || 'GET',
      headers: {
        Accept: req.headers.accept || '*/*',
        'User-Agent': 'CradleFlow-NASA-SpaceApps-2026/1.0',
      },
      signal: AbortSignal.timeout(12000),
    });

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const body = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Upstream NASA request failed', detail: String(err) }));
  }
  return true;
}

function serveStatic(res, urlPath) {
  const safeRelative = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const requested = path.join(DIST_DIR, safeRelative === '/' ? 'index.html' : safeRelative);
  const resolved = path.resolve(requested);

  if (resolved !== DIST_DIR && !resolved.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let target = resolved;
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    const hasExtension = Boolean(path.extname(safeRelative));
    if (hasExtension) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    target = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(target).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
  });
  fs.createReadStream(target).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (parsed.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'cradleflow' }));
    return;
  }

  if (await handleProxy(req, res, parsed.pathname, parsed.search)) {
    return;
  }

  serveStatic(res, parsed.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CradleFlow production server listening on http://0.0.0.0:${PORT}`);
});
