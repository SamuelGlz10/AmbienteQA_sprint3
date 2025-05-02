import db from "../utils/firebase.js";

// crear los endpoints y cambiar de proyectos a sprint NO HECHO

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
        const projectDoc = await db.collection("proyectos").doc(projectId).get(); //cambiar por sprints
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
  
