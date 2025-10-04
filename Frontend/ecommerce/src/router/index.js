import { createRouter, createWebHistory} from "vue-router"

import Inicio from "../views/Inicio.vue"
import TodosProdutos from "../views/TodosProdutos.vue"
import Login from "../views/Login.vue"
import Cadastro from "../views/Cadastro.vue"
import ProdutoDetalhes from '../views/ProdutoDetalhes.vue';

const routes = [
    { path : "/", component: Inicio},
    { path : "/TodosProdutos", component: TodosProdutos},
    { path : "/Login", component: Login},
    { path : "/Cadastro", component: Cadastro},
    { path: '/produto/:id', component: ProdutoDetalhes, props: true },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router