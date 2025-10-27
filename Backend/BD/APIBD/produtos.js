import express from "express";
import axios from "axios";
import { getDB, pool } from "../APIBD/db.js";

const router = express.Router();

const RECS_ENABLED = String(process.env.RECS_ENABLED || "false").toLowerCase() === "true";
const PY_SVC_URL = process.env.PY_SVC_URL;
const PY_SVC_TOKEN = process.env.PY_SVC_TOKEN; 
console.log('[recs]', { RECS_ENABLED, PY_SVC_URL, hasToken: !!PY_SVC_TOKEN });

router.get("/getByCategoria", async (req, res) => {
  try {
    const [categoria] = await pool.query("SELECT  DISTINCT category FROM produtos ORDER BY category");
    res.json(categoria);
  } catch (e) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.get("/getByTexto/:texto", async (req, res) => {
  try {
    const { texto } = req.params;
    const like = `%${texto}%`; // ✅ parametrizado
    const [produtos] = await pool.query(
      `SELECT * FROM produtos WHERE product_name LIKE ? OR descricao LIKE ?`,
      [like, like]
    );
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.get("/", async (req, res) => {
  try {
    //const produtos = await getDB().collection('ProdutosAmazon').find({}).toArray();
    const produtos = await pool.query(`Select * from produtos`);
    console.log(produtos);
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: "Error ao buscar produtos" });
  }
});

export async function getCliqueProdutosByUsuario(id) {
  const usuario = await getDB().collection("Usuarios").findOne(
    { "id": Number(id) },
    { projection: { _id: 0, cliqueProduto: 1 } },
  );
  return usuario?.cliqueProduto ?? [];
}

export async function getProdutosCompraByUsuario(id) {
  const [produtosComprados] = await pool.query(
    `
    SELECT DISTINCT p.product_id, p.product_name
    FROM usuarios u
    JOIN vendas v ON u.id = v.id_usuario
    JOIN itensvendas iv ON v.id = iv.id_venda
    JOIN produtos p ON iv.id_produto = p.id
    WHERE u.id = ?;
    `,
    [Number(id)] // parâmetro seguro
  );

  return produtosComprados ?? [];
}



function processaListProdutos(cliques) {
  const agora = Date.now();
  const limite = agora - 2 * 24 * 60 * 60 * 1000;

  const toTs = (data) => {
    if (data instanceof Date) return +data;
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [y, m, d] = data.split("-").map(Number);
      return new Date(y, m - 1, d).getTime();
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(data)) {
      const [d, m, y] = data.split("-").map(Number);
      return new Date(y, m - 1, d).getTime();
    }
    return new Date(data).getTime();
  };

  const acima7dias = cliques
    .map((it) => ({ it, ts: toTs(it.data) }))
    .filter(({ ts }) => Number.isFinite(ts) && ts < limite)
    .map(({ it }) => it.product_id);

  const abaixo7dias = cliques
    .flat()
    .map((it) => ({ it, ts: toTs(it.data) }))
    .filter(({ ts }) => Number.isFinite(ts) && ts >= limite)
    .map(({ it }) => it.product_id);

  const escolhidoAcima = acima7dias.length
    ? acima7dias[Math.floor(Math.random() * acima7dias.length)]
    : null;

  const escolhidoAbaixo = abaixo7dias.length
    ? abaixo7dias[Math.floor(Math.random() * abaixo7dias.length)]
    : null;

  return { "Recente": escolhidoAbaixo, "Pesquisou": escolhidoAcima };
}

router.get("/predicaoByCompras/:idUsuario", async(req,res) =>{
  try {
    const { idUsuario } = req.params;

    const listaClique = await getProdutosCompraByUsuario(idUsuario);
    const sorteado = listaClique[Math.floor(Math.random() * listaClique.length)];
    return res.json(sorteado);
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: "Erro durante obter a predição by Usuario",
    });
  }
})
router.get("/predicaoByClique/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const listaClique = await getCliqueProdutosByUsuario(idUsuario);
    return res.json(processaListProdutos(listaClique));
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: "Erro durante obter a predição by Usuario",
    });
  }
});

router.get("/predicao/:id", async (req, res) => {
  try {
    const produtoId = req.params.id; // string (ex.: B0BF16HHWC)
    if (!produtoId) return res.status(400).json({ error: "produtoId inválido" });

    if (!RECS_ENABLED) {
      return res.json({ data: [] });
    }

    const r = await axios.get(`${PY_SVC_URL}/recomendar`, {
      params: { prod_id: produtoId, topk: 10 },
      headers: { "X-Auth": PY_SVC_TOKEN },
      timeout: 5000,
    });

    return res.json(r.data);
  } catch (err) {
    console.error("[predicao]", err.response?.status, err.message);
    return res.status(200).json({ data: [] });
  }
});

export default router;

