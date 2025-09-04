<template>
  <div id="main-layout">
    <nav class="sidebar">
      <div class="sidebar-header">
        <h3>Gestión RPC</h3>
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
      </ul>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
#main-layout {
  display: flex;
  min-height: 100vh;
  font-family: sans-serif;
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