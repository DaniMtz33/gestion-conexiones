import { createRouter, createWebHistory } from 'vue-router';

// Importamos los componentes
import Dashboard from '../components/Dashboard.vue';
import UserList from '../components/UserList.vue';
import ConnectionHistory from '../components/ConnectionHistory.vue'; // <-- 1. Importar el nuevo componente

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
  // -- 2. AÑADIR LA NUEVA RUTA AQUÍ --
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