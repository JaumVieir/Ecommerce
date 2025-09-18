import {defineStore } from "pinia";

export const usandoCarrinho = defineStore("carrinho",{
    state : () => ({
        carrinho:[],
        contador: 0,
    }),
    actions :{
        addToCarrinho(produto){
            this.carrinho.push(produto);
        },
        contar(){
            this.contador++;
        }
    }
});