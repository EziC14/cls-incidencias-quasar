<template>
  <div class="menu-page q-pa-lg" style="max-width: 1000px; margin: 0 auto">
    <div class="text-center q-mb-lg">
      <q-icon name="mdi-incidence" size="64px" color="primary" class="q-mb-sm" />
      <div class="text-h4 text-weight-bold">Bienvenido, {{ auth.usuario }}</div>
      <div class="text-caption text-grey-7">Seleccione una opción</div>
    </div>

    <div class="row q-col-gutter-md justify-center">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card clickable v-ripple @click="$router.push('/inc-corp/registrar')" class="menu-card">
          <q-card-section class="text-center q-py-lg">
            <q-icon name="mdi-alert-circle-plus" size="56px" color="primary" />
            <div class="text-h6 q-mt-sm">Registrar Incidencia ATC</div>
            <div class="text-caption text-grey-7 q-mt-xs">Registro corporativo de incidencias</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card clickable v-ripple @click="$router.push('/inc-corp/listar')" class="menu-card">
          <q-card-section class="text-center q-py-lg">
            <q-icon name="mdi-format-list-bulleted" size="56px" color="secondary" />
            <div class="text-h6 q-mt-sm">Ver Incidencias</div>
            <div class="text-caption text-grey-7 q-mt-xs">Listado y búsqueda de incidencias</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card clickable v-ripple @click="$router.push('/inc-log/registrar')" class="menu-card">
          <q-card-section class="text-center q-py-lg">
            <q-icon name="mdi-truck-delivery" size="56px" color="orange" />
            <div class="text-h6 q-mt-sm">Registrar Incidencia Logística</div>
            <div class="text-caption text-grey-7 q-mt-xs">Registro logístico de incidencias</div>
          </q-card-section>
        </q-card>
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
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
}
</style>
