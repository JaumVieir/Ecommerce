import { createRouter, createWebHistory} from "vue-router"
import { getAuth } from "../services/auth.js"

import Dashboard from "../views/Dashboard.vue"
import TodosProdutos from "../views/TodosProdutos.vue"
import Login from "../views/Login.vue"
import Cadastro from "../views/Cadastro.vue"
import ProdutoDetalhes from '../views/ProdutoDetalhes.vue';
import Carrinho from "../views/Carrinho.vue"

const routes = [
    { path : "/", component: TodosProdutos},
    { path : "/Cadastro", component: Cadastro},

    { path : "/login", component: Login},
    { path : "/Dashboard", component: Dashboard, meta: { requiresAuth: true }},
    { path: '/produto/:id', component: ProdutoDetalhes, props: true},
    { path : "/Carrinho", component: Carrinho},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

    router.beforeEach((to) => {
        const {userId} = getAuth();
        const loggedIn = !!userId;

        if (to.meta?.requiresAuth && !loggedIn) {
            return { path: "/", query: { redirect: to.fullPath}}
        }
    })
export default router