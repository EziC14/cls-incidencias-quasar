<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">Detalle de Incidencia #{{ id }}</div>

    <q-card flat bordered v-if="incidencia" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Incidencia</div>
        <div class="row q-col-gutter-sm">
          <q-input :model-value="'INCD-0000' + incidencia.ID" label="Nro Incidencia" outlined dense readonly class="col-3" />
          <q-input :model-value="incidencia.ESTADOINCD" label="Estado" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.DESCTIPO" label="Tipo Incidencia" outlined dense readonly class="col-3" />
          <q-input :model-value="incidencia.FECHAINCID" label="Fecha Incidencia" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.USUARIOCREA" label="Usuario Crea" outlined dense readonly class="col-2" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Cliente / Vendedor</div>
        <div class="row q-col-gutter-sm">
          <q-input :model-value="incidencia.CODCLI" label="Cód. Cliente" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.CLINOM" label="Cliente" outlined dense readonly class="col-4" />
          <q-input :model-value="incidencia.CODVEND" label="Vendedor" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.AGENOM" label="Nom. Vendedor" outlined dense readonly class="col-4" />
          <q-input :model-value="incidencia.CANAL" label="Canal" outlined dense readonly class="col-3" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="incidencia.PHPVTA">
        <div class="text-subtitle2 q-mb-sm">Pedido / Guía / Factura</div>
        <div class="row q-col-gutter-sm">
          <q-input :model-value="incidencia.PHPVTA" label="Serie" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PHNUME" label="Pedido" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PDGUIA" label="Nro Guía" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PDFECG" label="Fec. Guía" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PDTDOC && incidencia.PDFABO ? incidencia.PDTDOC + '-' + incidencia.PDFABO : (incidencia.PDTDOC || incidencia.PDFABO || '')" label="Factura" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PDFECF" label="Fec. Factura" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PHREF1" label="OC" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PHFEIN" label="Fec. OC" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PHNVVA || incidencia.PHEVVA" label="Monto OC" outlined dense readonly class="col-2" />
        </div>
      </q-card-section>
      <q-separator v-if="incidencia.VALE" />
      <q-card-section v-if="incidencia.VALE">
        <div class="text-subtitle2 q-mb-sm">Vale</div>
        <div class="row q-col-gutter-sm">
          <q-input :model-value="incidencia.ALMACEN" label="Almacén" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.VALE" label="Vale" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.EJERCICIO" label="Ejercicio" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.PERIODO" label="Periodo" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.MHREF3" label="Guía Vale" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.MHFECH" label="Fec. Vale" outlined dense readonly class="col-2" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Contacto / Devolución</div>
        <div class="row q-col-gutter-sm">
          <q-input :model-value="incidencia.NOMCONTACTO" label="Nombre Contacto" outlined dense readonly class="col-4" />
          <q-input :model-value="incidencia.NUMTLFO" label="Teléfono" outlined dense readonly class="col-2" />
          <q-input :model-value="incidencia.EMAILCONT" label="Email" outlined dense readonly class="col-4" />
          <q-input :model-value="incidencia.DIRECCONT" label="Dirección" outlined dense readonly class="col-8" />
          <q-input :model-value="incidencia.MONTDEV" label="Monto Devuelto" outlined dense readonly class="col-2" prefix="S/ " />
          <q-input :model-value="incidencia.COMENTARIO" label="Motivo" outlined dense readonly type="textarea" rows="2" class="col-12" />
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
    console.log('visualizar header:', JSON.stringify(data.header, null, 2))
    console.log('visualizar details:', JSON.stringify(data.details, null, 2))
    console.log('header keys:', Object.keys(data.header || {}))
    if (!data.header) {
      $q.notify({ type: 'warning', message: 'No se encontraron datos para esta incidencia' })
      return
    }
    incidencia.value = data.header
    detalles.value = data.details || []
  } catch (err) {
    console.error('Error en visualizar:', err)
    $q.notify({ type: 'negative', message: 'Error al cargar detalle: ' + (err.message || err), timeout: 10000 })
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
