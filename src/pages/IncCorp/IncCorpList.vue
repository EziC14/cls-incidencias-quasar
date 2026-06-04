<template>
  <div style="position: relative; min-height: calc(100vh - 70px)">
    <div v-if="pageLoading" class="absolute-full flex flex-center bg-white" style="z-index: 9999">
      <div class="text-center">
        <q-spinner color="primary" size="64px" />
        <div class="text-primary text-weight-medium q-mt-md">Cargando incidencias...</div>
      </div>
    </div>

    <template v-if="!pageLoading">
      <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto">
        <div class="row items-center q-mb-lg">
          <div>
            <div class="text-h5 text-weight-bold">Incidencias Corporativas</div>
            <div class="text-caption text-grey-7">Listado y búsqueda de incidencias</div>
          </div>
          <q-space />
          <q-btn label="Nueva Incidencia" color="primary" icon="mdi-plus" unelevated @click="$router.push('/inc-corp/registrar')" />
        </div>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="row items-center">
              <q-icon name="mdi-filter" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Filtros</span>
              <q-space />
              <q-btn v-if="tieneFiltros" label="Limpiar" color="white" flat dense icon="mdi-close" @click="limpiarFiltros" />
            </div>
          </q-card-section>
          <q-card-section class="q-pt-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filtros.nroIncd" label="Nro Incidencia" outlined dense />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filtros.codVend" label="Cód. Vendedor" outlined dense />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input v-model="filtros.codCli" label="Cód. Cliente" outlined dense />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select v-model="filtros.tipoInc" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" label="Tipo" outlined dense clearable emit-value map-options />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select v-model="filtros.estado" :options="estados" label="Estado" outlined dense clearable emit-value map-options />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select v-model="filtros.usuario" :options="store.usuarios" label="Usuario" outlined dense clearable />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-checkbox v-model="filtrarFecha" label="Filtrar por fecha" />
              </div>
              <div class="col-12 col-sm-6 col-md-3" v-if="filtrarFecha">
                <div class="row q-col-gutter-sm">
                  <q-input v-model="filtros.desde" label="Desde" outlined dense type="date" class="col-6" />
                  <q-input v-model="filtros.hasta" label="Hasta" outlined dense type="date" class="col-6" />
                </div>
              </div>
            </div>
            <div class="row q-mt-md">
              <q-btn label="Buscar" color="primary" icon="mdi-magnify" unelevated @click="buscar" :loading="buscando" class="q-mr-sm" />
              <q-btn label="Pendientes" color="secondary" outline icon="mdi-format-list-bulleted" @click="mostrarPendientes" class="q-mr-sm" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon name="mdi-format-list-bulleted" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Resultados</span>
              <q-space />
              <span class="text-caption text-grey-7">{{ incidencias.length }} incidencias</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pa-none">
            <q-scroll-area style="height: calc(100vh - 420px)">
              <q-list separator>
                <q-item v-for="inc in incidencias" :key="inc.ID" clickable v-ripple @click="abrirDetalle(inc)" class="q-py-sm">
                  <q-item-section side>
                    <q-icon name="mdi-chevron-right" size="sm" class="text-grey-5" />
                  </q-item-section>
                  <q-item-section side>
                    <q-badge rounded :color="getEstadoColor(inc.ESTADOINCD)" class="q-px-sm q-py-xs text-weight-medium">
                      {{ getEstadoLabel(inc.ESTADOINCD) }}
                    </q-badge>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      INCD-{{ String(inc.ID).padStart(4, '0') }}
                    </q-item-label>
                    <q-item-label caption lines="2">
                      <template v-if="inc.CODCLI">
                        <q-icon name="mdi-account" size="xs" class="q-mr-xs" />{{ inc.CODCLI }}
                        <q-icon name="mdi-circle-small" size="xs" />
                      </template>
                      <template v-if="inc.PHPVTA">
                        Pedido {{ inc.PHPVTA }}-{{ inc.PHNUME }}
                        <q-icon name="mdi-circle-small" size="xs" />
                      </template>
                      <template v-if="inc.MONTDEV">
                        S/ {{ inc.MONTDEV }}
                        <q-icon name="mdi-circle-small" size="xs" />
                      </template>
                      {{ inc.USUARIOCREA }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="text-right">
                      <div class="text-caption text-grey-7">{{ inc.FECHAINCID }}</div>
                      <div class="text-caption text-weight-medium text-primary">{{ inc.TIPINCD }}</div>
                    </div>
                  </q-item-section>
                </q-item>
                <q-item v-if="incidencias.length === 0">
                  <q-item-section class="text-center text-grey-5 q-py-xl">
                    <q-icon name="mdi-inbox" size="48px" />
                    <div class="q-mt-sm">No se encontraron incidencias</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIncidentStore } from 'stores/incident'
