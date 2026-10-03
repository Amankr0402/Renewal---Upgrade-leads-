// Client-side Database Sync with Vercel Postgres / Neon

export async function fetchRemoteNotes() {
  try {
    const res = await fetch('/api/notes');
    if (!res.ok) return { dbConnected: false, notes: [] };
    const data = await res.json();
    return data;
  } catch (err) {
    return { dbConnected: false, notes: [] };
  }
}

export async function saveRemoteNote(subscriberId, note) {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: note.id,
        subscriberId: subscriberId,
        text: note.text,
        author: note.author,
        authorEmail: note.authorEmail,
        authorRole: note.authorRole,
        tag: note.tag,
        timestamp: note.timestamp
      })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function deleteRemoteNote(noteId) {
  try {
    const res = await fetch(`/api/notes?id=${encodeURIComponent(noteId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) return false;
    return true;
  } catch (err) {
    return false;
  }
}
