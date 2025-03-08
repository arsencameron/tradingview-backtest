import pandas as pd
import json

def convert_tearsheet_to_json(csvFileName):
    df = pd.read_csv(csvFileName)
    json_data = df.to_dict(orient="records")

    json_file = csvFileName[:-4] + ".json"

    with open(json_file, "w") as json_data:
        json.dump(json_data, json_file, indent = 4)
    
    print("Finished creating File")
