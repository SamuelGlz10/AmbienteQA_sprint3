import db from "../utils/firebase.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await db.collection("proyectos").get();
    const list = [];
    projects.forEach((doc) => {
      list.push({
        id: doc.id,
        descripcion: doc.data().descripcion,
        estatus: doc.data().estatus,
      });
    });
    res.json(list);
  } catch (err) {
    console.error("Firebase Error:", err);
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
      batch.update(docRef, { descripcion: req.descripcion, estatus: req.estatus });
    });

    await batch.commit(); // Ejecutar todas las operaciones en el batch

    res.status(200).json({ message: "Requerimientos actualizados correctamente" });
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

    res.status(200).json({ message: "Valoraciones actualizadas correctamente" });
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
