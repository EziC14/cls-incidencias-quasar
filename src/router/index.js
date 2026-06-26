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
      { path: '', redirect: '/inc-corp/listar' },
      { path: 'inc-corp/registrar', name: 'IncCorpRegister', component: () => import('pages/IncCorp/IncCorpRegister.vue') },
      { path: 'inc-corp/listar', name: 'IncCorpList', component: () => import('pages/IncCorp/IncCorpList.vue') },
      { path: 'inc-corp/detalle/:id', name: 'IncCorpDetail', component: () => import('pages/IncCorp/IncCorpDetail.vue') },
      { path: 'inc-corp/resuelto/:id', name: 'IncResuelto', component: () => import('pages/IncCorp/IncResuelto.vue') },
      { path: 'inc-log/registrar', name: 'IncLogRegister', component: () => import('pages/IncLog/IncLogRegister.vue') },
      { path: 'config', redirect: '/config/asignaciones' },
      { path: 'config/asignaciones', name: 'ConfigAsignaciones', component: () => import('pages/ConfigPage.vue') },
      { path: 'config/permisos', name: 'ConfigPermisos', component: () => import('pages/ConfigPage.vue') },
      { path: 'config/general', name: 'ConfigGeneral', component: () => import('pages/ConfigPage.vue') },
      { path: 'config/usuarios', name: 'ConfigUsuarios', component: () => import('pages/ConfigPage.vue') },
      { path: 'config/notificaciones', name: 'ConfigNotificaciones', component: () => import('pages/ConfigPage.vue') }
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
    const { usuario, clave, isAdmin } = JSON.parse(stored)
    const auth = useAuthStore()
    if (!auth.usuario) {
      auth.usuario = usuario
      auth.clave = clave
      auth.loggedIn = true
      auth.isAdmin = !!isAdmin
    }
  }
  if (to.meta.requiresAuth && !stored) {
    next('/login')
  } else {
    const auth = useAuthStore()
    if (to.path.startsWith('/config') && stored && !auth.isAdmin) {
      next('/inc-corp/listar')
    } else {
      next()
    }
  }
})

export default router
