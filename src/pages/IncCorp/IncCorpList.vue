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

        <!-- Header -->
        <div class="row items-center q-mb-lg">
          <div>
            <div class="text-h5 text-weight-bold">Incidencias Corporativas</div>
            <div class="text-caption text-grey-7">Listado y búsqueda de incidencias</div>
          </div>
          <q-space />
          <q-btn
            label="Nueva Incidencia"
            color="primary"
            icon="mdi-plus"
            unelevated
            @click="$router.push('/inc-corp/registrar')"
          />
        </div>

        <!-- Filtros -->
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
            <div class="row q-col-gutter-sm items-end">
              <q-input
                v-model="filtros.nroIncd"
                label="Nro Incidencia"
                outlined dense class="col-4"
                hide-bottom
                @keyup.enter="buscar"
              />
              <q-select
                v-model="filtros.estado"
                :options="estados"
                label="Estado"
                outlined dense class="col-3"
                clearable hide-bottom
                @update:model-value="buscar"
              />
              <div class="col-3">
                <q-btn
                  color="primary" icon="mdi-magnify" unelevated
                  @click="buscar" :loading="buscando"
                  class="full-width" style="height: 40px"
                />
              </div>
              <div class="col-2">
                <q-btn
                  label="Filtros" color="secondary" outline icon="mdi-cog"
                  @click="showFiltros = true"
                  class="full-width" style="height: 40px"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Dialog filtros avanzados -->
        <q-dialog v-model="showFiltros" persistent>
          <q-card style="min-width: 600px; max-width: 700px">
            <q-card-section class="bg-primary text-white q-py-sm">
              <div class="row items-center">
                <q-icon name="mdi-filter" size="sm" class="q-mr-sm" />
                <span class="text-weight-bold">Filtros Avanzados</span>
                <q-space />
                <q-btn flat dense icon="mdi-close" v-close-popup />
              </div>
            </q-card-section>
            <q-card-section class="q-pt-sm q-pb-md">
              <div class="row q-col-gutter-sm items-end">
                <q-input v-model="filtros.codVend" label="Cód. Vendedor" outlined dense class="col-4" hide-bottom />
                <q-input v-model="filtros.codCli" label="Cód. Cliente" outlined dense class="col-4" hide-bottom />
                <q-select v-model="filtros.tipoInc" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" label="Tipo" outlined dense class="col-4" clearable hide-bottom emit-value map-options />
                <q-select v-model="filtros.usuario" :options="store.usuarios" label="Usuario" outlined dense class="col-4" clearable hide-bottom />
                <q-input v-model="filtros.desde" label="Desde" outlined dense type="date" class="col-4" hide-bottom />
                <q-input v-model="filtros.hasta" label="Hasta" outlined dense type="date" class="col-4" hide-bottom />
              </div>
            </q-card-section>
            <q-card-section class="q-py-sm bg-grey-2">
              <div class="row justify-end q-gutter-sm">
                <q-btn label="Cancelar" flat v-close-popup />
                <q-btn label="Aplicar" color="primary" unelevated @click="aplicarFiltros" />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Resultados -->
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon name="mdi-format-list-bulleted" size="sm" class="q-mr-sm" />
              <span class="text-weight-bold">Resultados</span>
              <q-space />
              <span class="text-caption text-grey-7">{{ total }} incidencias</span>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <q-list separator>
              <q-item
                v-for="inc in incidencias"
                :key="inc.ID"
                clickable v-ripple
                @click="abrirDetalle(inc)"
                class="q-py-sm"
              >
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
                    <div class="text-caption text-grey-7">{{ fmtFecha(inc.FECHAINCID) }}</div>
                    <div class="text-caption text-grey-5">Creado: {{ fmtFecha(inc.FECHACREA) }}</div>
                    <div class="text-caption text-weight-medium text-primary q-mt-xs">{{ inc.DESCTIPO || inc.TIPINCD }}</div>
                  </div>
                </q-item-section>
              </q-item>

              <q-item v-if="incidencias.length === 0 && !buscando">
                <q-item-section class="text-center text-grey-5 q-py-xl">
                  <q-icon name="mdi-inbox" size="48px" />
                  <div class="q-mt-sm">No se encontraron incidencias</div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <!-- Paginación -->
          <q-card-section v-if="totalPaginas > 1" class="row justify-center items-center q-py-sm bg-grey-1">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="7"
              boundary-numbers
              direction-links
              color="primary"
              @update:model-value="cambiarPagina"
            />
            <div class="text-caption text-grey-6 q-ml-md">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </div>
          </q-card-section>
        </q-card>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { fmtFecha } from 'src/helpers/format'
import { useIncidentStore } from 'stores/incident'

const $q = useQuasar()
const router = useRouter()
const store = useIncidentStore()

const POR_PAGINA = 50

const pageLoading = ref(true)
const incidencias = ref([])
const buscando = ref(false)
const showFiltros = ref(false)
const total = ref(0)
const paginaActual = ref(1)

const totalPaginas = computed(() => Math.ceil(total.value / POR_PAGINA))

const filtros = ref({
  nroIncd: '', codVend: '', codCli: '',
  tipoInc: null, estado: null, usuario: null,
  desde: '', hasta: ''
})

const estados = [
  { label: 'Pendiente',      value: '22' },
  { label: 'Atendido',       value: '21' },
  { label: 'Refacturado',    value: '23' },
  { label: 'Pedido Anulado', value: '24' },
  { label: 'Emisión NC',     value: '25' },
  { label: 'Anulado',        value: '99' },
]

const tieneFiltros = computed(() =>
  filtros.value.nroIncd || filtros.value.codVend || filtros.value.codCli ||
  filtros.value.tipoInc || filtros.value.usuario ||
  filtros.value.desde || filtros.value.hasta
)

function getEstadoColor(estado) {
  const colors = { '22': 'orange', '21': 'green', '23': 'blue', '24': 'red', '25': 'purple' }
  return colors[estado] || 'grey'
}
function getEstadoLabel(estado) {
  const labels = { '22': 'Pendiente', '21': 'Atendido', '23': 'Refacturado', '24': 'Pedido Anulado', '25': 'Emisión NC' }
  return labels[estado] || estado
}

onMounted(async () => {
  await Promise.all([store.loadTipos(), store.loadUsuarios()])
  // Carga inicial: solo pendientes del mes
  filtros.value.estado = { label: 'Pendiente', value: '22' }
  await cargarPagina(1)
  pageLoading.value = false
})

async function cargarPagina(pagina) {
  buscando.value = true
  try {
    const f = { ...filtros.value, estado: filtros.value.estado?.value ?? filtros.value.estado }
    const [rows, count] = await Promise.all([
      store.listarIncidencias(f, pagina, POR_PAGINA),
      pagina === 1 ? store.contarIncidencias(f) : Promise.resolve(total.value)
    ])
    incidencias.value = rows
    if (pagina === 1) total.value = count
    paginaActual.value = pagina
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al cargar incidencias' })
  } finally {
    buscando.value = false
  }
}

async function buscar() {
  await cargarPagina(1)
}

function cambiarPagina(pagina) {
  cargarPagina(pagina)
}

function aplicarFiltros() {
  showFiltros.value = false
  buscar()
}

function limpiarFiltros() {
  filtros.value = { nroIncd: '', codVend: '', codCli: '', tipoInc: null, estado: null, usuario: null, desde: '', hasta: '' }
  showFiltros.value = false
  buscar()
}

function abrirDetalle(inc) {
  router.push(`/inc-corp/detalle/${inc.ID}`)
}
</script>