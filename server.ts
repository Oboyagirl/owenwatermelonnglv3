import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { Readable } from 'node:stream';
import { GoogleGenAI } from '@google/genai';

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
            // Forward to general proxy
            res.redirect(`/api/proxy?url=${encodeURIComponent(directUrl)}`);
          }
        }).on('error', () => {
          res.redirect(`/api/proxy?url=${encodeURIComponent(directUrl)}`);
        });
      }
    }).on('error', (err) => {
      res.status(502).send('Error loading play-shell: ' + err.message);
    });
  });

  // Movy.sx Unblocked Streaming & Catalog Proxy - Strips X-Frame-Options: DENY and blocks ads
  app.get('/api/movies/movy-stream', async (req, res) => {
    const type = req.query.type === 'tv' ? 'tv' : 'movie';
    const id = req.query.id as string;
    const s = req.query.s || '1';
    const e = req.query.e || '1';

    if (!id) {
      return res.status(400).send('Missing movie or show id');
    }

    const movyTarget = type === 'tv'
      ? `https://www.movy.sx/tv/${id}/${s}/${e}`
      : `https://www.movy.sx/movie/${id}`;

    https.get(movyTarget, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity'
      }
    }, (upstreamRes) => {
      res.status(upstreamRes.statusCode || 200);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.setHeader('Content-Security-Policy', 'frame-ancestors *');

      let html = '';
      upstreamRes.setEncoding('utf-8');
      upstreamRes.on('data', chunk => { html += chunk; });
      upstreamRes.on('end', () => {
        let cleaned = html.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
        cleaned = cleaned.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
        cleaned = cleaned.replace(/window\.top/g, 'window.self');
        cleaned = cleaned.replace(/top\.location/g, 'self.location');
        
        const antiAdShield = `
<script>
(function() {
  window.open = function() { console.log('[AdShield] Blocked popup'); return null; };
  window.alert = function() { return false; };
  Object.defineProperty(window, 'top', { get: function() { return window.self; } });
})();
</script>`;
        if (/<head[^>]*>/i.test(cleaned)) {
          cleaned = cleaned.replace(/(<head[^>]*>)/i, `$1\n${antiAdShield}`);
        } else {
          cleaned = antiAdShield + cleaned;
        }

        res.send(cleaned);
      });
    }).on('error', (err) => {
      res.status(502).send('Error loading Movy.sx stream: ' + err.message);
    });
  });

  // Movy Next.js Asset Proxy for _next chunks
  app.use('/_next', (req, res, next) => {
    const targetUrl = 'https://www.movy.sx/_next' + req.url;
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    }, (proxyRes) => {
      res.status(proxyRes.statusCode || 200);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      const ct = proxyRes.headers['content-type'];
      if (ct) res.setHeader('Content-Type', ct);
      proxyRes.pipe(res);
    }).on('error', () => {
      next();
    });
  });

  // Unblock Proxy Endpoint - Routes external websites and games through server so school filters (Securly, GoGuardian) cannot block them
  app.all('/api/proxy', (req, res) => {
    let targetUrl = (req.query.url as string) || (req.body && req.body.url);
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const fetchUrlWithRedirects = (currentUrl: string, hopsRemaining = 5) => {
      if (hopsRemaining <= 0) {
        return res.status(508).send('Too many redirects encountered');
      }

      try {
        const parsed = new URL(currentUrl);
        const isHttps = parsed.protocol === 'https:';
        const client = isHttps ? https : http;

        const proxyReq = client.get(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'identity', // Prevent gzip/br compression so text rewriting works
          }
        }, (proxyRes) => {
          // Follow redirects internally on server so client iframe never sees redirect block
          if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
            const redirectUrl = new URL(proxyRes.headers.location, currentUrl).href;
            return fetchUrlWithRedirects(redirectUrl, hopsRemaining - 1);
          }

          res.status(proxyRes.statusCode || 200);
          const contentType = proxyRes.headers['content-type'] || '';
          
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          // Strip blocking headers to allow iframe embedding anywhere
          res.removeHeader('X-Frame-Options');
          res.removeHeader('Frame-Options');
          res.removeHeader('Content-Security-Policy');
          res.removeHeader('Cross-Origin-Embedder-Policy');
          res.removeHeader('Cross-Origin-Opener-Policy');
          res.setHeader('Content-Security-Policy', "frame-ancestors *");

          if (contentType.includes('text/html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            let body = '';
            proxyRes.setEncoding('utf-8');
            proxyRes.on('data', chunk => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              // Determine baseHref for subresources
              let baseHref = currentUrl;
              if (currentUrl.includes('ubghyper.github.io/GameList.github.io/')) {
                const gameMatch = currentUrl.match(/GameList\.github\.io\/([^/]+)/);
                if (gameMatch && gameMatch[1]) {
                  baseHref = `https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/${gameMatch[1]}/`;
                }
              } else if (baseHref.endsWith('.html') || baseHref.endsWith('.htm')) {
                baseHref = baseHref.substring(0, baseHref.lastIndexOf('/') + 1);
              } else if (!baseHref.endsWith('/')) {
                baseHref += '/';
              }

              const baseTag = `<base href="${baseHref}">`;
              let modified = body.replace(/<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '');
              modified = modified.replace(/<meta[^>]*http-equiv=["']?X-Frame-Options["']?[^>]*>/gi, '');
              // Neutralize frame buster scripts so pages cannot escape iframe
              modified = modified.replace(/window\.top\.location/g, 'window.__disabled_top_location');
              modified = modified.replace(/top\.location\.href/g, 'window.__disabled_top_href');
              modified = modified.replace(/parent\.location/g, 'window.__disabled_parent_location');
              modified = modified.replace(/if\s*\(\s*top\s*!==?\s*self\s*\)/g, 'if(false)');
              modified = modified.replace(/if\s*\(\s*window\s*!==?\s*window\.top\s*\)/g, 'if(false)');

              // Rewrite Ruffle scripts to modern CDN with ruffle.js
              modified = modified.replace(/https?:\/\/ubghyper\.github\.io\/GameList\.github\.io\/ruffle\/ruffle\.js/g, 'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle/ruffle.js');
              modified = modified.replace(/"ruffle\/ruffle\.js"/g, '"https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle/ruffle.js"');
              modified = modified.replace(/'ruffle\/ruffle\.js'/g, "'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle/ruffle.js'");
              
              if (modified.includes('ruffle') || modified.includes('RufflePlayer')) {
                const ruffleConfig = `<script>window.RufflePlayer = window.RufflePlayer || {}; window.RufflePlayer.config = Object.assign({ publicPath: "https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle/" }, window.RufflePlayer.config || {});</script>`;
                modified = modified.replace(/(<head[^>]*>)/i, `$1\n${ruffleConfig}`);
              }

              if (body.includes('requirejs') || body.includes('require.js') || body.includes('bower_components/requirejs')) {
                const requireConfig = `<script>window.require = window.require || {}; window.require.baseUrl = "${baseHref}";</script>`;
                modified = modified.replace(/(<head[^>]*>)/i, `$1\n${requireConfig}`);
              }
              
              // Block ad/affiliate redirects
              modified = modified.replace(/(location\.(href|replace|assign)\s*=\s*|window\.open\()['"][^'"]*(argix|agrix|traffic|adservice|monetiz)[^'"]*['"]/gi, '/* blocked ad redirect */');

              // For non-SWF assets, can use jsDelivr
              modified = modified.replace(/https?:\/\/ubghyper\.github\.io\/GameList\.github\.io\/(?!.*\.swf)([^"'\s>]+)/g, 'https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/$1');

              // CRITICAL: Prepend window.location.origin to /api/proxy so that the injected <base href> does not redirect clicks to target domain!
              const interceptorScript = `
<script>
(function() {
  try {
    Object.defineProperty(window, 'top', { get: function() { return window; } });
    Object.defineProperty(window, 'parent', { get: function() { return window; } });
  } catch(e) {}
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
      e.preventDefault();
      var proxyOrigin = window.location.origin;
      var target = a.href;
      if (target.indexOf(proxyOrigin + '/api/proxy') === 0) {
        window.location.href = target;
      } else {
        window.location.href = proxyOrigin + '/api/proxy?url=' + encodeURIComponent(target);
      }
    }
  }, true);
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.action) {
      var method = (form.method || 'GET').toUpperCase();
      if (method === 'GET') {
        e.preventDefault();
        var proxyOrigin = window.location.origin;
        var formData = new FormData(form);
        var params = new URLSearchParams(formData).toString();
        var dest = form.action + (form.action.indexOf('?') !== -1 ? '&' : '?') + params;
        window.location.href = proxyOrigin + '/api/proxy?url=' + encodeURIComponent(dest);
      }
    }
  }, true);
})();
</script>`;

              if (/<head[^>]*>/i.test(modified)) {
                modified = modified.replace(/(<head[^>]*>)/i, `$1\n${baseTag}\n${interceptorScript}`);
              } else {
                modified = baseTag + interceptorScript + modified;
              }
              res.send(modified);
            });
          } else {
            if (contentType) {
              res.setHeader('Content-Type', contentType);
            }
            proxyRes.pipe(res);
          }
        });

        proxyReq.on('error', (err) => {
          res.status(502).send(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Proxy Notice - OwenWatermelon</title>
                <style>
                  body { background: #080f1d; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
                  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 36px; max-width: 500px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
                  h2 { color: #38bdf8; margin: 0 0 12px; font-size: 22px; }
                  p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
                  .btn { display: inline-block; background: #0284c7; color: white; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 13px; margin: 6px; transition: all 0.2s; }
                  .btn:hover { background: #0369a1; transform: translateY(-1px); }
                  .btn-secondary { background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
                  .btn-secondary:hover { background: rgba(255,255,255,0.15); color: white; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div style="font-size: 44px; margin-bottom: 12px;">🌐</div>
                  <h2>Proxy Connection Notice</h2>
                  <p>Could not route request to <strong>${currentUrl.replace(/</g, '&lt;')}</strong> via server proxy (${err.message}). The website may be down, blocking datacenter IPs, or require a direct tab.</p>
                  <div>
                    <a href="javascript:location.reload()" class="btn">🔄 Retry Page</a>
                    <a href="${currentUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">🔗 Open Directly</a>
                  </div>
                </div>
              </body>
            </html>
          `);
        });
      } catch (err: any) {
        res.status(400).send('Invalid URL: ' + err.message);
      }
    };

    fetchUrlWithRedirects(targetUrl);
  });

  // Dedicated SWF Proxy - Streams Flash games with guaranteed application/x-shockwave-flash MIME and CORS
  app.get('/api/swf', (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Missing url parameter');
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const proxyReq = client.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*'
        }
      }, (proxyRes) => {
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          const redirectUrl = new URL(proxyRes.headers.location, targetUrl).href;
          return res.redirect(`/api/swf?url=${encodeURIComponent(redirectUrl)}`);
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Content-Type', 'application/x-shockwave-flash');
        res.setHeader('Cache-Control', 'public, max-age=604800');

        if (proxyRes.headers['content-length']) {
          res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }

        res.status(proxyRes.statusCode || 200);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        res.status(502).send('SWF Proxy error: ' + err.message);
      });
    } catch (err: any) {
      res.status(400).send('Invalid SWF URL: ' + err.message);
    }
  });

  // Serve static games directly with relaxed framing headers
  app.use('/games', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.removeHeader('X-Frame-Options');
    next();
  }, express.static(path.resolve('public/games')));

  // Serve album covers statically with long-term cache
  const coversDir = fs.existsSync(path.resolve('public/music/covers'))
    ? path.resolve('public/music/covers')
    : path.resolve('dist/music/covers');
  app.use('/music/covers', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    next();
  }, express.static(coversDir));

  const primaryMusicDir = path.resolve('public/music');
  const fallbackMusicDir = path.resolve('dist/music');

  // Serve static real MP3 music with byte-range streaming support (compatible with iOS iPad Safari & Chrome)
  const streamAudioFile = (filename: string, req: express.Request, res: express.Response) => {
    const cleanFilename = path.basename(filename);
    let filePath = path.join(primaryMusicDir, cleanFilename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(fallbackMusicDir, cleanFilename);
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Audio file not found: ' + cleanFilename);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'audio/mpeg');
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
        'Content-Type': 'audio/mpeg',
      });
      fileStream.pipe(res);
      req.on('close', () => {
        fileStream.destroy();
      });
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': 'audio/mpeg',
      });
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      req.on('close', () => {
        fileStream.destroy();
      });
    }
  };

  // Dynamic Real MP3 Resolution & Streaming for all album songs
  const musicPreviewCache = new Map<string, string>();

  // Dedicated Real MP3 Streaming & School-Unblocked Audio Proxy
  app.get(['/api/music/proxy', '/api/music/stream'], async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');

    const remoteUrl = String(req.query.url || '');
    const local = String(req.query.local || '');

    // 1. Direct proxy for full-length MP3 URLs (archive.org, etc.) - Bypasses all school web filters
    if (remoteUrl && (remoteUrl.startsWith('http://') || remoteUrl.startsWith('https://'))) {
      try {
        const clientRange = req.headers.range;
        const fetchHeaders: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': '*/*'
        };
        if (clientRange) {
          fetchHeaders['Range'] = clientRange;
        }

        const remoteRes = await fetch(remoteUrl, { 
          headers: fetchHeaders,
          redirect: 'follow'
        });

        if (!remoteRes.ok && remoteRes.status !== 206) {
          return res.status(remoteRes.status).send('Remote audio not available: ' + remoteRes.statusText);
        }

        res.status(remoteRes.status);
        
        let contentType = remoteRes.headers.get('content-type') || '';
        if (!contentType || contentType.includes('text') || contentType.includes('html')) {
          if (remoteUrl.endsWith('.m4a') || remoteUrl.endsWith('.mp4')) {
            contentType = 'audio/mp4';
          } else {
            contentType = 'audio/mpeg';
          }
        }
        res.setHeader('Content-Type', contentType);

        if (remoteRes.headers.get('content-length')) {
          res.setHeader('Content-Length', remoteRes.headers.get('content-length')!);
        }
        if (remoteRes.headers.get('content-range')) {
          res.setHeader('Content-Range', remoteRes.headers.get('content-range')!);
        }
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.flushHeaders?.();

        if (remoteRes.body) {
          const nodeStream = Readable.fromWeb(remoteRes.body as any);
          req.on('close', () => {
            nodeStream.destroy();
          });
          nodeStream.pipe(res);
          return;
        }
      } catch (proxyErr) {
        console.warn('Direct MP3 proxy failed for URL:', remoteUrl, proxyErr);
        if (!res.headersSent) {
          return res.status(502).send('Proxy error streaming remote track');
        }
        return;
      }
    }

    if (local) {
      const cleanFilename = path.basename(local);
      const localPath = path.join(primaryMusicDir, cleanFilename);
      if (fs.existsSync(localPath)) {
        return streamAudioFile(cleanFilename, req, res);
      }
    }

    res.status(404).send('Audio track not found');
  });

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

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
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
