import mysql from "mysql2/promise";

let pool = null;
let mysqlAvailable = false;

export async function connectDatabase() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "shoe_authenticity",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  });

  await pool.query("SELECT 1");
  mysqlAvailable = true;
  return pool;
}

export function isDatabaseReady() {
  return mysqlAvailable && Boolean(pool);
}

export async function query(sql, params = []) {
  if (!isDatabaseReady()) {
    throw new Error("MySQL connection is not available");
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}
