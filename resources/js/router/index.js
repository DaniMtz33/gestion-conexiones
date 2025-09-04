import { createRouter, createWebHistory } from 'vue-router';

// Importamos los componentes que actuarán como páginas
import Dashboard from '../components/Dashboard.vue';
import UserList from '../components/UserList.vue';

// Definimos las rutas de nuestra aplicación
const routes = [
  {
    path: '/', // La ruta raíz
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/usuarios', // La ruta para la lista de usuarios
    name: 'UserList',
    component: UserList
  }
];

// Creamos la instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes, 
});

export default router;