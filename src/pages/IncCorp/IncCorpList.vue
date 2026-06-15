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
            v-if="selected.length > 0"
            :label="`Eliminar (${selected.length})`"
            color="negative"
            icon="mdi-delete"
            unelevated
            class="q-mr-sm"
            @click="confirmDelete"
          />
          <q-btn
            v-if="selected.length > 0"
            label="Asignar"
            color="primary"
            icon="mdi-account-edit"
            unelevated
            class="q-mr-sm"
            @click="asignarSelected"
          />
          <q-btn
            label="Importar Excel"
            color="secondary"
            icon="mdi-file-excel"
            unelevated
            @click="openImport"
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
                outlined dense class="col-2"
                hide-bottom
                @keyup.enter="buscar"
              />
              <q-select
                v-model="filtros.estado"
                :options="estados"
                label="Estado"
                outlined dense class="col-2"
                clearable hide-bottom
                @update:model-value="buscar"
              />
              <q-select
                v-model="filtros.responsable"
                :options="responsableOptions"
                label="Responsable"
                outlined dense class="col-3"
                clearable hide-bottom
                @update:model-value="buscar"
              />
              <div class="col-2">
                <q-btn
                  color="primary" icon="mdi-magnify" unelevated
                  @click="buscar" :loading="buscando"
                  class="full-width" style="height: 40px"
                />
              </div>
              <div class="col-3">
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
              <q-separator class="q-my-md" />
              <div class="text-caption text-grey-7 q-mb-sm text-weight-medium">Pedido / Guía / OC / Factura</div>
              <div class="row q-col-gutter-sm items-end">
                <q-input v-model="filtros.pedidoSerie" label="Serie Pedido" outlined dense class="col-2" hide-bottom />
                <q-input v-model="filtros.pedidoNro" label="Nro Pedido" outlined dense class="col-2" hide-bottom />
                <q-input v-model="filtros.guia" label="Nro Guía" outlined dense class="col-3" hide-bottom />
                <q-input v-model="filtros.oc" label="OC" outlined dense class="col-2" hide-bottom />
                <q-input v-model="filtros.factura" label="Factura" outlined dense class="col-3" hide-bottom />
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
        <div>
          <div class="row items-center q-mb-sm q-px-sm">
            <div class="text-subtitle2 text-grey-7">
              <q-icon name="mdi-format-list-bulleted" size="18px" class="q-mr-sm" />
              {{ total }} incidencias
            </div>
          </div>

          <div v-if="!incidencias.length && !buscando" class="text-center text-grey-4 q-py-xl">
            <q-icon name="mdi-inbox" size="56px" />
            <div class="q-mt-sm text-body2">No se encontraron incidencias</div>
          </div>

          <q-card
            v-for="inc in incidencias"
            :key="inc.ID"
            class="q-mb-sm inc-card cursor-pointer"
            flat
            @click="abrirDetalle(inc)"
          >
            <q-card-section class="q-pa-md">
              <div class="row no-wrap">
                <div class="col-auto flex items-center q-pr-md">
                  <q-checkbox
                    :model-value="selected.includes(inc.ID)"
                    @click.stop
                    @update:model-value="toggleSelection(inc.ID)"
                    dense
                  />
                </div>
                <div class="col">
                  <div class="row items-center">
                    <span class="text-weight-bold" style="font-size: 1rem; color: #37474f">
                      INCD-{{ String(inc.ID).padStart(5, '0') }}
                    </span>
                    <q-space />
                    <q-badge rounded :color="getEstadoColor(inc.ESTADOINCD)" class="q-px-sm q-py-xs text-weight-medium">
                      {{ getEstadoLabel(inc.ESTADOINCD) }}
                    </q-badge>
                  </div>
                  <div class="q-mt-xs" style="font-size: 0.95rem">
                    <span class="text-weight-bold" style="color: #EF6C00">{{ inc.CLINOM || 'Sin cliente' }}</span>
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    Pedido {{ inc.PHPVTA }}-{{ inc.PHNUME }}
                    <q-icon name="mdi-circle-small" size="14px" />
                    {{ inc.DESCTIPO || inc.TIPINCD }}
                    <template v-if="inc.MONTDEV">
                      <q-icon name="mdi-circle-small" size="14px" />
                      S/ {{ Number(inc.MONTDEV).toLocaleString('es-PE', { minimumFractionDigits: 2 }) }}
                    </template>
                  </div>
                  <div class="row items-center q-mt-sm q-gutter-x-md">
                    <div class="flex items-center text-caption" style="color: #78909c">
                      <q-icon name="mdi-calendar" size="14px" class="q-mr-xs" />
                      <span class="text-weight-medium">{{ fmtFecha(inc.FECHAINCID) }}</span>
                    </div>
                    <div class="flex items-center text-caption" style="color: #90a4ae">
                      <q-icon name="mdi-calendar-plus" size="14px" class="q-mr-xs" />
                      {{ fmtFecha(inc.FECHACREA) }}
                    </div>
                    <div class="flex items-center text-caption" style="color: #90a4ae">
                      <q-icon name="mdi-account-plus" size="14px" class="q-mr-xs" />
                      {{ inc.USUARIOCREA }}
                    </div>
                    <div v-if="inc.USRENC" class="flex items-center text-caption text-weight-medium" style="color: #EF6C00">
                      <q-icon name="mdi-account-check" size="14px" class="q-mr-xs" />
                      {{ inc.USRENC }}
                    </div>
                    <div v-else class="flex items-center text-caption" style="color: #b0bec5">
                      <q-icon name="mdi-account-off" size="14px" class="q-mr-xs" />
                      Sin responsable
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Paginación -->
          <div v-if="totalPaginas > 1" class="row justify-center items-center q-py-md">
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
              {{ paginaActual }} / {{ totalPaginas }}
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>

  <!-- Password dialog -->
  <q-dialog v-model="showPassword" persistent>
    <q-card style="min-width: 360px; border-radius: 14px">
      <q-card-section class="bg-negative text-white q-py-sm" style="border-radius: 14px 14px 0 0">
        <div class="row items-center">
          <q-icon name="mdi-shield-lock" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Confirmar eliminación</span>
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md">
        <div class="text-body2 q-mb-md">Ingrese la contraseña para eliminar {{ selected.length }} incidencia(s):</div>
        <q-input v-model="deletePassword" type="password" outlined dense autofocus hide-bottom @keyup.enter="executeDelete" />
      </q-card-section>
      <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
        <div class="row justify-end q-gutter-sm">
          <q-btn label="Cancelar" flat v-close-popup style="border-radius: 8px" no-caps />
          <q-btn label="Eliminar" color="negative" unelevated @click="executeDelete" :loading="eliminando" style="border-radius: 8px" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Asignar responsable dialog -->
  <q-dialog v-model="showAsignar" persistent>
    <q-card style="min-width: 400px; border-radius: 14px">
      <q-card-section class="bg-primary text-white q-py-sm" style="border-radius: 14px 14px 0 0">
        <div class="row items-center">
          <q-icon name="mdi-account-edit" size="sm" class="q-mr-sm" />
          <span class="text-weight-bold">Asignar Responsable</span>
          <q-space />
          <q-btn flat dense icon="mdi-close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-md">
        <div class="text-body2 q-mb-md">Asignar responsable a {{ selected.length }} incidencia(s):</div>
        <q-select v-model="asignarUsuario" :options="store.usuarios" label="Responsable" outlined dense autofocus hide-bottom />
      </q-card-section>
      <q-card-section class="bg-grey-2 q-py-sm" style="border-radius: 0 0 14px 14px">
        <div class="row justify-end q-gutter-sm">
          <q-btn label="Cancelar" flat v-close-popup style="border-radius: 8px" no-caps />
          <q-btn label="Asignar" color="primary" unelevated :loading="asignando" @click="executeAsignar" style="border-radius: 8px" no-caps />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Importar Excel dialog -->
  <q-dialog v-model="showImport" persistent>
    <q-card class="import-dialog">
      <q-card-section class="bg-secondary text-white q-py-md">
        <div class="row items-center">
          <div class="col-auto q-pr-sm">
            <div class="bg-white rounded-borders flex flex-center" style="width: 36px; height: 36px">
              <q-icon name="mdi-file-excel" color="secondary" size="20px" />
            </div>
          </div>
          <div class="col">
            <div class="text-weight-bold text-body1">Importar desde Excel</div>
            <div class="text-caption text-white text-opacity-70">Carga masiva de incidencias corporativas</div>
          </div>
          <div class="col-auto">
            <q-btn flat dense icon="mdi-close" v-close-popup @click="resetImport" />
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="!importRunning && !importResult" class="q-px-lg q-py-lg">
        <div class="text-caption text-grey-6 q-mb-md">
          Columnas: SERIE, CORRELATIVO, TIPO_INCIDENCIA, FECHA_INCIDENCIA, CONTACTO, DIR_CONTACTO, TLF_CONTACTO, EMAIL_CONTACTO, MOTIVO
        </div>

        <q-file
          ref="fileInput"
          v-model="importFile"
          label="Seleccionar archivo .xlsx"
          accept=".xlsx"
          outlined
          :disable="importRunning"
          hide-bottom
        >
          <template v-slot:prepend>
            <q-icon name="mdi-file-excel" color="secondary" />
          </template>
        </q-file>
      </q-card-section>

      <q-card-section v-if="importRunning" class="q-px-lg q-py-lg">
        <div class="text-center q-py-md">
          <q-circular-progress :value="importProgress * 100" size="80px" :thickness="8" color="secondary" track-color="grey-2" class="q-mb-md" show-value font-size="20px">
            {{ Math.round(importProgress * 100) }}%
          </q-circular-progress>
          <div class="text-body2 text-grey-8 q-mb-xs">{{ importProcessed }} de {{ importTotal }} registros</div>
          <q-linear-progress :value="importProgress" color="secondary" size="4px" rounded class="q-mb-sm" />
          <div v-if="importCurrent" class="text-caption text-grey-5">Pedido {{ importCurrent.serie }}-{{ importCurrent.correlativo }}</div>
        </div>
      </q-card-section>

      <q-card-section v-if="importResult" class="q-px-lg q-py-lg">
        <div class="text-center q-mb-md">
          <q-icon :name="importResult.err === 0 ? 'mdi-check-circle' : 'mdi-alert-circle'" :color="importResult.err === 0 ? 'positive' : 'warning'" size="56px" />
          <div class="text-h6 text-weight-bold text-grey-8 q-mt-sm">{{ importResult.ok }} registrada{{ importResult.ok !== 1 ? 's' : '' }}</div>
          <div v-if="importResult.err" class="text-body2 text-negative">{{ importResult.err }} con error{{ importResult.err !== 1 ? 'es' : '' }}</div>
        </div>

        <div v-if="importResult.errores.length" style="max-height: 160px; overflow-y: auto">
          <div v-for="(e, i) in importResult.errores" :key="i" class="q-py-xs text-caption text-negative">
            {{ e }}
          </div>
        </div>
      </q-card-section>

      <q-card-section class="bg-grey-1 q-py-md q-px-lg">
        <div class="row justify-end q-gutter-md">
          <q-btn v-if="!importResult" label="Cancelar" flat v-close-popup @click="resetImport" no-caps class="q-px-md" />
          <q-btn v-if="!importResult" label="Importar archivo" color="secondary" unelevated :disabled="!importFile" :loading="importRunning" @click="executeImport" no-caps class="q-px-lg" icon="mdi-upload" />
          <q-btn v-if="importResult" label="Cerrar" color="secondary" unelevated v-close-popup @click="resetImport" no-caps class="q-px-lg" icon="mdi-check" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { fmtFecha } from 'src/helpers/format'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const router = useRouter()
