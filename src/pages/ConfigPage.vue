<template>
  <div style="position: relative; min-height: calc(100vh - 70px)">
    <template v-if="section === 'asignaciones'">
      <div class="q-pa-lg" style="max-width: 1000px; margin: 0 auto">
        <div class="q-mb-lg">
          <div class="text-h5 text-weight-bold">Asignaciones</div>
          <div class="text-grey-7 q-mt-xs" style="font-size: 14px">Mapeo de clientes a responsable automático</div>
        </div>

        <div class="row items-center q-mb-lg q-gutter-sm">
          <q-input
            v-model="filter"
            outlined
            dense
            debounce="300"
            placeholder="Buscar cliente por código o nombre..."
            style="min-width: 320px"
          >
            <template v-slot:prepend><q-icon name="mdi-magnify" color="grey-4" /></template>
          </q-input>
          <q-space />
          <q-btn label="Agregar" color="primary" icon="mdi-plus" unelevated @click="openAdd" no-caps />
          <q-btn label="Importar" color="secondary" icon="mdi-file-excel" unelevated @click="openImport" no-caps />
          <q-btn label="Generar" color="accent" outline icon="mdi-auto-fix" @click="generarDesdeHistorial" :loading="generando" no-caps />
          <q-btn flat icon="mdi-refresh" @click="cargar" />
        </div>

        <div v-if="loading" class="flex flex-center q-py-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else>
          <div v-if="filtered.length === 0" class="flex flex-center q-py-xl text-grey-4">
            <div class="text-center">
              <q-icon name="mdi-account-switch" size="56px" />
              <div class="q-mt-sm text-grey-6 text-weight-medium">No hay asignaciones</div>
            </div>
          </div>

          <div class="list-container" v-if="filtered.length > 0">
            <div
              v-for="row in filtered"
              :key="row.CODCLI"
              class="list-row"
            >
              <div class="list-row-inner">
                <div class="list-client-code">{{ row.CODCLI }}</div>
                <div class="list-client-name">{{ row.CLINOM || '—' }}</div>
                <div class="list-actions">
                  <q-select
                    v-model="row.USRENC"
                    :options="store.usuarios"
                    outlined
                    dense
                    placeholder="Responsable"
                    style="min-width: 150px"
                    @update:model-value="guardarFila(row)"
                  />
                  <q-btn flat dense round icon="mdi-delete-outline" color="negative" size="sm" @click="eliminarFila(row)" />
                </div>
              </div>
            </div>
          </div>

          <div class="q-mt-md text-grey-5 text-caption">{{ filtered.length }} registro{{ filtered.length !== 1 ? 's' : '' }}</div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="q-pa-lg text-center q-pt-xl text-grey-5">
        <q-icon name="mdi-cog-outline" size="64px" />
        <div class="q-mt-sm text-h6 text-weight-medium text-grey-6">Próximamente</div>
        <div class="text-caption q-mt-xs">Esta sección está en desarrollo</div>
      </div>
    </template>

    <q-dialog v-model="showImport" persistent>
      <q-card style="min-width: 480px; border-radius: 14px; overflow: hidden">
        <q-card-section class="bg-secondary text-white q-py-md" style="cursor: move" @mousedown.prevent="onHeaderMouseDown">
          <div class="row items-center">
            <div class="col-auto q-pr-sm">
              <div class="bg-white rounded-borders flex flex-center" style="width: 36px; height: 36px">
                <q-icon name="mdi-file-excel" color="secondary" size="20px" />
              </div>
            </div>
            <div class="col">
              <div class="text-weight-bold text-body1">Importar asignaciones</div>
              <div class="text-caption text-white text-opacity-70">Columnas: CODCLI, USRENC</div>
            </div>
            <q-btn flat dense icon="mdi-close" v-close-popup @click="resetImport" />
          </div>
        </q-card-section>
        <q-card-section v-if="!importRunning && !importResult" class="q-pa-lg">
          <q-file v-model="importFile" label="Seleccionar archivo .xlsx" accept=".xlsx" outlined hide-bottom>
            <template v-slot:prepend><q-icon name="mdi-file-excel" color="secondary" /></template>
          </q-file>
        </q-card-section>
        <q-card-section v-if="importRunning" class="q-pa-lg text-center">
          <q-circular-progress :value="importProgress * 100" size="80px" :thickness="8" color="secondary" track-color="grey-2" class="q-mb-md" show-value font-size="20px">
            {{ Math.round(importProgress * 100) }}%
          </q-circular-progress>
          <div class="text-body2 text-grey-8">{{ importProcessed }} / {{ importTotal }}</div>
        </q-card-section>
        <q-card-section v-if="importResult" class="q-pa-lg text-center">
          <q-icon :name="importResult.err === 0 ? 'mdi-check-circle' : 'mdi-alert-circle'" :color="importResult.err === 0 ? 'positive' : 'warning'" size="56px" />
          <div class="text-h6 text-weight-bold text-grey-8 q-mt-sm">{{ importResult.ok }} asignada{{ importResult.ok !== 1 ? 's' : '' }}</div>
          <div v-if="importResult.err" class="text-body2 text-negative">{{ importResult.err }} con error{{ importResult.err !== 1 ? 'es' : '' }}</div>
          <div v-if="importResult.errores.length" style="max-height: 120px; overflow-y: auto" class="q-mt-sm">
            <div v-for="(e, i) in importResult.errores" :key="i" class="q-py-xs text-caption text-negative">{{ e }}</div>
          </div>
        </q-card-section>
        <q-card-section class="bg-grey-1 q-py-md q-px-lg">
          <div class="row justify-end q-gutter-md">
            <q-btn v-if="!importResult" label="Cancelar" flat v-close-popup @click="resetImport" no-caps class="q-px-md" />
            <q-btn v-if="!importResult" label="Importar" color="secondary" unelevated :disabled="!importFile" :loading="importRunning" @click="executeImport" no-caps class="q-px-lg" icon="mdi-upload" />
            <q-btn v-if="importResult" label="Cerrar" color="secondary" unelevated v-close-popup @click="resetImport; cargar()" no-caps class="q-px-lg" icon="mdi-check" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAdd" persistent>
      <q-card style="min-width: 400px; border-radius: 14px; overflow: hidden">
        <q-card-section class="bg-primary text-white q-py-md">
          <div class="row items-center">
            <q-icon name="mdi-plus-circle" size="22px" class="q-mr-sm" />
            <div class="col text-weight-bold text-body1">Nueva asignación</div>
            <q-btn flat dense icon="mdi-close" v-close-popup @click="resetAdd" />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-lg q-gutter-md">
          <div>
            <div class="text-caption text-grey-7 q-mb-xs">Cliente</div>
            <div class="row items-center no-wrap q-gutter-sm">
              <div class="col">
                <q-input
                  v-model="addCodcli"
                  outlined
                  dense
                  placeholder="Código o busque..."
                  hide-bottom
                  readonly
                  @click="openClienteBuscar"
                >
                  <template v-slot:prepend><q-icon name="mdi-account" color="grey-5" /></template>
                </q-input>
              </div>
              <q-btn icon="mdi-magnify" color="primary" unelevated dense @click="openClienteBuscar" />
            </div>
          </div>

          <q-select
            v-model="addUsrenc"
            :options="store.usuarios"
            label="Responsable"
            outlined
            dense
            hide-bottom
          >
            <template v-slot:prepend><q-icon name="mdi-account-tie" color="grey-5" /></template>
          </q-select>
        </q-card-section>

        <ClienteDialog v-model="clienteDialog" @select="onClienteSelected" />

        <q-card-section class="bg-grey-1 q-py-md q-px-lg">
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat v-close-popup @click="resetAdd" no-caps class="q-px-md" />
            <q-btn label="Guardar" color="primary" unelevated :disabled="!addCodcli || !addUsrenc" :loading="adding" @click="saveAdd" no-caps class="q-px-lg" icon="mdi-check" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useIncidentStore } from 'stores/incident'
