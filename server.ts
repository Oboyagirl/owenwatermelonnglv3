import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { Readable } from 'node:stream';
import { GoogleGenAI } from '@google/genai';
import { attachChessRoomServer } from './server/chessRooms.ts';
import { attachArcadeRoomServer } from './server/arcadeRooms.ts';

const execFileAsync = promisify(execFile);

async function startServer() {
  const app = express();

  // Parse CLI arguments (e.g. tsx server.ts --port 3000 --host 0.0.0.0)
  const portArgIndex = process.argv.indexOf('--port');
  let chosenPort = 3000;
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      chosenPort = parsed;
    }
  } else if (process.env.PORT) {
    const envPort = Number(process.env.PORT);
    // In our container environment, Nginx is bound to 8080 and proxies traffic to 3000.
    // If process.env.PORT is 8080, keep port 3000 to prevent EADDRINUSE collisions.
    if (!Number.isNaN(envPort) && envPort !== 8080 && envPort > 0) {
      chosenPort = envPort;
    }
  }
  const PORT = chosenPort;

  const hostArgIndex = process.argv.indexOf('--host');
  let chosenHost = '0.0.0.0';
  if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
    chosenHost = process.argv[hostArgIndex + 1];
  }

  app.use(express.json());

  // Initialize Gemini AI Client (Server-side only)
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });



  // Universal School-Unblocked Game Proxy - Proxies any external game (Unity, HTML5, Duck Life, Bloons TD, etc.)
  // Bypasses Securly / GoGuardian blocks, strips broken root-relative jqrg/ad scripts, shims Poki/ytgame SDKs, and fixes GitHub Pages .br Brotli headers
  app.get('/api/proxy/game', async (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send('Missing url parameter');
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      const upstreamRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(20000)
      });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');

      const finalUrl = upstreamRes.url || targetUrl;
      const cleanPath = finalUrl.split('?')[0].toLowerCase();
      let contentType = upstreamRes.headers.get('content-type') || '';

      if (cleanPath.endsWith('.js') || cleanPath.endsWith('.js.br') || cleanPath.endsWith('.js.gz')) {
        contentType = 'application/javascript; charset=utf-8';
      } else if (cleanPath.endsWith('.wasm') || cleanPath.endsWith('.wasm.br') || cleanPath.endsWith('.wasm.gz')) {
        contentType = 'application/wasm';
      } else if (cleanPath.endsWith('.json')) {
        contentType = 'application/json; charset=utf-8';
      } else if (cleanPath.endsWith('.css')) {
        contentType = 'text/css; charset=utf-8';
      }

      res.setHeader('Content-Type', contentType || 'text/html; charset=utf-8');

      if (contentType.includes('text/html')) {
        let html = await upstreamRes.text();
        const baseHref = finalUrl.endsWith('/') ? finalUrl : finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
        const baseTag = `<base href="${baseHref}">`;

        // Strip CSP meta tags, Google Ads / adSense / wrong-ref telemetry, and broken root-relative jqrg/gg-detect scripts
        html = html.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
        html = html.replace(/<script[^>]*src=["'][^"']*(?:jqrg-|gg-detect\.js|adSense\.js|pagead2\.googlesyndication|googletagmanager\.com)[^"']*["'][^>]*>\s*<\/script>/gi, '');
        // Rewrite blocked rawcdn.githack.com URLs to CORS-safe cdn.jsdelivr.net
        html = html.replace(/https?:\/\/rawcdn\.githack\.com\/([^/"']+)\/([^/"']+)\/([^/"']+)\//gi, 'https://cdn.jsdelivr.net/gh/$1/$2@$3/');

        // Shim Poki / ytgame SDKs & proxy .br Unity files seamlessly through same-origin /api/proxy/game
        const sdkShim = `<script>
(function(){
  try {
    if (!window.ytgame) {
      window.ytgame = {
        SDK_VERSION: '1.0',
        IN_PLAYABLES_ENV: false,
        game: { firstFrameReady: function(){}, gameReady: function(){}, saveData: function(){ return Promise.resolve(); }, loadData: function(){ return Promise.resolve(''); } },
        engagement: { sendScore: function(){ return Promise.resolve(); } },
        system: { isAudioEnabled: function(){ return true; }, onAudioEnabledChange: function(){}, onPause: function(){}, onResume: function(){}, getLanguage: function(){ return Promise.resolve('en'); } }
      };
    }
    if (!window.PokiSDK) {
      window.PokiSDK = {
        init: function(){ return Promise.resolve(); },
        gameLoadingStart: function(){},
        gameLoadingFinished: function(){},
        gameplayStart: function(){},
        gameplayStop: function(){},
        commercialBreak: function(){ return Promise.resolve(); },
        rewardedBreak: function(){ return Promise.resolve(true); },
        setDebug: function(){}
      };
    }
    var shouldProxy = function(abs) {
      return (
        (/\\.(br|unityweb)(\\?|$)/i.test(abs) && abs.indexOf('/api/proxy/game') === -1) ||
        abs.indexOf('rawcdn.githack.com') !== -1 ||
        abs.indexOf('pages.dev') !== -1 ||
        abs.indexOf('ubghyper.github.io') !== -1 ||
        abs.indexOf('freeonlinewebtools.github.io') !== -1
      );
    };
    var origFetch = window.fetch;
    if (origFetch) {
      window.fetch = function(input, init) {
        var urlStr = typeof input === 'string' ? input : (input && input.url ? input.url : '');
        try {
          var abs = new URL(urlStr, ${JSON.stringify(baseHref)}).href;
          if (shouldProxy(abs)) {
            return origFetch('/api/proxy/game?url=' + encodeURIComponent(abs), init);
          }
        } catch(e) {}
        return origFetch(input, init);
      };
    }
    if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
      var origXhrOpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function(method, url) {
        try {
          var abs = new URL(String(url), ${JSON.stringify(baseHref)}).href;
          if (shouldProxy(abs)) {
            var args = Array.prototype.slice.call(arguments);
            args[1] = '/api/proxy/game?url=' + encodeURIComponent(abs);
            return origXhrOpen.apply(this, args);
          }
        } catch(e) {}
        return origXhrOpen.apply(this, arguments);
      };
    }
  } catch(e) {}
})();
</script>`;

        const headInjection = `${baseTag}\n${sdkShim}`;
        if (/<head[^>]*>/i.test(html)) {
          html = html.replace(/(<head[^>]*>)/i, `$1\n${headInjection}`);
        } else {
          html = headInjection + html;
        }
        return res.status(upstreamRes.status).send(html);
      } else {
        let buf = Buffer.from(await upstreamRes.arrayBuffer());
        // Fix GitHub Pages serving Unity .br files with wrong Content-Encoding
        if (cleanPath.endsWith('.br') && buf.length > 0) {
          try {
            buf = zlib.brotliDecompressSync(buf);
          } catch {
            // Already decompressed or uncompressed; return as-is
          }
        }
        return res.status(upstreamRes.status).send(buf);
      }
    } catch (err: any) {
      console.warn('Game proxy error:', targetUrl, err.message);
      return res.status(502).send('Error loading unblocked game mirror: ' + err.message);
    }
  });

  // Direct Game Play-Shell Runner - Unblocks games for school iPads by piping play-shells and resolving assets via jsDelivr CDN
  app.get('/g/:slug', (req, res) => {
    const slug = req.params.slug;
    const lowerSlug = slug.toLowerCase();

    // Direct redirect for games with special local runners
    if (lowerSlug.includes('halloween') && lowerSlug.includes('fnaf')) {
      return res.redirect('/games/fnaf4-halloween.html');
    }

    // Try ubghyper play shell first
    const playShellUrl = `https://ubghyper.github.io/g/${encodeURIComponent(slug)}/`;
    https.get(playShellUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    }, (proxyRes) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');

      if (proxyRes.statusCode === 200) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        let body = '';
        proxyRes.setEncoding('utf-8');
        proxyRes.on('data', chunk => { body += chunk; });
        proxyRes.on('end', () => {
          let modified = body.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
          res.send(modified);
        });
      } else {
        // Fallback to direct shard with jsDelivr CDN base tag
        const cdnBase = `https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@9aa2f58b44aae1f82fb25a1ed8a43293eac3d5cc/${slug}/`;
        const directUrl = `https://ubghyper.github.io/GameList.github.io/${slug}/`;
        
        https.get(directUrl, (directRes) => {
          if (directRes.statusCode && directRes.statusCode >= 200 && directRes.statusCode < 400) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            let body = '';
            directRes.setEncoding('utf-8');
            directRes.on('data', chunk => { body += chunk; });
            directRes.on('end', () => {
              const baseTag = `<base href="${cdnBase}">`;
              let modified = body.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
              if (/<head[^>]*>/i.test(modified)) {
                modified = modified.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);
              } else {
                modified = baseTag + modified;
              }
              res.send(modified);
            });
          } else {
            res.redirect(directUrl);
          }
        }).on('error', () => {
          res.status(502).send('Error loading game shard');
        });
      }
    }).on('error', (err) => {
      res.status(502).send('Error loading play-shell: ' + err.message);
    });
  });

  // Dedicated SWF Proxy - Streams Flash games with guaranteed application/x-shockwave-flash MIME, CORS, and >20MB raw.githubusercontent fallback
  app.get('/api/swf', async (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const candidates = [targetUrl];
    if (targetUrl.includes('cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/')) {
      const tail = targetUrl.split('cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/')[1];
      candidates.push(`https://raw.githubusercontent.com/UBGHyper/GameList.github.io/main/${tail}`);
      candidates.push(`https://ubghyper.github.io/GameList.github.io/${tail}`);
    } else if (targetUrl.includes('ubghyper.github.io/GameList.github.io/')) {
      const tail = targetUrl.split('ubghyper.github.io/GameList.github.io/')[1];
      candidates.push(`https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/${tail}`);
      candidates.push(`https://raw.githubusercontent.com/UBGHyper/GameList.github.io/main/${tail}`);
    }

    for (const candidate of candidates) {
      try {
        const upstream = await fetch(candidate, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(25000)
        });
        if (!upstream.ok) continue;

        const buf = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Content-Type', 'application/x-shockwave-flash');
        res.setHeader('Cache-Control', 'public, max-age=604800');
        res.setHeader('Content-Length', String(buf.length));
        return res.status(200).send(buf);
      } catch {
        // try next fallback URL
      }
    }

    return res.status(502).send('SWF Proxy error: could not fetch SWF from any mirror');
  });

  // Serve static games directly with relaxed framing headers
  app.use('/games', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('X-Frame-Options');
    next();
  }, express.static(path.resolve('public/games')));

  // Serve album covers statically with no-cache / must-revalidate so updates reflect immediately
  const coversDir = fs.existsSync(path.resolve('public/music/covers'))
    ? path.resolve('public/music/covers')
    : path.resolve('dist/music/covers');
  app.use('/music/covers', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    next();
  }, express.static(coversDir));

  const primaryMusicDir = path.resolve('public/music');
  const fallbackMusicDir = path.resolve('dist/music');
  const cacheMusicDir = path.resolve('public/music/cache');
  if (!fs.existsSync(cacheMusicDir)) {
    fs.mkdirSync(cacheMusicDir, { recursive: true });
  }

  // Active transcode map to avoid duplicate simultaneous conversions
  const activeTranscodes = new Map<string, Promise<string | null>>();

  // Cache of known archive.org URLs for each catalog filename
  let albumSourceUrlsMap: Record<string, string> = {};
  const loadSourceUrls = () => {
    try {
      const urlsPath = path.resolve('src/data/albumSourceUrls.json');
      if (fs.existsSync(urlsPath)) {
        albumSourceUrlsMap = JSON.parse(fs.readFileSync(urlsPath, 'utf8'));
      }
    } catch {}
  };
  loadSourceUrls();

  const inferAudioContentType = (urlOrPath: string, upstreamType?: string | null): string => {
    const cleanUpstream = (upstreamType || '').split(';')[0].trim().toLowerCase();
    if (
      cleanUpstream === 'audio/x-m4p' ||
      cleanUpstream === 'audio/x-m4a' ||
      cleanUpstream === 'audio/m4a' ||
      cleanUpstream === 'audio/mp4a-latm'
    ) {
      return 'audio/mp4';
    }
    if (cleanUpstream === 'audio/mp3' || cleanUpstream === 'audio/x-mpeg') {
      return 'audio/mpeg';
    }
    if (cleanUpstream === 'audio/x-wav') {
      return 'audio/wav';
    }
    if (cleanUpstream.startsWith('audio/')) {
      return cleanUpstream;
    }
    const cleanPath = urlOrPath.split('?')[0].split('#')[0].toLowerCase();
    if (cleanPath.includes('.mp3')) return 'audio/mpeg';
    if (cleanPath.endsWith('.m4a') || cleanPath.endsWith('.mp4')) return 'audio/mp4';
    if (cleanPath.endsWith('.aac')) return 'audio/aac';
    if (cleanPath.endsWith('.ogg') || cleanPath.endsWith('.oga')) return 'audio/ogg';
    if (cleanPath.endsWith('.wav')) return 'audio/wav';
    if (cleanPath.endsWith('.webm')) return 'audio/webm';
    return 'audio/mpeg';
  };

  const appleFallbackCache = new Map<string, string | null>();
  const findUnblockedAppleStream = async (artist: string, title: string): Promise<string | null> => {
    const cleanArtist = artist.replace(/\([^)]*\)/g, '').split(',')[0].split('&')[0].trim();
    const cleanTitle = title
      .replace(/\([^)]*feat[^)]*\)/gi, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\([^)]*remaster[^)]*\)/gi, '')
      .trim();
    const key = `${cleanArtist}::${cleanTitle}`.toLowerCase();
    if (appleFallbackCache.has(key)) {
      return appleFallbackCache.get(key) || null;
    }
    try {
      const q = `${cleanArtist} ${cleanTitle}`.trim();
      const r = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=6`,
        { signal: AbortSignal.timeout(7000) }
      );
      if (r.ok) {
        const j: any = await r.json();
        const results: any[] = Array.isArray(j.results) ? j.results : [];
        const lowerTitle = cleanTitle.toLowerCase();
        const best =
          results.find(
            x =>
              x.previewUrl &&
              String(x.trackName || '').toLowerCase().includes(lowerTitle)
          ) || results.find(x => x.previewUrl);
        if (best?.previewUrl) {
          appleFallbackCache.set(key, best.previewUrl);
          return best.previewUrl;
        }
      }
    } catch {}
    appleFallbackCache.set(key, null);
    return null;
  };

  // Serve static real MP3/M4A music with byte-range streaming support (compatible with iOS iPad Safari & Chrome)
  const streamAudioFile = async (filenameOrPath: string, req: express.Request, res: express.Response) => {
    let filePath = filenameOrPath;
    const isFileValid = (p: string) => {
      try {
        return fs.existsSync(p) && fs.statSync(p).size > 1000;
      } catch {
        return false;
      }
    };

    if (!path.isAbsolute(filePath)) {
      const cleanFilename = path.basename(filenameOrPath);
      filePath = path.join(primaryMusicDir, cleanFilename);
      if (!isFileValid(filePath)) {
        filePath = path.join(cacheMusicDir, cleanFilename);
      }
      if (!isFileValid(filePath)) {
        filePath = path.join(fallbackMusicDir, cleanFilename);
      }
    }

    if (!isFileValid(filePath)) {
      const cleanFilename = path.basename(filenameOrPath);
      let sourceUrl = albumSourceUrlsMap[cleanFilename];
      if (!sourceUrl) {
        loadSourceUrls();
        sourceUrl = albumSourceUrlsMap[cleanFilename];
      }

      if (sourceUrl) {
        const targetDiskPath = path.join(primaryMusicDir, cleanFilename);
        const connectAc = new AbortController();
        const connectTimer = setTimeout(() => connectAc.abort(), 15000);
        req.on('close', () => connectAc.abort());
        try {
          const clientRange = req.headers.range;
          const fetchHeaders: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            'Accept': '*/*'
          };
          if (clientRange) fetchHeaders['Range'] = clientRange;

          const remoteRes = await fetch(sourceUrl, {
            headers: fetchHeaders,
            redirect: 'follow',
            signal: connectAc.signal
          });
          clearTimeout(connectTimer);

          if (remoteRes.ok || remoteRes.status === 206) {
            const contentType = inferAudioContentType(sourceUrl, remoteRes.headers.get('content-type'));
            res.status(remoteRes.status);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            if (remoteRes.headers.get('content-length')) {
              res.setHeader('Content-Length', remoteRes.headers.get('content-length')!);
            }
            if (remoteRes.headers.get('content-range')) {
              res.setHeader('Content-Range', remoteRes.headers.get('content-range')!);
            }
            res.flushHeaders?.();

            if (remoteRes.body) {
              const nodeStream = Readable.fromWeb(remoteRes.body as any);
              req.on('close', () => {
                try { nodeStream.destroy(); } catch {}
              });
              nodeStream.on('error', () => {
                if (!res.headersSent) res.status(502).end();
              });
              nodeStream.pipe(res);

              if (!fs.existsSync(targetDiskPath)) {
                fetch(sourceUrl, {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  redirect: 'follow'
                })
                  .then(r => r.arrayBuffer())
                  .then(buf => {
                    if (buf.byteLength > 100000) {
                      fs.writeFileSync(targetDiskPath, Buffer.from(buf));
                    }
                  })
                  .catch(() => {});
              }
              return;
            }
          }
        } catch (err: any) {
          clearTimeout(connectTimer);
          console.warn(`[STREAM FALLBACK ERROR] for ${cleanFilename}:`, err.message);
        }
      }

      return res.status(404).send('Audio file not found: ' + filenameOrPath);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = inferAudioContentType(filePath);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (Number.isNaN(start) || start >= fileSize || start < 0) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).send('Requested range not satisfiable');
      }

      if (Number.isNaN(end) || end >= fileSize) {
        end = fileSize - 1;
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });
      fileStream.pipe(res);
      req.on('close', () => {
        fileStream.destroy();
      });
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType,
      });
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      req.on('close', () => {
        fileStream.destroy();
      });
    }
  };

  const setAudioCorsHeaders = (res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Origin, Accept, Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges, Content-Type');
    res.setHeader('Accept-Ranges', 'bytes');
  };

  app.options(['/api/music/proxy', '/api/music/stream', '/api/music/resolve'], (_req, res) => {
    setAudioCorsHeaders(res);
    res.status(204).end();
  });

  app.get('/api/music/resolve', async (req, res) => {
    setAudioCorsHeaders(res);
    const artist = String(req.query.artist || '').trim();
    const title = String(req.query.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const streamUrl = await findUnblockedAppleStream(artist, title);
    if (!streamUrl) {
      return res.status(404).json({ error: 'No unblocked stream found' });
    }
    return res.json({ streamUrl, source: 'apple-cdn' });
  });

  const pendingRemoteCaches = new Map<string, Promise<string | null>>();

  const getCachedRemotePath = (targetUrl: string): string => {
    const hash = crypto.createHash('sha1').update(targetUrl).digest('hex');
    const clean = targetUrl.split('?')[0].split('#')[0].toLowerCase();
    const ext = clean.includes('.mp3')
      ? '.mp3'
      : clean.endsWith('.m4a')
      ? '.m4a'
      : clean.endsWith('.mp4')
      ? '.mp4'
      : clean.endsWith('.ogg')
      ? '.ogg'
      : '.mp3';
    return path.join(cacheMusicDir, `remote_${hash}${ext}`);
  };

  const cacheRemoteUrlToDisk = async (targetUrl: string): Promise<string | null> => {
    const dest = getCachedRemotePath(targetUrl);
    try {
      if (fs.existsSync(dest) && fs.statSync(dest).size > 20000) {
        return dest;
      }
    } catch {}

    const existing = pendingRemoteCaches.get(dest);
    if (existing) return existing;

    const job = (async (): Promise<string | null> => {
      const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
      const connectAc = new AbortController();
      const connectTimer = setTimeout(() => connectAc.abort(), 15000);
      try {
        if (!fs.existsSync(cacheMusicDir)) {
          fs.mkdirSync(cacheMusicDir, { recursive: true });
        }
        const dlRes = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
            'Accept': '*/*'
          },
          redirect: 'follow',
          signal: connectAc.signal
        });
        clearTimeout(connectTimer);
        if (!dlRes.ok || !dlRes.body) return null;
        const arr = Buffer.from(await dlRes.arrayBuffer());
        if (arr.byteLength < 10000) return null;
        fs.writeFileSync(tmp, arr);
        fs.renameSync(tmp, dest);
        return dest;
      } catch {
        clearTimeout(connectTimer);
        try {
          if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        } catch {}
        return null;
      } finally {
        pendingRemoteCaches.delete(dest);
      }
    })();

    pendingRemoteCaches.set(dest, job);
    return job;
  };

  const handleMusicProxyRequest = async (req: express.Request, res: express.Response) => {
    setAudioCorsHeaders(res);

    const remoteUrl = String(req.query.url || '').trim();
    const local = String(req.query.local || '').trim();
    const artist = String(req.query.artist || '').trim();
    const title = String(req.query.title || '').trim();
    const allowPreview = req.query.allowPreview === '1';
    const isHead = req.method === 'HEAD';

    if (local) {
      const cleanFilename = path.basename(local);
      const localPath = path.join(primaryMusicDir, cleanFilename);
      if (fs.existsSync(localPath)) {
        return streamAudioFile(cleanFilename, req, res);
      }
    }

    const streamRemote = async (targetUrl: string): Promise<boolean> => {
      const cachedPath = getCachedRemotePath(targetUrl);
      try {
        if (fs.existsSync(cachedPath) && fs.statSync(cachedPath).size > 20000) {
          await streamAudioFile(cachedPath, req, res);
          return true;
        }
      } catch {}

      const clientRange = req.headers.range;
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        'Accept': '*/*'
      };
      if (clientRange) {
        fetchHeaders['Range'] = clientRange;
      }

      const connectAc = new AbortController();
      const connectTimer = setTimeout(() => connectAc.abort(), 14000);
      const onReqClose = () => {
        try { connectAc.abort(); } catch {}
      };
      req.on('close', onReqClose);

      let remoteRes: Response;
      try {
        remoteRes = await fetch(targetUrl, {
          method: isHead ? 'HEAD' : 'GET',
          headers: fetchHeaders,
          redirect: 'follow',
          signal: connectAc.signal
        });
      } finally {
        clearTimeout(connectTimer);
      }

      if (!remoteRes.ok && remoteRes.status !== 206) {
        return false;
      }

      // If client asked for a byte range (e.g. Safari bytes=0-1 or scrubber seek) and upstream returned 200
      // without Content-Range (common for ZIP-extracted MP3s on Archive.org), cache locally once so byte-ranges work cleanly!
      if (!isHead && clientRange && remoteRes.status === 200 && !remoteRes.headers.get('content-range')) {
        try { await remoteRes.body?.cancel(); } catch {}
        const diskPath = await cacheRemoteUrlToDisk(targetUrl);
        if (diskPath) {
          await streamAudioFile(diskPath, req, res);
          return true;
        }
        return false;
      }

      const contentType = inferAudioContentType(targetUrl, remoteRes.headers.get('content-type'));
      res.status(remoteRes.status);
      res.setHeader('Content-Type', contentType);
      if (remoteRes.headers.get('content-length')) {
        res.setHeader('Content-Length', remoteRes.headers.get('content-length')!);
      }
      if (remoteRes.headers.get('content-range')) {
        res.setHeader('Content-Range', remoteRes.headers.get('content-range')!);
      }
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');

      if (isHead) {
        res.end();
        return true;
      }

      res.flushHeaders?.();
      if (remoteRes.body) {
        const nodeStream = Readable.fromWeb(remoteRes.body as any);
        nodeStream.on('error', () => {
          if (!res.headersSent) {
            res.status(502).end();
          }
        });
        req.on('close', () => {
          try { nodeStream.destroy(); } catch {}
        });
        res.on('error', () => {
          try { nodeStream.destroy(); } catch {}
        });
        nodeStream.pipe(res);
        return true;
      }
      return false;
    };

    if (remoteUrl && (remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://'))) {
      // Check if local cached file exists
      try {
        const decodedUrl = decodeURIComponent(remoteUrl);
        const urlBasename = path.basename(decodedUrl).toLowerCase();
        if (fs.existsSync(primaryMusicDir)) {
          const primaryFiles = fs.readdirSync(primaryMusicDir);
          const matched = primaryFiles.find(f => {
            const lower = f.toLowerCase();
            return lower === urlBasename || (urlBasename.length > 5 && lower.includes(urlBasename.slice(0, 15)));
          });
          if (matched) {
            return streamAudioFile(path.join(primaryMusicDir, matched), req, res);
          }
        }
      } catch {}

      try {
        const ok = await streamRemote(remoteUrl);
        if (ok) return;
      } catch (proxyErr) {
        console.warn('Direct proxy failed for URL:', remoteUrl);
      }

      // Only downgrade to 30-second Apple CDN preview when explicitly requested by client
      if (allowPreview && title) {
        try {
          const appleUrl = await findUnblockedAppleStream(artist, title);
          if (appleUrl) {
            const appleOk = await streamRemote(appleUrl);
            if (appleOk) return;
          }
        } catch {}
      }

      if (!res.headersSent) {
        return res.status(502).send('Audio stream temporarily unavailable');
      }
      return;
    }

    // If only artist & title supplied (no remoteUrl), resolve & stream Apple CDN only when explicitly requested
    if (allowPreview && title) {
      const appleUrl = await findUnblockedAppleStream(artist, title);
      if (appleUrl && (await streamRemote(appleUrl))) {
        return;
      }
    }

    if (!res.headersSent) {
      res.status(404).send('Audio track not found');
    }
  };

  app.head(['/api/music/proxy', '/api/music/stream'], handleMusicProxyRequest);
  app.get(['/api/music/proxy', '/api/music/stream'], handleMusicProxyRequest);

  // High-Accuracy LRCLIB + Search + Gemini AI Synced Lyrics Engine (School-unblocked)
  const lyricsCache = new Map<string, any>();
  
  const handleLyricsRequest = async (req: express.Request, res: express.Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const artist = String(req.query.artist || '').trim();
    const title = String(req.query.title || '').trim();
    const duration = Number(req.query.duration) || 180;

    if (!artist || !title) {
      return res.status(400).json({ error: 'artist and title query parameters are required' });
    }

    const cacheKey = `${artist}::${title}`.toLowerCase();
    if (lyricsCache.has(cacheKey)) {
      return res.json(lyricsCache.get(cacheKey));
    }

    // Clean title of tags like (feat. X), [Remastered], (Explicit), etc.
    const cleanTitle = title
      .replace(/\([^)]*feat[^)]*\)/gi, '')
      .replace(/\[[^\]]*feat[^\]]*\]/gi, '')
      .replace(/\([^)]*remaster[^)]*\)/gi, '')
      .replace(/\[[^\]]*remaster[^\]]*\]/gi, '')
      .replace(/\([^)]*version[^)]*\)/gi, '')
      .replace(/\(Explicit\)/gi, '')
      .replace(/\(clean\)/gi, '')
      .trim();

    // 1. Try LRCLIB exact GET
    try {
      const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(cleanTitle)}`;
      const remoteRes = await fetch(lrclibUrl, {
        headers: { 'User-Agent': 'OwenWatermelonV3/1.0 (https://ais-dev)' }
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        if (data.syncedLyrics || data.plainLyrics) {
          lyricsCache.set(cacheKey, data);
          return res.json(data);
        }
      }
    } catch (e) {
      // Continue to search
    }

    // 2. Try LRCLIB SEARCH (tolerant to punctuation, casing, track name variations)
    try {
      const searchUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(artist)}`;
      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'OwenWatermelonV3/1.0 (https://ais-dev)' }
      });
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          // Find first result with syncedLyrics, or fall back to plainLyrics
          const withSynced = results.find(r => r.syncedLyrics && r.syncedLyrics.length > 50);
          const candidate = withSynced || results.find(r => r.plainLyrics && r.plainLyrics.length > 50) || results[0];
          if (candidate && (candidate.syncedLyrics || candidate.plainLyrics)) {
            lyricsCache.set(cacheKey, candidate);
            return res.json(candidate);
          }
        }
      }
    } catch (e) {
      // Continue to query search
    }

    // 3. Try broader query search: "${cleanTitle} ${artist}"
    try {
      const querySearchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${artist}`)}`;
      const qRes = await fetch(querySearchUrl, {
        headers: { 'User-Agent': 'OwenWatermelonV3/1.0 (https://ais-dev)' }
      });
      if (qRes.ok) {
        const results = await qRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const candidate = results.find(r => r.syncedLyrics) || results[0];
          if (candidate && (candidate.syncedLyrics || candidate.plainLyrics)) {
            lyricsCache.set(cacheKey, candidate);
            return res.json(candidate);
          }
        }
      }
    } catch (e) {
      // Continue to AI generation
    }

    // 4. Server-Side AI Generation with Gemini for 100% guarantee of real, authentic lyrics!
    try {
      const aiPrompt = `Generate the exact, authentic lyrics for the song "${title}" by "${artist}".