const store = useIncidentStore()
const auth = useAuthStore()

const POR_PAGINA = 50

const pageLoading = ref(true)
const incidencias = ref([])
const buscando = ref(false)
const showFiltros = ref(false)
const total = ref(0)
const paginaActual = ref(1)
const selected = ref([])
const showPassword = ref(false)
const deletePassword = ref('')
const eliminando = ref(false)
const showAsignar = ref(false)
const asignarUsuario = ref(null)
const asignando = ref(false)

const totalPaginas = computed(() => Math.ceil(total.value / POR_PAGINA))

const responsableOptions = computed(() => [
  { label: '(Sin asignar)', value: '__UNASSIGNED__' },
  ...store.usuarios.map(u => ({ label: u, value: u }))
])

const filtros = ref({
  nroIncd: '', codVend: '', codCli: '',
  tipoInc: null, estado: null, usuario: null, responsable: null,
  pedidoSerie: '', pedidoNro: '', guia: '', oc: '', factura: '',
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
  filtros.value.tipoInc || filtros.value.usuario || filtros.value.responsable ||
  filtros.value.pedidoSerie || filtros.value.pedidoNro ||
  filtros.value.guia || filtros.value.oc || filtros.value.factura ||
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
    const f = {
      ...filtros.value,
      estado: filtros.value.estado?.value ?? filtros.value.estado,
      responsable: filtros.value.responsable?.value ?? filtros.value.responsable
    }
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
  filtros.value = { nroIncd: '', codVend: '', codCli: '', tipoInc: null, estado: null, usuario: null, responsable: null, pedidoSerie: '', pedidoNro: '', guia: '', oc: '', factura: '', desde: '', hasta: '' }
  showFiltros.value = false
  buscar()
}

function abrirDetalle(inc) {
  router.push(`/inc-corp/detalle/${inc.ID}`)
}

function toggleSelection(id) {
  const idx = selected.value.indexOf(id)
  if (idx === -1) selected.value.push(id)
  else selected.value.splice(idx, 1)
}

function asignarSelected() {
  const noPendientes = incidencias.value.filter(i => selected.value.includes(i.ID) && i.ESTADOINCD !== '22')
  if (noPendientes.length > 0) {
    $q.notify({ type: 'warning', message: 'Solo se puede asignar responsable a incidencias Pendientes' })
    return
  }
  showAsignar.value = true
}

function confirmDelete() {
  deletePassword.value = ''
  showPassword.value = true
}

async function executeDelete() {
  if (deletePassword.value !== 'Tones') {
    $q.notify({ type: 'negative', message: 'Contraseña incorrecta' })
    return
  }
  eliminando.value = true
  try {
    const usuario = auth.usuario || 'ELIMINACION'
    for (const id of selected.value) {
      await store.eliminarIncidencia(id, usuario)
    }
    $q.notify({ type: 'positive', message: `${selected.value.length} incidencia(s) eliminada(s)` })
    selected.value = []
    showPassword.value = false
    await cargarPagina(1)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al eliminar' })
  } finally {
    eliminando.value = false
  }
}

// ── Importar Excel ──────────────────────────────────────────────────
const showImport = ref(false)
const importFile = ref(null)
const importRunning = ref(false)
const importProgress = ref(0)
const importProcessed = ref(0)
const importTotal = ref(0)
const importCurrent = ref(null)
const importResult = ref(null)

function openImport() {
  resetImport()
  showImport.value = true
}
function resetImport() {
  importFile.value = null
  importRunning.value = false
  importProgress.value = 0
  importProcessed.value = 0
  importTotal.value = 0
  importCurrent.value = null
  importResult.value = null
}

function excelDateToYYYYMMDD(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'number') {
    const d = new Date((val - 25569) * 86400 * 1000)
    if (isNaN(d)) return String(val)
    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  }
  const s = String(val).trim()
  if (/^\d{8}$/.test(s)) return s
  const m = s.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/)
  if (m) return `${m[3]}${m[2]}${m[1]}`
  return s.replace(/\D/g, '')
}

