import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import produtos from "./produtos.js";
import usuarios from "./usuarios.js";
import usuariosSQL from "./usuariosSQL.js";
import vendaSQL from "./vendasSQL.js";

const app = express();

const CORS_ORIGIN = "https://ecommerce-89hivg6o3-jaumvieirs-projects.vercel.app";

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());


app.set("trust proxy", 1);

connectDB()
  .then(() => {
    app.use("/produtos", produtos);
    app.use("/usuarios", usuarios);
    app.use("/usuariosEcommerce", usuariosSQL);
    app.use("/vendas", vendaSQL);

   
    app.get("/health", (_req, res) => res.send("ok"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error("Erro ao conectar", err);
  });
