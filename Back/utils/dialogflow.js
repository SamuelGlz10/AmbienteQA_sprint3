import { db } from "../utils/firebase.js";

export class DialogflowService {
  static async getProjectDetails(projectName) {
    // Obtener el proyecto por nombre
    const snapshot = await db
      .collection("proyectos")
      .where("nombreProyecto", "==", projectName)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error("Project not found");
    }
    // Regresar el primer proyecto encontrado
    return snapshot.docs[0].data();
  }

  static async listActiveProjects() {
    const snapshot = await db
      .collection("proyectos")
      .where("estatus", "==", "Abierto")
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
