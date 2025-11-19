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
router.get("/getProdutosByPage/:pagina", async (req, res) => {
  try {
    // página atual (mínimo 1)
    let pagina = parseInt(req.params.pagina, 10) || 1;
    if (pagina < 1) pagina = 1;

    // limite por página (vem da query string, default 20)
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (pagina - 1) * limit;

    // filtros vindos do front
    const { q, categoria, ordenacao } = req.query;

    // -----------------------------
    // 1) Monta SQL base com filtros
    // -----------------------------
    let sql = `SELECT * FROM produtos WHERE 1=1`;
    const params = [];

    // filtro de busca (nome / descrição)
    if (q) {
      const like = `%${q}%`;
      sql += ` AND (product_name LIKE ? OR descricao LIKE ?)`;
      params.push(like, like);
    }

    // filtro de categoria
    if (categoria) {
      sql += ` AND category = ?`;
      params.push(categoria);
    }

    // ordenação
    if (ordenacao === "1") {
      // mais barato
      sql += ` ORDER BY actual_price ASC`;
    } else if (ordenacao === "2") {
      // mais caro
      sql += ` ORDER BY actual_price DESC`;
    } else if (ordenacao === "3") {
      // mais popular (ajuste a coluna se for outra)
      sql += ` ORDER BY rating DESC`;
    } else {
      // padrão
      sql += ` ORDER BY id ASC`;
    }

    // paginação
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // -----------------------------
    // 2) Busca página de produtos
    // -----------------------------
    const [produtos] = await pool.query(sql, params);

    // -----------------------------
    // 3) Busca TOTAL de registros com os mesmos filtros
    // -----------------------------
    let countSql = `SELECT COUNT(*) AS total FROM produtos WHERE 1=1`;
    const countParams = [];

    if (q) {
      const like = `%${q}%`;
      countSql += ` AND (product_name LIKE ? OR descricao LIKE ?)`;
      countParams.push(like, like);
    }

    if (categoria) {
      countSql += ` AND category = ?`;
      countParams.push(categoria);
    }

    const [rowsCount] = await pool.query(countSql, countParams);
    const total = rowsCount[0]?.total || 0;

    // -----------------------------
    // 4) Resposta pro frontend
    // -----------------------------
    res.json({
      products: produtos,
      total,
      page: pagina,
      limit,
    });
  } catch (err) {
    console.error("Erro ao buscar produtos paginados:", err);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});


router.get("/", async (req, res) => {
  try {
    //const produtos = await getDB().collection('ProdutosAmazon').find({}).toArray();
    const produtos = await pool.query(`Select * from produtos`);
    
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

