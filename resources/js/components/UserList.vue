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
                <th @click="sortColumn('username')" class="sortable-header">
                  <div class="header-content">
                    Usuario
                    <span class="sort-icons">
                      <span v-if="sortKey === 'username' && sortOrder === 'asc'" class="sort-icon">▲</span>
                      <span v-else-if="sortKey === 'username' && sortOrder === 'desc'" class="sort-icon">▼</span>
                      <span v-else class="sort-icon neutral">⇵</span>
                    </span>
                  </div>
                </th>
                <th @click="sortColumn('owner')" class="sortable-header">
                  <div class="header-content">
                    Propietario
                    <span class="sort-icons">
                      <span v-if="sortKey === 'owner' && sortOrder === 'asc'" class="sort-icon">▲</span>
                      <span v-else-if="sortKey === 'owner' && sortOrder === 'desc'" class="sort-icon">▼</span>
                      <span v-else class="sort-icon neutral">⇵</span>
                    </span>
                  </div>
                </th>
                <th @click="sortColumn('description')" class="sortable-header">
                  <div class="header-content">
                    Descripción
                    <span class="sort-icons">
                      <span v-if="sortKey === 'description' && sortOrder === 'asc'" class="sort-icon">▲</span>
                      <span v-else-if="sortKey === 'description' && sortOrder === 'desc'" class="sort-icon">▼</span>
                      <span v-else class="sort-icon neutral">⇵</span>
                    </span>
                  </div>
                </th>
                <th @click="sortColumn('limit')" class="sortable-header">
                  <div class="header-content">
                    Límite
                    <span class="sort-icons">
                      <span v-if="sortKey === 'limit' && sortOrder === 'asc'" class="sort-icon">▲</span>
                      <span v-else-if="sortKey === 'limit' && sortOrder === 'desc'" class="sort-icon">▼</span>
                      <span v-else class="sort-icon neutral">⇵</span>
                    </span>
                  </div>
                </th>
                <th @click="sortColumn('status')" class="sortable-header">
                  <div class="header-content">
                    Estado
                    <span class="sort-icons">
                      <span v-if="sortKey === 'status' && sortOrder === 'asc'" class="sort-icon">▲</span>
                      <span v-else-if="sortKey === 'status' && sortOrder === 'desc'" class="sort-icon">▼</span>
                      <span v-else class="sort-icon neutral">⇵</span>
                    </span>
                  </div>
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="font-weight-bold">{{ user.username }}</td>
                <td>{{ user.owner }}</td>
                <td class="text-muted">{{ user.description }}</td>
                <td class="font-weight-bold">{{ user.limit }}</td> 
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
        <div class="modal-header-custom">
          <div class="icon-box-modal">
            <span class="edit-icon-modal">👤</span>
          </div>
          <div>
            <h3 class="modal-title-main">Editar Perfil</h3>
            <p class="modal-subtitle">Usuario: <strong>{{ editingUser.username }}</strong></p>
          </div>
        </div>
      </template>
      
      <template v-slot:body>
        <div class="modal-body-wrapper">
          <div class="form-section-modern">
            <label class="form-label-modern">Descripción del Usuario</label>
            <textarea 
              v-model="editedDescription" 
              class="modern-input-field" 
              placeholder="Añada una descripción del usuario..."
              rows="3"
              :disabled="isSaving"
            ></textarea>
          </div>

          <div class="form-section-modern mt-4">
            <label class="form-label-modern">Límite de Conexiones</label>
            <div class="input-hint-container">
              <input 
                type="text" 
                v-model="editedLimit" 
                @keypress="onlyNumbers"
                class="modern-input-field"
                placeholder="0"
                :disabled="isSaving"
              >
              <small class="field-hint">Solo se permiten valores numéricos.</small>
            </div>
          </div>
        </div>
      </template>
      
      <template v-slot:footer>
        <div class="modal-footer-modern">
          <button @click="closeEditModal" class="btn-modern-secondary" :disabled="isSaving">
            Cancelar
          </button>
          <button @click="saveChanges" class="btn-modern-primary" :disabled="isSaving">
            <span v-if="isSaving" class="loader-small"></span>
            {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
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
      isSaving: false,
      editingUser: {},
      editedDescription: '',
      editedLimit: 0,
      sortKey: '',
      sortOrder: null
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
    sortColumn(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.users.sort((a, b) => {
        const valA = (a[key] || '').toString().toLowerCase();
        const valB = (b[key] || '').toString().toLowerCase();
        if (this.sortOrder === 'asc') {
          return valA.localeCompare(valB, undefined, { numeric: true });
        } else {
          return valB.localeCompare(valA, undefined, { numeric: true });
        }
      });
    },
    onlyNumbers(event) {
      const charCode = (event.which) ? event.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        event.preventDefault();
      }
    },
    openEditModal(user) {
      this.editingUser = user;
      this.editedDescription = user.description;
      this.editedLimit = user.limit; 
      this.isModalVisible = true;
    },
    closeEditModal() {
      this.isModalVisible = false;
      this.isSaving = false;
    },
    async saveChanges() {
      if (this.isSaving) return;
      this.isSaving = true;
      const cleanLimit = String(this.editedLimit).replace(/\D/g, '');
      try {
        const payload = {
          usuario: this.editingUser.username,
          propietario: this.editingUser.owner,
          descripcion: this.editedDescription,
          limite: cleanLimit
        };
        await apiService.getData('SAVE_USER', payload);
        const index = this.users.findIndex(u => u.username === this.editingUser.username);
        if (index !== -1) {
          const updatedUser = {
            ...this.users[index],
            description: this.editedDescription,
            limit: cleanLimit
          };
          this.users.splice(index, 1, updatedUser);
        }
        alert(`Cambios aplicados correctamente para ${this.editingUser.username}`);
        this.isModalVisible = false;
        const response = await apiService.getData('GET_USERS');
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          this.users = [...response.data];
        }
      } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar los datos.");
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>

