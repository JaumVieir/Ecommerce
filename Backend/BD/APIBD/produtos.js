import express from "express";
import { getDB, pool } from "../APIBD/db.js";
import { spawn } from "child_process";
import { text } from "stream/consumers";

const router = express.Router();


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

    const [produtos] = await pool.query(
      `SELECT * FROM produtos WHERE product_name LIKE '%${texto}%' OR descricao LIKE '%${texto}%'`,
      [texto, texto]
    );
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

router.get("/", async (req, res) => {
  try {
    //const produtos = await getDB().collection('ProdutosAmazon').find({}).toArray();
    const produtos = await pool.query(`Select * from Produtos`);
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
    let { id } = req.params;

    const input = JSON.stringify({ id });

    const arquivo = spawn("python", [
      "C:/Users/vitor/OneDrive/Área de Trabalho/Ecommerce/Backend/BD/Recomendacao/Recomendacao.py",
    ]);

    let respostas = "";
    let erro = "";

    arquivo.stdout.on("data", (data) => (respostas += data.toString()));
    arquivo.stderr.on("data", (data) => (erro += data.toString()));

    arquivo.on("close", (codigo) => {
      if (codigo !== 0 && !respostas) {
        return res.status(500).json({
          ok: false,
          error: "Python retornou erro",
          stderr: erro,
        });
      }
      try {
        const json = JSON.parse(respostas || "{}");
        return res.json(json);
      } catch (e) {
        return res.status(500).json({
          ok: false,
          error: "Resposta do Python não é JSON válido",
          detalhe: String(e?.message || e),
          stdout: respostas,
          stderr: erro,
        });
      }
    });

    arquivo.stdin.write(input);
    arquivo.stdin.end();
  } catch (err) {
    res.status(500).json({ ok: false, error: "Erro interno" });
  }
});

export default router;

