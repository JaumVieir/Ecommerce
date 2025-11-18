<script>
import axios from "axios";
import { getAuth } from "../services/auth.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      produtos: [],
      produtosCache: [], // Cache completo dos produtos carregados
      totalProdutosServidor: 0, // Total de produtos no servidor
      paginaAtual: 1,
      produtosPorPagina: 20,
      paginasCarregadas: 0, // Quantas páginas já foram carregadas
      carregandoProdutos: false, // Flag para evitar requisições duplicadas
      pesquisar: "",
      ordenacao: "",
      categorias: " ",
      categoriaSelecionada: "",
      isRestoringState: false, // Flag para controlar restauração de estado
      carregandoInicial: true, // Flag para mostrar loading inicial
      // Toast simples para feedback de adição ao carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
    };
  },

  computed: {
    produtosFiltrados() {
      let produtosParaFiltrar = this.produtosCache;
      
      if (
        this.categoriaSelecionada &&
        this.categoriaSelecionada !== "" &&
        this.categoriaSelecionada !== "Todas as Categorias"
      ) {
        return produtosParaFiltrar.filter(
          (p) => p.category === this.categoriaSelecionada
        );
      } else {
        return produtosParaFiltrar;
      }
    },
    produtosPaginação() {
      const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
      const fim = inicio + this.produtosPorPagina;
      return this.produtosFiltrados.slice(inicio, fim);
    },
    totalPaginas() {
      // Se estamos filtrando por categoria (e não é "Todas as Categorias"), usar o total filtrado
      if (this.categoriaSelecionada && 
          this.categoriaSelecionada !== "" && 
          this.categoriaSelecionada !== "Todas as Categorias" &&
          this.categoriaSelecionada !== " ") {
        return Math.ceil(this.produtosFiltrados.length / this.produtosPorPagina);
      }
      // Caso contrário (incluindo "Todas as Categorias"), usar o total do servidor
      return Math.ceil(this.totalProdutosServidor / this.produtosPorPagina);
    },
  },

  async mounted() {
    // Ativar flag de restauração
    this.isRestoringState = true;
    
    // Tentar restaurar cache de produtos do sessionStorage
    const cacheStr = sessionStorage.getItem('todosProdutos_cache');
    const totalStr = sessionStorage.getItem('todosProdutos_total');
    
    if (cacheStr && totalStr) {
      try {
        this.produtosCache = JSON.parse(cacheStr);
        this.totalProdutosServidor = parseInt(totalStr);
        this.paginasCarregadas = Math.ceil(this.produtosCache.length / this.produtosPorPagina);
        this.carregandoInicial = false;
      } catch (e) {
        console.error('Erro ao restaurar cache:', e);
      }
    }
    
    // Restaurar estado da página se existir
    const paginaSalva = sessionStorage.getItem('todosProdutos_paginaAtual');
    const categoriaSalva = sessionStorage.getItem('todosProdutos_categoriaSelecionada');
    const ordenacaoSalva = sessionStorage.getItem('todosProdutos_ordenacao');
    
    if (paginaSalva) {
      this.paginaAtual = parseInt(paginaSalva);
    }
    if (categoriaSalva) {
      this.categoriaSelecionada = categoriaSalva;
    }
    if (ordenacaoSalva) {
      this.ordenacao = ordenacaoSalva;
    }
    
    // Se não temos cache ou está vazio, carregar produtos
    if (!this.produtosCache.length) {
      const paginaParaCarregar = paginaSalva ? parseInt(paginaSalva) : 1;
      await this.carregarProdutosPaginados(paginaParaCarregar);
      this.carregandoInicial = false;
    }
    
    this.getCategoria();
    
    // Desativar flag após restauração
    this.isRestoringState = false;
  },
  watch: {
    paginaAtual(novaPagina) {
      // Verificar se precisa carregar mais produtos
      this.verificarCarregarMaisProdutos(novaPagina);
    },
    categoriaSelecionada() {
      // Não resetar se estamos restaurando o estado salvo
      if (this.isRestoringState) return;
      
      // Resetar para página 1 ao mudar de categoria
      this.paginaAtual = 1;
      
      // Limpar estado salvo da página ao mudar categoria
      sessionStorage.removeItem('todosProdutos_paginaAtual');
    },
    ordenacao() {
      switch (this.ordenacao) {
        case "1":
          this.produtosCache.sort(
            (a, b) => parseFloat(a.actual_price) - parseFloat(b.actual_price)
          );
          break;
        case "2":
          this.produtosCache.sort(
            (a, b) => parseFloat(b.actual_price) - parseFloat(a.actual_price)
          );
          break;
        case "3":
          this.produtosCache.sort((a, b) => b.rating_count - a.rating_count);
          break;
        default:
          // Recarregar produtos na ordem padrão
          this.produtosCache = [];
          this.paginasCarregadas = 0;
          this.carregarProdutosPaginados(1);
          break;
      }
    },
    pesquisar(novoValor) {
      if (novoValor.length >= 2) {
        this.buscarProdutos(novoValor);
      } else {
        // Resetar para o cache original
        this.produtosCache = [];
        this.paginasCarregadas = 0;
        this.paginaAtual = 1;
        this.carregarProdutosPaginados(1);
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
        // Ao buscar, substituir o cache com os resultados da busca
        this.produtosCache = response.data;
        this.totalProdutosServidor = response.data.length;
        this.paginaAtual = 1;
        
        // Limpar cache do sessionStorage durante busca
        sessionStorage.removeItem('todosProdutos_cache');
        sessionStorage.removeItem('todosProdutos_total');
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
    async obterTotalProdutos() {
      try {
        // Tentar obter apenas a contagem total de forma eficiente
        const response = await api.get('/produtos/count');
        if (response.data && response.data.total) {
          this.totalProdutosServidor = response.data.total;
          return;
        }
      } catch (e) {
        console.log('Endpoint /count não disponível');
      }
      
      // Fallback: usar o primeiro carregamento para determinar o total
      try {
        const response = await api.get('/produtos?limit=1&offset=0');
        if (response.data && response.data[1] && response.data[1].total) {
          this.totalProdutosServidor = response.data[1].total;
        }
      } catch (e) {
        console.error('Não foi possível obter o total de produtos', e);
      }
    },
    async carregarProdutosPaginados(paginaInicial) {
      if (this.carregandoProdutos) return;
      
      try {
        this.carregandoProdutos = true;
        
        // Primeiro, obter o total de produtos se ainda não temos
        if (this.totalProdutosServidor === 0) {
          try {
            const countResponse = await api.get('/produtos/count');
            if (countResponse.data && countResponse.data.total) {
              this.totalProdutosServidor = countResponse.data.total;
            }
          } catch (e) {
            console.log('Endpoint /produtos/count não disponível, usando fallback');
          }
        }
        
        // Carregar apenas o necessário para mostrar a página atual + 1 extra
        const offset = (paginaInicial - 1) * this.produtosPorPagina;
        const limit = this.produtosPorPagina * 2; // 2 páginas para buffer
        
        const response = await api.get(`/produtos?limit=${limit}&offset=${offset}`);
        
        if (response.data && response.data[0]) {
          const novosProdutos = response.data[0];
          
          // Adicionar ao cache apenas produtos que ainda não existem
          novosProdutos.forEach(produto => {
            if (!this.produtosCache.find(p => p.product_id === produto.product_id)) {
              this.produtosCache.push(produto);
            }
          });
          
          this.paginasCarregadas = Math.ceil(this.produtosCache.length / this.produtosPorPagina);
          
          // Obter total de produtos da resposta
          if (response.data[1] && response.data[1].total) {
            this.totalProdutosServidor = response.data[1].total;
          } else if (this.totalProdutosServidor === 0) {
            // Se ainda não temos o total, fazer fallback
            await this.getProdutosSemPaginacao();
          }
          
          // Salvar cache no sessionStorage para carregamento rápido
          try {
            sessionStorage.setItem('todosProdutos_cache', JSON.stringify(this.produtosCache));
            sessionStorage.setItem('todosProdutos_total', this.totalProdutosServidor.toString());
          } catch (e) {
            console.log('Não foi possível salvar cache:', e);
          }
        }
      } catch (error) {
        console.error(error);
        // Se a API não suportar limit/offset, tentar o método antigo
        await this.getProdutosSemPaginacao();
      } finally {
        this.carregandoProdutos = false;
      }
    },
    async getProdutosSemPaginacao() {
      try {
        const response = await api.get("/produtos");
        if (response.data && response.data[0]) {
          this.produtosCache = response.data[0];
          this.totalProdutosServidor = this.produtosCache.length;
          this.paginasCarregadas = Math.ceil(this.produtosCache.length / this.produtosPorPagina);
        }
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente.");
      }
    },
    verificarCarregarMaisProdutos(paginaAtual) {
      // Se estamos na última página carregada ou próximo dela, carregar mais
      const paginasRestantes = this.paginasCarregadas - paginaAtual;
      
      // Carregar mais quando estiver a 1 página do final do cache
      if (paginasRestantes <= 1 && this.produtosCache.length < this.totalProdutosServidor) {
        this.carregarProdutosPaginados(this.paginasCarregadas + 1);
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
        // Salvar estado da página atual antes de navegar
        sessionStorage.setItem('todosProdutos_paginaAtual', this.paginaAtual);
        sessionStorage.setItem('todosProdutos_categoriaSelecionada', this.categoriaSelecionada);
        sessionStorage.setItem('todosProdutos_ordenacao', this.ordenacao);
        
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
          <!-- Loading Skeleton -->
          <div v-if="carregandoInicial" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            <div
              v-for="i in 8"
              :key="'skeleton-' + i"
              class="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
            >
              <div class="w-full h-32 bg-gray-200 mt-5"></div>
              <div class="p-4">
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="flex items-center justify-between pt-2">
                  <div class="h-5 bg-gray-200 rounded w-20"></div>
                  <div class="h-9 w-9 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Produtos reais -->
          <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            <!-- Primeiro produto -->
            <div
              v-for="produto in produtospaginação"
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
