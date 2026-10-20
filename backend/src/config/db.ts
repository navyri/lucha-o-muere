import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno desde .env

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  // DB_SSL=true para bases de datos en la nube que exigen SSL (Neon, Supabase).
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default pool;
