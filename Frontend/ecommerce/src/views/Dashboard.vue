<script>
import Detalhes from "../components/Detalhes.vue";
import { getAuth } from "../services/auth.js";
import axios from "axios";

export default {
  components: {
    Detalhes,
  },
  data() {
    return {
      modalDetalhes: false,
      compraSelecionada: null,
      compras: [],
      produtosRecentes: [],
      produtosComprados: [],
      nomeProdutoComprado: "x",
      // Loading flags para mascarar demora
      loadingRecentes: false,
      loadingComprados: false,
      // Toast simples para feedback de adição ao carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
    };
  },
  mounted() {
    try {
      const { userId } = getAuth();
      if (!userId) {
        this.compras = [];
        this.produtosRecentes = [];
        this.produtosComprados = [];
        return;
      }
        // Exibe toast se vier da navegação
        if (this.$route.query.toast) {
          this.openToast(this.$route.query.toast);
          // Limpa o parâmetro da URL após exibir
          this.$router.replace({ query: { ...this.$route.query, toast: undefined } });
        }
      this.loadingRecentes = true;
      this.loadingComprados = true;
        axios
          .get(`http://localhost:3000/vendas/getVendasById/${userId}`)
          .then((response) => {
            this.compras = response.data.map((c) => ({
              id: c.id ?? Date.now(),
              data: c.data ?? new Date().toLocaleDateString("pt-BR"),
              valorTotal: Number(c.valorTotal) || 0,
              itens: Array.isArray(c.produtos) ? c.produtos : [],
            }));

          axios
            .get(`http://localhost:3000/produtos/predicaoByCompras/${userId}`)
            .then((res) => {
              console.log(res.data);
              const produtosCliques = res.data || [];
              if (produtosCliques != null) {
                if (produtosCliques.product_id != null) {
                  const recente = produtosCliques.product_id;
                  this.nomeProdutoComprado = produtosCliques.product_name;
                  console.log(recente);
                  axios
                    .get(`http://localhost:3000/produtos/predicao/${recente}`)
                    .then((res) => {
                      this.produtosComprados =
                        res.data?.data?.length > 0
                          ? res.data.data.slice(0, 4)
                          : [];
                      this.loadingComprados = false;
                    })
                    .catch((error) => {
                      console.error("Erro ao buscar produtos recentes:", error);
                      this.produtosComprados = [];
                      this.loadingComprados = false;
                    });
                } else {
                  this.loadingComprados = false;
                }
              } else {
                this.loadingComprados = false;
              }
            })
            .catch((error) => {
              console.error("Erro ao buscar produtos recomendados:", error);
              this.loadingComprados = false;
            });

          axios
            .get(`http://localhost:3000/produtos/predicaoByClique/${userId}`)
            .then((res) => {
              const produtosCliques = res.data || [];
              if (produtosCliques != null) {
                if (produtosCliques.Recente != null) {
                  const recente = produtosCliques.Recente;
                  axios
                    .get(`http://localhost:3000/produtos/predicao/${recente}`)
                    .then((res) => {
                      this.produtosRecentes =
                        res.data?.data?.length > 0
                          ? res.data.data.slice(0, 4)
                          : [];
                      this.loadingRecentes = false;
                    })
                    .catch((error) => {
                      console.error("Erro ao buscar produtos recentes:", error);
                      this.produtosRecentes = [];
                      this.loadingRecentes = false;
                    });
                } else {
                  this.loadingRecentes = false;
                }
              } else {
                this.loadingRecentes = false;
              }
            })
            .catch((error) => {
              console.error("Erro ao buscar produtos recomendados:", error);
              this.loadingRecentes = false;
            });
        })
        .catch((error) => {
          console.error("Erro ao buscar compras:", error);
          this.compras = [];
          this.loadingRecentes = false;
          this.loadingComprados = false;
        });
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      this.loadingRecentes = false;
      this.loadingComprados = false;
    }
  },
  methods: {
    verDetalhesCompra(compra) {
      this.compraSelecionada = compra;
      this.modalDetalhes = true;
    },
    voltarParaCompras() {
      this.modalDetalhes = false;
      this.compraSelecionada = null;
      // Rolando para o topo ao voltar para a lista de compras (mesmo comportamento do ProdutoDetalhes)
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
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
    logout() {
      localStorage.removeItem("auth");
      this.$router.push({ path: "/login" });
    },
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
        this.$router.push({ path: `/produto/${id}` });
      } catch (error) {
        console.error("Erro ao registrar clique:", error);
        // Mesmo com erro no registro, navega para o produto
        this.$router.push({ path: `/produto/${id}` });
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
<template>
  <div id="webcrumbs">
    <div class="min-h-screen bg-gray-50">
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

      <div class="pt-4 pb-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-white rounded-xl shadow-md p-6 mb-8">
            <div class="flex justify-between items-center mb-8">
              <h2 class="text-3xl font-bold">Compras Recentes</h2>
              <div class="flex space-x-2"></div>
            </div>
            <div>
              <template v-if="!modalDetalhes">
                <div
                  v-if="!compras.length"
                  class="text-gray-500 text-lg text-center py-8"
                >
                  Você ainda não possui compras recentes.
                </div>
                <ul v-else>
                  <li
                    class="flex items-center border-b py-4"
                    v-for="compra in compras"
                    :key="compra.id"
                  >
                    <div class="flex-1">
                      <div class="font-semibold">Compra #{{ compra.id }}</div>
                      <div class="text-sm text-gray-600">
                        Data: {{ compra.data }}
                      </div>
                    </div>
                    <div class="mr-4 font-bold">
                      {{ formataPreco(compra.valorTotal) }}
                    </div>
                    <button
                      @click="verDetalhesCompra(compra)"
                      class="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-bold"
                    >
                      Ver Detalhes
                    </button>
                  </li>
                </ul>
                <div class="mt-12 flex justify-center"></div>
              </template>
              <template v-else>
                <Detalhes :compra="compraSelecionada" />
                <button
                  @click="voltarParaCompras"
                  class="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold w-full"
                >
                  Voltar para Compras
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 pb-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Baseado em Acessos Recentes</h2>
            <div class="flex space-x-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <!-- Skeletons para Recentes -->
              <template v-if="loadingRecentes">
                <div
                  v-for="i in 4"
                  :key="`recent-skeleton-${i}`"
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
              <template v-else-if="produtosRecentes.length === 0">
                <div class="col-span-full text-gray-500 text-lg text-center py-8 w-full">
                  Nenhum produto baseado em acessos recentes ainda.
                </div>
              </template>
              <template v-else>
                <div
                  v-for="produto in produtosRecentes"
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
              </template>
          </div>
          <div class="mt-12 flex justify-center"></div>
        </div>
      </div>

      <!-- Reduzido espaço: menor padding-top e mantendo padding-bottom -->
      <div class="pt-4 pb-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">
              Baseado na Compra de:
              <u
                ><i>{{
                  nomeProdutoComprado.split(" ").slice(0, 2).join(" ")
                }}</i></u
              >
            </h2>
            <div class="flex space-x-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <!-- Skeletons para Comprados -->
              <template v-if="loadingComprados">
                <div
                  v-for="i in 4"
                  :key="`compr-skeleton-${i}`"
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
              <template v-else-if="produtosComprados.length === 0">
                <div class="col-span-full text-gray-500 text-lg text-center py-8 w-full">
                  Nenhum produto baseado em compras ainda.
                </div>
              </template>
              <template v-else>
                <div
                  v-for="produto in produtosComprados"
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
              </template>
          </div>
          <div class="mt-12 flex justify-center"></div>
        </div>
        <!-- Detalhes agora aparece na própria div de compras -->
        <footer class="bg-gray-800 text-gray-200 py-4">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
  </div>
</template>
