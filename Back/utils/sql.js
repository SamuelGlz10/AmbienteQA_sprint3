import sql from "mssql";

const sqlConfig = { // Localhost config
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const sqlConnect = async () => {
  try {
    const pool = await sql.connect(azureConfig);
    console.log("Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("SQL Connection Error:", err);
    throw err;
  }
};

const azureConfig = {
  server: process.env.AZURE_SQL_SERVER,
  port: parseInt(process.env.AZURE_SQL_PORT, 10),
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  options: {
    encrypt: true,
  },
};

export { sqlConnect, sql };
