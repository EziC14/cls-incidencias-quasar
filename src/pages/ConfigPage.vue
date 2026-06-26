<template>
  <div style="position: relative; min-height: calc(100vh - 70px)">
    <template v-if="section === 'asignaciones'">
      <div class="sticky-header">
        <div class="q-pa-lg" style="max-width: 1000px; margin: 0 auto">
          <div class="q-mb-sm">
            <div class="text-h5 text-weight-bold">Asignaciones</div>
            <div class="text-grey-7 q-mt-xs" style="font-size: 14px">Mapeo de clientes a responsable automático</div>
          </div>

          <div class="row items-center q-gutter-sm">
            <q-input
              v-model="filter"
              outlined
              dense
              debounce="300"
              placeholder="Buscar cliente..."
              style="min-width: 280px"
            >
              <template v-slot:prepend><q-icon name="mdi-magnify" color="grey-4" /></template>
            </q-input>
            <q-space />
            <q-btn label="Agregar" color="accent" unelevated icon="mdi-plus" @click="openAdd" no-caps />
            <q-btn label="Importar" color="secondary" unelevated icon="mdi-file-excel" @click="openImport" no-caps />
          </div>
        </div>
      </div>

      <div class="q-pa-lg" style="max-width: 1000px; margin: 0 auto">

        <div v-if="loading" class="flex flex-center q-py-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <template v-else>
          <div v-if="filtered.length === 0" class="flex flex-center q-py-xl text-grey-4">
            <div class="text-center">
              <q-icon name="mdi-account-switch" size="56px" />
              <div class="q-mt-sm text-grey-6 text-weight-medium">No hay asignaciones</div>
            </div>
          </div>

          <div v-else class="list-container">
            <div v-for="row in filtered" :key="row.CODCLI" class="list-row" @click="abrirSelector(row)">
              <div class="list-left">
                <div class="list-avatar"><q-icon name="mdi-domain" size="20px" /></div>
                <div class="list-info">
                  <div class="list-code">{{ row.CODCLI }}</div>
                  <div class="list-name">{{ row.CLINOM || '—' }}</div>
                </div>
              </div>

              <div class="list-right">
                <div class="list-responsable">
                  <q-icon name="mdi-account-tie" size="16px" color="grey-4" class="q-mr-xs" />
                  <span :class="{ 'text-grey-4': !row.USRENC }">{{ row.USRENC || 'Asignar responsable' }}</span>
                </div>
                <q-btn flat dense round icon="mdi-delete-outline" color="negative" size="sm" @click.stop="eliminarFila(row)" class="q-ml-sm" />
              </div>
            </div>
          </div>

          <div class="q-mt-md text-grey-5 text-caption">{{ filtered.length }} registro{{ filtered.length !== 1 ? 's' : '' }}</div>
        </template>
      </div>
    </template>

    <template v-else-if="section === 'permisos'">
      <div class="q-pa-lg" style="max-width: 700px; margin: 0 auto">
        <div class="q-mb-lg">
          <div class="text-h5 text-weight-bold">Permisos</div>
          <div class="text-grey-7 q-mt-xs" style="font-size: 14px">Control de acceso al panel de configuración</div>
        </div>

        <div class="row items-center q-mb-md q-gutter-sm">
          <q-input v-model="permisoFilter" outlined dense debounce="300" placeholder="Buscar admin..." style="min-width: 240px">
            <template v-slot:prepend><q-icon name="mdi-magnify" color="grey-4" /></template>
          </q-input>
          <q-btn label="Agregar admin" color="accent" unelevated icon="mdi-plus" @click="showAddPermiso = true" no-caps />
        </div>

        <div v-if="permisoLoading" class="flex flex-center q-py-xl">
          <q-spinner color="primary" size="40px" />
        </div>

        <template v-else>
          <div v-if="adminsFiltrados.length === 0" class="flex flex-center q-py-xl text-grey-4">
            <div class="text-center">
              <q-icon name="mdi-shield-account" size="56px" />
              <div class="q-mt-sm text-grey-6 text-weight-medium">Sin resultados</div>
            </div>
          </div>

          <div v-else class="list-container">
            <div v-for="row in adminsFiltrados" :key="row.USUARIO" class="list-row">
              <div class="list-left">
                <div class="list-avatar" style="background: #FB8159; color: #fff"><q-icon name="mdi-shield-account" size="20px" /></div>
                <div class="list-info">
                  <div class="list-code">{{ row.USUARIO }}</div>
                  <div class="list-name">{{ row.FECHAMOD ? `Agregado: ${row.FECHAMOD}` : 'Acceso completo a configuración' }}</div>
                </div>
              </div>
              <div class="list-right">
                <q-btn flat dense round icon="mdi-delete-outline" color="negative" size="sm" @click="eliminarPermiso(row)" />
              </div>
            </div>
          </div>

          <div class="q-mt-md text-caption text-grey-4">
            Los usuarios admin tienen acceso a todas las secciones de configuración.
            Los demás usuarios solo ven incidencias y registros.
          </div>
        </template>
      </div>

      <q-dialog v-model="showAddPermiso">
        <q-card style="min-width: 400px; border-radius: 14px">
          <q-card-section class="bg-accent text-white q-py-md">
            <div class="row items-center">
              <q-icon name="mdi-plus-circle" size="22px" class="q-mr-sm" />
              <div class="col text-weight-bold text-body1">Agregar admin</div>
              <q-btn flat dense icon="mdi-close" v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="q-pa-lg q-gutter-md">
            <div>
              <div class="text-caption text-grey-7 q-mb-xs">Nombre de usuario</div>
              <q-select
                v-model="nuevoAdmin"
                :options="usuariosDisponibles"
                outlined
                dense
                use-input
                fill-input
                hide-bottom
                placeholder="Buscar o escribir usuario..."
              >
                <template v-slot:prepend><q-icon name="mdi-account" color="grey-5" /></template>
              </q-select>
            </div>
            <div class="bg-amber-1 q-pa-md" style="border-radius: 8px; border-left: 3px solid #FB8159;">
              <div class="text-caption text-grey-7">El usuario tendrá acceso completo a Configuración (Asignaciones, Permisos y futuras secciones).</div>
            </div>
          </q-card-section>
          <q-card-section class="bg-grey-1 q-py-md q-px-lg">
            <div class="row justify-end q-gutter-sm">
              <q-btn label="Cancelar" flat v-close-popup no-caps class="q-px-md" />
              <q-btn label="Guardar" color="accent" unelevated :disabled="!nuevoAdmin" :loading="permisoAdding" @click="agregarPermiso" no-caps icon="mdi-check" class="q-px-lg" />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </template>

    <template v-else>
      <div class="q-pa-lg text-center q-pt-xl text-grey-5">
        <q-icon name="mdi-cog-outline" size="64px" />
        <div class="q-mt-sm text-h6 text-weight-medium text-grey-6">Próximamente</div>
        <div class="text-caption q-mt-xs">Esta sección está en desarrollo</div>
      </div>
    </template>

    <q-dialog v-model="showSelector" persistent>
      <q-card style="min-width: 380px; border-radius: 14px; overflow: hidden">
        <q-card-section class="bg-primary text-white q-py-md">
          <div class="row items-center">
            <q-icon name="mdi-account-tie" size="22px" class="q-mr-sm" />
            <div class="col text-weight-bold text-body1">Seleccionar responsable</div>
            <q-btn flat dense icon="mdi-close" v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="q-pa-lg">
          <div class="text-weight-medium text-grey-8 q-mb-sm" style="font-size: 14px">
            {{ selectorTarget?.CODCLI }} — {{ selectorTarget?.CLINOM }}
          </div>
          <q-input
            v-model="selectorSearch"
            outlined
            dense
            placeholder="Buscar responsable..."
            autofocus
            clearable
            class="q-mb-md"
          >
            <template v-slot:prepend><q-icon name="mdi-magnify" color="grey-4" /></template>
          </q-input>
          <div style="max-height: 300px; overflow-y: auto">
            <div
              v-for="user in filteredUsuarios"
              :key="user"
              class="selector-item"
              :class="{ selected: selectorTarget && selectorTarget.USRENC === user }"
              @click="seleccionarUsuario(user)"
            >
              <div class="selector-avatar">{{ user.charAt(0).toUpperCase() }}</div>
              <div>
                <div class="selector-name">{{ user }}</div>
                <div class="selector-sub">Responsable</div>
              </div>
              <q-icon v-if="selectorTarget && selectorTarget.USRENC === user" name="mdi-check-circle" color="primary" size="20px" class="q-ml-auto" />
            </div>
            <div v-if="filteredUsuarios.length === 0" class="text-center q-py-md text-grey-5 text-caption">Sin resultados</div>
          </div>
        </q-card-section>
        <q-card-section class="bg-grey-1 q-py-sm q-px-lg">
          <div class="row justify-end">
            <q-btn label="Cancelar" flat v-close-popup no-caps class="q-px-md" />
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
          <div>
            <div class="text-caption text-grey-7 q-mb-xs">Responsable</div>
            <q-select
              v-model="addUsrenc"
              :options="store.usuarios"
              outlined
              dense
              use-input
              fill-input
              hide-bottom
              placeholder="Buscar y seleccionar..."
            >
              <template v-slot:prepend><q-icon name="mdi-account-tie" color="grey-5" /></template>
            </q-select>
          </div>
        </q-card-section>

        <q-card-section class="bg-grey-1 q-py-md q-px-lg">
          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat v-close-popup @click="resetAdd" no-caps class="q-px-md" />
            <q-btn label="Guardar" color="primary" unelevated :disabled="!addCodcli || !addUsrenc" :loading="adding" @click="saveAdd" no-caps class="q-px-lg" icon="mdi-check" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ClienteDialog v-model="clienteDialog" @select="onClienteSelected" />

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
import { ref, computed, onMounted, watch } from 'vue'
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
const showSelector = ref(false)
const selectorTarget = ref(null)
const selectorSearch = ref('')

