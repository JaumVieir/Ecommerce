<template>
  <div class="p-8" v-if="produto">
    <h1 class="text-3xl font-bold mb-4">{{ produto.product_name }}</h1>
    <img :src="produto.img_link" alt="" class="w-96 h-64 object-cover mb-4" />
    <p class="mb-2">Preço: {{ produto.actual_price }}</p>
    <p>Rating: {{ produto.rating }}</p>
  </div>
  <div v-else class="p-8">Carregando produto...</div>
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
