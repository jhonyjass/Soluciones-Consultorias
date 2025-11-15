<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Generación de Nómina
    </div>

    <!-- SELECCIÓN DE CONTRATO -->
    <q-card flat bordered class="q-pa-md bg-grey-1">
      <q-card-section class="text-h6 text-primary">
        <q-icon name="payments" class="q-mr-sm" /> Seleccionar Contrato
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
            label="Contrato"
            outlined
            @update:model-value="cargarDatos"
          />
        </div>
      </div>

      <!-- FORMULARIO CALCULO -->
      <div v-if="contratoCargado" class="q-mt-lg">
        <q-card flat bordered class="q-pa-md">
          <q-card-section class="text-h6 text-primary">Datos de Cálculo</q-card-section>

          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <q-input v-model="form.salarioDiario" outlined readonly label="Salario Diario" />
            </div>

            <div class="col-4">
              <q-input v-model="form.viaticoDiario" outlined readonly label="Viático Diario" />
            </div>

            <div class="col-4">
              <q-input v-model="form.diasTrabajados" outlined readonly label="Días Trabajados" />
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-4">
              <q-input
                v-model="form.otrosDescuentos"
                type="number"
                outlined
                label="Otros Descuentos"
                @update:model-value="calcular"
              />
            </div>

            <div class="col-8">
              <q-input
                v-model="form.comentario"
                outlined
                label="Comentario"
              />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row text-bold">
            <div class="col-4">Total Salario: Q {{ form.totalSalario }}</div>
            <div class="col-4">Total Viáticos: Q {{ form.totalViaticos }}</div>
            <div class="col-4 text-primary">Total a Pagar: Q {{ form.totalPagar }}</div>
          </div>

          <q-card-actions align="right" class="q-mt-lg">
            <q-btn
              color="primary"
              icon="save"
              label="Generar Nómina"
              @click="guardarNomina"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-card>

    <q-separator class="q-my-xl" />

    <!-- TABLA -->
    <q-table
      v-model:pagination="pagination"
      :rows="nominas"
      :columns="columns"
      row-key="id"
      flat
      bordered
      title="Nóminas Generadas"
      :rows-per-page-options="[5, 10, 20, 50]"
    >
      <template #body-cell-totalPagar="props">
        <q-td align="center">
          Q {{ props.row.totalPagar }}
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td align="center">
          <q-btn dense flat round color="secondary" icon="picture_as_pdf" @click="pdf(props.row.id)" />
          <q-btn dense flat round color="warning" icon="edit" @click="abrirModal(props.row)" />
          <q-btn dense flat round color="negative" icon="delete" @click="eliminar(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <!-- MODAL EDICION -->
    <q-dialog v-model="modalEditar">
      <q-card style="min-width: 460px">
        <q-card-section class="text-h6 text-primary">
          Editar Nómina
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input
            v-model="editForm.otrosDescuentos"
            type="number"
            outlined
            label="Otros Descuentos"
            @update:model-value="calcularEdicion"
          />

          <q-input
            v-model="editForm.comentario"
            outlined
            label="Comentario"
          />

          <div class="text-bold text-primary">
            Total a Pagar: Q {{ editForm.totalPagar }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="guardarEdicion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userStore = useUserStore()

const contratos = ref([])
const contratoId = ref(null)
const contratoCargado = ref(false)
const nominas = ref([])

const loading = ref(false)
const modalEditar = ref(false)

const form = ref({
  salarioDiario: 0,
  viaticoDiario: 0,
  diasTrabajados: 0,
  otrosDescuentos: 0,
  comentario: '',
  totalSalario: 0,
  totalViaticos: 0,
  totalPagar: 0
})

const editForm = ref({
  id: null,
  otrosDescuentos: 0,
  comentario: '',
  totalPagar: 0
})

const pagination = ref({
  page: 1,
  rowsPerPage: 5
})

const columns = [
  { name: 'empleado', label: 'Empleado', field: row => row.personal.nombre, align: 'left' },
  { name: 'dias', label: 'Trabajados', field: 'diasTrabajados', align: 'center' },
  { name: 'totalPagar', label: 'A pagar', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

onMounted(async () => {
  await cargarContratos()
  await cargarNominas()
})

async function cargarContratos () {
  const res = await api.get('Rrhh/contratos/disponibles-nomina')
  contratos.value = res.data.map(x => ({
    id: x.id,
    salarioDiario: x.salarioDiario,
    viaticoDiario: x.viaticoDiario,
    diasTrabajados: x.diasTrabajados,
    personalId: x.personalId,
    display: `${x.id} - ${x.personal.nombre}`
  }))
}

async function cargarDatos () {
  const c = contratos.value.find(x => x.id === contratoId.value)
  if (!c) return

  form.value.salarioDiario = c.salarioDiario
  form.value.viaticoDiario = c.viaticoDiario

  const res = await api.get(`Rrhh/asistencias/resumen/${c.id}`)
  form.value.diasTrabajados = res.data.diasTrabajados

  calcular()
  contratoCargado.value = true
}

function calcular () {
  const s = Number(form.value.salarioDiario)
  const v = Number(form.value.viaticoDiario)
  const d = Number(form.value.diasTrabajados)
  const o = Number(form.value.otrosDescuentos)

  const totalSalario = (s + v) * d
  const totalViaticos = v * d
  const totalPagar = totalSalario - totalViaticos - o

  form.value.totalSalario = totalSalario.toFixed(2)
  form.value.totalViaticos = totalViaticos.toFixed(2)
  form.value.totalPagar = totalPagar.toFixed(2)
}

async function guardarNomina () {
  if (!contratoId.value) {
    $q.notify({ type: 'warning', message: 'Seleccione un contrato' })
    return
  }

  loading.value = true

  try {
    const payload = {
      contratoId: contratoId.value,
      otrosDescuentos: Number(form.value.otrosDescuentos),
      comentario: form.value.comentario,
      usuarioId: userStore.idUsuario
    }

    await api.post('Rrhh/nominas/generar', payload)
    $q.notify({ type: 'positive', message: 'Nómina generada correctamente' })

    contratoCargado.value = false
    contratoId.value = null
    form.value.otrosDescuentos = 0
    form.value.comentario = ''

    await cargarNominas()
    await cargarContratos()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al generar nómina' })
  }

  loading.value = false
}

async function cargarNominas () {
  const res = await api.get('Rrhh/nominas')
  nominas.value = res.data
}

function pdf (id) {
  const base = api.defaults.baseURL.replace(/\/api\/?$/, '')
  const url = `${base}/api/Rrhh/nomina-pdf/${id}`
  window.open(url, '_blank')
}

function abrirModal (row) {
  editForm.value = {
    id: row.id,
    otrosDescuentos: row.otrosDescuentos,
    comentario: row.comentario,
    totalPagar: row.totalPagar
  }
  modalEditar.value = true
}

function calcularEdicion () {
  const n = nominas.value.find(x => x.id === editForm.value.id)
  if (!n) return

  editForm.value.totalPagar = (
    n.totalSalario - n.totalViaticos - Number(editForm.value.otrosDescuentos)
  ).toFixed(2)
}

async function guardarEdicion () {
  try {
    await api.put(`Rrhh/nominas/${editForm.value.id}`, {
      otrosDescuentos: Number(editForm.value.otrosDescuentos),
      comentario: editForm.value.comentario
    })
    $q.notify({ type: 'positive', message: 'Nómina actualizada' })
    modalEditar.value = false
    await cargarNominas()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Error al actualizar nómina' })
  }
}

async function eliminar (id) {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar esta nómina?',
    cancel: true
  }).onOk(async () => {
    await api.delete(`Rrhh/nominas/${id}`)
    await cargarNominas()
    await cargarContratos()
    $q.notify({ type: 'positive', message: 'Nómina eliminada' })
  })
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