const filtered = computed(() => {
  if (!filter.value) return asignaciones.value
  const q = filter.value.toLowerCase()
  return asignaciones.value.filter(a =>
    (a.CODCLI || '').toLowerCase().includes(q) ||
    (a.CLINOM || '').toLowerCase().includes(q)
  )
})

const filteredUsuarios = computed(() => {
  if (!selectorSearch.value) return store.usuarios
  const q = selectorSearch.value.toLowerCase()
  return store.usuarios.filter(u => u.toLowerCase().includes(q))
})

function abrirSelector(row) {
  selectorTarget.value = row
  selectorSearch.value = ''
  showSelector.value = true
}

function seleccionarUsuario(user) {
  if (selectorTarget.value) {
    selectorTarget.value.USRENC = user
    guardarFila(selectorTarget.value)
  }
  showSelector.value = false
}

onMounted(async () => {
  await store.loadUsuarios()
  if (section.value === 'permisos') {
    await cargarPermisos()
  } else {
    await cargar()
    loading.value = false
  }
})

watch(section, async (val) => {
  if (val === 'permisos') await cargarPermisos()
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
// ---- Permisos ----
const permisoFilter = ref('')
const permisoLoading = ref(true)
const admins = ref([])
const usuariosDisponibles = ref([])
const showAddPermiso = ref(false)
const nuevoAdmin = ref(null)
const permisoAdding = ref(false)

const adminsFiltrados = computed(() => {
  if (!permisoFilter.value) return admins.value
  const q = permisoFilter.value.toLowerCase()
  return admins.value.filter(a => a.USUARIO.toLowerCase().includes(q))
})

async function cargarPermisos() {
  permisoLoading.value = true
  try {
    const [todos, adminRows] = await Promise.all([
      store._query("SELECT DISTINCT USUARIOCREA FROM CLS.TINCIDENCIAH WHERE USUARIOCREA IS NOT NULL AND USUARIOCREA <> ''"),
      store._query("SELECT * FROM CLS.TADMIN ORDER BY USUARIO")
    ])
    usuariosDisponibles.value = todos.map(r => r.USUARIOCREA).sort()
    admins.value = adminRows
  } catch (err) { $q.notify({ type: 'negative', message: err.message })
  } finally { permisoLoading.value = false }
}

async function agregarPermiso() {
  const u = nuevoAdmin.value
  if (!u) return
  permisoAdding.value = true
  try {
    await store._query("INSERT INTO CLS.TADMIN (USUARIO, FECHAMOD) VALUES (?, '')", [u])
    admins.value.push({ USUARIO: u, FECHAMOD: '' })
    $q.notify({ type: 'positive', message: `${u} ahora es admin`, timeout: 2000 })
    showAddPermiso.value = false
    nuevoAdmin.value = null
  } catch (err) { $q.notify({ type: 'negative', message: err.message })
  } finally { permisoAdding.value = false }
}

async function eliminarPermiso(row) {
  $q.dialog({ title: 'Eliminar', message: `¿Quitar admin a ${row.USUARIO}?`, cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await store._query("DELETE FROM CLS.TADMIN WHERE USUARIO = ?", [row.USUARIO])
        admins.value = admins.value.filter(a => a.USUARIO !== row.USUARIO)
        $q.notify({ type: 'positive', message: 'Eliminado', timeout: 1500 })
      } catch (err) { $q.notify({ type: 'negative', message: err.message }) }
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
.sticky-header
  position: sticky
  top: 0
  z-index: 10
  background: #fff
  border-bottom: 1px solid #eee
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04)

.list-container
  background: #fff
  border-radius: 14px
  overflow: hidden

.list-row
  display: flex
  align-items: center
  justify-content: space-between
  padding: 14px 20px
  border-bottom: 1px solid #f0f0f0
  cursor: pointer
  transition: background 0.12s

  &:last-child
    border-bottom: none

  &:hover
    background: rgba(210, 225, 134, 0.06)

.list-left
  display: flex
  align-items: center
  gap: 14px
  flex: 1
  min-width: 0

.list-avatar
  width: 40px
  height: 40px
  border-radius: 10px
  background: #D2E186
  display: flex
  align-items: center
  justify-content: center
  font-weight: 700
  font-size: 16px
  color: #415111
  flex-shrink: 0

.list-info
  min-width: 0

.list-code
  font-size: 14px
  font-weight: 600
  color: #415111

.list-name
  font-size: 13px
  color: #90a4ae
  margin-top: 1px
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

.list-right
  display: flex
  align-items: center
  flex-shrink: 0

.list-responsable
  display: flex
  align-items: center
  font-size: 13px
  font-weight: 500
  color: #37474f
  padding: 6px 12px
  border: 1px solid #e8e8e8
  border-radius: 8px
  transition: border-color 0.15s
  white-space: nowrap

  &:hover
    border-color: #D2E186

// Selector dialog
.selector-item
  display: flex
  align-items: center
  padding: 10px 12px
  border-radius: 8px
  cursor: pointer
  transition: background 0.1s

  &:hover
    background: rgba(210, 225, 134, 0.1)

  &.selected
    background: rgba(210, 225, 134, 0.15)

.selector-avatar
  width: 34px
  height: 34px
  border-radius: 50%
  background: #D2E186
  display: flex
  align-items: center
  justify-content: center
  font-weight: 700
  font-size: 14px
  color: #415111
  margin-right: 12px
  flex-shrink: 0

.selector-name
  font-size: 14px
  font-weight: 500
  color: #37474f

.selector-sub
  font-size: 11px
  color: #90a4ae
  margin-top: 1px
</style>
