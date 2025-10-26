import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import produtos from "./produtos.js";
import usuarios from "./usuarios.js"
import usuariosSQL from "./usuariosSQL.js";
import vendaSQL from "./vendasSQL.js";


const app = express();
app.use(cors());
app.use(express.json());

connectDB().then(() => {
  app.use("/produtos", produtos);
  app.use("/usuarios", usuarios);
  app.use("/usuariosEcommerce", usuariosSQL);
  app.use("/vendas", vendaSQL);

  app.get("/healthz/db", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json(rows[0]);
  } catch (err) {
    console.error("Erro DB:", err.message);
    res.status(500).send("erro ao conectar ao banco");
  }
});

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  
}).catch(err =>{
  console.error("Error ao conectar", err);
})