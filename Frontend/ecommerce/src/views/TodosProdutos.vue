<script setup>
import { ref, onMounted } from "vue";
import Papa from "papaparse";

const categorias = ref([]);
const categoriaSelecionada = ref("");

const carregarCSV = () => {
  Papa.parse("/produtos3.csv", {
    download: true,
    header: true,
    complete: (result) => {
      console.log("Resultado do CSV:", result.data); // 👈 Debug
      const lista = result.data
        .map((item) => item.category?.trim()) // garante que pega só texto
        .filter((cat) => cat && cat !== "undefined"); // remove nulos/vazios

      categorias.value = [...new Set(lista)].sort(); // remove duplicados e ordena

      console.log("Categorias extraídas:", categorias.value); // 👈 Debug
    },
    error: (err) => {
      console.error("Erro ao carregar CSV:", err);
    },
  });
};

onMounted(() => {
  carregarCSV();
});
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
                class="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>Sort By</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div class="relative">
                <img
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="Premium Denim Jacket"
                  class="w-full h-64 object-cover"
                  keywords="Premium Denim Jacket, fashion product, ecommerce"
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
                  <span class="text-sm text-gray-500 ml-2">4.2</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Premium Denim Jacket
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
                  src="https://images.unsplash.com/photo-1584735175315-9d5df23be620?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                  alt="Athletic Running Shoes"
                  class="w-full h-64 object-cover"
                  keywords="Athletic Running Shoes, fashion product, ecommerce"
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
                  <span class="text-sm text-gray-500 ml-2">4.7</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Athletic Running Shoes
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$79.99</span></div>
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
                  src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                  alt="Vintage Leather Watch"
                  class="w-full h-64 object-cover"
                  keywords="Vintage Leather Watch, fashion product, ecommerce"
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
                  <span class="text-sm text-gray-500 ml-2">4.8</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Vintage Leather Watch
                </h3>
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold">$149.99</span>
                      <span class="text-sm text-gray-500 line-through"
                        >$199.99</span
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
            <div
              class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 group"
            >
              <div class="relative">
                <img
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
                  src="https://m.media-amazon.com/images/I/71vk2qFDSPL._AC_UL320_.jpg"
                  alt="SAMSUNG Smart TV Crystal 50"
                  class="w-full h-64 object-cover"
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
                  <span class="text-sm text-gray-500 ml-2">4.6</span>
                </div>
                <h3
                  class="font-medium text-lg mb-2 hover:text-primary-600 transition duration-300"
                >
                  Classic White T-Shirt
                </h3>
                <div class="flex items-center justify-between">
                  <div><span class="font-bold">$29.99</span></div>
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