<style scoped>
/* Estilos Base de la Página */
.settings-page { max-width: 1000px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; color: #2d3748; }
.settings-header { margin-bottom: 30px; text-align: center; }
.settings-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
.card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-bottom: 24px; border: 1px solid #edf2f7; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.card-header h2, .card-header h3 { font-size: 1.1rem; font-weight: 600; margin: 0; }
.icon-circle { width: 36px; height: 36px; background: #ebf8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.search-box { display: flex; gap: 12px; }
.styled-input { flex: 1; padding: 12px 16px; border: 2px solid #edf2f7; border-radius: 8px; font-size: 1rem; transition: all 0.2s; box-sizing: border-box; }
.styled-input:focus { outline: none; border-color: #4299e1; }
.styled-input:disabled { background-color: #f7fafc; cursor: not-allowed; }
.header-content { display: flex; align-items: center; justify-content: flex-start; gap: 6px; }
.sortable-header { cursor: pointer; user-select: none; }
.sortable-header:hover { color: #4299e1; }
.sort-icons { display: inline-flex; margin-top: 2px; }
.sort-icon { font-size: 0.7rem; line-height: 1; }
.sort-icon.neutral { color: #cbd5e0; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background-color: #f7fafc; padding: 15px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.025em; }
.custom-table td { padding: 15px; border-bottom: 1px solid #edf2f7; font-size: 0.95rem; }
.status-badge { padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }
.btn-action { padding: 6px 16px; background: #ebf8ff; color: #3182ce; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
.table-responsive { width: 100%; overflow-x: auto; }

/* --- NUEVOS ESTILOS PARA EL MODAL DE EDICIÓN --- */

.modal-header-custom { display: flex; align-items: center; gap: 16px; width: 100%; }
.icon-box-modal { width: 44px; height: 44px; background: #eef2ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.edit-icon-modal { font-size: 1.2rem; }
.modal-title-main { font-size: 1.2rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-subtitle { font-size: 0.85rem; color: #64748b; margin: 2px 0 0 0; }

.modal-body-wrapper { padding: 8px 4px; }
.form-section-modern { display: flex; flex-direction: column; gap: 8px; }
.form-label-modern { font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }

.modern-input-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: #ffffff;
  box-sizing: border-box;
}
.modern-input-field:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}
.modern-input-field:disabled { background-color: #f1f5f9; cursor: not-allowed; color: #94a3b8; }

.input-hint-container { display: flex; flex-direction: column; gap: 4px; }
.field-hint { font-size: 0.75rem; color: #94a3b8; }

.modal-footer-modern { display: flex; justify-content: flex-end; gap: 12px; width: 100%; }

.btn-modern-primary {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}
.btn-modern-primary:hover { background-color: #4338ca; }
.btn-modern-primary:disabled { opacity: 0.6; cursor: wait; }

.btn-modern-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-modern-secondary:hover { background-color: #e2e8f0; }

.loader-small {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 0.8s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mt-4 { margin-top: 1.5rem; }
</style>