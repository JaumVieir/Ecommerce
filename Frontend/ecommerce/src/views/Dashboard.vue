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
                Início
              </router-link>
              <router-link
                to="/TodosProdutos"
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