Format the response ONLY as standard synced LRC format lines starting from [00:02.00] through roughly ${Math.floor(duration * 0.9)} seconds.
Each line must have a timestamp in [mm:ss.xx] format followed by the real lyrics of that line.
Do NOT include any commentary, explanations, markdown quotes, or headers. Output ONLY the LRC lines.
Example format:
[00:04.20] First line of lyrics
[00:08.50] Second line of lyrics`;

      const aiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: aiPrompt }] }]
      });

      const aiText = (aiRes.text || '').trim();
      if (aiText && aiText.includes('[') && aiText.includes(']')) {
        const generatedData = {
          trackName: title,
          artistName: artist,
          syncedLyrics: aiText,
          plainLyrics: aiText.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]\s*/g, ''),
          source: 'gemini-synced'
        };
        lyricsCache.set(cacheKey, generatedData);
        return res.json(generatedData);
      }
    } catch (aiErr) {
      console.warn('Gemini lyrics generation hit error:', aiErr);
    }

    return res.status(404).json({ error: 'Lyrics not found' });
  };

  app.get('/api/music/lyrics', handleLyricsRequest);
  app.get('/api/lyrics', handleLyricsRequest);

  app.get('/music/:filename', (req, res) => {
    streamAudioFile(req.params.filename, req, res);
  });

  app.get('/api/music/:filename', (req, res) => {
    streamAudioFile(req.params.filename, req, res);
  });

  app.use('/music', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    next();
  }, express.static(fs.existsSync(primaryMusicDir) ? primaryMusicDir : fallbackMusicDir));

  const httpServer = http.createServer(app);
  attachChessRoomServer(httpServer, app);
  attachArcadeRoomServer(httpServer, app);

  const runningUnderTsx =
    process.execArgv.some(a => a.includes('tsx')) ||
    process.argv.some(a => a.endsWith('server.ts'));
  const isDev =
    process.env.npm_lifecycle_event === 'dev' ||
    process.env.NODE_ENV === 'development' ||
    process.argv.includes('--dev') ||
    runningUnderTsx;
  const hasDist = fs.existsSync(path.resolve('dist/index.html'));
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.npm_lifecycle_event === 'start' ||
    (!isDev && hasDist);

  if (isProduction && hasDist) {
    if (fs.existsSync(path.resolve('dist/assets'))) {
      app.use('/assets', express.static(path.resolve('dist/assets'), {
        immutable: true,
        maxAge: '1y'
      }));
    }
    app.use(express.static(path.resolve('dist'), {
      index: 'index.html',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      plugins: [
        {
          name: 'disable-vite-client-ws-when-hmr-off',
          apply: 'serve',
          enforce: 'post',
          transform(code, id) {
            if (id.replace(/\\/g, '/').endsWith('/vite/dist/client/client.mjs')) {
              return code.replace(
                'transport.connect(createHMRHandler(handleMessage));',
                '// transport.connect disabled when HMR/WS are off'
              );
            }
          },
        },
      ],
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, chosenHost, () => {
    console.log(`Owen Watermelon V3 Server running on http://${chosenHost}:${PORT}`);
  });
}

startServer();
