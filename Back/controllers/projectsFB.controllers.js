import db from "../utils/firebase.js";
import { sqlConnect, sql } from "../utils/sql.js";
import { getStorage } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";

// Funcion para obtener los proyectos de un usuario específico
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
        console.log("Project Data:", projectDoc.data()); // Log para verificar los datos del proyecto
      }
    }

    res.json(projects); // Regresar los proyectos filtrados
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server Error");
  }
};

// Funcion para obtener un proyecto específico por ID
export const getProject = async (req, res) => {
  try {
    const project = await db.collection("proyectos").doc(req.params.id).get();
    res.json({
      id: req.params.id,
      nombreProyecto: project.data().nombreProyecto,
      descripcion: project.data().descripcion,
      estatus: project.data().estatus,
      EP: project.data().EP,
      HU: project.data().HU,
      RF: project.data().RF,
      RNF: project.data().RNF,
      fechaCreacion: project.data().fechaCreacion,
      modificationHistory: project.data().modificationHistory || [],
    });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

// Funcion para añadir un nuevo proyecto
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

// Funcion para vincular un usuario a un proyecto
export const linkUserToProject = async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId || !projectId) {
      return res
        .status(400)
        .json({ error: "UserID and ProjectID are required" });
    }

    const pool = await sqlConnect();

    // Insertar el usuario y el proyecto en la tabla Users_Projects
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("ProjectID", sql.VarChar, projectId).query(`
        INSERT INTO Users_Projects (UserID, ProjectID)
        VALUES (@UserID, @ProjectID)
      `);

    res
      .status(200)
      .json({ success: true, message: "¡Usuario vinculado al proyecto exitosamente!" });
  } catch (err) {
    console.error("Error linking user to project:", err);
    res.status(500).json({ error: "Failed to link user to project" });
  }
};

export const unlinkUserFromProject = async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId || !projectId) {
      return res
        .status(400)
        .json({ error: "UserID and ProjectID are required" });
    }

    const pool = await sqlConnect();

    // Eliminar el usuario y el proyecto de la tabla Users_Projects
    await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("ProjectID", sql.VarChar, projectId).query(`
        DELETE FROM Users_Projects
        WHERE UserID = @UserID AND ProjectID = @ProjectID
      `);

    res.status(200).json({
      success: true,
      message: "¡Usuario desvinculado del proyecto exitosamente!",
    });
  } catch (err) {
    console.error("Failed to unlink user from proyect", err);
    res.status(500).json({ error: "Error al desvincular el usuario del proyecto." });
  }
}

export const getProjectTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "ProjectID is required" });
    }

    const pool = await sqlConnect();

    // Query to fetch users linked to the project
    const result = await pool
      .request()
      .input("ProjectID", sql.VarChar, projectId)
      .query(`
        SELECT u.UserID, u.username, u.lastname, u.email, u.role
        FROM Users_Projects up
        INNER JOIN dbo.Users u ON up.UserID = u.UserID
        WHERE up.ProjectID = @ProjectID
      `);

    res.status(200).json({
      success: true,
      teamMembers: result.recordset,
    });
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
};

