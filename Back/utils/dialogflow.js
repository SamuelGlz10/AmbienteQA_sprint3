import { db } from "../utils/firebase.js";

export class DialogflowService {
  static async getProjectDetails(projectId) {
    const doc = await db.collection("proyectos").doc(projectId).get();
    if (!doc.exists) {
      throw new Error("Project not found");
    }
    return doc.data();
  }

  static async listActiveProjects() {
    const snapshot = await db
      .collection("proyectos")
      .where("estatus", "==", "Abierto")
      .limit(5)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }
}
