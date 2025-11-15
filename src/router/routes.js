import MainLayout from 'layouts/MainLayout.vue'
import AuthLayout from 'layouts/AuthLayout.vue'

const routes = [
  {
    path: '/solconsa',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      // =======================
      // DASHBOARD
      // =======================
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { roles: ['ADMIN', 'ANTROPOMETRISTA'] }
      },

      // =======================
      // NIÑOS (ADMIN + ANTROPOMETRISTA)
      // =======================
      {
        path: 'ninos',
        component: () => import('pages/Ninos/ListadoNinos.vue'),
        meta: { roles: ['ADMIN', 'ANTROPOMETRISTA'] }
      },
      {
        path: 'ninos/registro',
        component: () => import('pages/Ninos/RegistroNino.vue'),
        meta: { roles: ['ADMIN', 'ANTROPOMETRISTA'] }
      },
      {
        path: 'ninos/listado',
        component: () => import('pages/Ninos/ListadoNinos.vue'),
        meta: { roles: ['ADMIN', 'ANTROPOMETRISTA'] }
      },
      {
        path: 'ninos/historial',
        component: () => import('pages/Ninos/HistorialNinos.vue'),
        meta: { roles: ['ADMIN', 'ANTROPOMETRISTA'] }
      },

      // =======================
      // PERSONAL (SOLO ADMIN)
      // =======================
      {
        path: 'personal/registro',
        component: () => import('pages/Personal/RegistroPersonal.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'personal/historial',
        component: () => import('pages/Personal/HistorialPersonal.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'personal/asignar-equipo',
        component: () => import('pages/Personal/AsignarEquipo.vue'),
        meta: { roles: ['ADMIN'] }
      },

      // =======================
      // UBICACIONES (SOLO ADMIN)
      // =======================
      {
        path: 'ubicaciones/historial',
        component: () => import('pages/Ubicaciones/HistorialUbicacion.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'ubicaciones/registro',
        component: () => import('pages/Ubicaciones/RegistroUbicacion.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'ubicaciones/asignar',
        component: () => import('pages/Ubicaciones/AsignarUbicacion.vue'),
        meta: { roles: ['ADMIN'] }
      },

      // =======================
      // RRHH (SOLO ADMIN)
      // =======================
      {
        path: 'rrhh/contratos',
        component: () => import('pages/Rrhh/ContratosPage.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'rrhh/asistencias',
        component: () => import('pages/Rrhh/AsistenciasPage.vue'),
        meta: { roles: ['ADMIN'] }
      },
      {
        path: 'rrhh/nomina',
        component: () => import('pages/Rrhh/NominaPage.vue'),
        meta: { roles: ['ADMIN'] }
      },

      // =======================
      // REPORTES (SOLO ADMIN)
      // =======================
      {
        path: 'reportes',
        children: [
          {
            path: 'generar',
            component: () => import('pages/Reportes/GenerarReporteModal.vue'),
            meta: { roles: ['ADMIN'] }
          },
          {
            path: 'listado',
            component: () => import('pages/Reportes/ListadoReportes.vue'),
            meta: { roles: ['ADMIN'] }
          }
        ]
      },

      // =======================
      // CONTROL DE ACCESO (SOLO ADMIN)
      // =======================
      {
        path: 'usuarios',
        component: () => import('pages/Accesos/UsuariosPage.vue'),
        meta: { roles: ['ADMIN'] }
      }
    ]
  },

  // LOGIN
  {
    path: '/solconsa/login',
    component: AuthLayout,
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }]
  },

  // REDIRECCIONES
  { path: '/', redirect: '/solconsa/login' },
  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') }
]

export default routes
