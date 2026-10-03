import { neon } from '@neondatabase/serverless';

function getDb() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

export default async function handler(req, res) {
  const sql = getDb();

  // If Postgres environment variable is not configured yet, notify gracefully
  if (!sql) {
    return res.status(200).json({ 
      dbConnected: false, 
      message: 'Vercel Postgres not configured yet. Operating in local state mode.',
      notes: [] 
    });
  }

  try {
    // 1. Ensure Table Exists
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

    // 2. Handle GET: Fetch all notes
    if (req.method === 'GET') {
      const rows = await sql`
        SELECT 
          id, 
          subscriber_id, 
          text, 
          author_name AS author, 
          author_email AS "authorEmail", 
          author_role AS "authorRole", 
          tag, 
          created_at_text AS timestamp,
          created_at
        FROM subscriber_notes 
        ORDER BY created_at DESC;
      `;

      return res.status(200).json({ 
        dbConnected: true, 
        count: rows.length, 
        notes: rows 
      });
    }

    // 3. Handle POST: Insert a new note
    if (req.method === 'POST') {
      const { id, subscriberId, text, author, authorEmail, authorRole, tag, timestamp } = req.body || {};

      if (!subscriberId || !text) {
        return res.status(400).json({ error: 'subscriberId and text are required' });
      }

      const noteId = id || `note-${Date.now()}`;
      const noteAuthor = author || 'Sales Agent';
      const noteTime = timestamp || new Date().toLocaleString('en-IN');

      await sql`
        INSERT INTO subscriber_notes (
          id, 
          subscriber_id, 
          text, 
          author_name, 
          author_email, 
          author_role, 
          tag, 
          created_at_text
        )
        VALUES (
          ${noteId}, 
          ${subscriberId}, 
          ${text}, 
          ${noteAuthor}, 
          ${authorEmail || ''}, 
          ${authorRole || 'Sales Executive'}, 
          ${tag || 'Note'}, 
          ${noteTime}
        )
        ON CONFLICT (id) DO UPDATE SET
          text = EXCLUDED.text,
          author_name = EXCLUDED.author_name,
          author_email = EXCLUDED.author_email,
          tag = EXCLUDED.tag;
      `;

      return res.status(201).json({ 
        success: true, 
        message: 'Note saved in Vercel Postgres', 
        note: {
          id: noteId,
          subscriberId,
          text,
          author: noteAuthor,
          authorEmail,
          authorRole,
          tag,
          timestamp: noteTime
        }
      });
    }

    // 4. Handle DELETE: Remove a note
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Note ID is required' });
      }

      await sql`DELETE FROM subscriber_notes WHERE id = ${id};`;
      return res.status(200).json({ success: true, message: 'Note deleted from Vercel Postgres' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (err) {
    console.error('Vercel Postgres Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
