import yahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const result = await yahooFinance.search(q);
    const hits = (result.quotes || [])
      .filter(r => r.quoteType === 'EQUITY' || r.quoteType === 'INDEX' || r.quoteType === 'ETF')
      .slice(0, 8)
      .map(r => ({ symbol: r.symbol, name: r.shortname || r.longname || r.symbol, type: r.quoteType }));
    res.json(hits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
