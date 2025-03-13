import fetch from "node-fetch";

export const generateEpic = async (req, res) => {
  const { prompt } = req.body;

  console.log("Received prompt:", prompt);

  try {
    const response = await fetch(
      "https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, data: {} }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from external API:", errorText);
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received data from external API:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
