from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)


@app.route("/api/data", methods=["GET"])
def get_data():
    df = pd.read_csv("backend\BullCallSpreadPLTR_2025-02-10_19-32_jQXFGf_tearsheet.csv")

    df.dropna(how="all", inplace=True)

    json_data = df.to_dict(orient="records")

    return jsonify(json_data)


if __name__ == "__main__":
    app.run(debug=True)
