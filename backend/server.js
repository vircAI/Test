import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Suppress Yahoo Finance survey notice
if (typeof yahooFinance.suppressNotices === 'function') {
  yahooFinance.suppressNotices(['yahooSurvey']);
}

const INDEXES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^RUT', name: 'Russell 2000' },
  { symbol: '^VIX', name: 'VIX' },
];

const STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'JPM', name: 'JPMorgan' },
  { symbol: 'BRK-B', name: 'Berkshire' },
  { symbol: 'V', name: 'Visa' },
];

async function getQuote(symbol) {
  try {
    const result = await yahooFinance.quote(symbol);
    return {
      symbol: result.symbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
      open: result.regularMarketOpen,
      high: result.regularMarketDayHigh,
      low: result.regularMarketDayLow,
      volume: result.regularMarketVolume,
      marketCap: result.marketCap,
      previousClose: result.regularMarketPreviousClose,
    };
  } catch (err) {
    console.error(`Error fetching ${symbol}:`, err.message);
    return null;
  }
}

async function getHistory(symbol, period) {
  const periodMap = {
    '1D': { period1: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })(), interval: '5m' },
    '1W': { period1: (() => { const d = new Date(); d.setDate(d.getDate() - 7); return d; })(), interval: '1d' },
    '1M': { period1: (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; })(), interval: '1d' },
    '3M': { period1: (() => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; })(), interval: '1d' },
    '1Y': { period1: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d; })(), interval: '1wk' },
    '5Y': { period1: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 5); return d; })(), interval: '1mo' },
  };

  const { period1, interval } = periodMap[period] || periodMap['1M'];
  try {
    const result = await yahooFinance.chart(symbol, {
      period1,
      interval,
    });
    return result.quotes.map(q => ({
      date: new Date(q.date).toISOString(),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume,
    })).filter(q => q.close != null);
  } catch (err) {
    console.error(`Error fetching history for ${symbol}:`, err.message);
    return [];
  }
}

// GET /api/market - all indexes + stocks quotes
app.get('/api/market', async (req, res) => {
  try {
    const allSymbols = [...INDEXES, ...STOCKS];
    const quotes = await Promise.all(allSymbols.map(async (item) => {
      const quote = await getQuote(item.symbol);
      return quote ? { ...quote, name: item.name, type: INDEXES.find(i => i.symbol === item.symbol) ? 'index' : 'stock' } : null;
    }));

    res.json({
      indexes: quotes.filter(q => q && q.type === 'index'),
      stocks: quotes.filter(q => q && q.type === 'stock'),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:symbol?period=1M
app.get('/api/history/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const period = req.query.period || '1M';
  try {
    const data = await getHistory(symbol, period);
    res.json({ symbol, period, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search?q=query
app.get('/api/search', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Stock dashboard API running on http://localhost:${PORT}`);
});
