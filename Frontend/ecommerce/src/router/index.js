import { createRouter, createWebHistory} from "vue-router"

import Dashboard from "../views/Dashboard.vue"
import TodosProdutos from "../views/TodosProdutos.vue"
import Login from "../views/Login.vue"
import Cadastro from "../views/Cadastro.vue"
import ProdutoDetalhes from '../views/ProdutoDetalhes.vue';
import Carrinho from "../views/Carrinho.vue"

const routes = [
    { path : "/", component: Login},
    { path : "/Cadastro", component: Cadastro},

    { path : "/TodosProdutos", component: TodosProdutos, meta: { requiresAuth: true }},
    { path : "/Dashboard", component: Dashboard, meta: { requiresAuth: true }},
    { path: '/produto/:id', component: ProdutoDetalhes, props: true, meta: { requiresAuth: true }},
    { path : "/Carrinho", component: Carrinho, meta: { requiresAuth: true }},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

function getAuth() {
    try {
        return JSON.parse(localStorage.getItem("auth" ) || "{}")
    } catch {
        return {}
    }
}
    router.beforeEach((to) => {
        const {userId} = getAuth();
        const loggedIn = !!userId;

        if (to.meta?.requiresAuth && !loggedIn) {
            return { path: "/", query: { redirect: to.fullPath}}
        }

        if (!to.meta?.requiresAuth && loggedIn && (to.path === "/" || to.path === "/Cadstro")) {
            return { path: "/Dashboard"}
        }
    })
export default router