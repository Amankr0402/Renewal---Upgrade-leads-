import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

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

        // Notes API Handler (Vercel Postgres if env present, or local notes_db.json)
        server.middlewares.use('/api/notes', async (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end();
          }

          const notesFile = path.resolve('notes_db.json');
          const getLocalNotes = () => {
            try {
              if (fs.existsSync(notesFile)) {
                return JSON.parse(fs.readFileSync(notesFile, 'utf8'));
              }
            } catch (e) {}
            return [];
          };
          const saveLocalNotes = (notes) => {
            try {
              fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2), 'utf8');
            } catch (e) {}
          };

          const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

          // If Vercel Postgres URL is configured
          if (dbUrl) {
            try {
              const { neon } = await import('@neondatabase/serverless');
              const sql = neon(dbUrl);
              await sql`
                CREATE TABLE IF NOT EXISTS subscriber_notes (
                  id VARCHAR(255) PRIMARY KEY,
                  subscriber_id VARCHAR(255) NOT NULL,
                  text TEXT NOT NULL,
                  author_name VARCHAR(255) NOT NULL,
                  author_email VARCHAR(255),
                  author_role VARCHAR(100),
                  tag VARCHAR(100),
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                  created_at_text VARCHAR(100)
                );
              `;

              if (req.method === 'GET') {
                const rows = await sql`
                  SELECT id, subscriber_id, text, author_name AS author, author_email AS "authorEmail", author_role AS "authorRole", tag, created_at_text AS timestamp, created_at
                  FROM subscriber_notes ORDER BY created_at DESC;
                `;
                return res.end(JSON.stringify({ dbConnected: true, count: rows.length, notes: rows, storage: 'Vercel Postgres (Live Database)' }));
              }

              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                  try {
                    const data = JSON.parse(body || '{}');
                    const noteId = data.id || `note-${Date.now()}`;
                    await sql`
                      INSERT INTO subscriber_notes (id, subscriber_id, text, author_name, author_email, author_role, tag, created_at_text)
                      VALUES (${noteId}, ${data.subscriberId}, ${data.text}, ${data.author || 'Aman Soni'}, ${data.authorEmail || 'aman.soni@theelefant.ai'}, ${data.authorRole || 'Super Admin'}, ${data.tag || 'Note'}, ${data.timestamp || new Date().toLocaleString('en-IN')})
                      ON CONFLICT (id) DO UPDATE SET text = EXCLUDED.text;
                    `;
                    res.statusCode = 201;
                    return res.end(JSON.stringify({ success: true, dbConnected: true, storage: 'Vercel Postgres (Live Database)', note: data }));
                  } catch (e) {
                    res.statusCode = 500;
                    return res.end(JSON.stringify({ error: e.message }));
                  }
                });
                return;
              }
            } catch (errDb) {
              console.warn('[Vercel Postgres Local Proxy fallback]', errDb.message);
            }
          }

          // Local file storage mode
          if (req.method === 'GET') {
            const notes = getLocalNotes();
            return res.end(JSON.stringify({ 
              dbConnected: false, 
              count: notes.length, 
              notes, 
              storage: 'Local Database (notes_db.json & Browser)',
              instruction: 'When deployed to Vercel, connects automatically to Vercel Postgres.'
            }));
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body || '{}');
                const notes = getLocalNotes();
                const existingIdx = notes.findIndex(n => n.id === data.id);
                if (existingIdx >= 0) {
                  notes[existingIdx] = data;
                } else {
                  notes.unshift(data);
                }
                saveLocalNotes(notes);
                res.statusCode = 201;
                return res.end(JSON.stringify({ 
                  success: true, 
                  dbConnected: false, 
                  storage: 'Local Database (notes_db.json)', 
                  note: data 
                }));
              } catch (e) {
                res.statusCode = 500;
                return res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }

          if (req.method === 'DELETE') {
            const urlObj = new URL(req.url, 'http://localhost');
            const noteId = urlObj.searchParams.get('id');
            const notes = getLocalNotes().filter(n => n.id !== noteId);
            saveLocalNotes(notes);
            return res.end(JSON.stringify({ success: true, message: 'Note deleted' }));
          }
        });
      }
    }
  ]
});
