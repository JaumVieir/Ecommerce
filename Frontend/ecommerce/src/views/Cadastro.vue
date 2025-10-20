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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      name: '',
      cpf: '000000000000',
      email: '',
      password: ''
    }
  },
  methods: {
    handleRegister() {
      // Aqui você pode integrar com API ou Firebase
      try {
        axios.post('http://localhost:3000/usuariosecommerce/cadastro', {
          nome: this.name,
          cpf: this.cpf,
          email: this.email,
          senha: this.password
        })
        .then(response => {
          axios.post('http://localhost:3000/usuarios', {
            id: response.data[0].id,
          }).then(res => {
          
            alert('Conta criada com sucesso!');
            this.$router.push('/login');
          }).catch(err => {
            console.error('Erro ao inserir no mongo:', err);
          });
        })
        .catch(error => {
          console.error('Erro ao cadastrar usuário:', error);
          alert('Erro ao criar conta. Tente novamente.');
        });
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao criar conta. Tente novamente.');
      }
 
      alert('Conta criada com sucesso!');
      this.$router.push('/login');
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
