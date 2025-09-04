import './bootstrap';
import { createApp } from 'vue';

// 1. Importamos nuestro nuevo layout principal
import App from './layouts/App.vue'; 
import router from './router'; 

// 2. Le decimos a createApp que use App.vue como el componente raíz
const app = createApp(App);

app.use(router);
app.mount('#app');

window.router = router;