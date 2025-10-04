import express from 'express';
import { pool } from "./db.js";


const router = express.Router();

router.post('/', async (req,res) =>{
  try{
    const {idUsuario, produtos} = req.body;
    console.log(req.body)

  }catch(e){

  }
})

export default router;