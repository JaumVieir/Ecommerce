import { createRouter, createWebHistory} from "vue-router"

import Dashboard from "../views/Dashboard.vue"
import TodosProdutos from "../views/TodosProdutos.vue"
import Login from "../views/Login.vue"
import Cadastro from "../views/Cadastro.vue"
import ProdutoDetalhes from '../views/ProdutoDetalhes.vue';

const routes = [
    { path : "/", component: Dashboard},
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