// Funcion para actualizar un proyecto
export const putProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const projectRef = db.collection("proyectos").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const currentProject = projectDoc.data();
    const updates = req.body;

    // Obtener nombre y apellido del usuario
    let userName = '';
    let userLastname = '';
    try {
      const pool = await sqlConnect();
      const userResult = await pool
        .request()
        .input("userId", sql.Int, req.user.userId)
        .query("SELECT username, lastname FROM dbo.Users WHERE UserID = @userId");
      if (userResult.recordset.length > 0) {
        userName = userResult.recordset[0].username || '';
        userLastname = userResult.recordset[0].lastname || '';
      }
    } catch (e) {
      console.error("Error fetching user for modification history", e);
    }
    
    // Crear el registro de modificación
    const modification = {
      timestamp: new Date().toISOString(),
      userId: req.user.userId,
      userName,
      userLastname,
      changes: {}
    };

    // Comparar y registrar cambios
    Object.keys(updates).forEach(key => {
      if (key !== 'modificationHistory' && JSON.stringify(currentProject[key]) !== JSON.stringify(updates[key])) {
        // Si es un arreglo de elementos (EP, RF, RNF, HU), comparar internamente
        if (["EP", "RF", "RNF", "HU"].includes(key) && Array.isArray(updates[key]) && Array.isArray(currentProject[key])) {
          const oldArr = currentProject[key];
          const newArr = updates[key];
          const elementChanges = [];
          newArr.forEach(newItem => {
            const oldItem = oldArr.find(item => item.id === newItem.id);
            if (oldItem) {
              const changes = {};
              Object.keys(newItem).forEach(field => {
                if (JSON.stringify(newItem[field]) !== JSON.stringify(oldItem[field])) {
                  changes[field] = { oldValue: oldItem[field], newValue: newItem[field] };
                }
              });
              if (Object.keys(changes).length > 0) {
                elementChanges.push({ id: newItem.id, changes });
              }
            } else {
              // Elemento nuevo
              elementChanges.push({ id: newItem.id, changes: { nuevo: newItem } });
            }
          });
          // Detectar eliminaciones
          oldArr.forEach(oldItem => {
            if (!newArr.find(item => item.id === oldItem.id)) {
              elementChanges.push({ id: oldItem.id, changes: { eliminado: oldItem } });
            }
          });
          if (elementChanges.length > 0) {
            modification.changes[key] = elementChanges;
          }
        } else {
          // Cambio simple
          modification.changes[key] = {
            oldValue: currentProject[key],
            newValue: updates[key]
          };
        }
      }
    });

    // Si hay cambios, agregar al historial
    if (Object.keys(modification.changes).length > 0) {
      const modificationHistory = currentProject.modificationHistory || [];
      updates.modificationHistory = [...modificationHistory, modification];
    }

    await projectRef.update(updates);
    
    res.status(200).json({
      project_updated: true,
      id: projectId,
      modification: modification
    });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

// Funcion para actualizar los requerimientos de un proyecto
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

// Funcion para eliminar un proyecto
export const deleteProject = async (req, res) => {
  try {
    await db.collection("proyectos").doc(req.params.id).delete();
    res.status(200).json({ project_deleted: true });
  } catch (err) {
    console.error("Firebase Error:", err);
    res.status(500).send("Server Error");
  }
};

// Funcion para subir una imagen a Firebase Storage y guardar la URL en Firestore
export const uploadProjectImage = async (req, res) => {
  try {
    const { projectId } = req.body;
    const file = req.file;

    if (!file || !projectId) {
      return res.status(400).json({ error: "File and projectId are required" });
    }

    const storage = getStorage(app);
    const bucket = storage.bucket();
    const fileName = `projects/${projectId}/${uuidv4()}_${file.originalname}`; // Se guarda en su propia carpeta

    const fileUpload = bucket.file(fileName);

    // Subir a Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    });

    // Obtener URL del archivo subido
    const [url] = await fileUpload.getSignedUrl({
      action: "read",
      expires: "12-31-2100", // Expira en 100 años para no hacerse bolas
    });

    // Guardar la URL en Firestore bajo el ID del proyecto
    const projectRef = db.collection("proyectos").doc(projectId);
    await projectRef.update({ imageUrl: url });

    res.status(200).json({ success: true, imageUrl: url });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export const updateTasks = async (req, res) => {
  try {
    const { requirementType, elementId, tasks } = req.body;
    const projectId = req.params.id;
    const projectRef = db.collection("proyectos").doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }
    const data = projectDoc.data();
    const section = data[requirementType];
    if (!Array.isArray(section)) {
      return res.status(400).json({ error: "Invalid requirementType" });
    }
    const updatedSection = section.map(item =>
      item.id === elementId
        ? { ...item, tasks }
        : item
    );
    await projectRef.update({ [requirementType]: updatedSection });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating tasks:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { requirementType, elementId } = req.query;
    const projectId = req.params.id;
    const projectRef = db.collection("proyectos").doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }
    const data = projectDoc.data();
    const section = data[requirementType];
    if (!Array.isArray(section)) {
      return res.status(400).json({ error: "Invalid requirementType" });
    }
    const item = section.find((i) => i.id === elementId);
    const tasks = item?.tasks || [];
    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Server Error" });
  }
};
