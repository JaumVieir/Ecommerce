<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { getAuth } from "../services/auth.js";
import axios from "axios";

export default {
  data() {
    return {
      carrinho: [], // Array de produtos no carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
    };
  },
  computed: {
    valorTotal() {
      return this.carrinho.reduce((acc, prod) => {
        const preco =
          parseFloat(
            typeof prod.actual_price === "string"
              ? prod.actual_price.replace(",", ".")
              : prod.actual_price
          ) || 0;
        const qtd = Number(prod.quantidade) || 1;
        return acc + preco * qtd;
      }, 0);
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
      const arr = JSON.parse(carrinhoSalvo);
      // Garante que cada item tenha quantidade >= 1
      this.carrinho = (arr || []).map((p) => ({
        ...p,
        quantidade: Number(p.quantidade) > 0 ? Number(p.quantidade) : 1,
      }));
      localStorage.setItem("carrinho", JSON.stringify(this.carrinho));
    } else {
      // Exemplo de produtos
      this.carrinho = [];
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
      try {
        if (!this.carrinho || this.carrinho.length === 0) {
          this.openToast("Seu carrinho está vazio.");
          return;
        }

        // Verifica autenticação antes de criar a compra
        const { userId } = getAuth();
        if (!userId) {
          // Usuário não logado: não cria compra, apenas mantém o carrinho salvo e redireciona para login
          localStorage.setItem("carrinho", JSON.stringify(this.carrinho));
            this.openToast("Você precisa fazer login para finalizar a compra.");
          // Inclui um redirect para voltar ao carrinho após o login
          this.$router.push({ path: "/login", query: { redirect: "/Carrinho" } });
          return;
        }

        // Usuário logado: montar itens e concluir a compra normalmente
        const itens = this.carrinho.map((p) => {
          const preco =
            (typeof p.actual_price === "string"
              ? parseFloat(p.actual_price.replace(",", "."))
              : Number(p.actual_price)) || 0;
          const qtd = Number(p.quantidade) || 1;
          return {
            product_id: p.product_id,
            nome: p.product_name ?? p.nome ?? "Produto",
            preco,
            img_link: p.img_link,
            qtd,
          };
        });

        const listaProdutos =this.carrinho.map((p) => ({
          product_id: p.product_id,
          actual_price:
            (typeof p.actual_price === "string"
              ? parseFloat(p.actual_price.replace(",", "."))
              : Number(p.actual_price)) || 0,
          qtd: Number(p.quantidade) || 1,
        }));

       

        const valorTotal = itens.reduce(
          (acc, it) => acc + it.preco * (Number(it.quantidade) || 1),
          0
        );
   
        
         const jsonProdutos = `{
        "idUsuario": ${userId},
        "precoTotal": ${valorTotal},
        "produtos": [
          ${listaProdutos
            .map(
              (p) => `
            {
              "product_id": "${p.product_id}",
              "actual_price": ${p.actual_price},
              "qtd": ${p.qtd}
            }
          `
            )
            .join(",")}
        ]}`;

       axios.post("http://localhost:3000/vendas", JSON.parse(jsonProdutos)).then((response) => {

          console.log("Compra registrada com sucesso:", response.data);

        }).catch((error) => {
          console.error("Erro ao registrar compra:", error);
        });

        const agora = new Date();
        const compra = {
          id: Date.now(),
          data: agora.toLocaleDateString("pt-BR"),
          valorTotal,
          itens,
          userId,
        };

        const storageKey = `compras:${userId}`;
        const comprasExistentes = JSON.parse(
          localStorage.getItem(storageKey) || "[]"
        );
        comprasExistentes.unshift(compra);
        localStorage.setItem(storageKey, JSON.stringify(comprasExistentes));

        // Limpa carrinho (estado e localStorage) e redireciona
        this.carrinho = [];
        localStorage.removeItem("carrinho");
    this.$router.push({ path: "/Dashboard", query: { toast: "Compra finalizada com sucesso!" } });
      } catch (e) {
        console.error(e);
        this.openToast("Não foi possível finalizar a compra.");
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
    removerDoCarrinho(id) {
      try {
        const idx = this.carrinho.findIndex((p) => p.id === id);
        if (idx !== -1) {
          const item = this.carrinho[idx];
          const atual = Number(item.quantidade) || 1;
          if (atual > 1) {
            // Decrementa apenas uma unidade
            this.carrinho[idx] = { ...item, quantidade: atual - 1 };
          } else {
            // Se chegar a zero, remove o item
            this.carrinho.splice(idx, 1);
          }
          localStorage.setItem("carrinho", JSON.stringify(this.carrinho));
        }
      } catch (e) {
        console.error(e);
        alert("Não foi possível remover o produto.");
      }
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
    <main
      class="flex flex-1 py-16 w-full max-w-none mx-0 px-4 sm:px-6 lg:px-10 xl:px-16 gap-8"
    >
      <!-- Lado esquerdo: Itens do carrinho -->
      <div id="bloco-itens-carrinho" class="w-full md:flex-1 pr-0 md:pr-0">
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
                <div class="flex items-center gap-3">
                  <span class="font-bold text-xl text-primary-700">{{
                    formataPreco(produto.actual_price)
                  }}</span>
                  <span class="text-sm text-gray-600"
                    >x {{ produto.quantidade }}</span
                  >
                </div>
              </div>
              <!-- Botão remover -->
              <button
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
                title="Remover do carrinho"
                @click="removerDoCarrinho(produto.id)"
              >
                <span class="material-symbols-outlined text-red-600"
                  >delete</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Lado direito: Resumo da compra -->
      <div
        id="bloco-resumo-compra"
        class="w-full md:w-[22rem] lg:w-[24rem] flex-shrink-0"
      >
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
      </div>
    </main>
    <footer class="bg-gray-800 text-gray-200 py-4 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div></div>
        </div>
      </div>
    </footer>
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
