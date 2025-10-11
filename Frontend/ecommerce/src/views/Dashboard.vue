<script>
import Detalhes from "../components/Detalhes.vue";
import { getAuth } from "../services/auth.js";

export default {
  components: {
    Detalhes,
  },
  data() {
    return {
      modalDetalhes: false,
      compraSelecionada: null,
      compras: [],
    };
  },
  mounted() {
    try {
      const { userId } = getAuth();
      if (!userId) {
        // Sem usuário logado, não exibe compras pessoais
        this.compras = [];
        return;
      }

      const keyUser = `compras:${userId}`;
      const keyGlobalLegacy = "compras"; // legado global
      const keyAnon = "compras:anon"; // compras feitas antes do login

      // Migração simples: se ainda existir a chave global, move para a chave do usuário
      const legacy = JSON.parse(localStorage.getItem(keyGlobalLegacy) || "null");
      if (Array.isArray(legacy) && legacy.length) {
        const existentesUser = JSON.parse(localStorage.getItem(keyUser) || "[]");
        const mergeLegacy = [...legacy, ...existentesUser];
        // de-dupe por id, mantendo o primeiro (mais antigo ou mais recente?) aqui manteremos o mais recente por estar primeiro
        const vistos = new Set();
        const dedup = mergeLegacy.filter((c) => {
          if (!c || typeof c !== "object") return false;
          const id = c.id ?? Math.random();
          if (vistos.has(id)) return false;
          vistos.add(id);
          return true;
        });
        localStorage.setItem(keyUser, JSON.stringify(dedup));
        localStorage.removeItem(keyGlobalLegacy);
      }

      // Migra também compras anônimas desse dispositivo para o usuário após login
      const anonList = JSON.parse(localStorage.getItem(keyAnon) || "null");
      if (Array.isArray(anonList) && anonList.length) {
        const existentesUser = JSON.parse(localStorage.getItem(keyUser) || "[]");
        const mergeAnon = [...anonList, ...existentesUser];
        const vistos2 = new Set();
        const dedup2 = mergeAnon.filter((c) => {
          if (!c || typeof c !== "object") return false;
          const id = c.id ?? Math.random();
          if (vistos2.has(id)) return false;
          vistos2.add(id);
          return true;
        });
        localStorage.setItem(keyUser, JSON.stringify(dedup2));
        localStorage.removeItem(keyAnon);
      }

      const comprasSalvasUser = JSON.parse(localStorage.getItem(keyUser) || "[]");
      // Garante estrutura mínima
      this.compras = Array.isArray(comprasSalvasUser)
        ? comprasSalvasUser.map((c) => ({
            id: c.id ?? Date.now(),
            data: c.data ?? new Date().toLocaleDateString("pt-BR"),
            valorTotal: Number(c.valorTotal) || 0,
            itens: Array.isArray(c.itens) ? c.itens : [],
          }))
        : [];
    } catch (e) {
      console.error(e);
      this.compras = [];
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
    formatarPreco(valor) {
      if (typeof valor === "number") {
        return valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
      }
      const n = Number(valor) || 0;
      return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
            <div class="hidden md:flex items-center space-x-8">
              <router-link
                to="/"
                class="text-primary-600 hover:text-primary-700 transition duration-300"
                style="text-decoration: none !important"
              >
                Todos Produtos
              </router-link>
            </div>
            <div class="flex items-center space-x-4">
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
                <div v-if="!compras.length" class="text-gray-500 text-lg text-center py-8">
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
                      <div class="text-sm text-gray-600">Data: {{ compra.data }}</div>
                    </div>
                    <div class="mr-4 font-bold">{{ formatarPreco(compra.valorTotal) }}</div>
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
            <h2 class="text-3xl font-bold">Baseado em Pesquisas Recentes</h2>
            <div class="flex space-x-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div
                class="relative relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5"
              >
                <img
                  src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
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
                  <div class="flex text-amber-400">
                    <span class="material-symbols-outlined text-sm"> star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star_half
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 ml-2">4.4</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Summer Floral Dress
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$59.99</span></div>
                  <button
                    class="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition duration-300"
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

      <!-- Reduzido espaço: menor padding-top e mantendo padding-bottom -->
      <div class="pt-4 pb-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-bold">Baseado na Busca de Produto X</h2>
            <div class="flex space-x-2"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div
                class="relative relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5"
              >
                <img
                  src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
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
                  <div class="flex text-amber-400">
                    <span class="material-symbols-outlined text-sm"> star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star </span
                    ><span class="material-symbols-outlined text-sm">
                      star_half
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 ml-2">4.4</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Summer Floral Dress
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$59.99</span></div>
                  <button
                    class="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition duration-300"
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
        <!-- Detalhes agora aparece na própria div de compras -->
        <footer class="bg-gray-800 text-gray-200 py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>
