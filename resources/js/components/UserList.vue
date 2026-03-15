<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Gestión de Usuarios</h1>
      <p>Lista de todos los usuarios con conexiones definidas en el servidor.</p>
    </header>

    <main class="settings-content">
      <section class="card shadow-sm mb-4">
        <div class="card-header">
          <div class="icon-circle">
            <i class="search-icon">🔍</i>
          </div>
          <h2>Filtrar Usuarios</h2>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por nombre de usuario..."
            class="styled-input"
          >
        </div>
      </section>

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4">
          <h3>Usuarios Registrados</h3>
        </div>
        
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Propietario</th>
                <th>Descripción</th>
                <th>Límite</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="font-weight-bold">{{ user.username }}</td>
                <td>{{ user.owner }}</td>
                <td class="text-muted">{{ user.description }}</td>
                <td>{{ user.connectionLimit }}</td>
                <td>
                  <span :class="['status-badge', user.status === 'Activo' ? 'success' : 'error']">
                    {{ user.status }}
                  </span>
                </td>
                <td class="text-center">
                  <button @click="openEditModal(user)" class="btn-action">
                    Editar
                  </button>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="6" class="text-center py-5">No se encontraron usuarios</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <Modal :show="isModalVisible" @close="closeEditModal">
      <template v-slot:header>
        <h3>Editando Usuario: {{ editingUser.username }}</h3>
      </template>
      
      <template v-slot:body>
        <form @submit.prevent="saveChanges">
          <div class="form-group mb-3">
            <label class="font-weight-bold">Descripción del Usuario</label>
            <textarea 
              v-model="editedDescription" 
              class="styled-input w-100" 
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="font-weight-bold">Límite de Conexiones</label>
            <input 
              type="number" 
              v-model.number="editedConnectionLimit" 
              class="styled-input w-100"
            >
          </div>
        </form>
      </template>
      
      <template v-slot:footer>
        <button @click="closeEditModal" class="btn-cancel">Cancelar</button>
        <button @click="saveChanges" class="btn-verify">Guardar Cambios</button>
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from './Modal.vue';
import apiService from '../apiService.js';

export default {
  name: 'UserList',
  components: { Modal },
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
      if (!this.searchQuery) return this.users;
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
/* Estética idéntica a ConnectionSettings.vue */
.settings-page {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
}

.settings-header {
  margin-bottom: 30px;
  text-align: center;
}

.settings-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid #edf2f7;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header h2, .card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.icon-circle {
  width: 36px;
  height: 36px;
  background: #ebf8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-box {
  display: flex;
  gap: 12px;
}

.styled-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.styled-input:focus {
  outline: none;
  border-color: #4299e1;
}

/* Tabla personalizada con estilo moderno */
.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  background-color: #f7fafc;
  padding: 15px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.95rem;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }

.btn-action {
  padding: 6px 16px;
  background: #ebf8ff;
  color: #3182ce;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-verify {
  background: #4299e1;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}
</style>