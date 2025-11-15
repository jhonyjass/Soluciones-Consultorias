<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="min-width: 450px">
      <q-card-section class="text-h6 text-primary">
        Editar Usuario
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="guardarCambios" class="q-gutter-md">

          <!-- NOMBRE (solo lectura) -->
          <q-input
            v-model="form.nombre"
            label="Nombre"
            outlined dense
            readonly
          />

          <!-- EMAIL -->
          <q-input
            v-model="form.email"
            label="Email"
            type="email"
            outlined dense
          />

          <!-- ROL -->
          <q-select
            v-model="form.rolId"
            :options="roles"
            option-value="id"
            option-label="nombre"
            label="Rol"
            outlined
            dense
            emit-value
            map-options
          />

          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Cancelar" color="grey" @click="cerrar" />
            <q-btn color="primary" label="Guardar" type="submit" />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";
import usuariosService from "src/services/usuarios.service";

const $q = useQuasar();

const props = defineProps({
  modelValue: Boolean,
  usuario: Object,
  roles: Array,
});

const emit = defineEmits(["update:modelValue", "actualizado"]);

const form = ref({
  nombre: "",
  email: "",
  rolId: null
});

watch(
  () => props.usuario,
  (u) => {
    if (u) {
      form.value = {
        nombre: u.nombre,
        email: u.email,
        rolId: u.rolId
      };
    }
  },
  { immediate: true }
);

function cerrar() {
  emit("update:modelValue", false);
}

async function guardarCambios() {
  try {
    await usuariosService.actualizar(props.usuario.id, form.value);

    $q.notify({ type: "positive", message: "Usuario actualizado correctamente" });
    emit("actualizado");
    cerrar();
  } catch (err) {
    console.error(err);
    $q.notify({ type: "negative", message: "Error al actualizar usuario" });
  }
}
</script>
