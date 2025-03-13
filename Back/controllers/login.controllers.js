import { sqlConnect, sql } from "../utils/sql.js";

export const login = async (req, res) => {
  try {
    const pool = await sqlConnect();
    const data = await pool
      .request()
      .input("username", sql.VarChar, req.body.username)
      .query("SELECT * FROM Users WHERE username = @username");

    // console.log(data.recordset);

    if (data.recordset.length > 0) {
      let isLogin = data.recordset[0].password === req.body.password;
      res.status(200).json({ isLogin: isLogin, user: data.recordset[0] });
    } else {
      res
        .status(401)
        .json({ isLogin: false, message: "Invalid username or password" });
    }
  } catch (err) {
    console.error("SQL Query Error:", err);
    res.status(500).send("Server Error");
  }
};
