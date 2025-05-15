import fetch from "node-fetch";

export const generateEpic = async (req, res) => {
  const { prompt, rules, sprints, limit, context, currentUrl } = req.body;

  console.log("Received prompt:", prompt);
  console.log("Received rules:", rules);
  console.log("Received sprints:", sprints);
  console.log("Received limit:", limit);
  console.log("Received context:", context);
  console.log("Received currentUrl:", currentUrl);

  // Construir prompt incluyendo contexto y URL, formateando el JSON para la IA
  const fullPrompt = `
${rules}

Contexto de proyecto (JSON):
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Página actual: ${currentUrl}
Pregunta del usuario: ${prompt}
`;

  try {
    const response = await fetch(
      "https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          data: {
            rules,
            limit,
            option:
              rules.match(
                /The number of elements in each list should be (MAX|MIN) (\d+)/
              )?.[1] || "MAX",
            sprints,
            // ya se incluye en fullPrompt
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from external API:", errorText);
      throw new Error("External API error");
    }

    const data = await response.json();
    console.log("Received data from external API:", data);
    res.status(200).json({ data });
  } catch (error) {
    console.error("Error in generateEpic:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
