import { WebhookClient } from "dialogflow-fulfillment";
import { DialogflowService } from "../utils/dialogflow.js";

export const handleWebhook = async (req, res) => {
  try {
    const agent = new WebhookClient({ request: req, response: res });

    // Manejador de intencion para obtener información del proyecto
    async function projectInfoHandler(agent) {
      try {
        const projectId = agent.parameters.projectId;
        const project = await DialogflowService.getProjectDetails(projectId);

        // Mapear los elementos del proyecto a un formato legible
        const epics =
          project.EP?.map((epic) => ({
            id: epic.id,
            titulo: epic.titulo,
            descripcion: epic.data,
            numTasks: epic.tasks?.length || 0,
          })) || [];

        const userStories =
          project.HU?.map((hu) => ({
            id: hu.id,
            titulo: hu.titulo,
            descripcion: hu.data,
            numTasks: hu.tasks?.length || 0,
          })) || [];

        const rf =
          project.RF?.map((rf) => ({
            id: rf.id,
            titulo: rf.titulo,
            descripcion: rf.data,
          })) || [];

        const rnf =
          project.RNF?.map((rnf) => ({
            id: rnf.id,
            titulo: rnf.titulo,
            descripcion: rnf.data,
          })) || [];

        agent.add(
          `Proyecto ${project.nombreProyecto}:\n` +
            `Descripción: ${project.descripcion}\n` +
            `Epicas: ${epics.length}\n` +
            `Historias de Usuario: ${userStories.length}\n` +
            `Requerimientos Funcionales: ${rf.length}\n` +
            `Requerimientos No Funcionales: ${rnf.length}\n`
        );

        // Listamos los elementos del proyecto
        if (epics.length > 0) {
          agent.add(
            "Epicas:\n" +
              epics.map((e) => `• ${e.titulo}: ${e.descripcion}`).join("\n")
          );
        }
        if (userStories.length > 0) {
          agent.add(
            "Historias de Usuario:\n" +
              userStories
                .map(
                  (h) =>
                    `• ${h.titulo}: ${h.descripcion} (${h.numTasks} tareas)`
                )
                .join("\n")
          );
        }
        if (rf.length > 0) {
          agent.add(
            "Requerimientos Funcionales:\n" +
              rf.map((r) => `• ${r.titulo}: ${r.descripcion}`).join("\n")
          );
        }
        if (rnf.length > 0) {
          agent.add(
            "Requerimientos No Funcionales:\n" +
              rnf.map((r) => `• ${r.titulo}: ${r.descripcion}`).join("\n")
          );
        }
      } catch (error) {
        agent.add(
          `Lo lamento, no pude encontrar ese proyecto. ${error.message}`
        );
      }
    }

    // Manejador de intencion para obtener información de una tarea
    async function getTaskInfoHandler(agent) {
      try {
        const projectId = agent.parameters.projectId;
        const taskId = agent.parameters.taskId;
        const project = await DialogflowService.getProjectDetails(projectId);

        // Buscar todas las historias de usuario en el proyecto
        let foundTask = null;
        let parentStory = null;

        for (const hu of project.HU || []) {
          if (Array.isArray(hu.tasks)) {
            const task = hu.tasks.find((t) => t.id === taskId);
            if (task) {
              foundTask = task;
              parentStory = hu;
              break;
            }
          }
        }

        if (foundTask) {
          agent.add(
            `La tarea "${foundTask.titulo}" (${foundTask.id}) está en la historia "${parentStory.titulo}".\n` +
              `Descripción: ${foundTask.descripcion}\n` +
              (foundTask.estado ? `Estado: ${foundTask.estado}\n` : "") +
              (foundTask.asignado
                ? `Asignado a: ${foundTask.asignado}\n`
                : "") +
              (foundTask.sprint ? `Sprint: ${foundTask.sprint}\n` : "")
          );
        } else {
          agent.add(
            `No encontré la tarea con ID "${taskId}" en este proyecto.`
          );
        }
      } catch (error) {
        agent.add("Ocurrió un error buscando la tarea.");
      }
    }

    // Manejador de intencion para listar proyectos
    async function listProjectsHandler(agent) {
      try {
        const projects = await DialogflowService.listActiveProjects();
        if (projects.length === 0) {
          agent.add("No active projects found");
          return;
        }
        agent.add(
          `Active projects: ${projects.map((p) => p.nombreProyecto).join(", ")}`
        );
      } catch (error) {
        agent.add("Error fetching projects");
        console.error(error);
      }
    }

    // Mapeamos las intenciones a los manejadores
    const intentMap = new Map();
    intentMap.set("Informacion del proyecto", projectInfoHandler);
    intentMap.set("Listar proyectos", listProjectsHandler);
    intentMap.set("Obtener info de tasks", getTaskInfoHandler);

    await agent.handleRequest(intentMap);
  } catch (error) {
    console.error("Error in Dialogflow webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
