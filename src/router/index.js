import { route } from 'quasar/wrappers'
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
  createMemoryHistory
} from 'vue-router'

import routes from './routes'
import { useUserStore } from 'src/stores/userStore'

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory
        : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    const isLogged = userStore.isAuthenticated
    const role = userStore.rolUsuario // 'ADMIN' | 'ANTROPOMETRISTA' | ...

    // ---------- 1. RUTA QUE REQUIERE LOGIN ----------
    if (to.matched.some(r => r.meta.requiresAuth) && !isLogged) {
      return next('/solconsa/login')
    }

    // ---------- 2. SI YA ESTÁ LOGUEADO, NO VOLVER A LOGIN ----------
    if (to.path.startsWith('/solconsa/login') && isLogged) {
      return next('/solconsa/dashboard')
    }

    // ---------- 3. VALIDAR ROLES ----------
    // Busca el primer meta.roles en la cadena de rutas
    const withRoles = to.matched.find(r => r.meta && r.meta.roles)
    if (withRoles) {
      const allowedRoles = withRoles.meta.roles
      if (!allowedRoles.includes(role)) {
        // No tiene permiso para esa ruta
        // Para el antropometrista lo mandamos al dashboard
        return next('/solconsa/dashboard')
      }
    }

    next()
  })

  return Router
})
