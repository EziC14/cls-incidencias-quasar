<template>
  <q-layout view="lLr Lpr lFf">
    <aside
      class="custom-sidebar"
      :class="{ mini: mini, expanded: !mini }"
      @mouseenter="mini = false"
      @mouseleave="mini = true"
    >
      <div class="sidebar-inner column full-height">

        <!-- Brand -->
        <div class="brand row items-center no-wrap">
          <div class="icon-wrap">
            <q-icon name="mdi-hexagon-multiple" size="22px" style="color: #ef4444" />
          </div>
          <Transition name="fade">
            <span v-if="!mini" class="brand-text q-ml-sm">Incidencia CLS</span>
          </Transition>
        </div>

        <div class="divider" />

        <!-- Nav -->
        <nav class="nav-list col">
          <div
            v-for="item in navItems"
            :key="item.to"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item.to) }"
            @click="$router.push(item.to)"
          >
            <div class="icon-wrap">
              <q-icon :name="item.icon" size="20px" />
            </div>
            <Transition name="fade">
              <span v-if="!mini" class="item-label">{{ item.label }}</span>
            </Transition>
          </div>
        </nav>

        <div class="divider" />

        <!-- Footer -->
        <div class="footer">
          <div class="footer-item">
            <div class="icon-wrap">
              <q-avatar size="26px" style="background: #ef4444; font-size: 25px; color: white">
                {{ auth.usuario?.charAt(0)?.toUpperCase() }}
              </q-avatar>
            </div>
            <Transition name="fade">
              <span v-if="!mini" class="item-label">{{ auth.usuario }}</span>
            </Transition>
          </div>

          <div
            class="footer-item footer-item--logout"
            @click="handleLogout"
          >
            <div class="icon-wrap">
              <q-icon name="mdi-logout" size="18px" />
            </div>
            <Transition name="fade">
              <span v-if="!mini" class="item-label">Cerrar Sesión</span>
            </Transition>
          </div>
        </div>

      </div>
    </aside>

    <q-page-container :style="{ marginLeft: mini ? '60px' : '200px' }">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mini = ref(true)

const navItems = [
  { icon: 'mdi-format-list-bulleted', label: 'Ver Incidencias', to: '/inc-corp/listar' },
  { icon: 'mdi-plus-circle-outline', label: 'Registrar ATC', to: '/inc-corp/registrar' },
  { icon: 'mdi-truck-outline', label: 'Registrar LGST', to: '/inc-log/registrar' },
]

function isActive(path) {
  return route.path.startsWith(path)
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
.custom-sidebar
  position: fixed
  top: 0
  left: 0
  height: 100vh
  z-index: 1000
  background: #1c1c1e
  overflow: hidden
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1)

  &.mini
    width: 60px

  &.expanded
    width: 200px

.sidebar-inner
  width: 100%
  height: 100%

.brand
  height: 60px
  flex-shrink: 0

.brand-text
  font-size: 15px
  font-weight: 700
  color: #ffffff
  white-space: nowrap
  letter-spacing: -0.2px

.divider
  height: 1px
  background: rgba(255, 255, 255, 0.08)
  margin: 4px 0

.nav-list
  padding: 8px 0
  overflow-y: auto

.nav-item
  min-height: 46px
  display: flex
  align-items: center
  cursor: pointer
  color: #8e8e93
  transition: background 0.15s, color 0.15s

  &:hover
    background: rgba(255, 255, 255, 0.06) !important
    color: #ffffff !important

.nav-item--active
  background: rgba(239, 68, 68, 0.15) !important
  color: #ef4444 !important
  border-right: 3px solid #ef4444

.icon-wrap
  width: 60px
  min-width: 60px
  height: 46px
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0

.item-label
  font-size: 13px
  font-weight: 500
  white-space: nowrap
  color: inherit
  padding-right: 16px

.footer
  padding: 8px 0 12px

.footer-item
  min-height: 44px
  display: flex
  align-items: center
  cursor: default
  color: #8e8e93
  transition: background 0.15s, color 0.15s

  &:hover
    background: rgba(255, 255, 255, 0.05)
    color: #ffffff

.footer-item--logout
  cursor: pointer

  &:hover
    background: rgba(239, 68, 68, 0.10) !important
    color: #ef4444 !important

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.12s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>
