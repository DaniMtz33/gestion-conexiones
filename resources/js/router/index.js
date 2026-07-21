import { createRouter, createWebHistory } from 'vue-router';

const Login             = () => import('../components/Login.vue');
const Dashboard         = () => import('../components/Dashboard.vue');
const UserList          = () => import('../components/UserList.vue');
const ConnectionHistory = () => import('../components/ConnectionHistory.vue');
const Security          = () => import('../components/Security.vue');
const ReportConfig      = () => import('../components/ReportConfig.vue');
const RegisteredServices = () => import('../components/RegisteredServices.vue');

const routes = [
  { path: '/login',          name: 'Login',               component: Login },
  { path: '/',               name: 'Dashboard',            component: Dashboard,         meta: { requiresAuth: true } },
  { path: '/usuarios',       name: 'UserList',             component: UserList,          meta: { requiresAuth: true } },
  { path: '/historial',      name: 'ConnectionHistory',    component: ConnectionHistory, meta: { requiresAuth: true } },
  { path: '/seguridad',      name: 'Security',             component: Security,          meta: { requiresAuth: true } },
  { path: '/config-reportes',name: 'ReportConfig',         component: ReportConfig,      meta: { requiresAuth: true } },
  { path: '/servicios',      name: 'ServiciosRegistrados', component: RegisteredServices,meta: { requiresAuth: true } }
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