import { useDraggable } from 'src/composables/useDraggable'
import ClienteDialog from 'pages/Ayuda/ClienteDialog.vue'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const route = useRoute()
const store = useIncidentStore()
const { onHeaderMouseDown } = useDraggable()

const section = computed(() => route.name?.replace('Config', '').toLowerCase() || 'asignaciones')
const loading = ref(true)
const asignaciones = ref([])
const filter = ref('')
const generando = ref(false)

const filtered = computed(() => {
  if (!filter.value) return asignaciones.value
  const q = filter.value.toLowerCase()
  return asignaciones.value.filter(a =>
    (a.CODCLI || '').toLowerCase().includes(q) ||
    (a.CLINOM || '').toLowerCase().includes(q)
  )
})

onMounted(async () => {
  await store.loadUsuarios()
  await cargar()
  loading.value = false
})

async function cargar() { asignaciones.value = await store.listarAsignaciones() }
async function guardarFila(row) {
  await store.guardarAsignacion(row.CODCLI, row.USRENC)
  $q.notify({ type: 'positive', message: 'Guardado', timeout: 1500 })
}
async function eliminarFila(row) {
  $q.dialog({ title: 'Eliminar', message: `¿Eliminar asignación de ${row.CODCLI}?`, cancel: true, persistent: true })
    .onOk(async () => {
      await store.eliminarAsignacion(row.CODCLI)
      asignaciones.value = asignaciones.value.filter(a => a.CODCLI !== row.CODCLI)
      $q.notify({ type: 'positive', message: 'Eliminado', timeout: 1500 })
    })
}
async function generarDesdeHistorial() {
  generando.value = true
  try {
    const result = await store.generarAsignacionesDesdeHistorial()
    $q.notify({ type: 'positive', message: `${result.insertadas} asignaciones de ${result.total} clientes`, timeout: 3000 })
    await cargar()
  } catch (err) { $q.notify({ type: 'negative', message: err.message })
  } finally { generando.value = false }
}

