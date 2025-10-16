// danimtz33/gestion-conexiones/gestion-conexiones-e3ac4ad0f9092d596fc6b606c7c8f30222771f08/resources/js/router/index.js

import { createRouter, createWebHistory } from 'vue-router';

// Importamos los componentes
import Dashboard from '../components/Dashboard.vue';
import UserList from '../components/UserList.vue';
import ConnectionHistory from '../components/ConnectionHistory.vue';
import ConnectionSettings from '../components/ConnectionSettings.vue'; 
import Administration from '../components/Administration.vue'; 
import Security from '../components/Security.vue'; // <-- NUEVO

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
  },
  {
    path: '/ajustes', 
    name: 'ConnectionSettings',
    component: ConnectionSettings
  },
  { 
    path: '/administracion', 
    name: 'Administration',
    component: Administration
  },
  { // <-- NUEVA RUTA
    path: '/seguridad', 
    name: 'Security',
    component: Security
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes, 
});

export default router;