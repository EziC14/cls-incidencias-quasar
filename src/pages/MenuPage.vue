<template>
  <div class="menu-page q-pa-lg">
    <div class="text-h4 q-mb-md">Bienvenido, {{ auth.usuario }}</div>
    <div class="text-caption text-grey q-mb-lg">Seleccione una opción del menú lateral</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card clickable v-ripple to="/inc-corp/registrar" class="menu-card">
          <q-card-section class="text-center">
            <q-icon name="mdi-alert-circle-plus" size="48px" color="primary" />
            <div class="text-subtitle1 q-mt-sm">Registrar Incidencia ATC</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card clickable v-ripple to="/inc-corp/listar" class="menu-card">
          <q-card-section class="text-center">
            <q-icon name="mdi-format-list-bulleted" size="48px" color="secondary" />
            <div class="text-subtitle1 q-mt-sm">Ver Incidencias</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card clickable v-ripple to="/inc-log/registrar" class="menu-card">
          <q-card-section class="text-center">
            <q-icon name="mdi-truck-delivery" size="48px" color="orange" />
            <div class="text-subtitle1 q-mt-sm">Registrar Incidencia Logística</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth'

const auth = useAuthStore()
</script>

<style lang="scss" scoped>
.menu-card {
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-4px);
  }
}
</style>

