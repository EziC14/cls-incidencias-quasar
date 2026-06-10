<template>
  <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto; position: relative; min-height: calc(100vh - 120px)">
    <q-inner-loading :showing="loading" color="primary" size="48px" label="Cargando..." label-class="text-primary q-mt-sm" />
    <template v-if="!loading">
      <div class="row items-center q-mb-sm">
        <div>
          <div class="text-h6 text-weight-bold">Registrar Incidencia Logística</div>
          <div class="text-caption text-grey-7">Nuevo registro de incidencia logística</div>
        </div>
      </div>

      <q-splitter v-model="splitterModel" style="height: calc(100vh - 180px)">
        <template v-slot:before>
          <div class="q-pa-sm">
            <q-card flat bordered class="q-mb-sm">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-magnify" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Búsqueda de Vale</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <div class="row q-col-gutter-sm items-end">
                  <q-input v-model="almacen" label="Almacén" outlined dense class="col-3" hide-bottom />
                  <q-input v-model="vale" label="Vale" outlined dense class="col-3" hide-bottom />
                  <q-input v-model="ejercicio" label="Ejercicio" outlined dense class="col-2" hide-bottom />
                  <q-input v-model="periodo" label="Periodo" outlined dense class="col-2" hide-bottom />
                  <div class="col-2">
                    <div class="text-caption text-grey-7">&nbsp;</div>
                    <q-btn color="primary" icon="mdi-magnify" @click="buscarVale" :loading="buscando" unelevated class="full-width" style="height: 40px" />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-sm" v-if="valeData">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-receipt" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Datos del Vale</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Guía</div>
                    <div class="text-body2 text-weight-medium">{{ valeData.MHREF3 || '—' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Fec. Movimiento</div>
                    <div class="text-body2 text-weight-medium">{{ fmtFecha(valeData.MHFECH) }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Almacén/Vale Transf.</div>
                    <div class="text-body2 text-weight-medium">{{ valeData.MHHRE1 || '—' }}</div>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Usuario</div>
                    <div class="text-body2 text-weight-medium">{{ valeData.MHUSER || '—' }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="q-mb-sm">
              <q-card-section class="bg-primary text-white q-py-sm">
                <div class="row items-center">
                  <q-icon name="mdi-account" size="sm" class="q-mr-sm" />
                  <span class="text-weight-bold">Cliente y Datos</span>
                </div>
              </q-card-section>
              <q-card-section class="q-pt-sm q-pb-md">
                <div class="row q-col-gutter-sm items-center">
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Cód. Cliente</div>
                    <q-input v-model="codCli" outlined dense readonly hide-bottom>
                      <template v-slot:append>
                        <q-btn flat dense icon="mdi-magnify" @click="openClienteDialog" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Cliente</div>
                    <q-input v-model="nomCli" outlined dense readonly hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Fecha Incidencia</div>
                    <q-input v-model="fechaInc" outlined dense type="date" hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
                    <div class="text-caption text-grey-7 q-mb-xs">Tipo Incidencia</div>
                    <q-select v-model="tipoIncidencia" :options="store.tipos" option-value="IDTIPO" option-label="DESCTIPO" outlined dense hide-bottom />
                  </div>
                  <div class="col-12 col-sm-6 col-md-4">
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
                  <span class="text-weight-bold">Items del Vale ({{ itemsVale.length }})</span>
                  <q-space />
                  <q-btn label="Agregar" color="white" outline dense @click="agregarProductos" :disable="selectedItems.length === 0" icon="mdi-arrow-right" />
                </div>
              </q-card-section>
              <q-scroll-area style="flex: 1">
                <q-list dense padding>
                  <q-item v-for="(item, i) in itemsVale" :key="i" clickable v-ripple :class="selectedItems.find(s => s.MDCOAR === item.MDCOAR) ? 'bg-primary text-white' : i % 2 === 0 ? 'bg-grey-1' : ''" @click="toggleItem(item)">
                    <q-item-section side>
                      <q-checkbox :model-value="!!selectedItems.find(s => s.MDCOAR === item.MDCOAR)" dense />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">{{ item.MDCOAR }}</q-item-label>
                      <q-item-label caption :class="selectedItems.find(s => s.MDCOAR === item.MDCOAR) ? 'text-white' : ''">{{ item.ARTDES }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-right">
                        <div class="text-weight-bold">{{ item.MDCANR }}</div>
                      </div>
                    </q-item-section>
                  </q-item>
                  <div v-if="itemsVale.length === 0" class="text-center text-grey-5 q-py-xl">
                    <q-icon name="mdi-package-variant-closed" size="48px" />
                    <div class="q-mt-sm">Busque un vale para ver sus items</div>
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
                      <q-item-label caption>Medida: {{ p.artmed }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-right">
                        <div class="text-weight-bold text-primary">{{ p.precprod }}</div>
                        <q-input dense v-model="p.cantdev" type="number" min="0" :max="p.maxCant" @update:model-value="calcularMontoTotal" style="width: 70px" class="q-mt-xs" outlined hide-bottom />
                      </div>
                    </q-item-section>
                  </q-item>
                  <div v-if="productosSeleccionados.length === 0" class="text-center text-grey-5 q-py-xl">
                    <q-icon name="mdi-cart-off" size="48px" />
                    <div class="q-mt-sm">Seleccione productos del vale</div>
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

      <ClienteDialog v-model="clienteDialog" @select="onClienteSelected" />
    </template>
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
const usuarioResponsable = ref(auth.usuario || '')
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

onMounted(async () => {
  await store.loadTipos()
  loading.value = false
})

function toggleItem(item) {
  const idx = selectedItems.value.findIndex(s => s.MDCOAR === item.MDCOAR)
  if (idx >= 0) {
    selectedItems.value.splice(idx, 1)
  } else {
    selectedItems.value.push(item)
  }
}

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

function eliminarProducto(row) {
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
      usrenc: usuarioResponsable.value || auth.usuario,
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
