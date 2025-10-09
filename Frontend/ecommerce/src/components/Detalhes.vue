<template>
  <div class="bg-white rounded-xl shadow-md p-6 mb-8">
    <h2 class="text-xl font-bold mb-4">Detalhes da Compra</h2>
    <div class="w-full">
      <p><span class="font-semibold">Data da Compra:</span> {{ compra.data }}</p>
      <ul class="mt-4 mb-4 space-y-2">
        <li v-for="item in compra.itens" :key="item.id" class="flex items-center gap-4 p-2 bg-gray-50 rounded">
          <img :src="item.img_link" alt="imagem" class="w-12 h-12 object-contain rounded border" />
          <span class="font-medium">{{ item.nome }}</span>
          <span class="ml-auto font-bold">{{ formatarPreco(item.preco) }}</span>
        </li>
      </ul>
      <div class="flex justify-between items-center mt-4">
        <span class="font-semibold text-lg">Total da Compra:</span>
        <span class="font-bold text-primary-600 text-lg">{{ formatarPreco(compra.valorTotal) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Detalhes',
  props: {
    compra: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatarPreco(valor) {
      if (typeof valor === 'number') {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      return valor;
    }
  }
}
</script>

<style scoped>

</style>
        
