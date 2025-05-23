import dialogflow from "@google-cloud/dialogflow";
import path from "path";
import { DialogflowService } from "../utils/dialogflow.js"; // Your DB logic

const dialogflowKey = JSON.parse(process.env.DIALOGFLOW_KEY);
const projectId = dialogflowKey.project_id;

const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: dialogflowKey.client_email,
    private_key: dialogflowKey.private_key.replace(/\\n/g, "\n"),
  },
});

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
    console.log("respuesta IA:", response);

    // Intent de listar proyectos
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

    if (intent === "Informacion del proyecto") {
      // Extract projectId from parameters.fields
      const fields = response.queryResult.parameters?.fields;
      const projectIdParam =
        fields?.projectId?.stringValue || fields?.projectId?.string_value;

      if (projectIdParam) {
        try {
          const project = await DialogflowService.getProjectDetails(
            projectIdParam
          );
          fulfillmentText = `Información del proyecto "${projectIdParam}":\n${project.descripcion}\n\n`;
        } catch (err) {
          fulfillmentText = `No se encontró información para el proyecto "${projectIdParam}". Checa el nombre otra vez o pregúntame nuevamente :).`;
        }
      } else {
        fulfillmentText =
          "No entendí el nombre del proyecto. ¿Puedes repetirlo?";
      }
    }

    res.json({ fulfillmentText });
  } catch (error) {
    console.error("Error in Dialogflow proxy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
