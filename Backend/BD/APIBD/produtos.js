import express from "express";
import { getDB, pool } from "../APIBD/db.js";
import { spawn } from "child_process";
import { text } from "stream/consumers";

const router = express.Router();

router.get("/getByCategoria", async (req, res) =>{
  try{
    const [categoria] = await pool.query(`SELECT  DISTINCT category FROM produtos ORDER BY category`);
    res.json(categoria);
  }catch(e){
    res.status(500).json({ error : "Erro ao buscar produtos"});
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

    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: "Error ao buscar produtos" });
  }
});

export async function getCliqueProdutosByUsuario(id) {
  const usuario = await getDB().collection("Usuarios").findOne(
    { "id": String(id) },
    { projection: { _id: 0, cliqueProduto: 1 } },
  );
  return usuario?.cliqueProduto ?? [];
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
  console.log(abaixo7dias);
  console.log(acima7dias);

  const escolhidoAcima = acima7dias.length
    ? acima7dias[Math.floor(Math.random() * acima7dias.length)]
    : null;

  const escolhidoAbaixo = abaixo7dias.length
    ? abaixo7dias[Math.floor(Math.random() * abaixo7dias.length)]
    : null;

  return { "Recente": escolhidoAbaixo, "Pesquisou": escolhidoAcima };
}

router.get("/predicaoByClique/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;

    const listaClique = await getCliqueProdutosByUsuario(idUsuario);

    return res.json(processaListProdutos(listaClique[0]));
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
      "C:/Users/User/Projetos/Ecommerce/Backend/BD/Recomendacao/Recomendacao.py",
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

