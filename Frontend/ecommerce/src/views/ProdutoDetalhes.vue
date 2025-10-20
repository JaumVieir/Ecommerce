<template>
  <div>
    <!-- Header igual ao de TodosProdutos.vue -->
    <header class="bg-white shadow-md sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">E-Commerce</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center gap-2">
              <router-link
                to="/"
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative flex items-center"
                aria-label="Ver produtos"
                title="Ver produtos"
                style="text-decoration: none !important"
              >
                <span class="material-symbols-outlined text-primary-600">shopping_bag</span>
              </router-link>
              <router-link
                to="/Carrinho"
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative flex items-center"
                style="text-decoration: none !important"
              >
                <span class="material-symbols-outlined text-primary-600"
                  >shopping_cart</span
                >
              </router-link>
              <button
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
                style="text-decoration: none !important"
                @click="irParaDashboardOuLogin"
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

    <div class="max-w-9xl mx-auto p-8" v-if="produto">
      <div
        class="bg-white rounded-2xl shadow-lg overflow-hidden md:flex md:items-stretch md:gap-8"
      >
        <div class="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center">
          <img
            :src="produto.img_link"
            alt=""
            class="w-full max-w-md h-80 object-contain rounded-lg"
          />
        </div>

        <div class="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h1 class="text-3xl font-extrabold text-gray-900 mb-2">
              {{ produto.product_name }}
            </h1>
            <p class="text-sm text-gray-500 mb-4">{{ produto.brand || "" }}</p>

            <div class="flex items-baseline gap-4 mb-4">
              <div class="text-3xl font-bold text-primary-600">
                R$ {{ produto.actual_price }}
              </div>
              <div
                class="text-sm text-gray-500 line-through"
                v-if="produto.list_price"
              >
                {{ produto.list_price }}
              </div>
            </div>

            <div class="flex items-center gap-3 mb-4">
              <div class="flex text-amber-400">
                <span
                  v-for="(tipo, idx) in getStars(produto.rating)"
                  :key="idx"
                  class="material-symbols-outlined text-lg"
                  :class="
                    tipo === 'empty' ? 'text-gray-300' : 'text-yellow-500'
                  "
                  :style="{
                    'font-variation-settings':
                      tipo === 'full' || tipo === 'half'
                        ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20`
                        : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
                  }"
                >
                  {{ tipo === "half" ? "star_half" : "star" }}
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ produto.rating }} •
                {{ produto.rating_count || 0 }} avaliações
              </div>
            </div>

            <p class="text-gray-700 mb-6">
              {{ produto.description || produto.short_description || "" }}
            </p>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <button
              @click="addAoCarrinho(produto)"
              class="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Adicionar ao carrinho
            </button>
            <button
              @click="comprarAgora(produto)"
              class="w-full sm:w-auto px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-screen bg-gray-50">
      <div class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Relacionados a este Produto:</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <!-- Skeletons -->
            <template v-if="loadingPredicoes">
              <div
                v-for="i in 8"
                :key="`skeleton-${i}`"
                class="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
              >
                <div class="w-full h-32 bg-gray-100"></div>
                <div class="p-4 space-y-3">
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div class="flex items-center justify-between pt-2">
                    <div class="h-5 bg-gray-200 rounded w-20"></div>
                    <div class="h-9 w-9 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </template>
            <!-- Cards reais -->
            <div
              v-else
              v-for="produto in this.predicoes"
              :key="produto.id"
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div
                class="relative relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5"
              >
                <img
                  :src="produto.img_link"
                  alt="Summer Floral Dress"
                  class="object-contain h-full max-w-full"
                  keywords="Summer Floral Dress, fashion product, ecommerce"
                />
                <div class="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                  >
                    <span class="material-symbols-outlined text-gray-700"
                      >favorite</span
                    >
                  </button>
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 delay-75"
                  >
                    <span class="material-symbols-outlined text-gray-700"
                      >visibility</span
                    >
                  </button>
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 delay-150"
                  >
                    <span class="material-symbols-outlined text-gray-700"
                      >share</span
                    >
                  </button>
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-center mb-2">
                  <div class="flex">
                    <span
                      v-for="(tipo, idx) in getStars(produto.rating)"
                      :key="idx"
                      class="material-symbols-outlined text-sm"
                      :class="
                        tipo === 'empty' ? 'text-gray-300' : 'text-yellow-500'
                      "
                      :style="{
                        'font-variation-settings':
                          tipo === 'full' || tipo === 'half'
                            ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20`
                            : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
                      }"
                    >
                      {{ tipo === "half" ? "star_half" : "star" }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 ml-2">{{
                    produto.rating
                  }}</span>
                </div>
                <h3
                  class="font-medium text-base mb-1 hover:text-primary-600 transition duration-300 text-truncate cursor-pointer"
                  @click="verDetalhes(produto)"
                >
                  {{ produto.product_name }}
                </h3>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-bold">{{
                      formataPreco(produto.actual_price)
                    }}</span>
                  </div>
                  <button
                    class="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition duration-300"
                    @click="addAoCarrinho(produto)"
                  >
                    <span class="material-symbols-outlined text-primary-600"
                      >add_shopping_cart</span
                    >
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-12 flex justify-center"></div>
        </div>
      </div>
    </div>

    <!-- Toast simples -->
    <div
      v-if="toastVisible"
      class="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg"
      role="status"
      aria-live="polite"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { getAuth } from "../services/auth.js";

