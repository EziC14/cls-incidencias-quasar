<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">Registrar Incidencia Corporativa</div>

    <q-splitter v-model="splitterModel" style="height: calc(100vh - 180px)">
      <template v-slot:before>
        <div class="q-pa-sm">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">Búsqueda de Pedido</div>
              <div class="row q-col-gutter-sm">
                <q-input v-model="serie" label="Serie" outlined dense class="col-4" />
                <q-input v-model="correlativo" label="Correlativo" outlined dense class="col-4" />
                <q-btn label="Buscar" color="primary" icon="mdi-magnify" class="col-4" @click="buscarPedido" :loading="buscando" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm" v-if="pedido">
            <q-card-section>
              <div class="text-subtitle2">Datos del Pedido</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input v-model="pedido.CODCLI" label="Cód. Cliente" outlined dense readonly class="col-4" />
                <q-input v-model="pedido.NOMCLI" label="Cliente" outlined dense readonly class="col-8" />
                <q-input v-model="guia" label="Nro Guía" outlined dense readonly class="col-4" />
                <q-input v-model="fecGuia" label="Fec. Guía" outlined dense readonly class="col-4" />
                <q-input v-model="nroFact" label="Nro Factura" outlined dense readonly class="col-4" />
                <q-input v-model="fecFact" label="Fec. Factura" outlined dense readonly class="col-4" />
                <q-input v-model="nroOC" label="Nro OC" outlined dense readonly class="col-4" />
                <q-input v-model="fecOC" label="Fec. OC" outlined dense readonly class="col-4" />
                <q-input v-model="montoOC" label="Monto OC" outlined dense readonly class="col-4" />
                <q-input v-model="moneda" label="Moneda" outlined dense readonly class="col-4" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <div class="text-subtitle2">Tipo de Incidencia</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input v-model="codVend" label="Cód. Vendedor" outlined dense class="col-4" readonly>
                  <template v-slot:append>
                    <q-btn dense flat icon="mdi-magnify" @click="openVendedorDialog" />
                  </template>
                </q-input>
                <q-input v-model="nomVend" label="Vendedor" outlined dense readonly class="col-8" />
                <q-input v-model="canal" label="Canal" outlined dense readonly class="col-4" />
                <q-select v-model="tipoIncidencia" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" label="Tipo Incidencia" outlined dense class="col-8" />
                <q-input v-model="fechaInc" label="Fecha Incidencia" outlined dense type="date" class="col-4" />
                <q-checkbox v-model="modVendedor" label="Modificar Vendedor" class="col-4" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <div class="text-subtitle2">Contacto</div>
              <div class="row q-col-gutter-sm q-mt-xs">
                <q-input v-model="nomContacto" label="Nombre Contacto" outlined dense class="col-4" />
                <q-input v-model="dirContacto" label="Dirección" outlined dense class="col-4" />
                <q-input v-model="tlfContacto" label="Teléfono" outlined dense class="col-4" />
                <q-input v-model="emailContacto" label="Email" outlined dense class="col-12" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="q-mt-sm">
            <q-card-section>
              <div class="text-subtitle2">Motivo</div>
              <q-input v-model="motivo" label="Motivo / Comentario" outlined dense type="textarea" rows="3" />
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-sm" style="height: 100%">
          <div class="text-subtitle2 q-mb-sm">Items del Pedido</div>
          <q-table :rows="itemsPedido" :columns="itemColumns" row-key="PDNUME" dense flat bordered
            :rows-per-page-options="[10, 20, 50]" selection="multiple" v-model:selected="selectedItems"
            style="height: 35%; overflow-y: auto" />

          <div class="row q-mt-sm q-mb-sm">
            <q-btn label="Agregar Productos" color="primary" icon="mdi-arrow-right" @click="agregarProductos" :disable="selectedItems.length === 0" />
          </div>

          <div class="text-subtitle2 q-mb-sm">Productos Seleccionados</div>
          <q-table :rows="productosSeleccionados" :columns="prodColumns" row-key="index" dense flat bordered
            :rows-per-page-options="[10, 20, 50]"
            @row-click="eliminarProducto"
            style="height: 35%; overflow-y: auto">
            <template v-slot:body-cell-cantdev="props">
              <q-input dense v-model="props.row.cantdev" type="number" min="0" :max="props.row.maxCant"
                @update:model-value="calcularMontoTotal" style="width: 80px" />
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

    <VendedorDialog v-model="vendedorDialog" @select="onVendedorSelected" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { date, useQuasar } from 'quasar'
import VendedorDialog from 'pages/Ayuda/VendedorDialog.vue'

const $q = useQuasar()

const store = useIncidentStore()
const auth = useAuthStore()
const splitterModel = ref(50)

const serie = ref('')
const correlativo = ref('')
const buscando = ref(false)
const pedido = ref(null)
const guia = ref('')
const fecGuia = ref('')
const nroFact = ref('')
const fecFact = ref('')
const nroOC = ref('')
const fecOC = ref('')
const montoOC = ref('')
const moneda = ref('')
const codVend = ref('')
const nomVend = ref('')
const canal = ref('')
const tipoIncidencia = ref(null)
const fechaInc = ref(date.formatDate(Date.now(), 'YYYY-MM-DD'))
const modVendedor = ref(false)
const nomContacto = ref('')
const dirContacto = ref('')
const tlfContacto = ref('')
const emailContacto = ref('')
const motivo = ref('')
const montoDev = ref(0)
const itemsPedido = ref([])
const selectedItems = ref([])
const productosSeleccionados = ref([])
const registrando = ref(false)
const vendedorDialog = ref(false)

