import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import produtos from "./produtos.js";
import usuarios from "./usuarios.js";
import usuariosSQL from "./usuariosSQL.js";
import vendaSQL from "./vendasSQL.js";

const app = express();

// allowlist fixo + regex p/ previews da Vercel desse projeto
const allowlist = [
  "https://ecommerce-89hivg6o3-jaumvieirs-projects.vercel.app", // antigo
  "http://localhost:5173",
  "http://localhost:3000",
];
const vercelPreview = /^https:\/\/ecommerce-[a-z0-9-]+-jaumvieirs-projects\.vercel\.app$/;

const corsOptions = {
  origin(origin, callback) {
    // requests sem Origin (curl/Postman) — libera
    if (!origin) return callback(null, true);

    if (allowlist.includes(origin) || vercelPreview.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // se usar cookies/session
  optionsSuccessStatus: 204,
};

// APLIQUE UMA ÚNICA VEZ (não use app.options("*", ...))
app.use(cors(corsOptions));
app.use(express.json());

// (opcional) log rápido p/ depurar CORS
app.use((req, _res, next) => {
  if (req.method === "OPTIONS") {
    console.log("Preflight:", req.headers.origin, req.method, req.path);
  }
  next();
});

connectDB().then(() => {
  app.use("/produtos", produtos);
  app.use("/usuarios", usuarios);
  app.use("/usuariosEcommerce", usuariosSQL);
  app.use("/vendas", vendaSQL);

  app.get("/health", (_req, res) => res.send("ok"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}).catch(err => {
  console.error("Erro ao conectar", err);
});
