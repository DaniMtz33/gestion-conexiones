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
        <div class="form-group">
          <label for="connectionLimit">Límite de Conexiones</label>
          <input type="number" id="connectionLimit" v-model.number="editedConnectionLimit">
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
import apiService from '../apiService.js';

export default {
  name: 'UserList',
  components: { 
    Modal 
  },
  data() {
    return {
      searchQuery: '', 
      users: [],
      isModalVisible: false,
      editingUser: {},
      editedDescription: '',
      editedConnectionLimit: 0 
    };
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery) {
        return this.users;
      }
      return this.users.filter(user => {
        return user.username.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() { 
      try {
        const response = await apiService.getData('GET_USERS');
        this.users = response.data;
      } catch (error) {
        console.error("Hubo un error al obtener los usuarios:", error);
      }
    },
    openEditModal(user) {
      this.editingUser = user;
      this.editedDescription = user.description;
      this.editedConnectionLimit = user.connectionLimit;
      this.isModalVisible = true;
    },
    closeEditModal() {
      this.isModalVisible = false;
    },
    saveChanges() {
      const userToUpdate = this.users.find(u => u.id === this.editingUser.id);
      if (userToUpdate) {
        userToUpdate.description = this.editedDescription;
        userToUpdate.connectionLimit = this.editedConnectionLimit;
      }
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