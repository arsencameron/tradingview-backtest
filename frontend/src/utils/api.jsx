export async function uploadCSV(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });
  
    return response.json();
  }