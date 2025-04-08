import { sqlConnect, sql } from "../utils/sql.js";

export const login = async (req, res) => {
  try {
    const pool = await sqlConnect();
    const data = await pool
      .request()

      .input("email", sql.VarChar, req.body.email)
      .query("SELECT * FROM dbo.Users WHERE email = @email");

    // console.log(data.recordset);

    if (data.recordset.length > 0) {
      let isLogin = data.recordset[0].password === req.body.password;
      res.status(200).json({ isLogin: isLogin, user: data.recordset[0] });
    } else {
      res
        .status(401)
        .json({ isLogin: false, message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("SQL Query Error:", err);
    res.status(500).send("Server Error");
  }
};

export const register = async (req, res) => {
  try {
    const { name, password, phone, email } = req.body;
    
    if (!name || !password || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Username, email, and password are required" 
      });
    }
    
    const pool = await sqlConnect();
    
    const checkUser = await pool
      .request()
      .input("username", sql.VarChar, name)
      .query("SELECT COUNT(*) as count FROM dbo.Users WHERE username = @username");
    
    if (checkUser.recordset[0].count > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Username already exists" 
      });
    }
    
    const checkEmail = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT COUNT(*) as count FROM dbo.Users WHERE email = @email");
    
    if (checkEmail.recordset[0].count > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Email already exists" 
      });
    }
    
    const result = await pool
      .request()
      .input("username", sql.VarChar, name)
      .input("password", sql.VarChar, password)
      .input("phone", sql.VarChar, phone || null)
      .input("email", sql.VarChar, email || null)
      .query(`
        INSERT INTO dbo.Users (username, password, phone, email)
        VALUES (@username, @password, @phone, @email);
        SELECT SCOPE_IDENTITY() AS userId;
      `);
    
    const userId = result.recordset[0].userId;
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: userId
    });
    
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: err.message 
    });
  }
};

