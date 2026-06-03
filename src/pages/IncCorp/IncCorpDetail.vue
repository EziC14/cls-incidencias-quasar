<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">Detalle de Incidencia #{{ id }}</div>

    <q-card flat bordered v-if="incidencia" class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <q-input v-model="incidencia.CODCLI" label="Cód. Cliente" outlined dense readonly class="col-3" />
          <q-input v-model="incidencia.NOMCLI" label="Cliente" outlined dense readonly class="col-9" />
          <q-input v-model="incidencia.PHPVTA" label="Serie" outlined dense readonly class="col-2" />
          <q-input v-model="incidencia.PHNUME" label="Correlativo" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.NROGUIA" label="Nro Guía" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.FECHAGUIA" label="Fec. Guía" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.NROFACT" label="Nro Factura" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.FECHAFACT" label="Fec. Factura" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.NROOC" label="Nro OC" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.FECHAOC" label="Fec. OC" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.MONTOC" label="Monto OC" outlined dense readonly class="col-2" />
          <q-input v-model="incidencia.CODVEND" label="Cód. Vendedor" outlined dense readonly class="col-2" />
          <q-input :value="incidencia.NOMVEND" label="Vendedor" outlined dense readonly class="col-4" />
          <q-input v-model="incidencia.CANAL" label="Canal" outlined dense readonly class="col-2" />
          <q-input v-model="incidencia.TIPINCD" label="Tipo Incidencia" outlined dense readonly class="col-4" />
          <q-input v-model="incidencia.FECHAINCID" label="Fecha Incidencia" outlined dense readonly class="col-3" />
          <q-input v-model="incidencia.MONTDEV" label="Monto Devuelto" outlined dense readonly class="col-2" prefix="S/ " />
        </div>
      </q-card-section>
    </q-card>

    <q-table v-if="detalles.length > 0" :rows="detalles" :columns="detailColumns" row-key="ITEMINCD" dense flat bordered
      class="q-mb-md" title="Productos" />

    <div class="row q-mt-md">
      <q-btn label="Cerrar Incidencia" color="positive" icon="mdi-check-circle" @click="openCierre" class="q-mr-sm"
        v-if="incidencia?.ESTADOINCD === '22'" />
      <q-btn label="Más Información" color="info" icon="mdi-information" @click="openInfo" class="q-mr-sm" />
      <q-btn label="Volver" color="secondary" outline icon="mdi-arrow-left" @click="$router.back()" />
    </div>

    <CierreDialog v-model="cierreDialog" :incidencia-id="id" @saved="onCierreSaved" />
    <InfoDialog v-model="infoDialog" :incidencia="incidencia" :detalles="detalles" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useIncidentStore } from 'stores/incident'
import { useQuasar } from 'quasar'
import CierreDialog from './CierreDialog.vue'
import InfoDialog from './InfoDialog.vue'

const $q = useQuasar()

const route = useRoute()
const store = useIncidentStore()
const id = route.params.id
const incidencia = ref(null)
const detalles = ref([])
const cierreDialog = ref(false)
const infoDialog = ref(false)

const detailColumns = [
  { name: 'ITEMINCD', label: 'Item', field: 'ITEMINCD', align: 'center' },
  { name: 'CODPROD', label: 'Producto', field: 'CODPROD' },
  { name: 'ARTABC', label: 'ABC', field: 'ARTABC', align: 'center' },
  { name: 'ARTMAR', label: 'Marca', field: 'ARTMAR' },
  { name: 'PRECPROD', label: 'Precio', field: 'PRECPROD', align: 'right' },
  { name: 'CANTDEV', label: 'Cant. Dev', field: 'CANTDEV', align: 'center' },
  { name: 'ARTMED', label: 'Medida', field: 'ARTMED', align: 'center' },
]

onMounted(async () => {
  try {
    const data = await store.visualizar(id)
    incidencia.value = data.header
    detalles.value = data.details || []
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar detalle' })
  }
})

function openCierre() {
  cierreDialog.value = true
}

function openInfo() {
  infoDialog.value = true
}

function onCierreSaved() {
  cierreDialog.value = false
  $q.notify({ type: 'positive', message: 'Incidencia cerrada correctamente' })
}
</script>
