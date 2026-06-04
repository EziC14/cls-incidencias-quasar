<template>
  <div class="q-pa-md" style="position: relative; min-height: calc(100vh - 120px)">
    <q-inner-loading :showing="loading" color="primary" size="48px" label="Cargando..." label-class="text-primary q-mt-sm" />
    <div class="text-h5 q-mb-md">Incidencia Resuelta #{{ id }}</div>

    <q-card flat bordered v-if="rpta" class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <q-input v-model="rpta.DESCTIPO" label="Tipo Cierre" outlined dense readonly class="col-4" />
          <q-input v-model="rpta.FECHCIERRE" label="Fecha Cierre" outlined dense readonly class="col-4" />
          <q-input v-model="rpta.USUARIOMOD" label="Cerrado por" outlined dense readonly class="col-4" />
          <q-input v-model="rpta.MOTCIERRE" label="Motivo" outlined dense readonly type="textarea" rows="3" class="col-12" />
        </div>
      </q-card-section>
    </q-card>

    <div class="row">
      <q-btn label="Ver Detalle Completo" color="primary" icon="mdi-file-document" @click="verDetalle" class="q-mr-sm" />
      <q-btn label="Volver" color="secondary" outline icon="mdi-arrow-left" @click="$router.back()" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIncidentStore } from 'stores/incident'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const route = useRoute()
const router = useRouter()
const store = useIncidentStore()
const id = route.params.id
const rpta = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    rpta.value = await store.visualizarRpta(id)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar' })
  } finally {
    loading.value = false
  }
})

function verDetalle() {
  router.push(`/inc-corp/detalle/${id}`)
}
</script>
