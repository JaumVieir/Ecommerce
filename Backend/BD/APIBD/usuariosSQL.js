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

    const { rows } = await pool.query(cmd, [nome, cpf, email, senha]);

    return res.status(201).json({ msg: "Inserido!" });
  }catch(e){
    res.status(500).json({error: `Erro ao inserir usuario!`})
  }
});

router.post("/login", async (req,res) =>{
  try{
    const {email, senha} = req.body;
    const cmd = `Select * from Usuarios WHERE email = ? and senha = ?`;
    const login = await pool.query(cmd, [email,senha]);

    return res.json(login[0][0]);

  }catch(e){
    res.status(500).json({erro:"Erro ao logar!"})
  }
});

export default router;