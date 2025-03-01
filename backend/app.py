from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
import json

print(flask_cors.__version__)


app = Flask(__name__)

# this method is gonna grab the csv file and convert it into json
def convert_csv_to_json(file):
    keys = ["time", "strategy", "identifier", "symbol", "side", "type", "status", "multiplier",
            "time_in_force", "asset.right", "asset.strike", "asset.multiplier", "asset.expiration",
            "asset.asset_type", "price", "filled_quantity", "trade_cost"]

    reader = csv.DictReader(file, fieldnames=keys)
    json_data = [{"time": row["time"], "value": float(row["price"] or 0)} for row in reader] # only want time and price for now
    return json.dumps(json_data, indent=2)

@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    json_data = convert_csv_to_json(file)
    return jsonify(json.loads(json_data))

if __name__ == "__main__":
    app.run(debug=True)