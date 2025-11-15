<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Gestión de Contratos
    </div>

    <!-- FORMULARIO -->
    <q-form @submit.prevent="guardarContrato" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="assignment" class="q-mr-sm" color="primary" />
          Datos del Contrato
        </q-card-section>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select
              v-model="form.personalId"
              :options="personal"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              label="Seleccione Personal"
              outlined
              @update:model-value="autollenarCargo"
              :rules="[val => !!val || 'Seleccione un personal']"
            />
          </div>

          <div class="col-6">
            <q-input v-model="form.cargo" label="Cargo" outlined readonly />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-input
              v-model="form.salarioDiario"
              type="number"
              label="Salario Diario"
              outlined
              :rules="[val => val > 0 || 'Ingrese un valor']"
            />
          </div>

          <div class="col-4">
            <q-input
              v-model="form.viaticoDiario"
              type="number"
              label="Viático Diario"
              outlined
            />
          </div>

          <div class="col-4">
            <q-input
              v-model="form.diasContratados"
              label="Días Contratados"
              outlined
              readonly
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="form.fechaInicio"
              type="date"
              label="Fecha Inicio"
              outlined
              @update:model-value="calcularDias"
              :rules="[val => !!val || 'Requerido']"
            />
          </div>

          <div class="col-6">
            <q-input
              v-model="form.fechaFin"
              type="date"
              label="Fecha Fin"
              outlined
              @update:model-value="calcularDias"
              :rules="[val => !!val || 'Requerido']"
            />
          </div>
        </div>
      </q-card>

      <div class="q-mt-md flex justify-end">
        <q-btn
          type="submit"
          color="primary"
          label="Guardar Contrato"
          icon="save"
          :loading="loadingSubmit"
        />
      </div>
    </q-form>

    <q-separator class="q-my-xl" />

    <!-- TABLA -->
    <q-card flat bordered class="q-pa-md">
      <q-card-section class="text-h6 text-primary">
        <q-icon name="list_alt" class="q-mr-sm" color="primary" />
        Contratos Registrados
      </q-card-section>

      <q-table
        v-model:pagination="pagination"
        :rows="contratos"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <template #body-cell-acciones="props">
          <q-td :props="props" align="center">
            <q-btn
              dense flat round
              color="secondary"
              icon="picture_as_pdf"
              @click="pdfContrato(props.row.id)"
            />
            <q-btn
              dense flat round
              color="primary"
              icon="edit"
              @click="editar(props.row)"
            />
            <q-btn
              dense flat round
              color="negative"
              icon="delete"
              @click="eliminar(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL EDITAR -->
    <q-dialog v-model="modalEditar" persistent>
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6 text-primary">
          Editar Contrato
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input v-model="editForm.salarioDiario" type="number" label="Salario Diario" outlined />
          <q-input v-model="editForm.viaticoDiario" type="number" label="Viático Diario" outlined />

          <q-input
            v-model="editForm.fechaInicio"
            type="date"
            label="Fecha Inicio"
            outlined
            @update:model-value="calcularDiasEditar"
          />

          <q-input
            v-model="editForm.fechaFin"
            type="date"
            label="Fecha Fin"
            outlined
            @update:model-value="calcularDiasEditar"
          />

          <q-input v-model="editForm.diasContratados" label="Días" outlined readonly />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :loading="loadingEditar" label="Guardar" @click="guardarEdicion" />
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
const userStore = useUserStore()

const personal = ref([])
const contratos = ref([])

const loadingSubmit = ref(false)
const loadingEditar = ref(false)
const modalEditar = ref(false)

const form = ref({
  personalId: null,
  cargo: '',
  salarioDiario: 0,
  viaticoDiario: 0,
  fechaInicio: '',
  fechaFin: '',
  diasContratados: 0,
  usuarioId: userStore.idUsuario
})

const editForm = ref({
  id: null,
  salarioDiario: 0,
  viaticoDiario: 0,
  fechaInicio: '',
  fechaFin: '',
  diasContratados: 0
})

const columns = [
  { name: 'personal', label: 'Personal', field: row => row.personal.nombre, align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargoContratado', align: 'left' },
  { name: 'fi', label: 'Inicio', field: 'fechaInicio', align: 'center' },
  { name: 'ff', label: 'Fin', field: 'fechaFin', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 5
})

onMounted(async () => {
  await cargarPersonal()
  await cargarContratos()
})

async function cargarPersonal () {
  const res = await api.get('Personal/historial')
  personal.value = res.data
}

async function cargarContratos () {
  const res = await api.get('Rrhh/contratos')
  contratos.value = res.data
}

function autollenarCargo (id) {
  const p = personal.value.find(x => x.id === id)
  form.value.cargo = p ? p.cargo : ''
}

function calcularDias () {
  if (!form.value.fechaInicio || !form.value.fechaFin) return
  const ini = new Date(form.value.fechaInicio)
  const fin = new Date(form.value.fechaFin)
  const diff = (fin - ini) / 86400000 + 1
  form.value.diasContratados = diff > 0 ? diff : 0
}

function calcularDiasEditar () {
  if (!editForm.value.fechaInicio || !editForm.value.fechaFin) return
  const ini = new Date(editForm.value.fechaInicio)
  const fin = new Date(editForm.value.fechaFin)
  const diff = (fin - ini) / 86400000 + 1
  editForm.value.diasContratados = diff > 0 ? diff : 0
}

function pdfContrato (id) {
  const base = api.defaults.baseURL.replace(/\/api\/?$/, '')
  const url = `${base}/api/Rrhh/contrato-pdf/${id}`
  window.open(url, '_blank')
}

async function guardarContrato () {
  if (loadingSubmit.value) return
  loadingSubmit.value = true

  try {
    const payload = {
      personalId: form.value.personalId,
      fechaInicio: form.value.fechaInicio,
      fechaFin: form.value.fechaFin,
      salarioDiario: Number(form.value.salarioDiario),
      viaticoDiario: Number(form.value.viaticoDiario),
      usuarioId: userStore.idUsuario
    }

    await api.post('Rrhh/contratos', payload)
    $q.notify({ type: 'positive', message: 'Contrato registrado' })

    await cargarContratos()

    Object.assign(form.value, {
      personalId: null,
      cargo: '',
      salarioDiario: 0,
      viaticoDiario: 0,
      fechaInicio: '',
      fechaFin: '',
      diasContratados: 0
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al registrar' })
  }

  loadingSubmit.value = false
}

function editar (row) {
  editForm.value = {
    id: row.id,
    salarioDiario: row.salarioDiario,
    viaticoDiario: row.viaticoDiario,
    fechaInicio: row.fechaInicio.substring(0, 10),
    fechaFin: row.fechaFin.substring(0, 10),
    diasContratados: row.diasContratados
  }
  modalEditar.value = true
}

async function guardarEdicion () {
  if (loadingEditar.value) return
  loadingEditar.value = true

  try {
    await api.put(`Rrhh/contratos/${editForm.value.id}`, {
      salarioDiario: Number(editForm.value.salarioDiario),
      viaticoDiario: Number(editForm.value.viaticoDiario),
      fechaInicio: editForm.value.fechaInicio,
      fechaFin: editForm.value.fechaFin,
      usuarioId: userStore.idUsuario
    })

    modalEditar.value = false
    await cargarContratos()
    $q.notify({ type: 'positive', message: 'Contrato actualizado' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar' })
  }

  loadingEditar.value = false
}

async function eliminar (id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar este contrato?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`Rrhh/contratos/${id}`)
      await cargarContratos()
      $q.notify({ type: 'positive', message: 'Contrato eliminado' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
