// recsClient.js
import axios from "axios";

const PY_URL = process.env.PY_URL || "https://ecommerce-witm.onrender.com";
const PY_TOKEN = process.env.PY_SVC_TOKEN; // mesmo token configurado no Python

const http = axios.create({
  baseURL: PY_URL,
  timeout: 30000, // 30s
});

export async function getRecs(prodId, topk = 10) {
  if (!PY_TOKEN) {
    throw new Error("PY_SVC_TOKEN não definido no Node");
  }
  const { data } = await http.get("/recomendar", {
    params: { prod_id: prodId, topk },
    headers: { "x-auth": PY_TOKEN },
  });
  return data.data; // {data: [...]} -> retorna só o array
}

// opcional: “aquece” o Python ao subir
export async function warmupPython() {
  try {
    await http.get("/warmup", { headers: { "x-auth": PY_TOKEN } });
    console.log("[recs] warmup OK");
  } catch (e) {
    console.warn("[recs] warmup falhou:", e?.response?.status || e.message);
  }
}