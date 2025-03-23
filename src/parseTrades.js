import Papa from 'papaparse';

/**
 * Parses executed trades ("fill" status) from CSV text.
 * Returns: Array of { time, price, side, symbol } which matches the needed data to draw an arrow
 */

export const parseTradesCSV = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const trades = result.data.reduce((acc, row) => {
          const status = row.status?.toLowerCase();
          const side = row.side?.toLowerCase();
          const price = parseFloat(row.price);
          const time = Math.floor(new Date(row.time).getTime() / 1000);

          if (
            status === 'fill' &&
            (side === 'buy' || side === 'sell') &&
            !isNaN(price)
          ) {
            acc.push({ time, price, side, symbol: row.symbol || '' });
          }

          return acc;
        }, []);
        resolve(trades);
      },
      error: reject,
    });
  });
};


/*
should return an array like this:
[
  {
    time: 1707300075,
    price: 68.319,
    side: "buy",
    symbol: "NVDA"
  },
  {
    time: 1707300080,
    price: 144.76,
    side: "sell",
    symbol: "GOOGL"
  },
  // ...
]
*/
