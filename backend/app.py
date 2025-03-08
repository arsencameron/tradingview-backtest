import csv
import json


app = Flask(__name__)

# this method is gonna grab the csv file and convert it into json
def convert_csv_to_json(file):
    keys = ["time", "strategy", "identifier", "symbol", "side", "type", "status", "multiplier",
            "time_in_force", "asset.right", "asset.strike", "asset.multiplier", "asset.expiration",
            "asset.asset_type", "price", "filled_quantity", "trade_cost"]

    reader = csv.DictReader(file, fieldnames=keys)
    json_data = [{"time": row["time"], "value": float(row["price"] or 0)} for row in reader] # only want time and price for now
    return json.dumps(json_data, indent=2)

if __name__ == "__main__":
    app.run(debug=True)