<template>
  <div v-if="$route.name === 'Login'" id="login-layout">
    <router-view></router-view>
  </div>

  <div v-else id="main-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Gestión RPC</h3>
        <button @click="isGlobalSearchOpen = true" class="global-search-button" title="Búsqueda Global (Ctrl+K)">
            🔍
        </button>
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/">Dashboard</router-link>
        </li>
        <li>
          <router-link to="/usuarios">Usuarios</router-link>
        </li>
        <li>
          <router-link to="/historial">Historial de Conexiones</router-link>
        </li>
        <li>
          <router-link to="/ajustes">Ajustes de Conexiones</router-link>
        </li>
        <li>
          <router-link to="/administracion">Administración</router-link>
        </li>
        <li>
          <router-link to="/seguridad">Seguridad</router-link>
        </li>
        <li class="logout-item">
          <a @click.prevent="logout" href="#">Cerrar Sesión</a>
        </li>
      </ul>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <GlobalSearch :is-open="isGlobalSearchOpen" @close="isGlobalSearchOpen = false" />
  </div>
</template>

<script>
import GlobalSearch from '../components/GlobalSearch.vue';
import apiService from '../apiService.js';

export default {
  name: 'App',
  components: {
    GlobalSearch
  },
  data() {
    return {
      isGlobalSearchOpen: false,
      inactivityTimer: null
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleGlobalKeydown);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt =>
      window.addEventListener(evt, this.resetInactivityTimer, { passive: true })
    );
    this.startInactivityTimer();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt =>
      window.removeEventListener(evt, this.resetInactivityTimer)
    );
    clearTimeout(this.inactivityTimer);
  },
  methods: {
    handleGlobalKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.isGlobalSearchOpen = !this.isGlobalSearchOpen;
      }
    },
    handleBeforeUnload() {
      const user = sessionStorage.getItem('app_user') || '';
      if (user) {
        const body = JSON.stringify({ USER: user });
        navigator.sendBeacon('/api/UNIRPC_CONN/subroutine/SLOGOUT', new Blob([body], { type: 'application/json' }));
      }
      sessionStorage.clear();
    },
    startInactivityTimer() {
      this.inactivityTimer = setTimeout(() => this.logout(), 60 * 60 * 1000);
    },
    resetInactivityTimer() {
      clearTimeout(this.inactivityTimer);
      this.startInactivityTimer();
    },
    async logout() {
      clearTimeout(this.inactivityTimer);
      const user = sessionStorage.getItem('app_user') || '';
      try {
        await apiService.logout(user);
      } catch {
        // continuar con el logout aunque falle el endpoint
      }
      sessionStorage.clear();
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
#login-layout {
  min-height: 100vh;
  width: 100%;
}

#main-layout {
  display: flex;
  min-height: 100vh;
  font-family: sans-serif;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.global-search-button {
    background: none;
    border: 1px solid #34495e;
    color: #ecf0f1;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.2s;
}

.global-search-button:hover {
    background-color: #34495e;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header h3 {
  margin: 0;
  text-align: center;
  font-size: 24px;
}

.nav-links {
  list-style: none;
  padding: 0;
  margin-top: 40px;
  flex-grow: 1;
}

.nav-links li a {
  display: block;
  padding: 15px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.nav-links li a:hover,
.nav-links li a.router-link-exact-active { 
  background-color: #34495e;
}

/* Estilo para el botón de cerrar sesión */
.logout-item {
  margin-top: auto; /* Empuja el botón al fondo del sidebar */
}

.logout-item a {
  color: #e74c3c !important; /* Color rojo para indicar salida */
}

.logout-item a:hover {
  background-color: rgba(231, 76, 60, 0.1);
}

.main-content {
  flex-grow: 1;
  padding: 40px;
  background-color: #f4f6f9;
}
</style>