import express from 'express';
import { pool } from "./db.js";


const router = express.Router();

function getDataCompra() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const hora = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
}

router.post('/', async (req, res) => {
  try {
    const total = 0;
    const { idUsuario, produtos, precoTotal } = req.body;

    const idProdutos = produtos.map(p => p.product_id);

    const [produtosSql] = await pool.query(`SELECT id, product_id, actual_price FROM produtos WHERE product_id IN (?)`, [idProdutos]);

    const ProdutosFormatado = produtosSql.map(produtoBD => {
      const produtoBody = produtos.find(p => p.product_id === produtoBD.product_id);
      return {
        ...produtoBD,
        qtd: produtoBody ? produtoBody.qtd : 0
      };
    });

    const dataVenda = getDataCompra();

    const cmd = `INSERT INTO vendas (id_usuario,dataVenda,valorTotal) VALUES (?,?,?) `;

    const [venda] = await pool.query(cmd, [idUsuario, dataVenda, precoTotal]);
    const vendaId = venda.insertId;

    if (venda && venda.affectedRows > 0) {
      for (const produto of ProdutosFormatado) {
        const { id, qtd, actual_price } = produto;

        const cmd = `INSERT INTO itensvendas (id_venda,id_produto,quantidade, preco) VALUES (?,?,?,?) `;
        await pool.query(cmd, [vendaId, id, qtd, actual_price]);
      }
    }
    res.status(201).json({ message: 'Venda registrada com sucesso', idVenda: vendaId });

  } catch (e) {
    res.status(500).json({ error: 'Erro ao registrar venda' });
  }
})

router.get("/getVendasById/:idUsuario", async (req, res) => {
  try {
    const { idUsuario } = req.params;
    const [produtos] = await pool.query(`
      SELECT 
      v.id AS id,
      v.dataVenda,
      v.valorTotal,
      JSON_ARRAYAGG(
         JSON_OBJECT(
             'product_id', p.product_id,
             'product_name', p.product_name,
             'img_link', p.img_link,
             'actual_price', p.actual_price,
             'category', p.category,
             'decricao', p.descricao
             )
        ) AS produtos
      FROM vendas v
      JOIN itensvendas iv ON iv.id_venda = v.id
      JOIN produtos p ON p.id = iv.id_produto
      WHERE v.id_usuario = (?)
      GROUP BY v.id, v.dataVenda, v.valorTotal
      ORDER BY v.dataVenda DESC;
      `, [idUsuario])

      return res.json(produtos);
  } catch (e) {

  }
})

export default router;