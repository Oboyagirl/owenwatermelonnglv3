import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import https from 'https';
import http from 'http';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  // Unblock Proxy Endpoint - Routes external games through server so school filters (Securly, GoGuardian) cannot block them
  app.get('/api/proxy', (req, res) => {
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      }, (proxyRes) => {
        // Follow redirects
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          const redirectUrl = new URL(proxyRes.headers.location, targetUrl).href;
          return res.redirect(`/api/proxy?url=${encodeURIComponent(redirectUrl)}`);
        }

        res.status(proxyRes.statusCode || 200);
        const contentType = proxyRes.headers['content-type'] || '';
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        // Strip blocking headers to allow iframe embedding anywhere
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Cross-Origin-Embedder-Policy');
        res.removeHeader('Cross-Origin-Opener-Policy');

        if (contentType.includes('text/html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          let body = '';
          proxyRes.setEncoding('utf-8');
          proxyRes.on('data', chunk => {
            body += chunk;
          });
          proxyRes.on('end', () => {
            // Determine baseHref for subresources
            let baseHref = targetUrl;
            if (targetUrl.includes('ubghyper.github.io/GameList.github.io/')) {
              const gameMatch = targetUrl.match(/GameList\.github\.io\/([^/]+)/);
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
            // Neutralize frame buster scripts so games cannot escape iframe
            modified = modified.replace(/window\.top\.location/g, 'window.__disabled_top_location');
            modified = modified.replace(/top\.location\.href/g, 'window.__disabled_top_href');

            // CRITICAL FOR SECURLY: Rewrite Ruffle scripts and assets to open-source jsDelivr CDN
            modified = modified.replace(/https?:\/\/ubghyper\.github\.io\/GameList\.github\.io\/ruffle\/ruffle\.js/g, 'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle');
            modified = modified.replace(/"ruffle\/ruffle\.js"/g, '"https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle"');
            modified = modified.replace(/'ruffle\/ruffle\.js'/g, "'https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle'");
            modified = modified.replace(/https?:\/\/ubghyper\.github\.io\/GameList\.github\.io\//g, 'https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/');
            modified = modified.replace(/https?:\/\/ubghyper\.github\.io\//g, 'https://cdn.jsdelivr.net/gh/UBGHyper/');
            modified = modified.replace(/https?:\/\/flyingsully\.github\.io\/GameList\.github\.io\//g, 'https://cdn.jsdelivr.net/gh/UBGHyper/GameList.github.io@main/');

            // Upstream fix for The Binding of Isaac which incorrectly pointed to super smash flash 2
            if (targetUrl.toLowerCase().includes('binding-of-isaac') || targetUrl.toLowerCase().includes('the-binding-of-isaac')) {
              modified = modified.replace(/super-smash-flash-2\.swf/g, 'thebindingofissac.swf');
            }

            if (/<head[^>]*>/i.test(modified)) {
              modified = modified.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);
            } else {
              modified = baseTag + modified;
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
        res.status(502).send('Proxy error: ' + err.message);
      });
    } catch (err: any) {
      res.status(400).send('Invalid URL: ' + err.message);
    }
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
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Owen Watermelon V3 Server running on port ${PORT}`);
  });
}

startServer();
