import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, 'dist');
const PORT = Number(process.env.PORT || 5179);

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
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};

const PROXY_ROUTES = [
  ['/proxy/osdr', 'https://osdr.nasa.gov'],
  ['/proxy/firms', 'https://firms.modaps.eosdis.nasa.gov'],
  ['/proxy/asf', 'https://api.daac.asf.alaska.edu'],
  ['/proxy/cmr', 'https://cmr.earthdata.nasa.gov'],
  ['/proxy/donki', 'https://ccmc.gsfc.nasa.gov'],
];

const PROXY_CACHE = new Map();
const PROXY_CACHE_TTL_MS = 45_000;

async function fetchUpstreamOnce(req, upstreamUrl) {
  return fetch(upstreamUrl, {
    method: req.method || 'GET',
    headers: {
      Accept: req.headers.accept || '*/*',
      'User-Agent': 'DopaiMint-NASA-SpaceApps-2026/1.0',
    },
    signal: AbortSignal.timeout(12000),
  });
}

async function handleProxy(req, res, urlPath, search) {
  const match = PROXY_ROUTES.find(([prefix]) => urlPath.startsWith(prefix));
  if (!match) return false;

  const [prefix, origin] = match;
  const upstreamPath = urlPath.slice(prefix.length) || '/';
  const upstreamUrl = `${origin}${upstreamPath}${search}`;
  const method = (req.method || 'GET').toUpperCase();

  if (method === 'GET') {
    const cached = PROXY_CACHE.get(upstreamUrl);
    if (cached && cached.expiresAt > Date.now()) {
      res.writeHead(200, {
        'Content-Type': cached.contentType,
        'Cache-Control': 'no-store',
        'X-Proxy-Cache': 'HIT',
      });
      res.end(cached.body);
      return true;
    }
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const upstream = await fetchUpstreamOnce(req, upstreamUrl);
      if (upstream.status >= 500 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      const body = Buffer.from(await upstream.arrayBuffer());
      if (method === 'GET' && upstream.status === 200) {
        if (PROXY_CACHE.size > 64) PROXY_CACHE.clear();
        PROXY_CACHE.set(upstreamUrl, {
          contentType,
          body,
          expiresAt: Date.now() + PROXY_CACHE_TTL_MS,
        });
      }
      res.writeHead(upstream.status, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      });
      res.end(body);
      return true;
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
    }
  }

  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Proxy-Fallback': '1',
  });
  res.end('{"fallback":true}');
  return true;
}

const STATIC_ALIASES = {
  '/submission/terraspan-deck-7slides.pdf': '/submission/dopaimint-deck-7slides.pdf',
  '/submission/terraspan-demo-28s.mp4': '/submission/dopaimint-demo-28s.mp4',
};

function serveStatic(req, res, urlPath) {
  const aliasedPath = STATIC_ALIASES[urlPath] || urlPath;
  const safeRelative = path.normalize(decodeURIComponent(aliasedPath)).replace(/^(\.\.[/\\])+/, '');
  const requested = path.join(DIST_DIR, safeRelative === '/' ? 'index.html' : safeRelative);
  const resolved = path.resolve(requested);

  if (resolved !== DIST_DIR && !resolved.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  let target = resolved;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    const dirIndex = path.join(target, 'index.html');
    if (fs.existsSync(dirIndex)) {
      target = dirIndex;
    }
  }
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    const hasExtension = Boolean(path.extname(safeRelative));
    if (hasExtension) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    target = path.join(DIST_DIR, 'index.html');
  }

  const stat = fs.statSync(target);
  const total = stat.size;
  const ext = path.extname(target).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheControl = ext === '.html' ? 'no-cache' : 'public, max-age=3600';
  const isHead = req.method === 'HEAD';
  const range = req.headers.range;

  if (typeof range === 'string') {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      const [, startRaw, endRaw] = match;
      let start;
      let end;

      if (startRaw === '' && endRaw !== '') {
        const suffix = Number(endRaw);
        start = Math.max(0, total - suffix);
        end = total - 1;
      } else if (startRaw !== '') {
        start = Number(startRaw);
        end = endRaw !== '' ? Math.min(Number(endRaw), total - 1) : total - 1;
      } else {
        start = total;
        end = 0;
      }

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= total || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        res.end();
        return;
      }

      res.writeHead(206, {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': end - start + 1,
        'Cache-Control': cacheControl,
      });
      if (isHead) {
        res.end();
      } else {
        fs.createReadStream(target, { start, end }).pipe(res);
      }
      return;
    }
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Content-Length': total,
    'Cache-Control': cacheControl,
  });
  if (isHead) {
    res.end();
  } else {
    fs.createReadStream(target).pipe(res);
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (parsed.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'dopaimint' }));
    return;
  }

  if (await handleProxy(req, res, parsed.pathname, parsed.search)) {
    return;
  }

  serveStatic(req, res, parsed.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DopaiMint production server listening on http://0.0.0.0:${PORT}`);
});
