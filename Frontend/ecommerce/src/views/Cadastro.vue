<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
      
      <form @submit.prevent="handleRegister">

        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="name">Nome Completo</label>
          <input
            v-model="name"
            type="text"
            id="name"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="cpf">CPF</label>
          <input
            v-model="cpf"
            type="text"
            id="cpf"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Digite seu CPF"
            required
            maxlength="14"
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2" for="email">Email</label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Digite seu email"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 mb-2" for="password">Senha</label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Criar Conta
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600">
        Já tem uma conta?
        <router-link to="/login" class="text-primary-600 hover:underline">Entrar</router-link>
      </p>
      <div v-if="toastVisible" class="fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg" role="status" aria-live="polite">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      name: '',
      cpf: '',
      email: '',
      password: '',
      toastVisible: false,
      toastMessage: '',
      toastTimer: null
    }
  },
  methods: {
    openToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
        this.toastTimer = null;
      }, 2000);
    },
    async handleRegister() {
      // Aqui você pode integrar com API ou Firebase
      try {
        const response = await axios.post('http://localhost:3000/usuariosecommerce/cadastro', {
          nome: this.name,
          cpf: this.cpf,
          email: this.email,
          senha: this.password
        }, { headers: { "Content-Type": "application/json" } });

        const userId = response?.data?.[0]?.id ? String(response.data[0].id) : '';
        if (!userId) {
          throw new Error("Servidor não retornou ID");
        }

        await axios.post('http://localhost:3000/usuarios', {
          id: userId,
        }, { headers: { "Content-Type": "application/json" } });

        this.openToast('Conta criada com sucesso!');
        setTimeout(() => {
          this.$router.push('/login');
        }, 2000);
      } catch (error) {
        console.error('[cadastro] erro:', error?.response?.status, error?.response?.data || error?.message);
        this.openToast('Erro ao criar conta. Tente novamente.');
      }
    }
  }
}
</script>

<style scoped>
.font-sans {
  font-family: 'Lato', 'Open Sans', sans-serif;
}
.bg-primary-600 {
  background-color: #3b82f6; /* azul padrão Tailwind */
}
.bg-primary-700 {
  background-color: #2563eb;
}
.text-primary-600 {
  color: #3b82f6;
}
</style>
