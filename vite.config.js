import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function fetchCsv(url) {
  return new Promise((resolve, reject) => {
    function getWithRedirect(targetUrl, maxRedirects = 5) {
      if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/csv,text/plain,*/*'
        }
      };
      
      const req = https.get(targetUrl, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let nextUrl = res.headers.location;
          if (!nextUrl.startsWith('http')) {
            const u = new URL(targetUrl);
            nextUrl = u.origin + nextUrl;
          }
          return getWithRedirect(nextUrl, maxRedirects - 1);
        }
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
    }

    getWithRedirect(url);
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'metabase-dual-live-endpoints',
      configureServer(server) {
        // Upgrade Endpoint
        server.middlewares.use('/api/metabase-live', async (req, res) => {
          try {
            console.log('[Metabase API] Fetching live Upgrades data...');
            const url = 'https://metabase-bkp.theelefant.ai/public/question/8f167047-f200-4aa7-b56a-f7ff2964eaa7.csv';
            const csvData = await fetchCsv(url);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-store');
            res.end(csvData);
          } catch (err) {
            console.error('[Metabase API] Error fetching upgrades:', err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });

        // Renewal Endpoint
        server.middlewares.use('/api/metabase-renewal', async (req, res) => {
          try {
            console.log('[Metabase API] Fetching live Renewals data...');
            const url = 'https://metabase-bkp.theelefant.ai/public/question/46d8e6e4-4bc2-43c5-93b0-03d1a05c6ce6.csv';
            const csvData = await fetchCsv(url);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Cache-Control', 'no-store');
            res.end(csvData);
          } catch (err) {
            console.error('[Metabase API] Error fetching renewals:', err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      }
    }
  ]
});
