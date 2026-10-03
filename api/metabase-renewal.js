import https from 'node:https';

function fetchCsvWithRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/csv,text/plain,*/*'
      }
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let nextUrl = res.headers.location;
        if (!nextUrl.startsWith('http')) {
          const u = new URL(url);
          nextUrl = u.origin + nextUrl;
        }
        return resolve(fetchCsvWithRedirect(nextUrl, maxRedirects - 1));
      }

      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    const csvUrl = 'https://metabase-bkp.theelefant.ai/public/question/46d8e6e4-4bc2-43c5-93b0-03d1a05c6ce6.csv';
    const csvData = await fetchCsvWithRedirect(csvUrl);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).send(csvData);
  } catch (err) {
    console.error('Vercel API Renewal Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
}
