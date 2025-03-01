import { useState } from "react";
import { uploadCSV } from "../utils/api";
import ChartComponent from "./ChartComponent";

function FileUpload() {
  const [chartData, setChartData] = useState([]);

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const jsonData = await uploadCSV(file);
      setChartData(jsonData);
    }
  }

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {chartData.length > 0 && <ChartComponent data={chartData} />}
    </div>
  );
}

export default FileUpload;