import fetch from "node-fetch";

export const generateEpic = async (req, res) => {
  const { prompt, rules, sprints, limit } = req.body;

  console.log("Received prompt:", prompt);
  console.log("Received rules:", rules);
  console.log("Received sprints:", sprints);
  console.log("Received limit:", limit);

  try {
    const response = await fetch(
      "https://stk-formador-25.azurewebsites.net/epics/generate-from-prompt/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          data: {
            rules,
            limit,
            option:
              rules.match(
                /The number of elements in each list should be (MAX|MIN) (\d+)/
              )?.[1] || "MAX",
            sprints,
          },
        }),
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
