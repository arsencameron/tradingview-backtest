from flask import Flask, jsonify
import pandas as pd
import json
app = Flask(__name__)


@app.route("/api/data", methods=["GET"])
def get_data():
    df = pd.read_csv("BullCallSpreadPLTR_2025-02-10_19-32_jQXFGf_tearsheet.csv")

    df.columns = df.columns.str.strip()

    # Filter the rows based on the "Metric" column
    selected_metrics = [
        "Total Return",
        "CAGR% (Annual Return)",
        "Max Drawdown",
        "Sortino",
        "Sharpe",
    ]
    df_filtered = df[df["Metric"].isin(selected_metrics)]
    df_filtered.dropna(how="all", inplace=True)

    json_data = df_filtered.to_dict(orient="records")

    with open("tearsheet_data.json", "w") as json_file:
        json.dump(json_data, json_file, indent=4)

    # Return the JSON response
    return jsonify(json_data)


if __name__ == "__main__":
    app.run(debug=True)
