import dialogflow from "@google-cloud/dialogflow";
import path from "path";
import { DialogflowService } from "../utils/dialogflow.js"; // Your DB logic

const projectId = "stratedge-qkie";
const keyFilename = path.join(process.cwd(), "utils/dialogflow-key.json");
const sessionClient = new dialogflow.SessionsClient({ keyFilename });

export const handleWebhook = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId || "default-session"
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "es",
        },
      },
    };

    const [response] = await sessionClient.detectIntent(request);
    const intent = response.queryResult.intent.displayName;
    let fulfillmentText = response.queryResult.fulfillmentText;

    // Custom fulfillment logic based on intent
    if (intent === "Listar proyectos") {
      const projects = await DialogflowService.listActiveProjects();
      if (!projects.length) {
        fulfillmentText = "No hay proyectos activos.";
      } else {
        fulfillmentText =
          "Proyectos activos:\n" +
          projects.map((p) => p.nombreProyecto).join(" - ");
      }
    }

    res.json({ fulfillmentText });
  } catch (error) {
    console.error("Error in Dialogflow proxy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
