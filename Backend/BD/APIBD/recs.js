// recs.js
import { Router } from "express";
import { getRecs } from "./recsClient.js";

const router = Router();

router.get("/", async (req, res) => {
  const { prod_id, topk } = req.query;
  if (!prod_id) return res.status(400).json({ error: "parâmetro prod_id é obrigatório" });

  try {
    const recs = await getRecs(prod_id, topk ? Number(topk) : 10);
    return res.json({ data: recs });
  } catch (err) {
    const status = err?.response?.status || 502; // 5xx para upstream
    const detail = err?.response?.data || err.message;
    // log detalhado no servidor
    console.error("[recs] failed", { status, detail });
    return res.status(502).json({ error: "recs_failed", status, detail });
  }
});

export default router;