async function executeImport() {
  if (!importFile.value) return
  const file = importFile.value
  const reader = new FileReader()
  importRunning.value = true

  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })

      if (json.length === 0) {
        $q.notify({ type: 'warning', message: 'El archivo no contiene datos' })
        importRunning.value = false
        return
      }

      const headers = Object.keys(json[0])
      const esperados = ['SERIE', 'CORRELATIVO', 'TIPO_INCIDENCIA', 'FECHA_INCIDENCIA', 'CONTACTO', 'DIR_CONTACTO', 'TLF_CONTACTO', 'EMAIL_CONTACTO', 'MOTIVO']
      const faltantes = esperados.filter(h => !headers.some(x => x.toUpperCase() === h))
      if (faltantes.length) {
        $q.notify({ type: 'negative', message: `Faltan columnas: ${faltantes.join(', ')}` })
        importRunning.value = false
        return
      }

      const rows = json.map(r => ({
        serie: String(r.SERIE || r.serie || '').trim(),
        correlativo: String(r.CORRELATIVO || r.correlativo || '').trim(),
        tipoIncidencia: String(r.TIPO_INCIDENCIA || r.tipo_incidencia || '').trim(),
        fecha: excelDateToYYYYMMDD(r.FECHA_INCIDENCIA ?? r.fecha_incidencia ?? ''),
        contacto: String(r.CONTACTO || r.contacto || '').trim(),
        direccion: String(r.DIR_CONTACTO || r.dir_contacto || '').trim(),
        telefono: String(r.TLF_CONTACTO || r.tlf_contacto || '').trim(),
        email: String(r.EMAIL_CONTACTO || r.email_contacto || '').trim(),
        motivo: String(r.MOTIVO || r.motivo || '').trim(),
      }))

      importTotal.value = rows.length
      const result = await store.importarExcel(rows, auth.usuario, (proc, total, serie, correlativo) => {
        importProcessed.value = proc
        importProgress.value = proc / total
        importCurrent.value = { serie, correlativo }
      })
      importResult.value = result
      if (result.ok > 0) {
        $q.notify({ type: 'positive', message: `${result.ok} incidencia(s) importadas correctamente` })
        await cargarPagina(1)
      }
    } catch (err) {
      $q.notify({ type: 'negative', message: `Error al leer Excel: ${err.message}` })
    } finally {
      importRunning.value = false
    }
  }

  reader.readAsArrayBuffer(file)
}

async function executeAsignar() {
  if (!asignarUsuario.value) {
    $q.notify({ type: 'warning', message: 'Seleccione un responsable' })
    return
  }
  asignando.value = true
  try {
    for (const id of selected.value) {
      await store.asignarResponsable(id, asignarUsuario.value, auth.usuario)
    }
    $q.notify({ type: 'positive', message: `Responsable asignado a ${selected.value.length} incidencia(s)` })
    selected.value = []
    showAsignar.value = false
    asignarUsuario.value = null
    await cargarPagina(paginaActual.value)
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al asignar responsable' })
  } finally {
    asignando.value = false
  }
}
</script>

<style scoped>
.import-dialog {
  width: 480px;
  max-width: 90vw;
  border-radius: 16px !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}
.inc-card {
  border-radius: 12px !important;
  border: 1px solid #e8e8e8 !important;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;
}
.inc-card:hover {
  border-color: #D2E186 !important;
  box-shadow: 0 2px 8px rgba(210, 225, 134, 0.3);
}
</style>