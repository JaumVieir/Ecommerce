<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

export default {
  data() {
    return {
      carrinho: [], // Array de produtos no carrinho
    };
  },
  computed: {
    valorTotal() {
      return this.carrinho.reduce(
        (acc, prod) => acc + parseFloat(prod.actual_price),
        0
      );
    },
    // Classes dinâmicas: aplica scroll a partir de 3 itens
    listaCarrinhoClasses() {
      // Altura alvo ligeiramente menor que 3 linhas para o scroll aparecer já com 3 produtos
      // min-h de cada item ~7rem (min-h-28) + espaçamento vertical (space-y-6 => 1.5rem)
      // 3 itens ~= 3*7rem + 2*1.5rem = 24rem. Usamos 23rem para forçar o overflow com 3 itens.
      return this.carrinho.length >= 3
        ? "overflow-y-auto max-h-[23rem] pr-2"
        : "";
    },
  },
  mounted() {
    // Simulação: buscar carrinho do localStorage ou API
    // Substitua por chamada real se necessário
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    } else {
      // Exemplo de produtos
      this.carrinho = [
        {
          id: 1,
          product_name: "Produto Exemplo",
          img_link: "https://via.placeholder.com/100",
          actual_price: "199.99",
        },
     {
          id: 1,
          product_name: "Produto Exemplo",
          img_link: "https://via.placeholder.com/100",
          actual_price: "199.99",
        },
          {
          id: 1,
          product_name: "Produto Exemplo",
          img_link: "https://via.placeholder.com/100",
          actual_price: "199.99",
        },
           {
          id: 1,
          product_name: "Produto Exemplo",
          img_link: "https://via.placeholder.com/100",
          actual_price: "199.99",
        },
      ];
    }
  },
  methods: {
    formataPreco(valor) {
      if (!valor) return "R$ 0,00";
      const numero =
        typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
    finalizarCompra() {
      alert("Compra finalizada com sucesso!");
      // Aqui você pode implementar a lógica de finalizar compra
    },
  },
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col"
  >
    <header class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">E-Commerce</h1>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <router-link
              to="/TodosProdutos"
              class="text-primary-600 hover:text-primary-700 transition duration-300"
              style="text-decoration: none !important"
            >
              Todos Produtos
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <div class="flex items-center gap-2">
              <button
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
              >
                <span class="material-symbols-outlined text-primary-600"
                  >person</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    <main
      class="flex flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-8"
    >
      <!-- Lado esquerdo: Itens do carrinho -->
      <section class="w-full md:flex-1 pr-0 md:pr-0">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-8 border-b pb-4">
            Itens no Carrinho
          </h2>
          <div
            v-if="carrinho.length === 0"
            class="text-gray-500 text-lg text-center py-12"
          >
            Seu carrinho está vazio.
          </div>
          <div v-else :class="['space-y-6', listaCarrinhoClasses]">
            <div
              v-for="produto in carrinho"
              :key="produto.id"
              class="flex items-center min-h-28 group hover:bg-gray-50 rounded-xl transition p-4 border-b last:border-b-0"
            >
              <img
                :src="produto.img_link"
                alt="imagem produto"
                class="w-24 h-24 object-contain rounded-xl shadow mr-6 border"
              />
              <div class="flex-1">
                <h3
                  class="font-semibold text-lg mb-2 group-hover:text-primary-600 transition"
                >
                  {{ produto.product_name }}
                </h3>
                <span class="font-bold text-xl text-primary-700">{{
                  formataPreco(produto.actual_price)
                }}</span>
              </div>
              <!-- Botão remover futuro -->
            </div>
          </div>
        </div>
      </section>
      <!-- Lado direito: Resumo da compra -->
      <aside class="w-full md:w-[22rem] lg:w-[24rem] flex-shrink-0">
        <div class="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
          <h2 class="text-2xl font-bold mb-8 border-b pb-4">
            Resumo da Compra
          </h2>
          <div class="flex justify-between items-center mb-6">
            <span class="text-gray-700 text-lg">Total:</span>
            <span class="text-2xl font-extrabold text-primary-700">{{
              formataPreco(valorTotal)
            }}</span>
          </div>
          <button
            @click="finalizarCompra"
            class="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl shadow hover:scale-105 hover:from-primary-700 hover:to-primary-800 transition duration-200 text-lg"
          >
            Finalizar Compra
          </button>
        </div>
      </aside>
    </main>
    <footer class="bg-gray-800 text-gray-200 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div></div>
        </div>
      </div>
    </footer>
  </div>
</template>
