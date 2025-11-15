<template>
  <q-page padding>
    <div class="text-h5 text-primary text-weight-bold q-mb-md">
      Gestión de Usuarios
    </div>

    <q-btn
      color="primary"
      icon="add"
      label="Crear Usuario"
      class="q-mb-md"
      @click="mostrarModalCrear = true"
    />

    <q-table
      flat bordered
      :rows="usuarios"
      :columns="columns"
      row-key="id"
      separator="horizontal"
    >
      <template #body-cell-acciones="props">
        <q-td>
          <q-btn icon="edit" color="orange" dense flat round @click="abrirEditar(props.row)" />
          <q-btn icon="delete" color="negative" dense flat round @click="eliminar(props.row)" />
        </q-td>
      </template>
    </q-table>

    <CrearUsuarioModal
      v-model="mostrarModalCrear"
      :empleados="empleados"
      :roles="roles"
      @creado="cargarUsuarios"
    />

    <EditarUsuarioModal
      v-model="mostrarModalEditar"
      :usuario="usuarioSeleccionado"
      :roles="roles"
      @actualizado="cargarUsuarios"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import usuariosService from "src/services/usuarios.service";
import { personalService } from "src/services/personal.service.js";

import CrearUsuarioModal from "./CrearUsuarioModal.vue";
import EditarUsuarioModal from "./EditarUsuarioModal.vue";

const $q = useQuasar();

const usuarios = ref([]);
const empleados = ref([]);
const roles = ref([]);

const mostrarModalCrear = ref(false);
const mostrarModalEditar = ref(false);
const usuarioSeleccionado = ref(null);

const columns = [
  { name: "id", label: "ID", field: "id" },
  { name: "nombre", label: "Nombre", field: "nombre" },
  { name: "email", label: "Email", field: "email" },
  { name: "rol", label: "Rol", field: "rol" },
  { name: "acciones", label: "Acciones" },
];

async function cargarUsuarios() {
  const { data } = await usuariosService.listar();
  usuarios.value = data.filter(u => u.activo === true); // 👈 SOLO ACTIVOS
}

async function cargarEmpleados() {
  const { data } = await personalService.listar();
  empleados.value = data;
}

async function cargarRoles() {
  const { data } = await usuariosService.listarRoles();
  roles.value = data;
}

function abrirEditar(row) {
  usuarioSeleccionado.value = row;
  mostrarModalEditar.value = true;
}

async function eliminar(row) {
  $q.dialog({
    title: "Confirmar",
    message: `¿Deseas desactivar al usuario ${row.nombre}?`,
    cancel: true,
  }).onOk(async () => {
    await usuariosService.eliminar(row.id);
    $q.notify({ type: "positive", message: "Usuario desactivado" });
    cargarUsuarios();
  });
}

onMounted(() => {
  cargarUsuarios();
  cargarEmpleados();
  cargarRoles();
});
</script>
