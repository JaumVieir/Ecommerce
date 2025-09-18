<template>
  <div>
    <h1>Home</h1>
    <p>Contador: {{ counter.contador }}</p>
    <button type="button" class="btn btn-success" @click="counter.contar">+1</button>
  </div>

  <div class="container my-4">
    <div class="row g-3">
      <div
        class="col-6 col-md-3"
        v-for="(p, i) in primeirosOito"
        :key="p.id || i"
      >
        <div class="card h-100">
          <img
            :src="p.imgUrl"
            :alt="p.nome || p.title || 'Produto'"
            class="card-img-top"
            loading="lazy"
            @error="onImgErr"
          />
          <div class="card-body p-2">
            <h6 class="card-title text-truncate mb-1">{{ p.nome || p.title }}</h6>
            <p class="card-text small mb-2" v-if="p.preco != null || p.price != null">
              {{ formatPrice(p.preco ?? p.price) }}
            </p>
            <button class="btn btn-outline-primary w-100">Ver</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from '../services/api'
import { usandoCarrinho } from "../store/carrinho"

const counter = usandoCarrinho()
const produtos = ref([])

const primeirosOito = computed(() => produtos.value.slice(0, 8))

function formatPrice(v) {
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n)
    ? n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : ''
}

function onImgErr(e) {
  e.target.src = 'https://via.placeholder.com/400x250?text=Sem+Imagem'
}

onMounted(async () => {
  const res = await api.get('/produtos')
  produtos.value = res?.data ?? res ?? []
})
</script>
