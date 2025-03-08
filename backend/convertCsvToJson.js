const fs = require('fs');
const csv = require('csv-parser');

function convertCsvToJson(filePath) {
  const keys = ["time", "strategy", "identifier", "symbol", "side", "type", "status", "multiplier",
                "time_in_force", "asset.right", "asset.strike", "asset.multiplier", "asset.expiration",
                "asset.asset_type", "price", "filled_quantity", "trade_cost"];
  
  let jsonData = [];

  fs.createReadStream(filePath)
    .pipe(csv({ headers: keys }))
    .on('data', (row) => {
      jsonData.push({ time: row.time, value: parseFloat(row.price || 0) });
    })
    .on('end', () => {
      console.log(JSON.stringify(jsonData, null, 2));
    });
}

// Usage
const filePath = './BullCallSpreadPLTR_2025-02-10_19-32_jQXFGf_trades.csv'; // replace with your CSV file path
convertCsvToJson(filePath);