const itemColumns = [
  { name: 'PDNUME', label: 'Item', field: 'PDNUME', align: 'center', sortable: true },
  { name: 'PDCODI', label: 'Producto', field: 'PDCODI', sortable: true },
  { name: 'PDDESC', label: 'Descripción', field: 'PDDESC' },
  { name: 'PDCANT', label: 'Cantidad', field: 'PDCANT', align: 'right' },
  { name: 'PDPREC', label: 'Precio', field: 'PDPREC', align: 'right' },
]

const prodColumns = [
  { name: 'codprod', label: 'Producto', field: 'codprod' },
  { name: 'artabc', label: 'ABC', field: 'artabc', align: 'center' },
  { name: 'artmar', label: 'Marca', field: 'artmar' },
  { name: 'precprod', label: 'Precio', field: 'precprod', align: 'right' },
  { name: 'cantdev', label: 'Cant. Dev', field: 'cantdev', align: 'center' },
  { name: 'artmed', label: 'Medida', field: 'artmed', align: 'center' },
]

onMounted(() => {
  store.loadTipos()
})

async function buscarPedido() {
  buscando.value = true
  try {
    const result = await store.searchPedido(serie.value, correlativo.value)
    if (result.ok) {
      pedido.value = result.data
      guia.value = result.data.PHGUI2 || ''
      fecGuia.value = result.data.PHFEG2 || ''
      nroFact.value = result.data.PHFACC || ''
      fecFact.value = result.data.PHFEFC || ''
      nroOC.value = result.data.PHNROC || ''
      fecOC.value = result.data.PHFECC || ''
      montoOC.value = result.data.PHIMP1 || ''
      moneda.value = result.data.PHMONE || ''

      const detalle = await store.searchPedidoDetalle(serie.value, correlativo.value)
      itemsPedido.value = detalle.data || []
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Pedido no encontrado' })
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error al buscar pedido' })
  } finally {
    buscando.value = false
  }
}

function agregarProductos() {
  selectedItems.value.forEach(item => {
    if (!productosSeleccionados.value.find(p => p.codprod === item.PDCODI)) {
      productosSeleccionados.value.push({
        codprod: item.PDCODI,
        artabc: item.PDABC1 || '',
        artmar: item.PDMARC || '',
        precprod: item.PDPREC || 0,
        cantdev: item.PDCANT || 0,
        maxCant: item.PDCANT || 0,
        artmed: item.PDMED1 || ''
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

function openVendedorDialog() {
  vendedorDialog.value = true
}

function onVendedorSelected(vendedor) {
  codVend.value = vendedor.AGCODI
  nomVend.value = vendedor.AGNOMB
  canal.value = vendedor.CANAL || ''
}

async function registrarIncidencia() {
  if (!pedido.value || !tipoIncidencia.value) {
    $q.notify({ type: 'warning', message: 'Complete los datos requeridos' })
    return
  }
  registrando.value = true
  try {
    const cabecera = {
      canal: canal.value,
      codvend: codVend.value,
      codcli: pedido.value.CODCLI,
      phpvta: serie.value,
      phnume: correlativo.value,
      fechaincid: fechaInc.value,
      montdev: montoDev.value,
      moneda: moneda.value,
      nomcontacto: nomContacto.value,
      numtlfo: tlfContacto.value,
      direccontact: dirContacto.value,
      emailcontact: emailContacto.value,
      comentario: motivo.value,
      tipincd: tipoIncidencia.value.IDTIPO,
      usuariocrea: auth.usuario,
      ejercicio: '',
      periodo: '',
      almacen: '',
      vale: ''
    }
    await store.registrarCabecera(cabecera)
    const id = await store.obtenerId(serie.value, correlativo.value, pedido.value.CODCLI)

    for (let i = 0; i < productosSeleccionados.value.length; i++) {
      const p = productosSeleccionados.value[i]
      await store.registrarDetalle({
        id_indh: id,
        itemincd: i + 1,
        codprod: p.codprod,
        artabc: p.artabc,
        artmar: p.artmar,
        precprod: p.precprod,
        cantdev: p.cantdev,
        artmed: p.artmed,
        vale: '',
        cantvale: 0
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
  pedido.value = null
  serie.value = ''
  correlativo.value = ''
  guia.value = ''
  fecGuia.value = ''
  nroFact.value = ''
  fecFact.value = ''
  nroOC.value = ''
  fecOC.value = ''
  montoOC.value = ''
  moneda.value = ''
  codVend.value = ''
  nomVend.value = ''
  canal.value = ''
  tipoIncidencia.value = null
  fechaInc.value = date.formatDate(Date.now(), 'YYYY-MM-DD')
  modVendedor.value = false
  nomContacto.value = ''
  dirContacto.value = ''
  tlfContacto.value = ''
  emailContacto.value = ''
  motivo.value = ''
  montoDev.value = 0
  itemsPedido.value = []
  selectedItems.value = []
  productosSeleccionados.value = []
}
</script>
