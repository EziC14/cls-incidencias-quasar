<template>
  <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto; position: relative; min-height: calc(100vh - 120px)">
    <q-inner-loading :showing="loading" color="primary" size="48px" label="Cargando..." label-class="text-primary q-mt-sm" />
    <template v-if="!loading">
      <div class="row items-center q-mb-sm">
        <div>
          <div class="text-h6 text-weight-bold">Registrar Incidencia Corporativa</div>
          <div class="text-caption text-grey-7">Nuevo registro de incidencia</div>
          </div>
        </div>

        <q-splitter v-model="splitterModel" style="height: calc(100vh - 180px)">
          <template v-slot:before>
            <div class="q-pa-sm">
              <q-card flat bordered class="q-mb-sm">
                <q-card-section class="bg-primary text-white q-py-sm">
                  <div class="row items-center">
                    <q-icon name="mdi-magnify" size="sm" class="q-mr-sm" />
                    <span class="text-weight-bold">Búsqueda de Pedido</span>
                  </div>
                </q-card-section>
                <q-card-section class="q-pt-sm q-pb-md">
                  <div class="row q-col-gutter-sm items-end">
                    <q-input v-model="serie" label="Serie" outlined dense class="col-4" hide-bottom />
                    <q-input v-model="correlativo" label="Correlativo" outlined dense class="col-4" hide-bottom />
                  <div class="col-4">
                    <div class="text-caption text-grey-7">&nbsp;</div>
                    <q-btn color="primary" icon="mdi-magnify" @click="buscarPedido" :loading="buscando" unelevated class="full-width" style="height: 40px" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-sm" v-if="pedido">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-truck-delivery" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Datos del Pedido</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Cód. Cliente</div>
                    <div class="text-body2 text-weight-medium">{{ pedido.PHCLIE }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-8">
                    <div class="text-caption text-grey-7 q-mb-xs">Cliente</div>
                    <div class="text-body2 text-weight-medium">{{ pedido.PHNOMC }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Nro Guía</div>
                    <div class="text-body2 text-weight-medium">{{ guia || '—' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Fec. Guía</div>
                    <div class="text-body2 text-weight-medium">{{ fmtFecha(fecGuia) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Nro Factura</div>
                    <div class="text-body2 text-weight-medium">{{ nroFact || '—' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Fec. Factura</div>
                    <div class="text-body2 text-weight-medium">{{ fmtFecha(fecFact) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Nro OC</div>
                    <div class="text-body2 text-weight-medium">{{ nroOC || '—' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Fec. OC</div>
                    <div class="text-body2 text-weight-medium">{{ fmtFecha(fecOC) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Monto OC</div>
                    <div class="text-body2 text-weight-medium">S/ {{ montoOC || '0.00' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Moneda</div>
                    <div class="text-body2 text-weight-medium">{{ moneda === 0 ? 'SOLES' : moneda === 1 ? 'DÓLARES' : (moneda ?? '—') }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-sm">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-format-list-bulleted" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Datos de Incidencia</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-md q-pb-md">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Cód. Vendedor</div>
                    <q-input v-model="codVend" outlined dense hide-bottom>
                      <template v-slot:append>
                        <q-btn flat dense icon="mdi-magnify" @click="openVendedorDialog" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6 col-md-5">
                    <div class="text-caption text-grey-7 q-mb-xs">Vendedor</div>
                    <q-input v-model="nomVend" outlined dense :readonly="!modVendedor" hide-bottom>
                      <template v-slot:append>
                        <q-btn flat dense :icon="modVendedor ? 'mdi-lock-open-variant' : 'mdi-lock'" :color="modVendedor ? 'primary' : 'grey-5'" @click="modVendedor = !modVendedor" size="sm" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <div class="text-caption text-grey-7 q-mb-xs">Canal</div>
                    <q-input v-model="canal" outlined dense :readonly="!modVendedor" hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Tipo Incidencia</div>
                    <q-select v-model="tipoIncidencia" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" outlined dense hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-3">
                    <div class="text-caption text-grey-7 q-mb-xs">Fecha Incidencia</div>
                    <q-input v-model="fechaInc" outlined dense type="date" hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-5">
                    <div class="text-caption text-grey-7 q-mb-xs">Responsable</div>
                    <q-select v-model="usuarioResponsable" :options="store.usuarios" outlined dense hide-bottom clearable />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-sm">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-phone" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Contacto</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Nombre Contacto</div>
                    <q-input v-model="nomContacto" outlined dense hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Teléfono</div>
                    <q-input v-model="tlfContacto" outlined dense hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Email</div>
                    <q-input v-model="emailContacto" outlined dense hide-bottom />
                  </div>
                  <div class="col-12">
                    <div class="text-caption text-grey-7 q-mb-xs">Dirección</div>
                    <q-input v-model="dirContacto" outlined dense hide-bottom />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered>
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-comment-text" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Motivo</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <q-input v-model="motivo" outlined dense type="textarea" rows="3" hide-bottom />
              </q-card-section>
            </q-card>
          </div>
        </template>

        <template v-slot:after>
          <div class="q-pa-sm" style="height: 100%; display: flex; flex-direction: column">
            <q-card flat bordered class="q-mb-sm" style="flex: 1; display: flex; flex-direction: column">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-package" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Items del Pedido ({{ itemsDisponibles.length }})</span>
                  <q-space />
                  <q-btn label="Todo" color="white" outline dense @click="toggleAllItems" size="sm" class="q-mr-sm" />
                  <q-btn label="Agregar" color="white" outline dense @click="agregarProductos" :disable="selectedItems.length === 0" icon="mdi-arrow-right" />
                </div>
              </q-card-section>
              <q-scroll-area style="flex: 1">
                <q-list dense padding>
                  <q-item v-for="(item, i) in itemsDisponibles" :key="item._idx" clickable v-ripple :class="selectedItems.find(s => s._idx === item._idx) ? 'bg-primary text-white' : i % 2 === 0 ? 'bg-grey-1' : ''" @click="toggleItem(item)" style="border-radius: 8px; margin: 2px 0">
                    <q-item-section side>
                      <q-checkbox :model-value="!!selectedItems.find(s => s._idx === item._idx)" dense @click.stop />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ item.PDARTI }}</q-item-label>
                      <q-item-label caption :class="selectedItems.find(s => s._idx === item._idx) ? 'text-white' : ''">{{ item.ARTDES }}</q-item-label>
                    <q-item-label caption v-if="item.VALE" :class="selectedItems.find(s => s._idx === item._idx) ? 'text-white' : ''">
                      <q-icon name="mdi-file-document" size="xs" class="q-mr-xs" />VALE: {{ item.VALE }} · Cant: {{ item.CANTREQ }}
                    </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-right">
                        <div class="text-weight-bold">{{ item.PDCANT }}</div>
                        <div class="text-caption">u. {{ item.ARTMED || '' }}</div>
                        <div class="text-caption">S/ {{ item.PDUNIT }}</div>
                      </div>
                    </q-item-section>
                  </q-item>
                  <div v-if="itemsPedido.length === 0" class="text-center text-grey-5 q-py-xl">
                    <q-icon name="mdi-package-variant-closed" size="48px" />
                    <div class="q-mt-sm">Busque un pedido para ver sus items</div>
                  </div>
                </q-list>
              </q-scroll-area>
            </q-card>

            <q-card flat bordered style="flex: 1; display: flex; flex-direction: column">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-cart" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Productos Seleccionados ({{ productosSeleccionados.length }})</span>
                </div>
              </q-card-section>
              <q-scroll-area style="flex: 1">
                <q-list dense padding>
                  <q-item v-for="(p, i) in productosSeleccionados" :key="i" class="q-my-xs" :class="i % 2 === 0 ? 'bg-grey-1' : ''">
                    <q-item-section side>
                      <q-btn flat dense round icon="mdi-close" size="xs" color="negative" @click="eliminarProducto(p)" />
                    </q-item-section>
                    <q-item-section side>
                      <q-badge rounded color="primary" class="q-px-sm">{{ i + 1 }}</q-badge>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ p.codprod }}</q-item-label>
                      <q-item-label caption>ABC: {{ p.artabc }} · Marca: {{ p.artmar }} · Medida: {{ p.artmed }}</q-item-label>
                      <q-item-label caption v-if="p.vale">VALE: {{ p.vale }} · Cant: {{ p.cantreq }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-right">
                        <div class="text-weight-bold text-primary">{{ p.precprod }}</div>
                        <q-input dense v-model="p.cantdev" type="number" min="0" :max="p.maxCant" @update:model-value="validarCantidad(p)" style="width: 70px" class="q-mt-xs" outlined hide-bottom />
                      </div>
                    </q-item-section>
                  </q-item>
                  <div v-if="productosSeleccionados.length === 0" class="text-center text-grey-5 q-py-xl">
                    <q-icon name="mdi-cart-off" size="48px" />
                    <div class="q-mt-sm">Seleccione productos del pedido</div>
                  </div>
                </q-list>
              </q-scroll-area>
              <q-card-section class="bg-grey-2 q-py-sm">
                <div class="row items-center justify-between">
                  <span class="text-caption text-weight-medium">Monto a Devolver</span>
                  <span class="text-weight-bold text-primary text-h6">S/ {{ montoDev.toFixed(2) }}</span>
                </div>
              </q-card-section>
            </q-card>

            <div class="row q-mt-sm justify-end q-gutter-sm">
              <q-btn label="Nuevo" color="secondary" outline icon="mdi-refresh" @click="nuevo" />
              <q-btn label="Registrar" color="positive" icon="mdi-check" unelevated @click="registrarIncidencia" :loading="registrando" />
            </div>
          </div>
        </template>
      </q-splitter>

      <VendedorDialog v-model="vendedorDialog" @select="onVendedorSelected" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useIncidentStore } from 'stores/incident'
import { useAuthStore } from 'stores/auth'
import { date, useQuasar } from 'quasar'
import { fmtFecha } from 'src/helpers/format'
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
const usuarioResponsable = ref(auth.usuario || '')
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
const loading = ref(true)

const itemsDisponibles = computed(() => {
  const addedIdx = productosSeleccionados.value.map(p => p._idx)
  return itemsPedido.value.filter(item => !addedIdx.includes(item._idx))
})

onMounted(async () => {
  await store.loadTipos()
  loading.value = false
})

async function buscarPedido() {
  buscando.value = true
  try {
    const result = await store.searchPedido(serie.value, correlativo.value)
    if (result.ok) {
      pedido.value = result.data
      guia.value = result.data.PDGUIA || ''
      fecGuia.value = result.data.PDFECG || ''
      nroFact.value = result.data.PDTDOC && result.data.PDFABO ? result.data.PDTDOC + '-' + result.data.PDFABO : (result.data.PDTDOC || result.data.PDFABO || '')
      fecFact.value = result.data.PDFECF || ''
      nroOC.value = result.data.PHREF1 || ''
      fecOC.value = result.data.PHFEIN || ''
      const monto = parseFloat(result.data.PHNVVA) || parseFloat(result.data.PHEVVA) || 0
      montoOC.value = monto.toFixed(2)
      moneda.value = result.data.PHMONE

      if (result.data.PHUSAP) {
        codVend.value = result.data.PHUSAP
        const vres = await store._query(
          `SELECT AGECVE, AGENOM, TBALF2 AS CANAL
           FROM SPEED400CS.TAGEN
           LEFT JOIN SPEED400CS.TTABD ON TBALF1 = AGECVE AND TBIDEN = 'CNVEN'
           WHERE AGECVE = ?`,
          [result.data.PHUSAP])
        if (vres.length > 0) {
          nomVend.value = vres[0].AGENOM || ''
          canal.value = vres[0].CANAL || ''
        }
      }

      const detalle = await store.searchPedidoDetalle(serie.value, correlativo.value)
      itemsPedido.value = (detalle.data || []).map((item, idx) => ({ ...item, _idx: idx }))
    } else {
      $q.notify({ type: 'negative', message: result.error || 'Pedido no encontrado' })
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error: ' + (err.message || err) })
  } finally {
    buscando.value = false
  }
}

function toggleItem(item) {
  const found = selectedItems.value.find(s => s._idx === item._idx)
  if (found) selectedItems.value.splice(selectedItems.value.indexOf(found), 1)
  else selectedItems.value.push({ ...item })
}

function toggleAllItems() {
  if (selectedItems.value.length === itemsDisponibles.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = itemsDisponibles.value.map(item => ({ ...item }))
  }
}

function agregarProductos() {
  selectedItems.value.forEach(item => {
    const existente = productosSeleccionados.value.find(p => p._idx === item._idx)
    if (!existente) {
      productosSeleccionados.value.push({
        _idx: item._idx,
        codprod: item.PDARTI,
        artabc: item.ARTABC || '',
        artmar: item.ARTMAR || '',
        precprod: item.PDUNIT || 0,
        cantdev: item.PDCANT || 0,
        maxCant: item.PDCANT || 0,
        artmed: item.ARTMED || '',
        vale: item.VALE || '',
        cantreq: item.CANTREQ || 0
      })
    }
  })
  selectedItems.value = []
  calcularMontoTotal()
}

function validarCantidad(p) {
  const val = Number(p.cantdev)
  if (val > p.maxCant) p.cantdev = p.maxCant
  if (val < 0) p.cantdev = 0
  calcularMontoTotal()
}

function eliminarProducto(row) {
  const idx = productosSeleccionados.value.findIndex(p => p._idx === row._idx && p.codprod === row.codprod)
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
  codVend.value = vendedor.AGECVE
  nomVend.value = vendedor.AGENOM
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
      codcli: pedido.value.PHCLIE,
      phpvta: Number(serie.value),
      phnume: Number(correlativo.value),
      fechaincid: Number(fechaInc.value),
      montdev: montoDev.value,
      moneda: moneda.value,
      nomcontacto: nomContacto.value,
      numtlfo: tlfContacto.value,
      direccontact: dirContacto.value,
      emailcontact: emailContacto.value,
      comentario: motivo.value,
      tipincd: Number(tipoIncidencia.value.IDTIPO),
      usuariocrea: auth.usuario,
      usrenc: usuarioResponsable.value || auth.usuario,
      ejercicio: '',
      periodo: '',
      almacen: '',
      vale: ''
    }
    await store.registrarCabecera(cabecera)
    const id = await store.obtenerId(serie.value, correlativo.value, pedido.value.PHCLIE)

    for (let i = 0; i < productosSeleccionados.value.length; i++) {
      const p = productosSeleccionados.value[i]
      await store.registrarDetalle({
        id_indh: id,
        itemincd: i + 1,
        codprod: p.codprod,
        artabc: p.artabc,
        artmar: p.artmar,
        precprod: Number(p.precprod) || 0,
        cantdev: Number(p.cantdev) || 0,
        artmed: p.artmed || '',
        vale: p.vale ? String(p.vale).slice(0, 8) : '',
        cantvale: Number(p.cantreq) || 0
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
  usuarioResponsable.value = auth.usuario || ''
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
