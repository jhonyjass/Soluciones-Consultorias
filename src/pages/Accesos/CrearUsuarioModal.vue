<template>
  <q-dialog
    v-model="isOpen"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="text-h6 text-primary">
        Crear Usuario
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="guardar" class="q-gutter-md">

          <q-select
            v-model="form.personalId"
            :options="empleados"
            option-value="id"
            option-label="nombre"
            label="Empleado"
            outlined dense
            emit-value
            map-options
          />

          <q-input
            v-model="form.email"
            label="Correo"
            type="email"
            outlined dense
          />

          <q-input
            v-model="form.contrasena"
            label="Contraseña"
            type="password"
            outlined dense
          />

          <q-select
            v-model="form.rolId"
            :options="roles"
            option-value="id"
            option-label="nombre"
            label="Rol"
            outlined dense
            emit-value
            map-options
          />

        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="negative" @click="cerrar" />
        <q-btn label="Guardar" color="primary" @click="guardar" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import { useQuasar } from "quasar";
import usuariosService from "src/services/usuarios.service";

const props = defineProps({
  modelValue: Boolean,
  empleados: Array,
  roles: Array
});

const emit = defineEmits(["update:modelValue", "creado"]);
const $q = useQuasar();

const isOpen = ref(false);

watch(() => props.modelValue, (val) => {
  isOpen.value = val;
});

watch(isOpen, (val) => {
  emit("update:modelValue", val);
});

const form = ref({
  personalId: null,
  email: "",
  contrasena: "",
  rolId: null
});

async function guardar() {
  try {
    if (!form.value.personalId || !form.value.email || !form.value.contrasena || !form.value.rolId) {
      return $q.notify({ type: "warning", message: "Completa todos los campos." });
    }

    await usuariosService.crear(form.value);

    emit("creado");
    $q.notify({
      type: "positive",
      message: "Usuario creado correctamente"
    });
    cerrar();
  } catch (e) {
    console.error(e);
    $q.notify({
      type: "negative",
      message: "Error al crear el usuario"
    });
  }
}

function cerrar() {
  isOpen.value = false;

  form.value = {
    personalId: null,
    email: "",
    contrasena: "",
    rolId: null
  };
}
</script>
