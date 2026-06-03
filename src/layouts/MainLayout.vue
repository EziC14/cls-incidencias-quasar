<template>
  <q-layout view="hHh LpR lFf">
    <q-header elevated class="bg-primary text-white" style="height: 50px">
      <q-toolbar>
        <q-btn dense flat round icon="mdi-menu" @click="toggleSidebar" />
        <q-toolbar-title class="text-subtitle1">
          Módulo de Incidencias
        </q-toolbar-title>
        <span class="text-caption q-mr-sm">{{ auth.usuario }}</span>
        <q-btn dense flat round icon="mdi-logout" @click="handleLogout">
          <q-tooltip>Cerrar Sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="sidebarOpen" show-if-above side="left" :width="220" bordered>
      <q-list padding class="menu-vertical">
        <q-item-label header class="text-grey-8 text-weight-bold">Menú</q-item-label>

        <q-expansion-item icon="mdi-alert-circle" label="Incidencias" default-opened>
          <q-item clickable v-ripple to="/inc-corp/registrar" exact>
            <q-item-section avatar><q-icon name="mdi-plus-circle" /></q-item-section>
            <q-item-section>Registrar ATC</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/inc-corp/listar" exact>
            <q-item-section avatar><q-icon name="mdi-format-list-bulleted" /></q-item-section>
            <q-item-section>Ver Incidencias</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/inc-log/registrar" exact>
            <q-item-section avatar><q-icon name="mdi-truck" /></q-item-section>
            <q-item-section>Registrar LGST</q-item-section>
          </q-item>
        </q-expansion-item>

        </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(true)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.menu-vertical {
  .q-item--active {
    color: var(--q-primary);
    background: rgba(var(--q-primary-rgb), 0.08);
    border-right: 3px solid var(--q-primary);
  }
}
</style>


