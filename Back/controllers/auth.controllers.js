import jwt from "jsonwebtoken";
import { sqlConnect, sql } from "../utils/sql.js";
import axios from "axios";
import qs from "qs";

const FRONT_URL = process.env.FRONT_URL;

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
          { expiresIn: "1h" } // Opciones del token
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

export const registro = async (req, res) => {
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

export const exchangeWhoopToken = async (req, res) => {
  const { code } = req.body;
  try {
    console.log("Exchanging WHOOP authorization code for tokens");
    const response = await axios.post(
      "https://api.prod.whoop.com/oauth/oauth2/token",
      qs.stringify({
        client_id: "4a7cd98e-1a62-45c4-ad24-59011db56b9f",
        client_secret:
          "a315fb94189d174a4ef205b479199c28e496d9fa575bed088d70911f0de0fb35",
        grant_type: "authorization_code",
        code,
        redirect_uri: `${FRONT_URL}/whoop-callback`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("WHOOP full token response:", response.data);

    if (!response.data.access_token) {
      throw new Error("No access token received from WHOOP");
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error exchanging WHOOP token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: "Invalid authorization code",
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: "Error al obtener el token de Whoop",
      details: error.response?.data || error.message,
    });
  }
};

export const refreshWhoopToken = async (req, res) => {
  const { refresh_token } = req.body;
  try {
    if (!refresh_token) {
      return res.status(400).json({ error: "No refresh token provided" });
    }

    console.log("Refreshing WHOOP access token");
    const response = await axios.post(
      "https://api.prod.whoop.com/oauth/oauth2/token",
      qs.stringify({
        client_id: "4a7cd98e-1a62-45c4-ad24-59011db56b9f",
        client_secret:
          "a315fb94189d174a4ef205b479199c28e496d9fa575bed088d70911f0de0fb35",
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("WHOOP full token response:", response.data);

    if (!response.data.access_token) {
      throw new Error("No access token received from WHOOP refresh");
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error refreshing WHOOP token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: "Invalid refresh token",
        details: error.response.data,
      });
    }

    res.status(500).json({
      error: "Error al actualizar el token de Whoop",
      details: error.response?.data || error.message,
    });
  }
};
