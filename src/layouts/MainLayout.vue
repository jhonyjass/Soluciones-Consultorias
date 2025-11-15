<template>
  <q-layout view="hHh Lpr fFf">

    <!-- HEADER -->
    <q-header elevated class="bg-white text-dark header-shadow">
      <q-toolbar class="q-px-md">
        <q-btn flat dense round icon="menu" @click="toggleDrawer" class="q-mr-sm" />

        <!-- LOGO -->
        <q-toolbar-title class="row items-center no-wrap">
          <img src="../assets/img/solconrecortada.png" alt="Logo SolconSA" class="logo" />
        </q-toolbar-title>

        <!-- USUARIO -->
        <div class="q-mr-md text-caption text-weight-bold text-primary flex items-center">
          <q-icon name="account_circle" size="22px" class="q-mr-xs" />
          {{ nombreUsuario }} ({{ rolUsuario }})
        </div>

        <!-- BOTÓN SALIR -->
        <q-btn
          color="primary"
          dense
          flat
          icon="logout"
          label="Salir"
          @click="onLogout"
          class="logout-btn"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="drawerOpen" show-if-above bordered class="drawer-menu">
      <q-scroll-area class="fit">
        <q-list class="q-pa-sm">

          <q-item-label header class="text-primary text-weight-bold">
            Menú Principal
          </q-item-label>

          <!-- DASHBOARD (TODOS) -->
          <q-item clickable v-ripple to="/solconsa/dashboard">
            <q-item-section avatar>
              <q-icon name="dashboard" color="dark" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <!-- NIÑOS (ADMIN + ANTROPOMETRISTA) -->
          <q-expansion-item icon="child_care" label="Niños">
            <q-item clickable v-ripple to="/solconsa/ninos/registro">
              <q-item-section>Registro</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/solconsa/ninos/listado">
              <q-item-section>Listado</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/solconsa/ninos/historial">
              <q-item-section>Historial</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- PERSONAL (SOLO ADMIN) -->
          <q-expansion-item
            v-if="esAdmin"
            icon="groups"
            label="Personal"
          >
            <q-item clickable v-ripple to="/solconsa/personal/registro">
              <q-item-section>Registro</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/solconsa/personal/historial">
              <q-item-section>Historial</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/solconsa/personal/asignar-equipo">
              <q-item-section>Asignar equipo</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- UBICACIONES (SOLO ADMIN) -->
          <q-expansion-item
            v-if="esAdmin"
            icon="place"
            label="Ubicaciones"
          >
            <q-item clickable v-ripple to="/solconsa/ubicaciones/registro">
              <q-item-section>Registro</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/solconsa/ubicaciones/historial">
              <q-item-section>Historial</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/solconsa/ubicaciones/asignar">
              <q-item-section>Asignar ubicación</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- RRHH (SOLO ADMIN) -->
          <q-expansion-item
            v-if="esAdmin"
            icon="business_center"
            label="Recursos Humanos"
          >
            <q-item clickable v-ripple to="/solconsa/rrhh/contratos">
              <q-item-section>Contratos</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/solconsa/rrhh/asistencias">
              <q-item-section>Asistencias</q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/solconsa/rrhh/nomina">
              <q-item-section>Nómina</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- REPORTES (SOLO ADMIN) -->
          <q-expansion-item
            v-if="esAdmin"
            icon="bar_chart"
            label="Reportes"
          >
            <q-item clickable v-ripple to="/solconsa/reportes/generar">
              <q-item-section>Generar Reporte</q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/solconsa/reportes/listado">
              <q-item-section>Listado de Reportes</q-item-section>
            </q-item>
          </q-expansion-item>

          <!-- CONTROL DE ACCESO (SOLO ADMIN) -->
          <q-item
            v-if="esAdmin"
            clickable
            v-ripple
            to="/solconsa/usuarios"
          >
            <q-item-section avatar>
              <q-icon name="manage_accounts" color="dark" />
            </q-item-section>
            <q-item-section>Control de Acceso</q-item-section>
          </q-item>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO PRINCIPAL -->
    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const userStore = useUserStore()

// Drawer responsive
const drawerOpen = ref(false)
onMounted(() => {
  drawerOpen.value = $q.screen.gt.sm
})
const toggleDrawer = () => {
  drawerOpen.value = !drawerOpen.value
}

// Datos usuario
const nombreUsuario = computed(() => userStore.nombreUsuario)
const rolUsuario = computed(() => userStore.rolUsuario)
const esAdmin = computed(() => rolUsuario.value === 'ADMIN')
// por si algún día quieres algo especial para antropometrista:

// Cerrar sesión
const onLogout = () => {
  $q.dialog({
    title: 'Cerrar sesión',
    message: '¿Deseas salir del sistema?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    userStore.logout()
    router.push('/solconsa/login')
  })
}
</script>

<style scoped>
.header-shadow {
  box-shadow: 0 3px 8px rgba(241, 238, 238, 0.15);
}

/* LOGO */
.logo {
  width: 180px;
  height: auto;
}

/* BOTÓN SALIR */
.logout-btn:hover {
  background: rgba(197, 105, 105, 0.87);
  border-radius: 8px;
}

/* DRAWER */
.drawer-menu {
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

/* ÍTEMS DEL MENÚ */
.q-item:hover {
  background: rgba(21, 31, 41, 0.07);
  transition: background 0.2s ease;
  border-radius: 6px;
}
</style>
