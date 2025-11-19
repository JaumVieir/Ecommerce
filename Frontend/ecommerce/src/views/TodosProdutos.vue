<script>
import { getAuth } from "../services/auth.js";
import api from "../services/api.js";

export default {
  data() {
    return {
      // Produtos carregados para a página atual (serão buscados do servidor)
      produtos: [],
      totalProdutosServidor: 0,
      paginaAtual: 1,
      produtosPorPagina: 20,
      carregandoProdutos: false,
      pesquisar: "",
      ordenacao: "",
      categorias: [],
      categoriaSelecionada: "",
      // timer para debounce da busca
      searchTimer: null,
      // Toast simples para feedback de adição ao carrinho
      toastVisible: false,
      toastMessage: "",
      toastTimer: null,
      // Flags internas
      mostrandoProdutos: false,
    };
  },

  computed: {
  // por enquanto, só repassa o que veio do servidor
  produtosFiltrados() {
    return this.produtos;
  },

  produtosPaginação() {
    return this.produtosFiltrados;
  },

  totalPaginas() {
    return Math.max(
      1,
      Math.ceil((this.totalProdutosServidor || 0) / this.produtosPorPagina)
    );
  },
},

  async mounted() {
    
   
  this.paginaAtual = 1;
  this.pesquisar = "";
  this.categoriaSelecionada = "";
  this.ordenacao = "";

  // (opcional) limpar qualquer coisa antiga salva
  try {
    window.todosProdutosPagina = 1;
    sessionStorage.removeItem('todosProdutos_paginaAtual');
  } catch (e) {
    // ignora erro
  }

  console.debug('[TodosProdutos] mounted, paginaAtual (inicial):', this.paginaAtual);

  // Carrega SEMPRE a página 1 do servidor
  await this.carregarPagina(1);
  this.getCategoria();


  },

  watch: {
    categoriaSelecionada(novaCategoria) {
      const pagina = 1;
      this.paginaAtual = pagina;

      const endpoint = this.buildProdutosEndpoint(pagina, {
        search: this.pesquisar,
        categoria: novaCategoria,
        ordenacao: this.ordenacao,
      });

      this.carregarPagina(pagina, endpoint);
    },
    paginaAtual(novaPagina, antiga) {
      // Garantir limites
      if (!novaPagina || novaPagina < 1) {
        this.paginaAtual = 1;
        return;
      }
      // Salvar como propriedade global e em sessionStorage para persistência
      try {
        window.todosProdutosPagina = novaPagina;
      } catch (e) {
        // ignore
      }
      try {
        sessionStorage.setItem('todosProdutos_paginaAtual', String(novaPagina));
      } catch (e) {
        // ignore
      }
      console.debug('[TodosProdutos] watcher paginaAtual ->', novaPagina, 'antiga:', antiga);
      // OBS: não chamar carregarPagina aqui para evitar chamadas duplicadas quando handlers
      // do botão já chamam carregarPagina diretamente.
    },
    ordenacao() {
      const pagina = 1;
      this.paginaAtual = pagina;
      const endpoint = this.buildProdutosEndpoint(pagina, {
        search: this.pesquisar,
        categoria: this.categoriaSelecionada,
        ordenacao: this.ordenacao,
      });
      this.carregarPagina(pagina, endpoint);
    },

    pesquisar(novoValor) {
      if (novoValor.length >= 2) {
        this.buscarProdutos(novoValor);
      } else {
        this.carregarPagina(1);
      }
    },
    '$route'(to, from) {
      // Se navegou para esta página (de qualquer outra página), recarrega página 1
      if (to.path === '/' && from.path !== '/') {
        this.paginaAtual = 1;
        this.pesquisar = "";
        this.categoriaSelecionada = "";
        this.ordenacao = "";
        this.carregarPagina(1);
      }
    },
  },

  methods: {
    formataData() {
      const data = new Date();
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const ano = data.getFullYear();
      return `${dia}-${mes}-${ano}`;
    },
    irParaDashboardOuLogin() {
      const { userId } = getAuth();
      if (userId) this.$router.push({ path: "/Dashboard" });
      else this.$router.push({ path: "/login" });
    },
    async addAoCarrinho(produto) {
      try {
        const { userId } = getAuth();
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
        try {
          await api.post(`/usuarios/setClique`, cliques);
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
      const num = typeof rating === "number" ? rating : parseFloat(String(rating || 0).replace(",", "."));
      if (isNaN(num)) return ["empty", "empty", "empty", "empty", "empty"];
      const clamped = Math.max(0, Math.min(5, num));
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

    // Monta o endpoint para buscar produtos paginados.
    // Recebe página e um objeto opcional com parâmetros: { search, categoria, ordenacao }
    // TODO: ajuste a construção conforme sua API. Exemplo de formato aceito aqui:
    //   GET /produtos/getProdutosByPage/:page?limit=20&q=term&categoria=cat&ordenacao=1
    buildProdutosEndpoint(pagina, opts = {}) {
      const page = pagina || 1;
      // Base (substitua se seu endpoint for diferente)
      const base = `https://ecommerce-nuqc.onrender.com/produtos/getProdutosByPage/${page}`;
      const params = new URLSearchParams();
      // limitar por página
      params.set('limit', String(this.produtosPorPagina));
      if (opts.search) params.set('q', String(opts.search));
      if (opts.categoria) params.set('categoria', String(opts.categoria));
      if (opts.ordenacao) params.set('ordenacao', String(opts.ordenacao));
      const qs = params.toString();
      return qs ? `${base}?${qs}` : base;
    },

    async carregarPagina(pagina, endpointArg) {
      if (this.carregandoProdutos) return;
      this.carregandoProdutos = true;
      this.mostrandoProdutos = false;
      try {
        const endpoint = endpointArg || this.buildProdutosEndpoint(pagina);
        console.debug('[TodosProdutos] carregarPagina -> pagina:', pagina, 'endpoint:', endpoint);
        const response = await api.get(endpoint);
        console.debug('[TodosProdutos] carregarPagina -> response status:', response && response.status);
        console.debug('[TodosProdutos] carregarPagina -> response.data (preview):', response && response.data && (Array.isArray(response.data) ? `array(${response.data.length})` : typeof response.data));

        // Aceitar múltiplos formatos de resposta para facilitar a integração:
        // 1) { products: [...], total: 123 }
        // 2) [ productsArray, { total } ] (formato antigo do backend)
        // 3) apenas um array (toda a página)

        if (response.data) {
          if (response.data.products) {
            this.produtos = response.data.products;
            this.totalProdutosServidor = response.data.total || this.totalProdutosServidor;
          } else if (Array.isArray(response.data) && response.data[0] && Array.isArray(response.data[0])) {
            // formato antigo: [ [produtos], { total } ]
            this.produtos = response.data[0];
            if (response.data[1] && response.data[1].total) this.totalProdutosServidor = response.data[1].total;
          } else if (Array.isArray(response.data)) {
            // array de produtos
            this.produtos = response.data;
            // total com fallback para produtos.length se servidor não retornar o total
            this.totalProdutosServidor = this.totalProdutosServidor || this.produtos.length;
          } else {
            // caso inesperado: tentar heurísticas para extrair um array de produtos
            const findFirstArray = (val, depth = 0) => {
              if (!val || depth > 3) return null;
              if (Array.isArray(val)) return val;
              if (typeof val !== 'object') return null;
              for (const k of Object.keys(val)) {
                const v = val[k];
                if (Array.isArray(v)) return v;
              }
              // tentar recursivamente em objetos aninhados (nivel 2)
              for (const k of Object.keys(val)) {
                const v = val[k];
                if (typeof v === 'object') {
                  const found = findFirstArray(v, depth + 1);
                  if (found) return found;
                }
              }
              return null;
            };

            const maybeArray = findFirstArray(response.data);
            if (maybeArray) {
              this.produtos = maybeArray;
              // tentar extrair total de chaves numéricas ou 'total' em mesmo nível
              if (response.data.total) this.totalProdutosServidor = response.data.total;
              else {
                const maybeTotal = Object.keys(response.data).map(k => response.data[k]).find(v => typeof v === 'number');
                if (maybeTotal) this.totalProdutosServidor = maybeTotal;
              }
            } else {
              // fallback: mostrar o objeto inteiro como único item para diagnóstico
              this.produtos = Array.isArray(response.data) ? response.data : [response.data];
            }
          }
        }
        console.debug('[TodosProdutos] carregarPagina -> produtos carregados:', Array.isArray(this.produtos) ? this.produtos.length : 0, 'ex:', this.produtos && this.produtos[0]);
        this.mostrandoProdutos = true;
      } catch (error) {
        console.error('Erro ao carregar produtos paginados:', error);
        this.mostrandoProdutos = true; // evita spinner infinito
      } finally {
        this.carregandoProdutos = false;
      }
    },

    async buscarProdutos(texto) {
      // Debounce simples: aguarda 300ms desde o último keystroke
      if (this.searchTimer) clearTimeout(this.searchTimer);
      return new Promise((resolve) => {
        this.searchTimer = setTimeout(async () => {
          try {
            const pagina = 1;
            this.paginaAtual = pagina;
            const endpoint = this.buildProdutosEndpoint(pagina, {
              search: texto,
              categoria: this.categoriaSelecionada,
              ordenacao: this.ordenacao,
            });
            console.debug('[TodosProdutos] buscarProdutos -> endpoint:', endpoint);
            await this.carregarPagina(pagina, endpoint);
            resolve();
          } catch (error) {
            console.error('Erro na busca paginada:', error);
            // não bloquear a UI
            resolve();
          }
        }, 300);
      });
    },

    async getCategoria() {
      try {
        const response = await api.get(`/produtos/getByCategoria`);
        if (response.data) this.categorias = response.data.map((cat) => cat.category);
      } catch (e) {
        console.error(e);
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
        await api.post(`/usuarios/setClique`, cliques);
        this.$router.push({ path: `/produto/${id}` });
      } catch (error) {
        console.error("Erro ao registrar clique:", error);
      }
    },

    formataPreco(valor) {
      if (!valor) return "R$ 0,00";
      const numero = typeof valor === "string" ? parseFloat(valor.replace(",", ".")) : valor;
      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },

    logout() {
      localStorage.removeItem("auth");
      this.$router.push({ path: "/login" });
    },
    async irParaPaginaInicial() {
      this.paginaAtual = 1;
      this.pesquisar = "";
      this.categoriaSelecionada = "";
      this.ordenacao = "";
      await this.carregarPagina(1);
      this.$router.push({ path: "/" });
    },
    async handlePrev() {
      const nova = Math.max(1, this.paginaAtual - 1);
      if (nova === this.paginaAtual) return;
      this.paginaAtual = nova;
      const endpoint = this.buildProdutosEndpoint(nova, {
        search: this.pesquisar,
        categoria: this.categoriaSelecionada,
        ordenacao: this.ordenacao,
      });
      await this.carregarPagina(nova, endpoint);
    },
    async handleNext() {
      const nova = this.paginaAtual + 1;
      this.paginaAtual = nova;
      const endpoint = this.buildProdutosEndpoint(nova, {
        search: this.pesquisar,
        categoria: this.categoriaSelecionada,
        ordenacao: this.ordenacao,
      });
      await this.carregarPagina(nova, endpoint);
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
              <h1 class="text-2xl font-bold text-primary-600 cursor-pointer hover:opacity-80 transition-opacity" @click="irParaPaginaInicial">E-Commerce</h1>
            </div>
            <div class="hidden md:flex items-center space-x-8"></div>
            <div class="flex items-center space-x-4">
              <div class="relative">
                <input v-model="pesquisar" type="text" placeholder="Search products..."
                  class="py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                <span class="material-symbols-outlined absolute left-3 top-2 text-gray-400">search</span>
              </div>
              <div class="flex items-center gap-2">
                <router-link to="/Carrinho"
                  class="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative flex items-center"
                  style="text-decoration: none !important">
                  <span class="material-symbols-outlined text-primary-600">shopping_cart</span>
                </router-link>
                <button class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
                  style="text-decoration: none !important" @click="irParaDashboardOuLogin">
                  <span class="material-symbols-outlined text-primary-600">person</span>
                </button>
                <button class="p-2 rounded-full hover:bg-gray-100 transition duration-300 flex items-center"
                  @click="logout">
                  <span class="material-symbols-outlined text-red-600">logout</span>
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
              <select v-model="categoriaSelecionada"
                class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Todas as Categorias</option>
                <option v-for="cat in categorias" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>

            <div class="flex space-x-2">
              <select v-model="ordenacao"
                class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Ordernar Por</option>
                <option value="1">Mais Barato</option>
                <option value="2">Mais Caro</option>
                <option value="3">Mais Popular</option>
              </select>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div v-if="!mostrandoProdutos" class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            <!-- Primeiro produto -->
            <div v-for="produto in produtosPaginação" :key="produto.product_id || produto.id"
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group">
              <div class="relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5">
                <img :src="produto.img_link" alt="SAMSUNG Smart TV Crystal 50" class="object-contain h-full max-w-full"
                  keywords="SAMSUNG Smart TV Crystal 50, TV, electronics, ecommerce" />
                <div class="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                    <span class="material-symbols-outlined text-gray-700">favorite</span>
                  </button>
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 delay-75">
                    <span class="material-symbols-outlined text-gray-700">visibility</span>
                  </button>
                  <button
                    class="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 delay-150">
                    <span class="material-symbols-outlined text-gray-700">share</span>
                  </button>
                </div>
              </div>
              <div class="p-4">
                <div class="flex items-center mb-2">
                  <div class="flex">
                    <span v-for="(tipo, idx) in getStars(produto.rating)" :key="idx"
                      class="material-symbols-outlined text-sm" :class="tipo === 'empty' ? 'text-gray-300' : 'text-yellow-500'
                        " :style="{
                          'font-variation-settings':
                            tipo === 'full' || tipo === 'half'
                              ? `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20`
                              : `'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
                        }">
                      {{ tipo === "half" ? "star_half" : "star" }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 ml-2">{{
                    produto.rating
                  }}</span>
                </div>
                <h3
                  class="font-medium text-base mb-1 hover:text-primary-600 transition duration-300 text-truncate cursor-pointer"
                  @click="verDetalhes(produto)">
                  {{ produto.product_name }}
                </h3>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-bold">{{
                      formataPreco(produto.actual_price)
                    }}</span>
                  </div>
                  <button class="p-2 bg-primary-50 rounded-full hover:bg-primary-100 transition duration-300"
                    @click="addAoCarrinho(produto)">
                    <span class="material-symbols-outlined text-primary-600">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-12 flex justify-center px-4">
            <div class="flex items-center space-x-2">
              <button ref="btnPrev" id="btn-prev" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                @click="handlePrev" style="pointer-events:auto; z-index:50" aria-label="Anterior">
                Anterior
              </button>

              <span>Página {{ paginaAtual }} de {{ totalPaginas }}</span>

              <button ref="btnNext" id="btn-next" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                @click="handleNext" style="pointer-events:auto; z-index:50" aria-label="Próxima">
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
    <div v-if="toastVisible" class="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg"
      role="status" aria-live="polite">
      {{ toastMessage }}
    </div>
  </div>
</template>
