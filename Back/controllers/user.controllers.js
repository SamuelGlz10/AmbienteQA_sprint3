import { sqlConnect, sql } from "../utils/sql.js";

export const getUsers = async (req, res) => {
  try {
    const pool = await sqlConnect();
    const result = await pool.request().query("SELECT * FROM dbo.Users");

    res.status(200).json({
      success: true,
      users: result.recordset,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sqlConnect();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.Users WHERE UserID = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, lastname, phone, email } = req.body;

    const pool = await sqlConnect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("username", sql.VarChar, username)
      .input("lastname", sql.VarChar, lastname || null)
      .input("phone", sql.VarChar, phone || null)
      .input("email", sql.VarChar, email || null).query(`
        UPDATE dbo.Users
        SET username = @username, lastname = @lastname, phone = @phone, email = @email
        WHERE UserID = @id
      `);

    res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sqlConnect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM dbo.Users WHERE UserID = @id");

    res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      success: false,
      message: "Error de servidor",
    });
  }
};
