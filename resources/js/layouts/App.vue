<template>
  <div id="main-layout">
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
      </ul>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <GlobalSearch :is-open="isGlobalSearchOpen" @close="isGlobalSearchOpen = false" />
  </div>
</template>

<script>
import GlobalSearch from '../components/GlobalSearch.vue'; // <-- Importar el nuevo componente

export default {
  name: 'App',
  components: {
    GlobalSearch // <-- Registrar el componente
  },
  data() {
    return {
      isGlobalSearchOpen: false // <-- Estado para controlar la visibilidad
    }
  },
  mounted() {
    // Añadir atajo de teclado global (Ctrl+K o Cmd+K)
    window.addEventListener('keydown', this.handleGlobalKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeydown);
  },
  methods: {
    handleGlobalKeydown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        this.isGlobalSearchOpen = !this.isGlobalSearchOpen;
      }
    }
  }
}
</script>

<style scoped>
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
}
.nav-links li a {
  display: block;
  padding: 15px;
  color: #ecf0f1;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s;
}
.nav-links li a:hover,
.nav-links li a.router-link-exact-active { /* Estilo para el enlace activo */
  background-color: #34495e;
}
.main-content {
  flex-grow: 1;
  padding: 40px;
  background-color: #f4f6f9;
}
</style>