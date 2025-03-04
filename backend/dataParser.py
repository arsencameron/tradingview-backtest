import pandas as pd
import os

file_path = "data/testData.csv"

if os.path.exists(file_path):
    print("File exists!")
else:
    print("File not found!")

# Read from the test CSV file 
df = pd.read_csv(file_path)

# Extract the 'time' and 'price' columns
df_extracted = df[["time", "price"]] 

json_data = df_extracted.to_json(orient="records", date_format="iso")

with open("data/output.json", "w") as file: 
    file.write(json_data)
