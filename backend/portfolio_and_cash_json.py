import csv
import json

def convert_csv_to_json(file_path):
  portfolio_data = []
  cash_data = []
  
  with open(file_path, "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
      portfolio_data.append({"datetime": row["datetime"], "portfolio_value": float(row["portfolio_value"] or 0)})
      cash_data.append({"datetime": row["datetime"], "cash": float(row["cash"] or 0)})

  portfolio_json = json.dumps(portfolio_data, indent=2)
  cash_json = json.dumps(cash_data, indent=2)

  return portfolio_json, cash_json