const showAdd = ref(false)
const addCodcli = ref('')
const addUsrenc = ref(null)
const adding = ref(false)
const clienteDialog = ref(false)

function openAdd() { resetAdd(); showAdd.value = true }
function resetAdd() { addCodcli.value = ''; addUsrenc.value = null }
function openClienteBuscar() { clienteDialog.value = true }
function onClienteSelected(row) { addCodcli.value = row.CLICVE }
async function saveAdd() {
  if (!addCodcli.value || !addUsrenc.value) return
  adding.value = true
  try {
    await store.guardarAsignacion(addCodcli.value.trim(), addUsrenc.value)
    $q.notify({ type: 'positive', message: 'Asignación guardada', timeout: 1500 })
    showAdd.value = false
    resetAdd()
    await cargar()
  } catch (err) { $q.notify({ type: 'negative', message: err.message })
  } finally { adding.value = false }
}

const showImport = ref(false)
const importFile = ref(null)
const importRunning = ref(false)
const importProgress = ref(0)
const importProcessed = ref(0)
const importTotal = ref(0)
const importResult = ref(null)

function openImport() { resetImport(); showImport.value = true }
function resetImport() { importFile.value = null; importRunning.value = false; importProgress.value = 0; importProcessed.value = 0; importTotal.value = 0; importResult.value = null }
async function executeImport() {
  if (!importFile.value) return
  const reader = new FileReader()
  importRunning.value = true
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' })
      if (json.length === 0) { $q.notify({ type: 'warning', message: 'Archivo vacío' }); importRunning.value = false; return }
      const rows = json.map(r => ({ codcli: String(r.CODCLI || r.codcli || '').trim(), usrenc: String(r.USRENC || r.usrenc || '').trim() }))
      importTotal.value = rows.length
      const result = await store.importarAsignaciones(rows, (proc, total) => { importProcessed.value = proc; importProgress.value = proc / total })
      importResult.value = result
      if (result.ok > 0) $q.notify({ type: 'positive', message: `${result.ok} importadas`, timeout: 3000 })
    } catch (err) { $q.notify({ type: 'negative', message: err.message })
    } finally { importRunning.value = false }
  }
  reader.readAsArrayBuffer(importFile.value)
}
</script>

<style lang="sass" scoped>
.list-container
  border: 1px solid #e8e8e8
  border-radius: 10px
  overflow: hidden

.list-row
  border-bottom: 1px solid #f0f0f0

  &:last-child
    border-bottom: none

  &:hover
    background: rgba(210, 225, 134, 0.06)

.list-row-inner
  display: flex
  align-items: center
  gap: 12px
  padding: 10px 16px

.list-client-code
  font-weight: 600
  font-size: 13px
  color: #415111
  background: rgba(210, 225, 134, 0.3)
  padding: 3px 10px
  border-radius: 5px
  white-space: nowrap
  min-width: 70px
  text-align: center

.list-client-name
  flex: 1
  min-width: 0
  font-size: 13px
  color: #37474f
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.list-actions
  display: flex
  align-items: center
  gap: 6px
  flex-shrink: 0
</style>
