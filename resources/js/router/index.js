import { createRouter, createWebHistory } from 'vue-router';

// Importamos los componentes
import Login from '../components/Login.vue';
import Dashboard from '../components/Dashboard.vue';
import UserList from '../components/UserList.vue';
import ConnectionHistory from '../components/ConnectionHistory.vue';
import Security from '../components/Security.vue';
import ReportConfig from '../components/ReportConfig.vue';
import RegisteredServices from '../components/RegisteredServices.vue';

// Definimos las rutas
const routes = [
  {
    path: '/login', // 1. Cambiamos el path para evitar conflicto con Dashboard
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // 2. Usamos meta para un control global más limpio
  },
  {
    path: '/usuarios',
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true }
  },
  {
    path: '/historial', 
    name: 'ConnectionHistory',
    component: ConnectionHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/seguridad',
    name: 'Security',
    component: Security,
    meta: { requiresAuth: true }
  },
  {
    path: '/config-reportes',
    name: 'ReportConfig',
    component: ReportConfig,
    meta: { requiresAuth: true }
  },
  {
    path: '/servicios',
    name: 'ServiciosRegistrados',
    component: RegisteredServices,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes, 
});

// 3. Guardia global: Centraliza la protección en un solo lugar
router.beforeEach((to, from, next) => {
  // Verificamos la clave 'app_authenticated' que definimos en tu Login.vue
  const isAuthenticated = sessionStorage.getItem('app_authenticated') === 'true';

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' }); // Si ya está logueado, no dejarlo ir al Login
  } else {
    next();
  }
});

export default router;