import { useQuasar } from 'quasar'

const router = useRouter()
const store = useIncidentStore()
const $q = useQuasar()

const incidencias = ref([])
const pageLoading = ref(true)
const buscando = ref(false)
const filtrarFecha = ref(false)

const filtros = ref({
  nroIncd: '',
  codVend: '',
  codCli: '',
  tipoInc: null,
  estado: null,
  usuario: null,
  desde: '',
  hasta: ''
})

const tieneFiltros = computed(() =>
  filtros.value.nroIncd || filtros.value.codVend || filtros.value.codCli ||
  filtros.value.tipoInc || filtros.value.estado || filtros.value.usuario
)

const estados = [
  { label: 'Pendiente', value: '22' },
  { label: 'Atendido', value: '21' },
  { label: 'Refacturado', value: '23' },
  { label: 'Pedido Anulado', value: '24' },
  { label: 'Emisión NC', value: '25' },
]

function getEstadoColor(estado) {
  const colors = { '22': 'orange', '21': 'green', '23': 'blue', '24': 'red', '25': 'purple' }
  return colors[estado] || 'grey'
}

function getEstadoLabel(estado) {
  const labels = { '22': 'Pendiente', '21': 'Atendido', '23': 'Refacturado', '24': 'Pedido Anulado', '25': 'Emisión NC' }
  return labels[estado] || estado
}

function limpiarFiltros() {
  filtros.value = { nroIncd: '', codVend: '', codCli: '', tipoInc: null, estado: null, usuario: null, desde: '', hasta: '' }
  filtrarFecha.value = false
  buscar()
}

onMounted(async () => {
  pageLoading.value = true
  await Promise.all([store.loadTipos(), store.loadUsuarios()])
  incidencias.value = await store.listarIncidencias({ estado: '22' })
  pageLoading.value = false
})

async function buscar() {
  buscando.value = true
  try {
    const params = {}
    if (filtros.value.nroIncd) params.nroIncd = filtros.value.nroIncd
    if (filtros.value.codVend) params.codVend = filtros.value.codVend
    if (filtros.value.codCli) params.codCli = filtros.value.codCli
    if (filtros.value.tipoInc) params.tipoInc = filtros.value.tipoInc
    if (filtros.value.estado) params.estado = filtros.value.estado
    if (filtros.value.usuario) params.usuario = filtros.value.usuario
    if (filtrarFecha.value && filtros.value.desde && filtros.value.hasta) {
      params.desde = filtros.value.desde
      params.hasta = filtros.value.hasta
    }
    incidencias.value = await store.listarIncidencias(params)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al buscar' })
  } finally {
    buscando.value = false
  }
}

async function mostrarPendientes() {
  buscando.value = true
  try {
    incidencias.value = await store.listarIncidencias({ estado: '22' })
  } finally {
    buscando.value = false
  }
}

function abrirDetalle(inc) {
  router.push(`/inc-corp/detalle/${inc.ID}`)
}
</script>
