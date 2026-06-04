<template>
  <div class="q-pa-md" style="position: relative; min-height: calc(100vh - 120px)">
    <q-inner-loading :showing="loading" color="primary" size="48px" label="Cargando..." label-class="text-primary q-mt-sm" />
    <div class="text-h5 q-mb-md">Registrar Incidencia Logística</div>

    <q-splitter v-model="splitterModel" style="height: calc(100vh - 180px)">
      <template v-slot:before>
        <div class="q-pa-sm">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Búsqueda de Vale</div>
              <div class="row q-col-gutter-sm">
                <q-input v-model="almacen" label="Almacén" outlined dense class="col-3" />
                <q-input v-model="vale" label="Vale" outlined dense class="col-3" />
                <q-input v-model="ejercicio" label="Ejercicio" outlined dense class="col-2" />
                <q-input v-model="periodo" label="Periodo" outlined dense class="col-2" />
                <q-btn label="Buscar" color="primary" icon="mdi-magnify" class="col-2" @click="buscarVale" :loading="buscando" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm" v-if="valeData">
            <q-card-section>
              <div class="text-subtitle2">Datos del Vale</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input :model-value="valeData.MHREF3" label="Guía" outlined dense readonly class="col-4" />
                <q-input :model-value="fmtFecha(valeData.MHFECH)" label="Fec. Movimiento" outlined dense readonly class="col-4" />
                <q-input :model-value="valeData.MHHRE1" label="Almacén/Vale Transf." outlined dense readonly class="col-4" />
                <q-input :model-value="valeData.MHUSER" label="Usuario" outlined dense readonly class="col-4" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <div class="text-subtitle2">Cliente y Tipo</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input v-model="codCli" label="Cód. Cliente" outlined dense class="col-4" readonly>
                  <template v-slot:append>
                    <q-btn dense flat icon="mdi-magnify" @click="openClienteDialog" />
                  </template>
                </q-input>
                <q-input v-model="nomCli" label="Cliente" outlined dense readonly class="col-8" />
                <q-select v-model="tipoIncidencia" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" label="Tipo Incidencia" outlined dense class="col-8" />
                <q-input v-model="fechaInc" label="Fecha" outlined dense type="date" class="col-4" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <div class="text-subtitle2">Contacto</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input v-model="nomContacto" label="Nombre" outlined dense class="col-4" />
                <q-input v-model="dirContacto" label="Dirección" outlined dense class="col-4" />
                <q-input v-model="tlfContacto" label="Teléfono" outlined dense class="col-4" />
                <q-input v-model="emailContacto" label="Email" outlined dense class="col-12" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <q-input v-model="motivo" label="Motivo / Comentario" outlined dense type="textarea" rows="3" />
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-sm" style="height: 100%">
          <div class="text-subtitle2 q-mb-sm">Items del Vale</div>
          <q-table :rows="itemsVale" :columns="itemColumns" row-key="MDCOAR" dense flat bordered
            selection="multiple" v-model:selected="selectedItems"
            style="height: 35%; overflow-y: auto" />

          <div class="row q-mt-sm q-mb-sm">
            <q-btn label="Agregar" color="primary" icon="mdi-arrow-right" @click="agregarProductos" :disable="selectedItems.length === 0" />
          </div>

          <div class="text-subtitle2 q-mb-sm">Productos Seleccionados</div>
          <q-table :rows="productosSeleccionados" :columns="prodColumns" row-key="index" dense flat bordered
            @row-click="eliminarProducto"
            style="height: 35%; overflow-y: auto">
            <template v-slot:body-cell-cantdev="props">
              <q-input dense v-model="props.row.cantdev" type="number" min="0" style="width: 80px" @update:model-value="calcularMontoTotal" />
            </template>
          </q-table>

          <div class="row items-center q-mt-sm">
            <div class="text-subtitle2">Monto a Devolver:</div>
            <q-input v-model="montoDev" outlined dense readonly class="q-ml-sm" style="width: 150px" prefix="S/ " />
          </div>

          <div class="row q-mt-md">
            <q-btn label="Registrar" color="positive" icon="mdi-check" class="q-mr-sm" @click="registrarIncidencia" :loading="registrando" />
            <q-btn label="Nuevo" color="secondary" outline icon="mdi-refresh" @click="nuevo" />
          </div>
        </div>
      </template>
    </q-splitter>

    <ClienteDialog v-model="clienteDialog" @select="onClienteSelected" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { date, useQuasar } from 'quasar'
import { fmtFecha } from 'src/helpers/format'
import ClienteDialog from 'pages/Ayuda/ClienteDialog.vue'

const $q = useQuasar()

const store = useIncidentStore()
const auth = useAuthStore()
const splitterModel = ref(50)

const almacen = ref('')
const vale = ref('')
const ejercicio = ref('')
const periodo = ref('')
const buscando = ref(false)
const valeData = ref(null)
const codCli = ref('')
const nomCli = ref('')
const tipoIncidencia = ref(null)
const fechaInc = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const nomContacto = ref('')
const dirContacto = ref('')
const tlfContacto = ref('')
const emailContacto = ref('')
const motivo = ref('')
const montoDev = ref(0)
const itemsVale = ref([])
const selectedItems = ref([])
const productosSeleccionados = ref([])
const registrando = ref(false)
const clienteDialog = ref(false)
const loading = ref(true)

