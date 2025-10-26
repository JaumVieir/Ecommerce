import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import produtos from "./produtos.js";
import usuarios from "./usuarios.js"
import usuariosSQL from "./usuariosSQL.js";
import vendaSQL from "./vendasSQL.js";


const app = express();
app.use(cors());

app.use(
  cors({
    origin: "https://ecommerce-89hivg6o3-jaumvieirs-projects.vercel.app", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
  })
);

app.options("*", cors());

app.use(express.json());

connectDB().then(() => {
  app.use("/produtos", produtos);
  app.use("/usuarios", usuarios);
  app.use("/usuariosEcommerce", usuariosSQL);
  app.use("/vendas", vendaSQL);

  

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  
}).catch(err =>{
  console.error("Error ao conectar", err);
})