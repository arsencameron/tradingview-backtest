import Papa from 'papaparse';

/*
Parse {timestamp, value, name, detail_text, color, symbol} from indicator.csv file
*/

export const parseIndicatorsCSV = (csvText) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const indicators = result.data.reduce((acc, row) => {
          const{timestamp, value, name, detail_text, color, symbol} = row;

          const time = Math.floor(parseFloat(timestamp));
          if (!isNaN(time)) {
            acc.push({time, value: parseFloat(value), name, detail_text, color, symbol});
          }

          return acc;
        }, []);

        resolve(indicators);
      },
      error: reject,
    });
  });
};


/*
sample return:
[
  {
    time: 1724875020,
    value: 3.1654159894424856,
    name: "TRIN",
    detail_text: "Value: 3.1654159894424856",
    color: "blue",
    symbol: "circle"
  },
  {
    time: 1725047820,
    value: 2.3098366117394424,
    name: "TRIN",
    detail_text: "Value: 2.3098366117394424",
    color: "blue",
    symbol: "circle"
  },
  {
    time: 1725220620,
    value: 0.900038719285535,
    name: "TRIN",
    detail_text: "Value: 0.900038719285535",
    color: "blue",
    symbol: "circle"
  }
]
*/
                            
