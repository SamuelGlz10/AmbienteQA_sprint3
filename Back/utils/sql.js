import sql from "mssql";

const azureConfig = {
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT, 10),
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

let pool; // Reusar la conexión a la base de datos

const sqlConnect = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(azureConfig); // Crear pool si no existe
      console.log("Connected to Azure SQL Server");
    }
    return pool;
  } catch (err) {
    console.error("SQL Connection Error:", err);
    throw err;
  }
};

export { sqlConnect, sql };
