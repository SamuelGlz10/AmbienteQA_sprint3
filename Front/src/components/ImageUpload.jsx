import React, { useState } from "react";

const ImageUpload = ({ projectId }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // URL del backend
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guardar el archivo seleccionado
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId); // Pasar el ID del proyecto
    formData.append("file", file); // Pasar el archivo seleccionado

    try {
      const response = await fetch(`${BACKEND_URL}/projectsFB/uploadImage`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("Imagen subida con éxito.");
        console.log("Uploaded Image URL:", data.imageUrl);
      } else {
        setUploadStatus(`Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadStatus("Ocurrió un error al subir la imagen.");
    }
  };

  return (
    <div>
      <h3>Subir imagen</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default ImageUpload;
