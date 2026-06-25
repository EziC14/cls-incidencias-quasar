<template>
  <div style="position: relative; min-height: calc(100vh - 70px)">
    <template v-if="section === 'asignaciones'">
      <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto">
        <div class="row items-center q-mb-md">
          <div>
            <div class="text-h5 text-weight-bold">Asignaciones</div>
            <div class="text-caption text-grey-7">Mapeo de clientes a responsable automático</div>
          </div>
          <q-space />
          <q-btn label="Importar" color="secondary" icon="mdi-file-excel" unelevated @click="openImport" no-caps />
          <q-btn label="Generar" color="accent" outline icon="mdi-auto-fix" @click="generarDesdeHistorial" :loading="generando" no-caps class="q-ml-sm" />
          <q-btn flat icon="mdi-refresh" @click="cargar" class="q-ml-sm" />
        </div>

        <q-card flat bordered style="border-radius: 10px">
          <q-card-section class="q-py-sm q-px-md bg-grey-1">
            <div class="row items-center">
              <q-input
                v-model="filter"
                outlined
                dense
                debounce="300"
                placeholder="Buscar cliente..."
                style="min-width: 280px"
              >
                <template v-slot:prepend><q-icon name="mdi-magnify" color="grey-5" /></template>
              </q-input>
              <q-space />
              <div class="text-grey-6 text-caption">{{ asignaciones.length }} registro{{ asignaciones.length !== 1 ? 's' : '' }}</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-table
            :rows="asignaciones"
            :columns="columns"
            row-key="CODCLI"
            :filter="filter"
            flat
            dense
            :rows-per-page-options="[25, 50, 100]"
            :loading="loading"
            hide-pagination
            class="config-table"
          >
            <template v-slot:loading><q-inner-loading showing color="primary" /></template>
            <template v-slot:no-data>
              <div class="text-center q-py-lg text-grey-5">
                <q-icon name="mdi-account-switch" size="48px" />
                <div class="q-mt-sm text-weight-medium">No hay asignaciones</div>
              </div>
            </template>
            <template v-slot:body-cell-CLINOM="props">
              <td>
                <div class="text-weight-medium">{{ props.row.CLINOM || '—' }}</div>
              </td>
            </template>
            <template v-slot:body-cell-USRENC="props">
              <td>
                <q-select
                  v-model="props.row.USRENC"
                  :options="store.usuarios"
                  outlined
                  dense
                  style="min-width: 140px"
                  @update:model-value="guardarFila(props.row)"
                />
              </td>
            </template>
            <template v-slot:body-cell-acciones="props">
              <td class="text-center">
                <q-btn flat dense round icon="mdi-delete" color="negative" size="sm" @click="eliminarFila(props.row)" />
              </td>
            </template>
          </q-table>
        </q-card>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useIncidentStore } from 'stores/incident'
import { useDraggable } from 'src/composables/useDraggable'
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

const columns = [
  { name: 'CODCLI', label: 'Cód. Cliente', field: 'CODCLI', align: 'left', sortable: true, style: 'width: 120px' },
  { name: 'CLINOM', label: 'Nombre Cliente', field: 'CLINOM', align: 'left', sortable: true },
  { name: 'USRENC', label: 'Responsable', field: 'USRENC', align: 'left', sortable: true, style: 'width: 180px' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center', sortable: false, style: 'width: 50px' },
]

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
.config-table
  thead tr:first-child th
    position: sticky
    top: 0
    z-index: 1

  ::v-deep(.q-table__middle)
    max-height: calc(100vh - 320px)
    overflow-y: auto
</style>
