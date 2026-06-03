import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const routes = [
  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', component: () => import('pages/LoginPage.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/menu' },
      { path: 'menu', name: 'Menu', component: () => import('pages/MenuPage.vue') },
      { path: 'inc-corp/registrar', name: 'IncCorpRegister', component: () => import('pages/IncCorp/IncCorpRegister.vue') },
      { path: 'inc-corp/listar', name: 'IncCorpList', component: () => import('pages/IncCorp/IncCorpList.vue') },
      { path: 'inc-corp/detalle/:id', name: 'IncCorpDetail', component: () => import('pages/IncCorp/IncCorpDetail.vue') },
      { path: 'inc-corp/resuelto/:id', name: 'IncResuelto', component: () => import('pages/IncCorp/IncResuelto.vue') },
      { path: 'inc-log/registrar', name: 'IncLogRegister', component: () => import('pages/IncLog/IncLogRegister.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const stored = localStorage.getItem('auth')
  if (stored) {
    const { usuario, clave } = JSON.parse(stored)
    const auth = useAuthStore()
    if (!auth.usuario) {
      auth.usuario = usuario
      auth.clave = clave
      auth.loggedIn = true
    }
  }
  if (to.meta.requiresAuth && !stored) {
    next('/login')
  } else {
    next()
  }
})

export default router

