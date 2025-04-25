import jwt from "jsonwebtoken";
import { sqlConnect, sql } from "../utils/sql.js";

export const login = async (req, res) => {
  try {
    const pool = await sqlConnect();
    const data = await pool
      .request()
      .input("email", sql.VarChar, req.body.email)
      .query("SELECT * FROM dbo.Users WHERE email = @email");

    if (data.recordset.length > 0) {
      const user = data.recordset[0];
      const isLogin = user.password === req.body.password;

      if (isLogin) {
        // Generar JWT
        const token = jwt.sign(
          { userId: user.UserID, role: user.role }, // Contenido de token, user.X tiene que ser el mismo que el de la base de datos
          process.env.JWT_SECRET, // Clave secreta
          { expiresIn: "15m" } // Opciones del token
        );

        res.status(200).json({
          success: true,
          token, // Enviar el token al cliente
          user: { id: user.UserID, role: user.role },
          message: "¡Inicio de sesión exitoso!",
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Usuario o contraseña inválidos" });
      }
    } else {
      res
        .status(401)
        .json({ success: false, message: "Usuario o contraseña inválidos" });
    }
  } catch (err) {
    console.error("SQL Query Error:", err);
    res.status(500).json({ success: false, message: "Error de servidor" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, lastname, password, phone, email } = req.body;

    if (!name || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Nombre, correo, y contraseña son requeridos",
      });
    }

    const pool = await sqlConnect();

    const checkEmail = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT COUNT(*) as count FROM dbo.Users WHERE email = @email");

    if (checkEmail.recordset[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: "Correo ya existe",
      });
    }

    const result = await pool
      .request()
      .input("username", sql.VarChar, name)
      .input("lastname", sql.VarChar, lastname || null)
      .input("password", sql.VarChar, password)
      .input("phone", sql.VarChar, phone || null)
      .input("email", sql.VarChar, email || null).query(`
        INSERT INTO dbo.Users (username, lastname, password, phone, email, role)
        VALUES (@username, @lastname, @password, @phone, @email, 'user');
        SELECT SCOPE_IDENTITY() AS userId;
      `);

    const userId = result.recordset[0].userId;

    res.status(201).json({
      success: true,
      message: "¡Usuario registrado exitosamente!",
      userId: userId,
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
      error: err.message,
    });
  }
};
