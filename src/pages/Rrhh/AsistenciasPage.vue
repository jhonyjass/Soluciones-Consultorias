<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Registro de Asistencias
    </div>

    <!-- ======================== FORMULARIO SUPERIOR ======================== -->
    <q-card flat bordered class="q-pa-md bg-grey-1">
      <q-card-section class="text-h6 text-primary">
        <q-icon name="event_available" class="q-mr-sm" color="primary" />
        Seleccionar Contrato
      </q-card-section>

      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-select
            v-model="contratoId"
            :options="contratos"
            option-value="id"
            option-label="display"
            emit-value
            map-options
            outlined
            label="Seleccione un contrato"
            @update:model-value="cargarMatrizCrear"
          />
        </div>
      </div>

      <!-- MATRIZ PARA CREAR ASISTENCIAS -->
      <div v-if="mostrarCrear" class="q-mt-lg">
        <q-card flat bordered class="q-pa-md">
          <q-card-section class="text-h6 text-primary">Días del período</q-card-section>

          <div class="row q-col-gutter-sm">
            <div v-for="d in dias" :key="d.fecha" class="col-2">
              <q-checkbox
                v-model="d.asistio"
                :label="formatea(d.fecha)"
                color="primary"
              />
            </div>
          </div>

          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="Guardar Asistencias"
              icon="save"
              :loading="loading"
              @click="guardarAsistencias"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-card>

    <q-separator class="q-my-xl" />

    <!-- ============================ TABLA ============================= -->
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="text-h6 text-primary">
        <q-icon name="fact_check" class="q-mr-sm" color="primary" />
        Asistencias Registradas
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="lista"
        :columns="columns"
        row-key="contratoId"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <template #body-cell-acciones="props">
          <q-td align="center">
            <q-btn
              dense flat round color="warning"
              icon="edit"
              @click="abrirModalEditar(props.row)"
            />

            <q-btn
              dense flat round color="negative"
              icon="delete"
              @click="eliminar(props.row.contratoId)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ============================ MODAL EDITAR ============================= -->
    <q-dialog v-model="modalEditar">
      <q-card style="min-width: 460px">
        <q-card-section class="text-h6 text-primary">Editar Asistencias</q-card-section>

        <q-card-section>
          <div class="text-subtitle1 text-bold">{{ editRow.empleado }}</div>
          <div class="text-grey-7 q-mb-md">
            Periodo: {{ editRow.fechaInicio }} → {{ editRow.fechaFin }}
          </div>

          <div class="row q-col-gutter-sm">
            <div v-for="d in dias" :key="d.fecha" class="col-3">
              <q-checkbox
                v-model="d.asistio"
                :label="formatea(d.fecha)"
                color="primary"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar Cambios" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/userStore'

const $q = useQuasar()
const user = useUserStore()

const contratos = ref([])
const contratoId = ref(null)

const dias = ref([])
const lista = ref([])

const loading = ref(false)
const modalEditar = ref(false)
const mostrarCrear = ref(false)

const editRow = ref({})

const pagination = ref({ page: 1, rowsPerPage: 5 })

const columns = [
  { name: 'empleado', label: 'Empleado', field: 'empleado', align: 'left' },
  { name: 'fechaInicio', label: 'Inicio', field: 'fechaInicio', align: 'center' },
  { name: 'fechaFin', label: 'Fin', field: 'fechaFin', align: 'center' },
  { name: 'diasTrabajados', label: 'Trabajados', field: 'diasTrabajados', align: 'center' },
  { name: 'faltas', label: 'Faltas', field: 'faltas', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

onMounted(async () => {
  await cargarContratos()
  await cargarListado()
})

/* ================= CARGAR CONTRATOS DISPONIBLES ================= */
async function cargarContratos () {
  const res = await api.get('Rrhh/contratos/disponibles-asistencia')
  contratos.value = res.data.map(x => ({
    id: x.id,
    personalId: x.personalId,
    display: `${x.id} - ${x.personal.nombre}`
  }))
}

/* ================= MATRIZ (CREAR) ================= */
async function cargarMatrizCrear () {
  if (!contratoId.value) return

  mostrarCrear.value = true
  dias.value = []

  const res = await api.get(`Rrhh/fechas-contrato/${contratoId.value}`)
  const ini = new Date(res.data.data.fechaInicio)
  const fin = new Date(res.data.data.fechaFin)

  const tmp = []
  for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
    tmp.push({ fecha: d.toISOString().split('T')[0], asistio: false })
  }

  dias.value = tmp
}

/* ================= GUARDAR CREACIÓN ================= */
async function guardarAsistencias () {
  if (!contratoId.value) {
    return $q.notify({ type: 'warning', message: 'Seleccione un contrato' })
  }

  loading.value = true

  const c = contratos.value.find(x => x.id === contratoId.value)

  const payload = {
    contratoId: contratoId.value,
    personalId: c.personalId,
    fechasAsistidas: dias.value.filter(x => x.asistio).map(x => x.fecha),
    usuarioId: user.idUsuario
  }

  try {
    await api.post('Rrhh/asistencias/registrar', payload)

    $q.notify({ type: 'positive', message: 'Asistencias guardadas' })

    mostrarCrear.value = false
    contratoId.value = null

    await cargarContratos()
    await cargarListado()

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al guardar asistencias' })
  }

  loading.value = false
}

/* ================= LISTADO ================= */
async function cargarListado () {
  const res = await api.get('Rrhh/asistencias/resumen-todos')
  lista.value = res.data
}

/* ================= EDITAR ================= */
async function abrirModalEditar (row) {
  editRow.value = row
  contratoId.value = row.contratoId

  mostrarCrear.value = false
  await cargarMatrizEdicion()

  modalEditar.value = true
}

async function cargarMatrizEdicion () {
  dias.value = []

  const r = await api.get(`Rrhh/fechas-contrato/${contratoId.value}`)
  const ini = new Date(r.data.data.fechaInicio)
  const fin = new Date(r.data.data.fechaFin)

  const tmp = []
  for (let d = new Date(ini); d <= fin; d.setDate(d.getDate() + 1)) {
    tmp.push({ fecha: d.toISOString().split('T')[0], asistio: false })
  }

  dias.value = tmp

  const guardadas = await api.get(`Rrhh/asistencias/por-contrato/${contratoId.value}`)
  const fechas = guardadas.data

  dias.value.forEach(x => { x.asistio = fechas.includes(x.fecha) })
}

async function guardarEdicion () {
  const c = contratos.value.find(x => x.id === contratoId.value)
    || lista.value.find(x => x.contratoId === contratoId.value)

  const payload = {
    contratoId: contratoId.value,
    personalId: c.personalId,
    fechasAsistidas: dias.value.filter(x => x.asistio).map(x => x.fecha),
    usuarioId: user.idUsuario
  }

  try {
    await api.post('Rrhh/asistencias/registrar', payload)

    $q.notify({ type: 'positive', message: 'Asistencias actualizadas' })

    modalEditar.value = false

    await cargarContratos()
    await cargarListado()

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar asistencias' })
  }
}

/* ================= ELIMINAR ================= */
async function eliminar (id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar todas las asistencias del contrato?',
    cancel: true
  }).onOk(async () => {
    await api.delete(`Rrhh/asistencias/por-contrato/${id}`)

    await cargarContratos()
    await cargarListado()

    $q.notify({ type: 'positive', message: 'Asistencias eliminadas' })
  })
}

/* ================= FORMATEAR FECHA ================= */
function formatea (f) {
  return new Date(f).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short'
  })
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
