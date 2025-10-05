<template>
  <div class="max-w-9xl mx-auto p-8" v-if="produto">
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden md:flex md:items-stretch md:gap-8">
      <div class="md:w-1/2 bg-gray-50 p-6 flex items-center justify-center">
        <img :src="produto.img_link" alt="" class="w-full max-w-md h-80 object-contain rounded-lg" />
      </div>

      <div class="md:w-1/2 p-6 flex flex-col justify-between">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 mb-2">{{ produto.product_name }}</h1>
          <p class="text-sm text-gray-500 mb-4">{{ produto.brand || '' }}</p>

          <div class="flex items-baseline gap-4 mb-4">
            <div class="text-3xl font-bold text-primary-600">R$ {{ produto.actual_price }}</div>
            <div class="text-sm text-gray-500 line-through" v-if="produto.list_price">{{ produto.list_price }}</div>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <div class="flex text-amber-400">
              <span class="material-symbols-outlined text-lg">star</span>
              <span class="material-symbols-outlined text-lg">star</span>
              <span class="material-symbols-outlined text-lg">star</span>
              <span class="material-symbols-outlined text-lg">star</span>
              <span class="material-symbols-outlined text-lg">star_half</span>
            </div>
            <div class="text-sm text-gray-500">{{ produto.rating }} • {{ produto.reviews_count || 0 }} avaliações</div>
          </div>

          <p class="text-gray-700 mb-6">{{ produto.description || produto.short_description || '' }}</p>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <button class="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            Adicionar ao carrinho
          </button>
          <button class="w-full sm:w-auto px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition">
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
          <h2 class="text-3xl font-bold">Baseado na Busca de Produto X</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          <div
            class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Summer Floral Dress"
                class="w-full h-64 object-cover"
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
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
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
          <div
            class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Wireless Headphones"
                class="w-full h-64 object-cover"
                keywords="Wireless Headphones, fashion product, ecommerce"
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
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm">
                    star_half
                  </span>
                </div>
                <span class="text-sm text-gray-500 ml-2">4.6</span>
              </div>
              <h3
                class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
              >
                Wireless Headphones
              </h3>
              <div class="flex items-center justify-between">
                <div><span class="font-bold">$129.99</span></div>
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
          <div
            class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Designer Sunglasses"
                class="w-full h-64 object-cover"
                keywords="Designer Sunglasses, fashion product, ecommerce"
              />
              <span
                class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
                >SALE</span
              >
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
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm">
                    star_half
                  </span>
                </div>
                <span class="text-sm text-gray-500 ml-2">4.3</span>
              </div>
              <h3
                class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
              >
                Designer Sunglasses
              </h3>
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold">$89.99</span>
                    <span class="text-sm text-gray-500 line-through"
                      >$119.99</span
                    >
                  </div>
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
          <div
            class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
          >
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                alt="Slim Fit Chino Pants"
                class="w-full h-64 object-cover"
                keywords="Slim Fit Chino Pants, fashion product, ecommerce"
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
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm"> star </span
                  ><span class="material-symbols-outlined text-sm">
                    star_half
                  </span>
                </div>
                <span class="text-sm text-gray-500 ml-2">4.1</span>
              </div>
              <h3
                class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
              >
                Slim Fit Chino Pants
              </h3>
              <div class="flex items-center justify-between">
                <div><span class="font-bold">$49.99</span></div>
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      produto: null,
    };
  },
  mounted() {
    this.getProduto();
  },
  methods: {
    async getProduto() {
      try {
        const response = await axios.get(`http://localhost:3000/produtos`);
        // response.data[0] é o array de produtos
        const produtosArray = response.data[0];
        // Filtra pelo id da rota
        this.produto = produtosArray.find((p) => p.id == this.$route.params.id);
      } catch (error) {
        console.error(error);
        alert("Erro ao carregar produto.");
      }
    },
  },
};
</script>
