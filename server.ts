import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import https from 'https';
import http from 'http';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
            // Inject base tag right after head to resolve relative assets
            const baseTag = `<base href="${targetUrl}">`;
            let modified = body;
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
