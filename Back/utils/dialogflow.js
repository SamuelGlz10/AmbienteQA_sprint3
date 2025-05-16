import { db } from "./firebase.js";
import { WebhookClient } from "dialogflow-fulfillment";

// Funcion para obtener detalles del proyecto
async function getProjectDetails(projectId) {
  const doc = await db.collection("proyectos").doc(projectId).get();
  if (!doc.exists) {
    throw new Error("Proyecto no encontrado");
  }
  return doc.data();
}

// Manejador de webhook de Dialogflow
export const dialogflowWebhook = async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  // Manejador para la intención "Project Information"
  async function projectInfoHandler(agent) {
    try {
      const projectId = agent.parameters.projectId;
      const project = await getProjectDetails(projectId);

      // Estructura la respuesta
      const response = `
        Project ${project.name}:
        • Status: ${project.status}
        • Epics: ${project.epics.length}
        • Tasks: ${project.tasks.filter((t) => !t.completed).length} pending
        ${project.description ? `\nDescription: ${project.description}` : ""}
      `;

      agent.add(response);
    } catch (error) {
      agent.add(`Disculpa, no pude encontrar el proyecto. ${error.message}`);
    }
  }

  // Mapa de intenciones
  const intentMap = new Map();
  intentMap.set("Info de proyecto: ", projectInfoHandler);

  try {
    await agent.handleRequest(intentMap);
  } catch (error) {
    console.error("Error manejando dialogflow: ", error);
    res.status(500).send("Error interno de servidor :(");
  }
};
