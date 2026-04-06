import yahooFinance from 'yahoo-finance2';

const periodMap = {
  '1D': { offsetDays: 1, interval: '5m' },
  '1W': { offsetDays: 7, interval: '1d' },
  '1M': { offsetMonths: 1, interval: '1d' },
  '3M': { offsetMonths: 3, interval: '1d' },
  '1Y': { offsetYears: 1, interval: '1wk' },
  '5Y': { offsetYears: 5, interval: '1mo' },
};

function getPeriod1(config) {
  const d = new Date();
  if (config.offsetDays) d.setDate(d.getDate() - config.offsetDays);
  if (config.offsetMonths) d.setMonth(d.getMonth() - config.offsetMonths);
  if (config.offsetYears) d.setFullYear(d.getFullYear() - config.offsetYears);
  return d;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  const period = req.query.period || '1M';
  const config = periodMap[period] || periodMap['1M'];

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: getPeriod1(config),
      interval: config.interval,
    });
    const data = result.quotes
      .map(q => ({
        date: new Date(q.date).toISOString(),
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume,
      }))
      .filter(q => q.close != null);

    res.json({ symbol, period, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
