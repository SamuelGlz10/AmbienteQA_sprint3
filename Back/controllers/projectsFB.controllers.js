import db from "../utils/firebase.js";
import { sqlConnect, sql } from "../utils/sql.js";

export const getProjects = async (req, res) => {
  try {
    const { userId } = req.query; // Obtener el userId de la query de la solicitud
    console.log("User ID:", userId); // Log para verificar el userId recibido

    // Validar que se haya proporcionado el userId
    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // 1: Obtener los IDs de los proyectos del usuario
    const pool = await sqlConnect();
    const userProjects = await pool
      .request()
      .input("userId", sql.Int, userId) // Usar sql.Int para el tipo de dato correcto
      .query("SELECT ProjectID FROM Users_Projects WHERE UserID = @userId"); // Query para obtener los IDs del usuario

    const projectIds = userProjects.recordset.map((row) => row.ProjectID); // Obtener los IDs de los proyectos
    console.log("Project IDs:", projectIds); // Log para verificar los IDs obtenidos

    if (projectIds.length === 0) {
      return res.json([]); // Si no hay proyectos, devolver un array vacío
    }

    // 2: Obtener los detalles de los proyectos desde Firebase
    const projects = [];
    for (const projectId of projectIds) {
      const projectDoc = await db.collection("proyectos").doc(projectId).get();
      if (projectDoc.exists) {
        projects.push({
          id: projectDoc.id,
          ...projectDoc.data(),
        });
      }
    }

    res.json(projects); // Regresar los proyectos filtrados
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server Error");
  }
};

export const getProject = async (req, res) => {
  try {
    const project = await db.collection("proyectos").doc(req.params.id).get();
    res.json({
      id: req.params.id,
      descripcion: project.data().descripcion,
      estatus: project.data().estatus,
    });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

export const postProject = async (req, res) => {
  try {
    const project = await db.collection("proyectos").add(req.body);
    res.status(200).json({
      project_added: true,
      id: project.id,
      descripcion: req.body.descripcion,
      estatus: req.body.estatus,
    }); // Mandar estatus 200 (ok) y un json con un mensaje de que se añadió el proyecto.
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

export const putProject = async (req, res) => {
  try {
    await db.collection("proyectos").doc(req.params.id).update(req.body);
    res.status(200).json({
      project_updated: true,
      id: req.params.id,
      descripcion: req.body.descripcion,
      estatus: req.body.estatus,
    });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

export const updateRequirements = async (req, res) => {
  try {
    const { requirements } = req.body; // Recibe un array de requerimientos desde el frontend

    // Actualizar cada requerimiento en Firebase
    const batch = db.batch(); // Usar un batch para realizar múltiples operaciones
    requirements.forEach((req) => {
      const docRef = db.collection("proyectos").doc(req.id); // Referencia al documento
      batch.update(docRef, {
        descripcion: req.descripcion,
        estatus: req.estatus,
      });
    });

    await batch.commit(); // Ejecutar todas las operaciones en el batch

    res
      .status(200)
      .json({ message: "Requerimientos actualizados correctamente" });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

export const updateRatings = async (req, res) => {
  try {
    const { ratings } = req.body; // Recibe un objeto de valoraciones desde el frontend

    // Actualizar las valoraciones en Firebase
    const docRef = db.collection("proyectos").doc("ratings"); // Documento donde se guardan las valoraciones
    await docRef.set({ ratings }, { merge: true }); // Actualizar o fusionar los datos

    res
      .status(200)
      .json({ message: "Valoraciones actualizadas correctamente" });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

export const deleteProject = async (req, res) => {
  try {
    await db.collection("proyectos").doc(req.params.id).delete();
    res.status(200).json({ project_deleted: true });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};
