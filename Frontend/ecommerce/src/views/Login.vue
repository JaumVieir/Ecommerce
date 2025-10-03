<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>

      <form @submit.prevent="handleLogin">
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
          Entrar
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600">
        Não tem uma conta?
        <router-link to="/cadastro" class="text-primary-600 hover:underline">Criar Conta</router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      // Aqui você pode integrar com API ou Firebase
      console.log('Login:', this.email, this.password);
      alert('Login realizado com sucesso!');
    }
  }
}
</script>

<style scoped>
.font-sans {
  font-family: 'Lato', 'Open Sans', sans-serif;
}
.bg-primary-600 {
  background-color: #3b82f6;
}
.bg-primary-700 {
  background-color: #2563eb;
}
.text-primary-600 {
  color: #3b82f6;
}
</style>
