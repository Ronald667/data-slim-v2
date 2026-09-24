export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) return res.status(400).send('No url');
  try {
    const r = await fetch(target, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const text = await r.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html');
    res.send(text);
  } catch (e) {
    res.status(500).send('Failed: ' + e.message);
  }
}
