<template>
  <q-layout view="lLr Lpr lFf">
    <q-drawer
      v-model="drawer"
      :mini="mini"
      :width="200"
      :mini-width="60"
      :bordered="false"
      class="sidebar-outer"
      @mouseenter="mini = false"
      @mouseleave="mini = true"
    >
      <div class="sidebar column full-height">

        <!-- Brand -->
        <div class="brand row items-center no-wrap" :class="mini ? 'justify-center' : 'q-px-lg'">
          <q-icon name="mdi-hexagon-multiple" size="22px" style="color: #ef4444" />
          <Transition name="fade">
            <span v-if="!mini" class="brand-text q-ml-sm">MiApp</span>
          </Transition>
        </div>

        <!-- Nav -->
        <q-list class="nav-list col">
          <q-item
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            exact
            clickable
            v-ripple
            class="nav-item"
            active-class="nav-item--active"
          >
            <div class="icon-wrap">
              <q-icon :name="item.icon" size="20px" />
            </div>
            <Transition name="fade">
              <span v-if="!mini" class="item-label">{{ item.label }}</span>
            </Transition>
          </q-item>
        </q-list>

        <!-- Divider -->
        <div class="divider" />

        <!-- Footer -->
        <div class="footer">

          <div class="footer-item" :class="mini ? 'justify-center' : ''">
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
            :class="mini ? 'justify-center' : ''"
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

const drawer = ref(true)
const mini = ref(true)

const navItems = [
  { icon: 'mdi-format-list-bulleted', label: 'Ver Incidencias', to: '/inc-corp/listar' },
  { icon: 'mdi-plus-circle-outline', label: 'Registrar ATC', to: '/inc-corp/registrar' },
  { icon: 'mdi-truck-outline', label: 'Registrar LGST', to: '/inc-log/registrar' },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style lang="sass" scoped>
// ── Quasar overrides ──────────────────────────
:deep(.q-drawer)
  background: transparent !important
  border: none !important
  box-shadow: none !important
  overflow: hidden !important
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important

:deep(.q-drawer__content)
  overflow: hidden !important
  background: transparent !important

// ── Sidebar principal ─────────────────────────
.sidebar
  width: 100%
  height: 100%
  background: #1c1c1e
  overflow: hidden

// ── Brand ─────────────────────────────────────
.brand
  height: 60px
  flex-shrink: 0

.brand-text
  font-size: 15px
  font-weight: 700
  color: #ffffff
  white-space: nowrap
  letter-spacing: -0.2px

// ── Nav ───────────────────────────────────────
.nav-list
  padding: 8px 0
  display: flex
  flex-direction: column

.nav-item
  min-height: 46px
  padding: 0 !important
  display: flex !important
  align-items: center !important
  color: #8e8e93
  border-radius: 0
  transition: background 0.15s, color 0.15s

  &:hover
    background: rgba(255, 255, 255, 0.06) !important
    color: #ffffff !important

.nav-item--active
  background: rgba(239, 68, 68, 0.15) !important
  color: #ef4444 !important
  border-right: 3px solid #ef4444

// ── Icono wrapper: ancho = mini-width exacto ──
// mini-width=60, sin márgenes → icon-wrap ocupa todo el ancho
.icon-wrap
  width: 60px
  min-width: 60px
  height: 46px
  display: flex
  align-items: center
  justify-content: center
  flex-shrink: 0

// ── Label ─────────────────────────────────────
.item-label
  font-size: 13px
  font-weight: 500
  white-space: nowrap
  color: inherit
  padding-right: 16px

// ── Divider ───────────────────────────────────
.divider
  height: 1px
  background: rgba(255, 255, 255, 0.08)
  margin: 4px 0

// ── Footer ────────────────────────────────────
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

// ── Fade ──────────────────────────────────────
.fade-enter-active,
.fade-leave-active
  transition: opacity 0.12s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0
</style>