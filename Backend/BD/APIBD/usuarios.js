import express from 'express';
import { getDB } from "./db.js";
import { get } from 'mongoose';


const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const produtos = await getDB().collection('Usuarios').insertOne(req.body);
        res.json({"Mensagem":"Sucesso!"})
    } catch (err) {
        res.status(500).json({ error: "Error ao buscar usuários" })
    }
});

router.post("/setClique", async (req, res) => {
    try {
        const id = Number(req.body?.usuario);
        const clique = req.body?.clique;
        
        const cliques = await getDB().collection('Usuarios').updateOne(
          {id},
          { $push: { "cliqueProduto": { $each: clique } } }
        );
        res.json({"Mensagem":"Sucesso!"})
    } catch (err) {
        res.status(500).json({ error: "Error ao inserir clique" })
    }
});

router.get("/getClique", async (req,res)=>{
  try{
    const usuario = req.body;
    const clique = await getDB().collection('Usuarios').findOne(usuario);
    res.json(clique)
  }catch(err){
    res.status(500).json({ error: "Error ao buscar clique" })
  }
})



export default router;