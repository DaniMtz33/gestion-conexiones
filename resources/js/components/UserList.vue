<template>
  <div class="user-list-container">
    <h1>Gestión de Usuarios</h1>
    <div class="search-bar"><input type="text" v-model="searchQuery" placeholder="Buscar por nombre de usuario..."></div>

    <div class="user-table">
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Propietario</th>
            <th>Descripción</th>
            <th>Límite de Conexiones</th>
            <th>Estado</th>
            <th>Acciones</th>
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
            <td>
              <button @click="openEditModal(user)" class="edit-button">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <Modal :show="isModalVisible" @close="closeEditModal">
    <template v-slot:header>
      <h3>Editando Usuario: {{ editingUser.username }}</h3>
    </template>

    <template v-slot:body>
      <form @submit.prevent="saveChanges">
        <div class="form-group">
          <label for="description">Descripción del Usuario</label>
          <textarea id="description" v-model="editedDescription" rows="4"></textarea>
        </div>
      </form>
    </template>

    <template v-slot:footer>
      <button @click="closeEditModal" class="button-secondary">Cancelar</button>
      <button @click="saveChanges" class="button-primary">Guardar Cambios</button>
    </template>
  </Modal>

</template>

<script>
import Modal from './Modal.vue';

export default {
  name: 'UserList',
  components: { Modal },
  data() {
    return {
      searchQuery: '', 
      users: [],
      isModalVisible: false,
      editingUser: {},
      // 3. VARIABLE TEMPORAL PARA LA EDICIÓN
      editedDescription: '' 
    };
  },
  computed: { /* ... (sin cambios) ... */
    filteredUsers() { if (!this.searchQuery) { return this.users; } return this.users.filter(user => { return user.username.toLowerCase().includes(this.searchQuery.toLowerCase()); }); }
  },
  mounted() { this.fetchUsers(); },
  methods: {
    fetchUsers() { /* ... (sin cambios) ... */
      const mockUsers = [ { id: 1, username: 'user_app_01', owner: 'Juan Pérez', description: 'Aplicativo de Ventas', connectionLimit: 20, status: 'Activo' }, { id: 2, username: 'user_db_03', owner: 'Equipo de BI', description: 'Base de Datos de Reportes', connectionLimit: 5, status: 'Activo' }, { id: 3, username: 'user_batch', owner: 'Procesos Nocturnos', description: 'Ejecución de procesos batch', connectionLimit: 10, status: 'Inactivo' }, { id: 4, username: 'api_connect', owner: 'Ana García', description: 'API Externa de Clientes', connectionLimit: 15, status: 'Activo' }, ];
      this.users = mockUsers;
    },
    openEditModal(user) {
      this.editingUser = user;
      // 4. COPIAMOS LA DESCRIPCIÓN ACTUAL A LA VARIABLE TEMPORAL
      this.editedDescription = user.description; 
      this.isModalVisible = true;
    },
    closeEditModal() {
      this.isModalVisible = false;
    },
    // 5. NUEVO MÉTODO PARA GUARDAR LOS CAMBIOS
    saveChanges() {
      // Buscamos al usuario original en nuestra lista por su ID
      const userToUpdate = this.users.find(u => u.id === this.editingUser.id);
      if (userToUpdate) {
        // Actualizamos su descripción con el valor del formulario
        userToUpdate.description = this.editedDescription;
      }
      // Cerramos la modal
      this.closeEditModal();
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
.edit-button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.edit-button:hover {
  background-color: #0056b3;
}
/* NUEVOS ESTILOS PARA EL FORMULARIO Y BOTONES */
.form-group { 
  margin-bottom: 15px; 
}
.form-group label { 
  display: block; 
  margin-bottom: 5px; 
  font-weight: bold; 
}
.form-group textarea { 
  width: 100%; 
  padding: 8px; 
  border: 1px solid #ccc; 
  border-radius: 4px; 
  font-size: 14px; 
}
.button-secondary { 
  padding: 10px 15px; 
  border: 1px solid #ccc; 
  background-color: #f8f9fa; 
  border-radius: 5px; 
  cursor: pointer; 
  margin-right: 10px; 
}
.button-primary { 
  padding: 10px 15px; 
  border: none; 
  background-color: #007bff; 
  color: white; 
  border-radius: 5px; 
  cursor: pointer; }
</style>