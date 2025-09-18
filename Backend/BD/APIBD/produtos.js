import express from 'express';
import { getDB } from "../APIBD/db.js";
import { spawn } from 'child_process'

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const produtos = await getDB().collection('ProdutosAmazon').find({}).toArray();
        res.json(produtos)
    } catch (err) {
        res.status(500).json({ error: "Error ao buscar usuários" })
    }
});

router.get("/predicao/:id", async (req, res) => {
  try {
    let { id } = req.params;

    const input = JSON.stringify({ id });

    const arquivo = spawn("python", [
      "C:/Users/vitor/OneDrive/Área de Trabalho/Ecommerce -TDD/Backend/BD/Recomendacao/Recomendacao.py"
    ]);

    let respostas = "";
    let erro = "";

    arquivo.stdout.on("data", (data) => (respostas += data.toString()));
    arquivo.stderr.on("data", (data) => (erro += data.toString()));

    arquivo.on("close", (codigo) => {
      if (codigo !== 0 && !respostas) {
        return res.status(500).json({ ok: false, error: "Python retornou erro", stderr: erro });
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
          stderr: erro
        });
      }
    });

    arquivo.stdin.write(input);
    arquivo.stdin.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false, error: "Erro interno" });
  }
});

export default router;