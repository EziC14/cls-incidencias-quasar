<template>
  <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto; position: relative; min-height: calc(100vh - 120px)">
    <q-inner-loading :showing="loading" color="primary" size="48px" label="Cargando..." label-class="text-primary q-mt-sm" />
    <div class="row items-center q-mb-sm">
      <q-btn flat round icon="mdi-arrow-left" @click="$router.back()" class="q-mr-xs" dense />
      <div>
        <div class="text-h6 text-weight-bold">INCD-{{ String(incidencia?.ID || id).padStart(4, '0') }}</div>
        <div class="text-caption text-grey-7">Detalle de Incidencia Corporativa</div>
      </div>
      <q-space />
      <q-btn v-if="incidencia?.ESTADOINCD === '22'" label="Cerrar" color="primary" icon="mdi-check-circle" @click="openCierre" unelevated class="q-mr-sm" style="height: 36px; border-radius: 8px" no-caps />
      <q-btn label="Más Info" color="grey-8" icon="mdi-information-outline" @click="openInfo" flat class="q-mr-sm" style="height: 36px; border-radius: 8px" no-caps />
      <q-btn label="Historial" color="secondary" icon="mdi-history" @click="openHistorial" flat style="height: 36px; border-radius: 8px" no-caps />
    </div>

    <div v-if="incidencia" class="row q-col-gutter-sm">
      <div class="col-12 col-md-7">
        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-information" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Información General</span>
              <q-space />
              <q-badge :color="estadoColor" class="text-weight-medium q-px-sm q-py-xs">{{ getEstadoLabel(incidencia.ESTADOINCD) }}</q-badge>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Tipo Incidencia</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.DESCTIPO || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Fecha Incidencia</div>
                <div class="text-body2 text-weight-medium">{{ fmtFecha(incidencia.FECHAINCID) }}</div>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="text-caption text-grey-7 q-mb-xs">Usuario Crea</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.USUARIOCREA || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-account-group" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Cliente / Vendedor</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Cód. Cliente</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.CODCLI || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Cliente</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.CLINOM || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Vendedor</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.CODVEND || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Nom. Vendedor</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.AGENOM || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Canal</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.CANAL || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Responsable</div>
                <div class="text-body2 text-weight-medium row items-center">
                  <span>{{ incidencia.USRENC || '—' }}</span>
                  <q-btn flat dense round icon="mdi-pencil" size="xs" color="grey-6" class="q-ml-xs" @click="editarResponsable = true" v-if="incidencia.ESTADOINCD === '22'" />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md" v-if="incidencia.PHPVTA">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-truck-delivery" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Pedido / Guía / Factura</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Serie</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.PHPVTA }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Pedido</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.PHNUME }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Nro Guía</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.PDGUIA || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Guía</div>
                <div class="text-body2 text-weight-medium">{{ fmtFecha(incidencia.PDFECG) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Factura</div>
                <div class="text-body2 text-weight-medium">{{ fmtFactura }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Fact.</div>
                <div class="text-body2 text-weight-medium">{{ fmtFecha(incidencia.PDFECF) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">OC</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.PHREF1 || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. OC</div>
                <div class="text-body2 text-weight-medium">{{ fmtFecha(incidencia.PHFEIN) }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Moneda</div>
                <div class="text-body2 text-weight-medium">
                  <q-chip v-if="incidencia.MONEDA === 1" size="sm" color="amber" text-color="black" dense>USD</q-chip>
                  <q-chip v-else size="sm" color="green" text-color="white" dense>SOLES</q-chip>
                </div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Monto OC</div>
                <div class="text-body2 text-weight-medium">S/ {{ fmtMoney(incidencia.PHNVVA || incidencia.PHEVVA) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md" v-if="incidencia.VALE">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-receipt" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Vale</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Almacén</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.ALMACEN }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Vale</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.VALE }}</div>
              </div>
              <div class="col-6 col-sm-2">
                <div class="text-caption text-grey-7 q-mb-xs">Ejercicio</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.EJERCICIO }}</div>
              </div>
              <div class="col-6 col-sm-2">
                <div class="text-caption text-grey-7 q-mb-xs">Periodo</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.PERIODO }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Guía Vale</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.MHREF3 || '—' }}</div>
              </div>
              <div class="col-6 col-sm-4">
                <div class="text-caption text-grey-7 q-mb-xs">Fec. Vale</div>
                <div class="text-body2 text-weight-medium">{{ fmtFecha(incidencia.MHFECH) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white q-py-sm">
            <div class="row items-center">
              <q-icon name="mdi-phone" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Contacto / Devolución</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-pb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Nombre Contacto</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.NOMCONTACTO || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Teléfono</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.NUMTLFO || '—' }}</div>
              </div>
              <div class="col-6 col-sm-3">
                <div class="text-caption text-grey-7 q-mb-xs">Monto Dev.</div>
                <div class="text-body2 text-weight-medium">S/ {{ incidencia.MONTDEV || '0.00' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Email</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.EMAILCONT || '—' }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="text-caption text-grey-7 q-mb-xs">Dirección</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.DIRECCONT || '—' }}</div>
              </div>
              <div class="col-12">
                <div class="text-caption text-grey-7 q-mb-xs">Motivo</div>
                <div class="text-body2 text-weight-medium">{{ incidencia.COMENTARIO || '—' }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card flat bordered style="height: calc(100vh - 180px); display: flex; flex-direction: column">
          <q-card-section class="bg-primary text-white q-py-sm">
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
                    <q-item-label>
                      <div class="text-caption text-grey-8">{{ det.ARTDES || '—' }}</div>
                    </q-item-label>
                    <q-item-label caption>
                      ABC: {{ det.ARTABC }} · Marca: {{ det.ARTMAR }} · Medida: {{ det.ARTMED }}
                    </q-item-label>
                    <q-item-label caption v-if="det.VALE && det.VALE !== '0' && det.VALE !== '1'" class="text-primary">
                      RQ: {{ det.VALE }} · Cant: {{ det.CANTVALE }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-right">
                      <div v-if="det.VALE && det.VALE !== '0' && det.VALE !== '1'" class="q-mb-xs">
                        <q-badge color="primary" rounded>REQ</q-badge>
                      </div>
                      <div v-else class="q-mb-xs">
                        <q-badge color="positive" rounded>STOCK</q-badge>
                      </div>
                      <div class="text-weight-bold text-primary">{{ fmtMoney(det.PRECPROD) }}</div>
                      <div class="text-caption text-grey-7">x {{ det.CANTDEV }}</div>
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
          <q-card-section class="bg-grey-2 q-py-sm">
            <div class="row items-center justify-between">
              <span class="text-caption text-weight-medium">Total Productos</span>
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
    <HistorialDialog v-model="historialDialog" :incidencia="incidencia" />

    <q-dialog v-model="editarResponsable" persistent>
      <q-card style="min-width: 380px; border-radius: 14px">
        <q-card-section class="bg-primary text-white q-py-sm" style="border-radius: 14px 14px 0 0">
          <div class="row items-center">
            <q-icon name="mdi-account-edit" size="sm" class="q-mr-sm" />
            <span class="text-weight-bold">Cambiar Responsable</span>
            <q-space />
            <q-btn flat dense icon="mdi-close" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="q-pt-md">
          <q-select v-model="nuevoResponsable" :options="store.usuarios" label="Nuevo responsable" outlined dense autofocus hide-bottom />
        </q-card-section>
        <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat v-close-popup style="border-radius: 8px" no-caps />
            <q-btn label="Guardar" color="primary" unelevated @click="guardarResponsable" style="border-radius: 8px" no-caps />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'
import { fmtFecha, fmtMoney } from 'src/helpers/format'
import CierreDialog from './CierreDialog.vue'
import InfoDialog from './InfoDialog.vue'
import HistorialDialog from './HistorialDialog.vue'

const $q = useQuasar()
const auth = useAuthStore()

const route = useRoute()
const store = useIncidentStore()
const id = route.params.id
const incidencia = ref(null)
const detalles = ref([])
const loading = ref(true)
const cierreDialog = ref(false)
const infoDialog = ref(false)
const historialDialog = ref(false)
const editarResponsable = ref(false)
const nuevoResponsable = ref('')

const fmtFactura = computed(() => {
  if (!incidencia.value) return ''
  const d = incidencia.value
  return d.PDTDOC && d.PDFABO ? `${d.PDTDOC}-${d.PDFABO}` : (d.PDTDOC || d.PDFABO || '—')
})

const estadoMap = {
  '22': { label: 'Pendiente', color: 'orange' },
  '21': { label: 'Atendido', color: 'green' },
  '23': { label: 'Refacturado', color: 'blue' },
  '24': { label: 'Pedido Anulado', color: 'red' },
  '25': { label: 'Emisión NC', color: 'purple' },
  '55': { label: 'Cerrado', color: 'green' },
  '99': { label: 'Anulado', color: 'red' },
}

const estadoColor = computed(() => {
  return estadoMap[incidencia.value?.ESTADOINCD]?.color || 'grey'
})

function getEstadoLabel(estado) {
  return estadoMap[estado]?.label || estado
}

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

function openHistorial() {
  historialDialog.value = true
}

function onCierreSaved() {
  cierreDialog.value = false
  $q.notify({ type: 'positive', message: 'Incidencia cerrada correctamente' })
}

async function guardarResponsable() {
  if (!nuevoResponsable.value) return
  try {
    await store.asignarResponsable(id, nuevoResponsable.value, auth.usuario)
    incidencia.value.USRENC = nuevoResponsable.value
    editarResponsable.value = false
    $q.notify({ type: 'positive', message: 'Responsable actualizado' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cambiar responsable' })
  }
}
</script>
