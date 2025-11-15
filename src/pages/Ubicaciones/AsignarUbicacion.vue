<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Asignar Ubicación a Personal
    </div>

    <!-- FORMULARIO -->
    <q-form @submit.prevent="guardarAsignacion" class="q-gutter-md">
      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="assignment_ind" class="q-mr-sm" color="primary" />
          Datos de Asignación
        </q-card-section>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select
              v-model="form.personalId"
              :options="personalOptions"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              label="Seleccione Personal"
              outlined
              @update:model-value="cargarAsignaciones"
              :rules="[val => !!val || 'Seleccione un personal']"
            />
          </div>

          <div class="col-6">
            <q-select
              v-model="form.ubicacionId"
              :options="ubicaciones"
              option-label="comunidad"
              option-value="id"
              emit-value
              map-options
              label="Seleccione Ubicación"
              outlined
              :rules="[val => !!val || 'Seleccione una ubicación']"
            />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model="form.fechaAsignacion"
              type="date"
              label="Fecha de Asignación"
              outlined
              :rules="[val => !!val || 'Requerido']"
            />
          </div>
        </div>

      </q-card>

      <div class="q-mt-md flex justify-end">
        <q-btn
          type="submit"
          color="primary"
          label="Guardar Asignación"
          icon="save"
          :loading="loadingSubmit"
        />
      </div>
    </q-form>

    <q-separator class="q-my-lg" />

    <!-- TABLA -->
    <div v-if="asignaciones.length">
      <q-table
        :rows="asignaciones"
        :columns="columns"
        row-key="id"
        flat
        bordered
      >
        <template #body-cell-acciones="props">
          <q-td :props="props" align="center">
            <q-btn dense flat round icon="edit" color="primary" @click="abrirEdicion(props.row)" />
            <q-btn dense flat round icon="delete" color="negative" @click="eliminar(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- MODAL DE EDICIÓN -->
    <q-dialog v-model="modalEditar" persistent>
      <q-card style="min-width: 440px">
        <q-card-section class="text-h6 text-primary">
          Editar Asignación
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <q-select
            v-model="editForm.ubicacionId"
            :options="ubicaciones"
            option-label="comunidad"
            option-value="id"
            emit-value
            map-options
            label="Ubicación"
            outlined
          />

          <q-input
            v-model="editForm.fechaAsignacion"
            type="date"
            label="Fecha"
            outlined
          />
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
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const userStore = useUserStore()

const loadingSubmit = ref(false)
const loadingEditar = ref(false)

const personalOptions = ref([])
const ubicaciones = ref([])
const asignaciones = ref([])
const modalEditar = ref(false)


const form = ref({
  personalId: null,
  ubicacionId: null,
  fechaAsignacion: new Date().toISOString().split('T')[0],
  usuarioId: userStore.idUsuario
})

const editForm = ref({
  id: null,
  ubicacionId: null,
  fechaAsignacion: ''
})

const columns = [
  { name: 'personal', label: 'Personal', field: row => row.personal.nombre, align: 'left' },
  { name: 'ubicacion', label: 'Ubicación', field: row => row.ubicacion.comunidad, align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fechaAsignacion', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

onMounted(async () => {
  try {
    const per = await api.get('Personal/historial')
    personalOptions.value = per.data

    const ubi = await api.get('Ubicaciones/historial')
    ubicaciones.value = ubi.data

    // 🚀 CARGAR TODAS LAS ASIGNACIONES AL ENTRAR
    const asig = await api.get('AsignacionUbicacion/todas')
    asignaciones.value = asig.data

  } catch (err) {
    console.error(err)
  }
})

async function cargarAsignaciones() {
  const id = form.value.personalId;
  if (!id) return;

  try {
    const res = await api.get(`AsignacionUbicacion/por-personal/${id}`);
    asignaciones.value = res.data;
  } catch (err) {
    console.error(err);
    asignaciones.value = [];
  }
}

async function guardarAsignacion() {
  if (loadingSubmit.value) return
  loadingSubmit.value = true

  try {
    const payload = {
      personalId: form.value.personalId,
      ubicacionId: form.value.ubicacionId,
      fechaAsignacion: form.value.fechaAsignacion,
      usuarioId: userStore.idUsuario
    }

    await api.post('AsignacionUbicacion/asignar', payload)
    $q.notify({ type: 'positive', message: 'Ubicación asignada correctamente' })

const todas = await api.get('AsignacionUbicacion/todas')
asignaciones.value = todas.data

    Object.assign(form.value, {
      ubicacionId: null,
      fechaAsignacion: new Date().toISOString().split('T')[0]
    })

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al asignar ubicación' })
  }

  loadingSubmit.value = false
}

function abrirEdicion(row) {
  editForm.value = {
    id: row.id,
    ubicacionId: row.ubicacionId,
    fechaAsignacion: row.fechaAsignacion
  }
  modalEditar.value = true
}

async function guardarEdicion() {
  if (loadingEditar.value) return
  loadingEditar.value = true

  try {
    await api.put(`AsignacionUbicacion/${editForm.value.id}`, editForm.value)

    modalEditar.value = false
const todas = await api.get('AsignacionUbicacion/todas')
asignaciones.value = todas.data

    $q.notify({ type: 'positive', message: 'Asignación actualizada correctamente' })

  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al actualizar asignación' })
  }

  loadingEditar.value = false
}

async function eliminar(id) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Desea eliminar esta asignación?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`AsignacionUbicacion/${id}`)
      asignaciones.value = asignaciones.value.filter(a => a.id !== id)
      $q.notify({ type: 'positive', message: 'Asignación eliminada correctamente' })
    } catch (err) {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Error al eliminar asignación' })
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
