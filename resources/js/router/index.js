import { createRouter, createWebHistory } from 'vue-router';

// Importamos los componentes
import Dashboard from '../components/Dashboard.vue';
import UserList from '../components/UserList.vue';
import ConnectionHistory from '../components/ConnectionHistory.vue';

// Definimos las rutas
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/usuarios',
    name: 'UserList',
    component: UserList
  },
  {
    path: '/historial', 
    name: 'ConnectionHistory',
    component: ConnectionHistory
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes, 
});

export default router;