const itemColumns = [
  { name: 'MDCOAR', label: 'Producto', field: 'MDCOAR' },
  { name: 'ARTDES', label: 'Descripción', field: 'ARTDES' },
  { name: 'MDCANR', label: 'Cantidad', field: 'MDCANR', align: 'right' },
]

const prodColumns = [
  { name: 'codprod', label: 'Producto', field: 'codprod' },
  { name: 'artmed', label: 'Medida', field: 'artmed' },
  { name: 'precprod', label: 'Precio', field: 'precprod', align: 'right' },
  { name: 'cantdev', label: 'Cant. Dev', field: 'cantdev', align: 'center' },
]

onMounted(async () => {
  await store.loadTipos()
  loading.value = false
})

async function buscarVale() {
  buscando.value = true
  try {
    const result = await store.searchVale(almacen.value, vale.value, ejercicio.value, periodo.value)
    if (result.ok) {
      valeData.value = result.data
      const detalle = await store.searchValeDetalle(almacen.value, vale.value, ejercicio.value, periodo.value)
      itemsVale.value = detalle.data || []
    } else {
      $q.notify({ type: 'negative', message: 'Vale no encontrado' })
    }
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error: ' + (err.message || err) })
  } finally {
    buscando.value = false
  }
}

function agregarProductos() {
  selectedItems.value.forEach(item => {
    if (!productosSeleccionados.value.find(p => p.codprod === item.MDCOAR)) {
      productosSeleccionados.value.push({
        codprod: item.MDCOAR,
        artmed: item.MDUMER || '',
        precprod: item.MDCUNA || 0,
        cantdev: item.MDCANR || 0,
        maxCant: item.MDCANR || 0,
      })
    }
  })
  selectedItems.value = []
  calcularMontoTotal()
}

function eliminarProducto(evt, row) {
  const idx = productosSeleccionados.value.findIndex(p => p.codprod === row.codprod)
  if (idx >= 0) {
    productosSeleccionados.value.splice(idx, 1)
    calcularMontoTotal()
  }
}

function calcularMontoTotal() {
  montoDev.value = productosSeleccionados.value.reduce((sum, p) => sum + (parseFloat(p.precprod) || 0) * (parseFloat(p.cantdev) || 0), 0)
}

function openClienteDialog() {
  clienteDialog.value = true
}

function onClienteSelected(cliente) {
  codCli.value = cliente.CLICVE
  nomCli.value = cliente.CLINOM
}

async function registrarIncidencia() {
  if (!valeData.value || !tipoIncidencia.value) {
    $q.notify({ type: 'warning', message: 'Complete los datos requeridos' })
    return
  }
  registrando.value = true
  try {
    const isLogisticUser = ['HURRUTIA', 'FARONES', 'AGUTIERREZ'].includes(auth.usuario)
    const cabecera = {
      canal: isLogisticUser ? 'VCONTR' : 'LURIN',
      codvend: isLogisticUser ? '034' : '',
      codcli: codCli.value,
      phpvta: '',
      phnume: '',
      fechaincid: fechaInc.value,
      montdev: montoDev.value,
      moneda: 'SOL',
      nomcontacto: nomContacto.value,
      numtlfo: tlfContacto.value,
      direccontact: dirContacto.value,
      emailcontact: emailContacto.value,
      comentario: motivo.value,
      tipincd: tipoIncidencia.value.IDTIPO,
      usuariocrea: auth.usuario,
      ejercicio: ejercicio.value,
      periodo: periodo.value,
      almacen: almacen.value,
      vale: vale.value
    }
    await store.registrarCabecera(cabecera)
    const id = await store.obtenerIdVale(ejercicio.value, periodo.value, almacen.value, vale.value)

    for (let i = 0; i < productosSeleccionados.value.length; i++) {
      const p = productosSeleccionados.value[i]
      await store.registrarDetalle({
        id_indh: id,
        itemincd: i + 1,
        codprod: p.codprod,
        artabc: '',
        artmar: '',
        precprod: p.precprod,
        cantdev: p.cantdev,
        artmed: p.artmed,
        vale: vale.value,
        cantvale: p.cantdev
      })
    }

    $q.notify({ type: 'positive', message: `Incidencia #${id} registrada correctamente` })
    nuevo()
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al registrar: ' + (err.response?.data?.error || err.message) })
  } finally {
    registrando.value = false
  }
}

function nuevo() {
  valeData.value = null
  almacen.value = ''
  vale.value = ''
  ejercicio.value = ''
  periodo.value = ''
  codCli.value = ''
  nomCli.value = ''
  tipoIncidencia.value = null
  fechaInc.value = date.formatDate(Date.now(), 'YYYY-MM-DD')
  nomContacto.value = ''
  dirContacto.value = ''
  tlfContacto.value = ''
  emailContacto.value = ''
  motivo.value = ''
  montoDev.value = 0
  itemsVale.value = []
  selectedItems.value = []
  productosSeleccionados.value = []
}
</script>
