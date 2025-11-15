<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Registro de Personal
    </div>

    <q-form @submit.prevent="guardarPersonal" class="q-gutter-md">

      <q-card flat bordered class="q-pa-md bg-grey-1">
        <q-card-section class="text-h6 text-primary">
          <q-icon name="badge" class="q-mr-sm" color="primary" />
          Datos Generales
        </q-card-section>

        <q-input v-model="personal.nombre" label="Nombre completo" outlined required />

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="personal.cargo" label="Cargo" outlined />
          </div>
          <div class="col-6">
            <q-input v-model="personal.contacto" label="Contacto / Teléfono" outlined />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input v-model="personal.idioma" label="Idioma" outlined />
          </div>
          <div class="col-6">
            <q-input v-model="personal.residencia" label="Residencia" outlined />
          </div>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-select v-model="personal.departamento" :options="departamentos" label="Departamento" outlined
              @update:model-value="cargarMunicipios" />
          </div>
          <div class="col-6">
            <q-select v-model="personal.municipio" :options="municipios" label="Municipio" outlined />
          </div>
        </div>
      </q-card>

      <div class="q-mt-md flex justify-end">
        <q-btn type="submit" color="primary" label="Guardar Registro" icon="save" :loading="loadingGuardar"
          :disable="loadingGuardar" />
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
const loadingGuardar = ref(false)

const departamentos = Object.keys(departamentosData)
const municipios = ref([])

const personal = ref({
  nombre: '',
  cargo: '',
  contacto: '',
  idioma: '',
  residencia: '',
  departamento: '',
  municipio: '',
  usuarioId: userStore.idUsuario
})

function cargarMunicipios(dep) {
  municipios.value = departamentosData[dep] || []
  personal.value.municipio = ''
}

async function guardarPersonal() {
  if (loadingGuardar.value) return
  loadingGuardar.value = true
  try {
    if (!personal.value.nombre) {
      $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
      return
    }
    const res = await api.post('Personal/registrar', personal.value)
    $q.notify({ type: 'positive', message: res.data.mensaje })
    Object.assign(personal.value, {
      nombre: '', cargo: '', contacto: '', idioma: '', residencia: '',
      departamento: '', municipio: '', usuarioId: userStore.idUsuario
    })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Error al registrar personal' })
  } finally {
    loadingGuardar.value = false
  }
}
</script>
