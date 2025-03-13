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

export const deleteProject = async (req, res) => {
  try {
    await db.collection("proyectos").doc(req.params.id).delete();
    res.status(200).json({ project_deleted: true });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};
