<script>
import { ref } from "vue";
import Papa from "papaparse";
import axios from "axios";


export default {
  data() {
    return {
      produtos: [],
      paginaAtual: 1,
      produtosPorPagina: 20,
      pesquisar: '',
      ordenacao: '',
      categorias: ' ',
      categoriaSelecionada:''
    };
  },

  computed: {
    produtosFiltrados() {
    if (this.categoriaSelecionada && this.categoriaSelecionada !== '' && this.categoriaSelecionada !== 'Todas as Categorias') {
      return this.produtos.filter(p => p.category === this.categoriaSelecionada);
    } else {
      return this.produtos;
    }
  },
    produtosPaginação() {
      const inicio = (this.paginaAtual - 1) * this.produtosPorPagina;
      const fim = inicio + this.produtosPorPagina;
      return this.produtosFiltrados.slice(inicio, fim)
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
  ordenacao(){
      switch(this.ordenacao){
        case "1":
        this.produtos.sort((a, b) => parseFloat(a.actual_price) - parseFloat(b.actual_price));
        break;
      case "2":
        this.produtos.sort((a, b) => parseFloat(b.actual_price) - parseFloat(a.actual_price));
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
  }
},
  methods: {
    async buscarProdutos(texto) {
      try {
        const response = await axios.get(`http://localhost:3000/produtos/getByTexto/${texto}`);
        this.produtos = response.data;
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente.");
      }
    },
    async getCategoria(){
      try{
        const response = await axios.get(`http://localhost:3000/produtos/getByCategoria`);
        console.log(response.data);
        this.categorias = response.data.map( cat => cat.category);
        console.log(this.categorias)

      }catch(e){
        console.error(e);
      }
    },
    async getProdutos() {
      try {
        const response = await axios.get("http://localhost:3000/produtos");
        this.produtos = response.data[0];
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente.");
      }
    },
    verDetalhes(id) {
      // Navega para a página de detalhes com o id
      this.$router.push({ path: `/produto/${id}` });
    },
    formataPreco(valor) {
      if (!valor) return 'R$ 0,00';
      const numero = typeof valor === 'string' ? parseFloat(valor.replace(",", ".")) : valor;
      return numero.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
}
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
                class="hover:text-primary-600 transition duration-300"
              >
                Início
              </router-link>
              <router-link
                to="/TodosProdutos"
                class="hover:text-primary-600 transition duration-300"
              >
                Todos Produtos
              </router-link>
            </div>
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
              <button
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative"
              >
                <span class="material-symbols-outlined">shopping_cart</span>
                <span
                  class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                  >3</span
                >
              </button>
              <button
                class="p-2 rounded-full hover:bg-gray-100 transition duration-300"
              >
                <span class="material-symbols-outlined">person</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Amostragem de todos os produtos -->
      <div class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
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
               v-model="ordenacao" class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Ordernar Por</option>
                <option value="1">Mais Barato</option>
                <option value="2">Mais Caro</option>
                <option value="3">Mais Popular</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <!-- Primeiro produto -->
            <div
              v-for="produto in produtosPaginação"
              :key="produto.id"
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div class="relative relative w-full h-32 bg-white flex items-center justify-center overflow-hidden mt-5">
                <img
                
                  :src="produto.img_link"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class=" object-contain h-full max-w-full"
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
                  <span class="text-sm text-gray-500 ml-2">{{
                    produto.rating
                  }}</span>
                </div>
                <h3
                  class="font-medium text-base mb-1 hover:text-primary-600 transition duration-300 text-truncate cursor-pointer"
                  @click="verDetalhes(produto.id)"
                >
                  {{ produto.product_name }}
                </h3>
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-bold">{{ formataPreco(produto.actual_price) }}</span>
                  </div>
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
          <div class="mt-12 flex justify-center">
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

      <footer class="bg-gray-800 text-gray-200 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div></div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
