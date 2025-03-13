import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField } from "@mui/material";

function Generate() {
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    const input = e.target.prompt.value;
    const prompt =
      "Please create a JSON object that returns headers with 'title' of the generated text, 'data' being the actual text generated from the following prompt. Do not include aditional text inside or outside the json. Do not include the word json or any punctuation of any kind. The output should only be the brackets from the json and its content. " +
      input;
    alert("Solicitud recibida, generando texto..." + prompt); // Aquí se muestra el mensaje de que se recibió la solicitud
    const result = await fetch("http://localhost:5001/generateEpic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const response = await result.json();
    const generatedText = response.data;
    navigate("/home", { state: { generatedText } }); // Regresar el texto generado a la página de inicio
    alert(generatedText); // Aquí se muestra el mensaje de que se generó el texto
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <Box
          margin={"auto"}
          flexDirection={"column"}
          display={"flex"}
          width={400}
          marginTop={10}
        >
          <TextField
            className={"login-input"}
            name={"prompt"}
            id={"prompt"}
            label={"Prompt"}
            variant={"outlined"}
            margin={"normal"}
            autoComplete="off"
            // Se utiliza para modificar el estilo de los elementos internos del TextField de mui materials:
            slotProps={{
              inputLabel: {
                sx: {
                  color: "#9e72be",
                },
              },
            }}
          />
          <button className="main-button" type="submit">
            Generar
          </button>
        </Box>
      </form>
    </div>
  );
}

export default Generate;
