import './bootstrap';
import { createApp } from 'vue';

// 1. Importar nuestro nuevo componente
import Dashboard from './components/Dashboard.vue';

const app = createApp({});

// 2. Registrar el componente para poder usarlo en HTML
app.component('dashboard', Dashboard);

app.mount('#app');