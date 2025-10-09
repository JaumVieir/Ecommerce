import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import "dotenv/config"; // atalaho para importar e chamar a função dotenv.config() automaticamente

export const pool = mysql.createPool({
  host: "localhost",
  port: process.env.DB_PORT,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "faculdade",
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
  dateStrings: true,
});

const uri =
  "mongodb+srv://vitor36silva_db_user:DSUw1Ujz0xkbxukF@ecommerce.pul1uqa.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce";
const client = new MongoClient(uri);

let db;

export async function connectDB() {
  await client.connect();
  db = client.db("TratamentoDeDados");
  return db;
}

export function getDB() {
  if (!db) throw new Error("Banco não Conectado");
  return db;
}
