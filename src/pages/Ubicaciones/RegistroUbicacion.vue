<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Registro de Ubicación
    </div>

    <q-form @submit.prevent="guardar" class="q-gutter-md">

      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="place" class="q-mr-sm" color="primary" />
          Datos de Ubicación
        </q-card-section>

        <div class="row q-col-gutter-md">

          <div class="col-6">
            <q-select
              v-model="form.departamento"
              :options="departamentos"
              label="Departamento"
              outlined
              required
              @update:model-value="cargarMunicipios"
            />
          </div>

          <div class="col-6">
            <q-select
              v-model="form.municipio"
              :options="municipios"
              label="Municipio"
              outlined
              required
            />
          </div>

        </div>

        <q-input
          v-model="form.comunidad"
          label="Comunidad"
          outlined
        />
      </q-card>

      <div class="q-mt-md flex justify-end">
        <q-btn
          type="submit"
          color="primary"
          label="Guardar Ubicación"
          icon="save"
          :loading="loading"
        />
      </div>

    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useUserStore } from 'src/stores/userStore'
import { departamentosData } from 'src/data/departamentosMunicipios'

const $q = useQuasar()
const userStore = useUserStore()

// ==============================
// LISTA DE DEPARTAMENTOS
// ==============================
const departamentos = Object.keys(departamentosData)
const municipios = ref([])

const form = ref({
  departamento: '',
  municipio: '',
  comunidad: '',
  usuarioId: userStore.idUsuario
})

const loading = ref(false)

// ==============================
// Cargar municipios dinámicos
// ==============================
function cargarMunicipios(dep) {
  municipios.value = departamentosData[dep] || []
  form.value.municipio = ''
}

// ==============================
// Guardar ubicación
// ==============================
async function guardar() {
  try {
    if (!form.value.departamento || !form.value.municipio) {
      $q.notify({
        type: 'warning',
        message: 'Completa todos los campos obligatorios'
      })
      return
    }

    loading.value = true

    const res = await api.post('Ubicaciones/registrar', form.value)

    $q.notify({
      type: 'positive',
      message: res.data.mensaje || 'Ubicación registrada correctamente'
    })

    // RESET
    form.value = {
      departamento: '',
      municipio: '',
      comunidad: '',
      usuarioId: userStore.idUsuario
    }

    municipios.value = []

  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar ubicación'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 10px;
}
</style>
