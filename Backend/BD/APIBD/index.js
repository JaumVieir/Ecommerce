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

  app.listen(3000, () => console.log("Servidor rodando na porta 3000"))
}).catch(err =>{
  console.error("Error ao conectar", err);
})