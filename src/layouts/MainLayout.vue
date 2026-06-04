<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" style="height: 48px">
      <q-toolbar style="height: 48px">
        <q-btn dense flat round icon="mdi-menu" class="q-mr-sm lt-md" @click="drawer = !drawer" />
        <q-toolbar-title class="text-subtitle2">
          <q-breadcrumbs active-color="white" style="font-size: 13px">
            <q-breadcrumbs-el :label="breadcrumb" />
          </q-breadcrumbs>
        </q-toolbar-title>
        <q-badge transparent color="white" text-color="primary" class="q-px-sm q-py-xs text-caption text-weight-medium">
          {{ auth.usuario }}
        </q-badge>
        <q-btn dense flat round icon="mdi-logout" size="sm" @click="handleLogout">
          <q-tooltip>Cerrar Sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="230" :breakpoint="768" bordered class="bg-dark">
      <div class="column full-height">
        <div class="q-pa-lg text-center">
          <q-icon name="mdi-incidence" size="36px" class="text-primary q-mb-sm" />
          <div class="text-white text-subtitle2 text-weight-bold">Incidencias</div>
          <div class="text-grey-5 text-caption">Sistema de Gestión</div>
        </div>

        <q-separator dark />

        <q-list class="q-pa-sm" style="flex: 1">
          <q-item
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            exact
            clickable
            v-ripple
            class="nav-item q-mb-xs"
            style="border-radius: 8px"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar class="q-mr-sm" style="min-width: 32px">
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium" style="font-size: 13.5px">{{ item.label }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator dark />
        <div class="q-pa-sm text-center">
          <q-badge outline color="grey-6" class="text-caption">v1.0.0</q-badge>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const drawer = ref(false)

const navItems = [
  { icon: 'mdi-format-list-bulleted', label: 'Ver Incidencias', to: '/inc-corp/listar' },
  { icon: 'mdi-plus-circle', label: 'Registrar ATC', to: '/inc-corp/registrar' },
  { icon: 'mdi-truck', label: 'Registrar LGST', to: '/inc-log/registrar' },
]

const breadcrumb = computed(() => {
  const p = route.path
  if (p.startsWith('/inc-corp/listar')) return 'Incidencias Corporativas / Listado'
  if (p.startsWith('/inc-corp/registrar')) return 'Incidencias Corporativas / Registrar ATC'
  if (p.startsWith('/inc-corp/detalle')) return 'Incidencias Corporativas / Detalle ATC'
  if (p.startsWith('/inc-corp/resuelto')) return 'Incidencias Corporativas / Resolución ATC'
  if (p.startsWith('/inc-log/registrar')) return 'Incidencias Logísticas / Registrar LGST'
  return 'Incidencias'
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
.nav-item
  transition: all 0.15s ease
  &:hover:not(.bg-primary)
    background: rgba(255, 255, 255, 0.08) !important
</style>
