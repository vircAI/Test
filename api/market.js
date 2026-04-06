import yahooFinance from 'yahoo-finance2';

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
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const allSymbols = [...INDEXES, ...STOCKS];
    const quotes = await Promise.all(allSymbols.map(async (item) => {
      const quote = await getQuote(item.symbol);
      return quote
        ? { ...quote, name: item.name, type: INDEXES.find(i => i.symbol === item.symbol) ? 'index' : 'stock' }
        : null;
    }));

    res.json({
      indexes: quotes.filter(q => q && q.type === 'index'),
      stocks: quotes.filter(q => q && q.type === 'stock'),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
