import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
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

  // AI Chatbot Endpoint for WatermelonBase
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, message } = req.body;

      let contents: any[] = [];
      if (Array.isArray(messages) && messages.length > 0) {
        contents = messages.map(m => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(m.content || m.text || '') }]
        }));
      } else if (message) {
        contents = [{ role: 'user', parts: [{ text: String(message) }] }];
      } else {
        return res.status(400).json({ error: 'No message provided' });
      }

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: `You are "MelonBot" (Watermelon AI), the official, high-energy, super-smart AI assistant for WatermelonBase (Owen Watermelon V3 Arcade).
You know all about our catalog of 830+ unblocked games, including:
- Sports & Random games: Soccer Random, Volley Random, Basket Random, Boxing Random, Retro Bowl, Basketball Stars, 8-Ball Pool.
- Tower Defence: Bloons Tower Defence 1, 2, 3, 4, 5.
- Restaurant Management: The complete Papa's series (Pizzeria, Burgeria, Freezeria, Cupcakeria, Cheeseria, Donuteria, Hot Doggeria, Pancakeria, Pastaria, Scooperia, Sushiria, Taco Mia, Bakeria, Wingeria, Papa Louie 1-3).
- Action & Arcade: Fruit Ninja, Slope, 1v1.lol, Drive Mad, Subway Surfers, BitLife, FNAF 1-4, Eaglercraft (Minecraft), Cookie Clicker, Getting Over It, Drift Hunters, Run 3.
- Owen OGs: Watermelon Merge (Suika), Cyber Snake, Breakout, Flappy Melon, Cyber Pong.

Your job:
1. Provide awesome, personalized game recommendations based on what the user feels like playing.
2. Share tips, strategies, secret mechanics, and high-score guides.
3. Help users understand WatermelonBase features like the Tab Cloaker (camouflaging tabs as Google Classroom or Docs) and Theme Customizer.
4. Keep answers friendly, snappy, fun, and easy to read using Markdown (bold text, lists, and emojis). Always be enthusiastic about gaming!`
          }
        });
        responseText = response.text || '';
      } catch (primaryErr) {
        console.warn('Primary model hit issue, trying gemini-flash-latest fallback:', primaryErr);
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction: 'You are MelonBot, the energetic AI assistant for WatermelonBase unblocked games. Help with recommendations, strategies, and tips in friendly Markdown with emojis!'
          }
        });
        responseText = fallbackRes.text || '';
      }

      const reply = responseText || "Hello from WatermelonBase! How can I help you game today?";
      res.json({ reply });
    } catch (err: any) {
      console.error('Error generating AI chat response:', err);
      res.json({ 
        reply: "🍉 **MelonBot Quick Answer**: WatermelonBase has over 830+ unblocked games ready to play!\n\nTop picks for today:\n- **Watermelon Merge**: Build up to the giant watermelon!\n- **Soccer Random & Basket Random**: Ridiculous ragdoll sports fun.\n- **Bloons TD 5 & Papa's Freezeria**: Timeless strategy & cozy classics.\n\nAsk me anything specific about game strategies, secret controls, or the stealth Tab Cloaker!" 
      });
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

  // Unblock Proxy Endpoint - Routes external websites and games through server so school filters (Securly, GoGuardian) cannot block them
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
