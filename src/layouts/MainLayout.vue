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
            <q-icon name="mdi-hexagon-multiple" size="22px" style="color: #FB8159" />
          </div>
          <Transition name="fade">
            <span v-if="!mini" class="brand-text q-ml-sm">Incidencia CLS</span>
          </Transition>
        </div>

        <div class="divider" />

        <!-- Nav -->
        <nav class="nav-list col">
          <template v-for="item in navItems" :key="item.to">
            <div
              class="nav-item"
              :class="{
                'nav-item--active': !item.children && isActive(item.to),
                'nav-item--parent': item.children,
                'nav-item--parent-expanded': item.children && configExpanded
              }"
              @click="handleNavClick(item)"
            >
              <div class="icon-wrap">
                <q-icon :name="item.icon" size="20px" />
              </div>
              <Transition name="fade">
                <span v-if="!mini" class="item-label row items-center no-wrap">
                  {{ item.label }}
                  <q-icon v-if="item.children" :name="configExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20px" class="arrow-icon" />
                </span>
              </Transition>
            </div>

            <Transition name="slide">
              <div v-if="item.children && configExpanded && !mini" class="nav-children">
                <div
                  v-for="child in item.children"
                  :key="child.to"
                  class="nav-child"
                  :class="{ 'nav-child--active': isActive(child.to) }"
                  @click="router.push(child.to)"
                >
                  <q-icon :name="child.icon" size="17px" class="q-mr-sm" />
                  <span class="nav-child-label">{{ child.label }}</span>
                </div>
              </div>
            </Transition>
          </template>
        </nav>

        <div class="divider" />

        <!-- Footer -->
        <div class="footer">
          <div class="footer-item">
            <div class="icon-wrap">
              <q-avatar size="26px" style="background: #FB8159; font-size: 25px; color: white">
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mini = ref(true)
const expandedSections = ref({})

const navItems = [
  { icon: 'mdi-format-list-bulleted', label: 'Ver Incidencias', to: '/inc-corp/listar' },
  { icon: 'mdi-plus-circle-outline', label: 'Registrar ATC', to: '/inc-corp/registrar' },
  { icon: 'mdi-truck-outline', label: 'Registrar LGST', to: '/inc-log/registrar' },
  {
    icon: 'mdi-cog',
    label: 'Configuración',
    to: '/config/asignaciones',
    children: [
      { icon: 'mdi-account-switch', label: 'Asignaciones', to: '/config/asignaciones' },
      { icon: 'mdi-cog-outline', label: 'General', to: '/config/general' },
      { icon: 'mdi-account-group', label: 'Usuarios', to: '/config/usuarios' },
      { icon: 'mdi-bell-outline', label: 'Notificaciones', to: '/config/notificaciones' },
    ]
  },
]

const configExpanded = computed(() => expandedSections.value['config'])

function isActive(path) {
  return route.path.startsWith(path)
}

function handleNavClick(item) {
  if (item.children && !mini.value) {
    expandedSections.value['config'] = !expandedSections.value['config']
  } else {
    router.push(item.to)
  }
}

function isAnyChildActive(item) {
  return item.children && item.children.some(c => route.path.startsWith(c.to))
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
  background: #D2E186
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
  color: #415111
  white-space: nowrap
  letter-spacing: -0.2px

.divider
  height: 1px
  background: rgba(65, 81, 17, 0.15)
  margin: 4px 0

.nav-list
  padding: 8px 0
  overflow-y: auto

.nav-item
  min-height: 46px
  display: flex
  align-items: center
  cursor: pointer
  color: #415111
  transition: background 0.15s, color 0.15s

  &:hover
    background: rgba(65, 81, 17, 0.1) !important
    color: #415111 !important

.nav-item--active,
.nav-item--parent-expanded
  background: rgba(251, 129, 89, 0.15) !important
  color: #FB8159 !important
  border-right: 3px solid #FB8159

.nav-children
  background: rgba(65, 81, 17, 0.04)

.nav-child
  min-height: 36px
  padding-left: 60px
  padding-right: 12px
  display: flex
  align-items: center
  cursor: pointer
  color: #415111
  font-size: 12.5px
  font-weight: 500
  transition: background 0.12s
  border-left: 3px solid transparent

  &:hover
    background: rgba(65, 81, 17, 0.06) !important
    color: #415111 !important

.nav-child--active
  background: rgba(251, 129, 89, 0.1) !important
  color: #FB8159 !important
  border-left-color: #FB8159
  font-weight: 600

.nav-child-label
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

.arrow-icon
  margin-left: auto
  margin-right: 10px
  padding-left: 14px
  color: rgba(65, 81, 17, 0.4)
  flex-shrink: 0

  .nav-item--parent-expanded &
    color: #FB8159

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
  color: #415111
  transition: background 0.15s, color 0.15s

  &:hover
    background: rgba(65, 81, 17, 0.08)
    color: #415111

.footer-item--logout
  cursor: pointer

  &:hover
    background: rgba(251, 129, 89, 0.15) !important
    color: #FB8159 !important

.fade-enter-active,
.fade-leave-active
  transition: opacity 0.12s ease

.fade-enter-from,
.fade-leave-to
  opacity: 0

.slide-enter-active,
.slide-leave-active
  transition: all 0.2s ease

.slide-enter-from,
.slide-leave-to
  opacity: 0
  max-height: 0

.slide-enter-to,
.slide-leave-from
  opacity: 1
  max-height: 200px
</style>
