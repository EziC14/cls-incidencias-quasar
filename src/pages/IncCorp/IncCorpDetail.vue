<template>
  <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto">
    <div class="row items-center q-mb-lg">
      <q-btn flat round icon="mdi-arrow-left" @click="$router.back()" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold">INCD-{{ String(incidencia?.ID || id).padStart(4, '0') }}</div>
        <div class="text-caption text-grey-7">Detalle de Incidencia Corporativa</div>
      </div>
      <q-space />
      <q-btn v-if="incidencia?.ESTADOINCD === '22'" label="Cerrar Incidencia" color="positive" icon="mdi-check-circle" @click="openCierre" unelevated class="q-mr-sm" />
      <q-btn label="Más Información" color="info" icon="mdi-information" @click="openInfo" flat class="q-mr-sm" />
    </div>

    <div v-if="incidencia" class="row q-col-gutter-md">
      <div class="col-12 col-md-7">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-information" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Información General</span>
              <q-space />
              <q-badge :color="estadoColor" class="text-weight-medium q-px-sm q-py-xs">{{ incidencia.ESTADOINCD }}</q-badge>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Tipo Incidencia</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.DESCTIPO || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Fecha Incidencia</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.FECHAINCID || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Usuario Crea</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.USUARIOCREA || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-account-group" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Cliente / Vendedor</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Cód. Cliente</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.CODCLI || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Cliente</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.CLINOM || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Vendedor</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.CODVEND || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Nom. Vendedor</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.AGENOM || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Canal</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.CANAL || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md" v-if="incidencia.PHPVTA">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-truck-delivery" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Pedido / Guía / Factura</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Serie</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PHPVTA }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Pedido</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PHNUME }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Nro Guía</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PDGUIA || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Guía</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PDFECG || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Factura</div>
                <div class="text-body1 text-weight-medium">{{ fmtFactura }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Fact.</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PDFECF || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">OC</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PHREF1 || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. OC</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PHFEIN || '—' }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Monto OC</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PHNVVA || incidencia.PHEVVA || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md" v-if="incidencia.VALE">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-receipt" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Vale</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Almacén</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.ALMACEN }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Vale</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.VALE }}</div>
              </div>
              <div class="col-6 col-sm-2">
                <div class="text-caption text-grey-7 q-mb-xs">Ejercicio</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.EJERCICIO }}</div>
              </div>
              <div class="col-6 col-sm-2">
                <div class="text-caption text-grey-7 q-mb-xs">Periodo</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.PERIODO }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Guía Vale</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.MHREF3 || '—' }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Vale</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.MHFECH || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-phone" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Contacto / Devolución</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Nombre Contacto</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.NOMCONTACTO || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Teléfono</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.NUMTLFO || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Monto Dev.</div>
                <div class="text-body1 text-weight-medium">S/ {{ incidencia.MONTDEV || '0.00' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Email</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.EMAILCONT || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Dirección</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.DIRECCONT || '—' }}</div>
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-7 q-mb-xs">Motivo</div>
                <div class="text-body1 text-weight-medium">{{ incidencia.COMENTARIO || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card flat bordered style="height: calc(100vh - 200px); display: flex; flex-direction: column">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-package-variant" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Productos ({{ detalles.length }})</span>
            </div>
          </q-card-section>
          <q-scroll-area style="flex: 1">
            <q-list dense padding>
              <template v-for="(det, i) in detalles" :key="det.ITEMINCD">
                <q-item class="q-my-xs" :class="i % 2 === 0 ? 'bg-grey-1' : ''">
                  <q-item-section side>
                    <q-badge rounded color="primary" class="q-px-sm">{{ det.ITEMINCD }}</q-badge>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ det.CODPROD }}</q-item-label>
                    <q-item-label caption>
                      ABC: {{ det.ARTABC }} · Marca: {{ det.ARTMAR }} · Medida: {{ det.ARTMED }}
                    </q-item-label>
                    <q-item-label caption v-if="det.VALE">
                      Vale: {{ det.VALE }} · Cant. Vale: {{ det.CANTVALE }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-right">
                      <div class="text-weight-bold text-primary">{{ det.PRECPROD || '0.00' }}</div>
                      <div class="text-caption text-grey-7">x {{ det.CANTDEV }}</div>
                      <div v-if="det.CANTVALE" class="text-caption text-positive">
                        <q-icon name="mdi-check-circle" size="xs" /> Vale
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-separator v-if="i < detalles.length - 1" inset="item" />
              </template>
              <div v-if="detalles.length === 0" class="text-center text-grey-5 q-py-xl">
                <q-icon name="mdi-package-variant-closed" size="48px" />
                <div class="q-mt-sm">Sin productos</div>
              </div>
            </q-list>
          </q-scroll-area>
          <q-card-section class="bg-grey-2">
            <div class="row items-center justify-between">
              <span class="text-weight-medium">Total Productos</span>
              <span class="text-weight-bold text-primary text-h6">{{ detalles.length }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-if="!incidencia && !loading" class="text-center text-grey-5 q-py-xl">
      <q-icon name="mdi-alert-circle-outline" size="64px" />
      <div class="text-h6 q-mt-sm">Incidencia no encontrada</div>
    </div>

    <CierreDialog v-model="cierreDialog" :incidencia-id="id" @saved="onCierreSaved" />
    <InfoDialog v-model="infoDialog" :incidencia="incidencia" :detalles="detalles" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const loading = ref(true)
const cierreDialog = ref(false)
const infoDialog = ref(false)

const fmtFactura = computed(() => {
  if (!incidencia.value) return ''
  const d = incidencia.value
  return d.PDTDOC && d.PDFABO ? `${d.PDTDOC}-${d.PDFABO}` : (d.PDTDOC || d.PDFABO || '—')
})

const estadoColor = computed(() => {
  const map = { '22': 'orange', '55': 'green', '99': 'red' }
  return map[incidencia.value?.ESTADOINCD] || 'grey'
})

onMounted(async () => {
  try {
    const data = await store.visualizar(id)
    if (!data.header) {
      $q.notify({ type: 'warning', message: 'No se encontraron datos para esta incidencia' })
      return
    }
    incidencia.value = data.header
    detalles.value = data.details || []
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar detalle: ' + (err.message || err), timeout: 10000 })
  } finally {
    loading.value = false
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
