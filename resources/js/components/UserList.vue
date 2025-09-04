<template>
  <div class="user-list-container">
    <h1>Gestión de Usuarios</h1>
    <p>Lista de todos los usuarios con conexiones definidas en el servidor.</p>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar por nombre de usuario..."
      >
    </div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Propietario</th>
            <th>Descripción</th>
            <th>Límite de Conexiones</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.username }}</td>
            <td>{{ user.owner }}</td>
            <td>{{ user.description }}</td>
            <td>{{ user.connectionLimit }}</td>
            <td>
              <span :class="['status', user.status === 'Activo' ? 'status-active' : 'status-inactive']">
                {{ user.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserList',
  data() {
    return {
      // 3. AÑADIMOS UNA VARIABLE PARA GUARDAR EL TEXTO DE BÚSQUEDA
      searchQuery: '', 
      users: [] 
    };
  },
  // 4. AÑADIMOS LA PROPIEDAD COMPUTADA PARA FILTRAR
  computed: {
    filteredUsers() {
      // Si no hay texto de búsqueda, devolvemos la lista completa
      if (!this.searchQuery) {
        return this.users;
      }
      // Si hay texto, filtramos la lista
      return this.users.filter(user => {
        // Comparamos el nombre de usuario (en minúsculas) con el texto de búsqueda (en minúsculas)
        return user.username.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      const mockUsers = [
        { id: 1, username: 'user_app_01', owner: 'Juan Pérez', description: 'Aplicativo de Ventas', connectionLimit: 20, status: 'Activo' },
        { id: 2, username: 'user_db_03', owner: 'Equipo de BI', description: 'Base de Datos de Reportes', connectionLimit: 5, status: 'Activo' },
        { id: 3, username: 'user_batch', owner: 'Procesos Nocturnos', description: 'Ejecución de procesos batch', connectionLimit: 10, status: 'Inactivo' },
        { id: 4, username: 'api_connect', owner: 'Ana García', description: 'API Externa de Clientes', connectionLimit: 15, status: 'Activo' },
      ];
      this.users = mockUsers;
    }
  }
};
</script>

<style scoped>
.user-list-container {
  font-family: sans-serif;
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
}
/* Estilos para la barra de búsqueda */
.search-bar {
  margin-bottom: 20px;
}
.search-bar input {
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.user-table {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.status-active {
  background-color: #e2f5ea;
  color: #34a853;
}
.status-inactive {
  background-color: #f8e1e1;
  color: #ea4335;
}
</style>