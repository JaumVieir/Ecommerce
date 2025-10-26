import express from 'express';
import { pool } from "../APIBD/db.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const produtos = await pool.query(`Select * from Produtos`);
    
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ error: "Error ao buscar produtos" })
  }
});

router.post("/cadastro", async (req, res) =>{
  try{
    let {nome,cpf, email, senha} = req.body;
 
    const cmd= `INSERT INTO usuarios (nome, cpf, email, senha) VALUES (?, ?, ?, ?)`;

    const [cadastra] = await pool.query(cmd, [nome, cpf, email, senha]);

    const [produtosSql] = await pool.query(`SELECT * FROM usuarios WHERE id = (?)`, [cadastra.insertId]);

    return res.status(201).json(produtosSql);
  }catch(e){
    res.status(500).json({error: `Erro ao inserir usuario!`})
  }
});

router.post("/login", async (req,res) =>{
  try{
    const {email, senha} = req.body;
    console.log(email);
    const cmd = `Select * from usuarios WHERE email = ? and senha = ?`;
    const login = await pool.query(cmd, [email,senha]);

    console.log(login);
    return res.json(login[0][0]);

  }catch(e){
    res.status(500).json({erro:"Erro ao logar!"})
  }
});

export default router;