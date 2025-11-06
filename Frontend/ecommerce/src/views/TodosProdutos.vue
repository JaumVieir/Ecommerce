<script>
import axios from "axios";
import { getAuth } from "../services/auth.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      produtos: [],
      paginaAtual: 1,
      produtosPorPagina: 20,
      pesquisar: "",
      ordenacao: "",
      categorias: " ",
      categoriaSelecionada: "",
      // Toast simples para feedback de adição ao carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
    };
  },

  computed: {
    produtosFiltrados() {
      if (
        this.categoriaSelecionada &&
        this.categoriaSelecionada !== "" &&
        this.categoriaSelecionada !== "Todas as Categorias"
      ) {
        return this.produtos.filter(
          (p) => p.category === this.categoriaSelecionada
        );
      } else {
        return this.produtos;
      }
    },
    produtosPaginação() {
      const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
      const fim = inicio + this.produtosPorPagina;
      return this.produtosFiltrados.slice(inicio, fim);
    },
    totalPaginas() {
      return Math.ceil(this.produtosFiltrados.length / this.produtosPorPagina);
    },
  },

  mounted() {
    this.getProdutos();
    this.getCategoria();
  },
  watch: {
    ordenacao() {
      switch (this.ordenacao) {
        case "1":
          this.produtos.sort(
            (a, b) => parseFloat(a.actual_price) - parseFloat(b.actual_price)
          );
          break;
        case "2":
          this.produtos.sort(
            (a, b) => parseFloat(b.actual_price) - parseFloat(a.actual_price)
          );
          break;
        case "3":
          this.produtos.sort((a, b) => b.rating_count - a.rating_count);
          break;
        default:
          this.getProdutos();
          break;
      }
    },
    pesquisar(novoValor) {
      if (novoValor.length >= 2) {
        this.buscarProdutos(novoValor);
      } else {
        this.getProdutos();
      }
    },
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
    irParaDashboardOuLogin() {
      const { userId } = getAuth();
      if (userId) {
        this.$router.push({ path: "/Dashboard" });
      } else {
        this.$router.push({ path: "/login" });
      }
    },
    async addAoCarrinho(produto) {
      try {
        const { userId } = getAuth();
        console.log("User ID:", userId);
        const cliques = {
          usuario: userId,
          clique: [
            {
              product_id: produto.product_id,
              product_name: produto.product_name,
              data: this.formataData(),
            },
          ],
        };
        console.log(cliques);
        try {
          const resposta = await api.post(
            `/usuarios/setClique`,
            cliques
          );
        } catch (error) {
          console.error("Erro ao registrar clique:", error);
        }
        const carrinhoStr = localStorage.getItem("carrinho");
        const carrinho = carrinhoStr ? JSON.parse(carrinhoStr) : [];
        const existente = carrinho.find((p) => p.id == produto.product_id);
        if (existente) {
          existente.quantidade = (Number(existente.quantidade) || 1) + 1;
        } else {
          const item = {
            product_id: produto.product_id,
            product_name: produto.product_name,
            img_link: produto.img_link,
            actual_price: produto.actual_price,
            qtd: 1,
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
    openToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
        this.toastTimer = null;
      }, 2000);
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
    async buscarProdutos(texto) {
      try {
        const response = await api.get(
          `/produtos/getByTexto/${texto}`
        );
        this.produtos = response.data;
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente.");
      }
    },
    async getCategoria() {
      try {
        const response = await api.get(
          `/produtos/getByCategoria`
        );

        this.categorias = response.data.map((cat) => cat.category);
      } catch (e) {
        console.error(e);
      }
    },
    async getProdutos() {
      try {
        const response = await api.get("/produtos");
        console.log(response.data);
        this.produtos = response.data[0];
        console.log(this.produtos);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente.");
      }
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
        const resposta = await api.post(
          `/usuarios/setClique`,
          cliques
        );
        this.$router.push({ path: `/produto/${id}` });
      } catch (error) {
        console.error("Erro ao registrar clique:", error);
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

    logout() {
      localStorage.removeItem("auth");
      this.$router.push({ path: "/login" });
    },
  },
};
</script>

<template>
  <div id="webcrumbs" class="w-full">
    <div class="min-h-screen bg-gray-50 w-full">
      <header class="bg-white shadow-md sticky top-0 z-10 w-full">
        <div class="w-full px-0">
          <div class="flex justify-between items-center py-4 px-4">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-primary-600">E-Commerce</h1>
            </div>
            <div class="hidden md:flex items-center space-x-8"></div>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <input
                  v-model="pesquisar"
                  type="text"
                  placeholder="Search products..."
                  class="py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span
                  class="material-symbols-outlined absolute left-3 top-2 text-gray-400"
                  >search</span
                >
              </div>
              <div class="flex items-center gap-2">
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
                <button
                  class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
                  @click="logout"
                >
                  <span class="material-symbols-outlined text-red-600"
                    >logout</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Amostragem de todos os produtos -->
      <div class="py-16 bg-gray-50 w-full">
        <div class="w-full px-0">
          <div class="flex justify-between items-center mb-8 px-4">
            <h2 class="text-3xl font-bold">Todos os Produtos</h2>

            <!--Filtro de Categoria-->
            <div class="flex space-x-2">
              <select
                v-model="categoriaSelecionada"
                class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todas as Categorias</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div class="flex space-x-2">
              <select
                v-model="ordenacao"
                class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Ordernar Por</option>
                <option value="1">Mais Barato</option>
                <option value="2">Mais Caro</option>
                <option value="3">Mais Popular</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            <!-- Primeiro produto -->
            <div
              v-for="produto in produtosPaginação"
              :key="produto.id"
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div
                class="relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5"
              >
                <img
                  :src="produto.img_link"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="object-contain h-full max-w-full"
                  keywords="SAMSUNG Smart TV Crystal 50, TV, electronics, ecommerce"
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
          <div class="mt-12 flex justify-center px-4">
            <div class="flex items-center space-x-2">
              <button
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                :disabled="paginaAtual === 1"
                @click="paginaAtual--"
              >
                Anterior
              </button>

              <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>

              <button
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                :disabled="paginaAtual === totalPaginas"
                @click="paginaAtual++"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer class="bg-gray-800 text-gray-200 py-4 w-full">
        <div class="w-full px-0">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            <div></div>
          </div>
        </div>
      </footer>
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
</template>
