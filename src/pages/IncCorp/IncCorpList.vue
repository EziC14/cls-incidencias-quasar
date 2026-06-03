<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">Listado de Incidencias</div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <q-input v-model="filtros.nroIncd" label="Nro Incidencia" outlined dense class="col-2" />
          <q-input v-model="filtros.codVend" label="Cód. Vendedor" outlined dense class="col-2" />
          <q-input v-model="filtros.codCli" label="Cód. Cliente" outlined dense class="col-2" />
          <q-select v-model="filtros.tipoInc" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" label="Tipo" outlined dense clearable class="col-2" emit-value map-options />
          <q-select v-model="filtros.estado" :options="estados" label="Estado" outlined dense clearable class="col-2" emit-value map-options />
          <q-select v-model="filtros.usuario" :options="store.usuarios" label="Usuario" outlined dense clearable class="col-2" />
        </div>
        <div class="row q-col-gutter-sm items-center q-mt-sm">
          <q-checkbox v-model="filtrarFecha" label="Filtrar por fecha" />
          <q-input v-if="filtrarFecha" v-model="filtros.desde" label="Desde" outlined dense type="date" class="col-2" />
          <q-input v-if="filtrarFecha" v-model="filtros.hasta" label="Hasta" outlined dense type="date" class="col-2" />
          <q-btn label="Buscar" color="primary" icon="mdi-magnify" @click="buscar" :loading="cargando" />
          <q-btn label="Pendientes" color="secondary" outline icon="mdi-format-list-bulleted" @click="mostrarPendientes" class="q-ml-sm" />
        </div>
      </q-card-section>
    </q-card>

    <q-table :rows="incidencias" :columns="columns" row-key="ID" dense flat bordered
      :rows-per-page-options="[15, 30, 50]"
      :loading="cargando"
      @row-click="abrirDetalle">
      <template v-slot:body-cell-estadoincd="props">
        <q-chip :color="getEstadoColor(props.value)" text-color="white" dense>
          {{ getEstadoLabel(props.value) }}
        </q-chip>
      </template>
    </q-table>

    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Eliminar Incidencia</q-card-section>
        <q-card-section>
          <q-input v-model="deletePassword" label="Contraseña" outlined type="password" @keyup.enter="confirmarEliminar" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancelar" v-close-popup />
          <q-btn label="Eliminar" color="negative" @click="confirmarEliminar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const store = useIncidentStore()
const auth = useAuthStore()
const $q = useQuasar()

const incidencias = ref([])
const cargando = ref(false)
const filtrarFecha = ref(false)
const showDeleteDialog = ref(false)
const deletePassword = ref('')

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

const estados = [
  { label: 'Pendiente', value: '22' },
  { label: 'Atendido', value: '21' },
  { label: 'Refacturado', value: '23' },
  { label: 'Pedido Anulado', value: '24' },
  { label: 'Emisión NC', value: '25' },
]

const columns = [
  { name: 'ID', label: 'Nro', field: 'ID', align: 'center', sortable: true },
  { name: 'CODCLI', label: 'Cliente', field: 'CODCLI', sortable: true },
  { name: 'PHPVTA', label: 'Serie', field: 'PHPVTA', align: 'center' },
  { name: 'PHNUME', label: 'Pedido', field: 'PHNUME', align: 'center' },
  { name: 'TIPINCD', label: 'Tipo', field: 'TIPINCD', align: 'center' },
  { name: 'ESTADOINCD', label: 'Estado', field: 'ESTADOINCD', align: 'center' },
  { name: 'FECHAINCID', label: 'Fecha', field: 'FECHAINCID', align: 'center' },
  { name: 'MONTDEV', label: 'Monto Dev', field: 'MONTDEV', align: 'right' },
  { name: 'USUARIOCREA', label: 'Usuario', field: 'USUARIOCREA' },
]

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
  await mostrarPendientes()
})

async function buscar() {
  cargando.value = true
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
    cargando.value = false
  }
}

async function mostrarPendientes() {
  cargando.value = true
  try {
    incidencias.value = await store.listarIncidencias({ estado: '22' })
  } finally {
    cargando.value = false
  }
}

async function abrirDetalle(evt, row) {
  router.push(`/inc-corp/detalle/${row.ID}`)
}
</script>