export default {
  data() {
    return {
      produto: null,
      predicoes: [],
      pesquisar: "",
      // Loading para mascarar demora de recomendações
      loadingPredicoes: false,
      // Toast simples para feedback de adição ao carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
    };
  },
  mounted() {
    window.scrollTo(0, 0);
    this.getProduto();
  },
  methods: {
    formataData() {
      const data = new Date();
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      const dataFormatada = `${dia}-${mes}-${ano}`;
      return dataFormatada;
    },
    getStars(rating) {
      // Returns an array of 5 positions with values: 'full' | 'half' | 'empty'
      const num =
        typeof rating === "number"
          ? rating
          : parseFloat(String(rating || 0).replace(",", "."));
      if (isNaN(num)) return ["empty", "empty", "empty", "empty", "empty"];
      const clamped = Math.max(0, Math.min(5, num));
      // Round to nearest 0.5
      const rounded = Math.round(clamped * 2) / 2;
      const full = Math.floor(rounded);
      const hasHalf = rounded % 1 !== 0;
      const stars = [];
      for (let i = 0; i < 5; i++) {
        if (i < full) stars.push("full");
        else if (i === full && hasHalf) stars.push("half");
        else stars.push("empty");
      }
      return stars;
    },
    async verDetalhes(produto) {
      const id = produto.product_id;
      const { userId } = getAuth();

      const cliques = {
        usuario: userId,
        clique: [
          {
            product_id: id,
            product_name: produto.product_name,
            data: this.formataData(),
          },
        ],
      };

      try {
        await axios.post(`http://localhost:3000/usuarios/setClique`, cliques);
        // Recarrega a página com o novo produto
        this.$router.push({ path: `/produto/${id}` });
        // Força o reload do componente
        window.scrollTo(0, 0);
        this.getProduto();
      } catch (error) {
        console.error("Erro ao registrar clique:", error);
        // Mesmo com erro no registro, navega para o produto
        this.$router.push({ path: `/produto/${id}` });
      }
    },
    irParaDashboardOuLogin() {
      const { userId } = getAuth();
      if (userId) {
        this.$router.push({ path: "/Dashboard" });
      } else {
        this.$router.push({ path: "/login" });
      }
    },
    openToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
        this.toastTimer = null;
      }, 2000);
    },
    addAoCarrinho(produto) {
      try {
        const carrinhoStr = localStorage.getItem("carrinho");
        const carrinho = carrinhoStr ? JSON.parse(carrinhoStr) : [];
        const existente = carrinho.find(
          (p) => p.product_id == produto.product_id
        );
        if (existente) {
          existente.quantidade = (Number(existente.quantidade) || 1) + 1;
        } else {
          const item = {
            product_id: produto.product_id,
            product_name: produto.product_name,
            img_link: produto.img_link,
            actual_price: produto.actual_price,
            quantidade: 1,
          };
          carrinho.push(item);
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        this.openToast("Produto adicionado ao carrinho");
      } catch (e) {
        console.error(e);
        this.openToast("Não foi possível adicionar ao carrinho");
      }
    },
    comprarAgora(produto) {
      try {
        // Adiciona ao carrinho
        const carrinhoStr = localStorage.getItem("carrinho");
        const carrinho = carrinhoStr ? JSON.parse(carrinhoStr) : [];
        const existente = carrinho.find(
          (p) => p.product_id == produto.product_id
        );
        if (existente) {
          existente.quantidade = (Number(existente.quantidade) || 1) + 1;
        } else {
          const item = {
            product_id: produto.product_id,
            product_name: produto.product_name,
            img_link: produto.img_link,
            actual_price: produto.actual_price,
            quantidade: 1,
          };
          carrinho.push(item);
        }
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
        // Redireciona para o carrinho
        this.$router.push({ path: "/Carrinho" });
      } catch (e) {
        console.error(e);
        this.openToast("Não foi possível processar a compra");
      }
    },
    async getProduto() {
      try {
        const response = await axios.get(`http://localhost:3000/produtos`);

        const produtosArray = response.data[0];

        this.produto = produtosArray.find(
          (p) => p.product_id == this.$route.params.id
        );

        console.log("Produto carregado:", this.produto);
        this.loadingPredicoes = true;
        const resultado = await axios.get(
          `http://localhost:3000/produtos/predicao/${this.produto.product_id}`
        );
        console.log("Predições recebidas:", resultado.data);
        const rawString = resultado?.data;
        const parsed = rawString && rawString.data ? rawString.data : [];
        this.predicoes = Array.isArray(parsed) ? parsed.slice(0, 8) : [];
        this.loadingPredicoes = false;
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produto.");
        this.loadingPredicoes = false;
        this.predicoes = [];
      }
    },
    formataPreco(valor) {
      if (!valor) return "R$ 0,00";
      const numero =
        typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
};
</script>
