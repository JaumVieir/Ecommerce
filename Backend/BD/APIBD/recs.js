// recs.js
import { Router } from "express";
import { getRecs } from "./recsClient.js";

const recRouter = Router();

recRouter.get("/", async (req, res) => {
  const { prod_id, topk } = req.query;
  if (!prod_id) {
    return res.status(400).json({ error: "parâmetro prod_id é obrigatório" });
  }
  try {
    const recs = await getRecs(prod_id, topk ? Number(topk) : 10);
    return res.json({ data: recs });
  } catch (err) {
    const status = err?.response?.status || 500;
    const detail = err?.response?.data || err.message;
    return res.status(status).json({ error: "recs_failed", detail });
  }
});

export default recRouter;