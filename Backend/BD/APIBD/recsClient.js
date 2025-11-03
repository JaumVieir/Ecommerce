import axios from "axios";
import http from "http";
import https from "https";

const PY_URL = process.env.PY_URL || process.env.PY_SVC_URL || "https://ecommerce-witm.onrender.com";
const PY_TOKEN = process.env.PY_SVC_TOKEN;

const agentHttp = new http.Agent({ keepAlive: true });
const agentHttps = new https.Agent({ keepAlive: true });

const httpClient = axios.create({
  baseURL: PY_URL,
  timeout: 60000, // 60s ajuda no cold start
  httpAgent: agentHttp,
  httpsAgent: agentHttps,
  validateStatus: s => s >= 200 && s < 500, // deixa passar 4xx p/ logarmos
});

async function callWithRetry(path, config, retries = 3, delayMs = 1500) {
  let lastErr, lastRes;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await httpClient.get(path, config);
      // Se 5xx, tenta de novo; se 2xx/4xx, retorna
      if (res.status >= 500) {
        lastRes = res;
        await new Promise(r => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  if (lastRes) throw Object.assign(new Error(`Upstream ${lastRes.status}`), { response: lastRes });
  throw lastErr || new Error("Unknown upstream error");
}

export async function getRecs(prodId, topk = 10) {
  if (!PY_TOKEN) throw new Error("PY_SVC_TOKEN não definido no Node");
  const res = await callWithRetry("/recomendar", {
    params: { prod_id: prodId, topk },
    headers: { "x-auth": PY_TOKEN },
  });
  if (res.status !== 200) {
    // logar resposta textual (html do 502) e status
    const preview = typeof res.data === "string" ? res.data.slice(0, 300) : res.data;
    throw Object.assign(new Error("recs upstream error"), { response: { status: res.status, data: preview } });
  }
  return res.data.data;
}

export async function warmupPython() {
  try {
    const res = await callWithRetry("/warmup", {
      headers: { "x-auth": PY_TOKEN },
    }, 2, 1000);
    console.log("[recs] warmup status:", res.status);
  } catch (e) {
    console.warn("[recs] warmup falhou:", e?.response?.status || e.message);
  }
}

console.log("[recs]", {
  RECS_ENABLED: true,
  PY_URL,
  hasToken: !!PY_TOKEN,
});