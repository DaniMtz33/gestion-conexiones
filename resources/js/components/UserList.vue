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
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <h3>Usuarios Registrados</h3>
          <div class="header-right">
            <span class="records-count">{{ filteredUsers.length }} usuarios</span>
            <span v-if="totalPages > 1" class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          </div>
        </div>
        
        <div v-if="loading" class="p-4 text-center text-muted">Cargando usuarios...</div>
        <div v-else class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th @click="sortColumn('username')" class="sortable-header">
                  Usuario <span :class="['sort-icon', sortKey !== 'username' ? 'neutral' : '']">{{ sortIcon('username') }}</span>
                </th>
                <th @click="sortColumn('owner')" class="sortable-header">
                  Propietario <span :class="['sort-icon', sortKey !== 'owner' ? 'neutral' : '']">{{ sortIcon('owner') }}</span>
                </th>
                <th @click="sortColumn('description')" class="sortable-header">
                  Descripción <span :class="['sort-icon', sortKey !== 'description' ? 'neutral' : '']">{{ sortIcon('description') }}</span>
                </th>
                <th @click="sortColumn('limit')" class="sortable-header">
                  Límite <span :class="['sort-icon', sortKey !== 'limit' ? 'neutral' : '']">{{ sortIcon('limit') }}</span>
                </th>
                <th @click="sortColumn('status')" class="sortable-header">
                  Estado <span :class="['sort-icon', sortKey !== 'status' ? 'neutral' : '']">{{ sortIcon('status') }}</span>
                </th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="6" class="text-center py-5">No se encontraron usuarios</td>
              </tr>
              <tr v-for="user in paginatedUsers" :key="user.id">
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
                  <button @click="openEditModal(user)" class="btn-action">Editar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!loading && totalPages > 1" class="pagination">
          <button @click="currentPage = 1" :disabled="currentPage === 1" class="page-btn">«</button>
          <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">‹</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="currentPage = p"
            :class="['page-btn', p === currentPage ? 'active' : '']"
          >{{ p }}</button>
          <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">›</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages" class="page-btn">»</button>
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
      loading: false,
      isModalVisible: false,
      isSaving: false,
      editingUser: {},
      editedDescription: '',
      editedLimit: 0,
      sortKey: '',
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 50
    };
  },
  computed: {
    sortedUsers() {
      if (!this.sortKey) return this.users;
      const key = this.sortKey;
      const dir = this.sortOrder === 'asc' ? 1 : -1;
      return [...this.users].sort((a, b) => {
        const va = (a[key] || '').toString().toLowerCase();
        const vb = (b[key] || '').toString().toLowerCase();
        return va.localeCompare(vb, undefined, { numeric: true }) * dir;
      });
    },
    filteredUsers() {
      if (!this.searchQuery) return this.sortedUsers;
      const q = this.searchQuery.toLowerCase();
      return this.sortedUsers.filter(u => u.username.toLowerCase().includes(q));
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredUsers.slice(start, start + this.pageSize);
    },
    visiblePages() {
      const total = this.totalPages;
      const cur = this.currentPage;
      const pages = [];
      for (let p = Math.max(1, cur - 2); p <= Math.min(total, cur + 2); p++) {
        pages.push(p);
      }
      return pages;
    }
  },
  watch: {
    filteredUsers() { this.currentPage = 1; }
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await apiService.getData('GET_USERS');
        this.users = response.data;
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      } finally {
        this.loading = false;
      }
    },
    sortColumn(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortOrder = 'asc';
      }
      this.currentPage = 1;
    },
    sortIcon(key) {
      if (this.sortKey !== key) return '⇵';
      return this.sortOrder === 'asc' ? '▲' : '▼';
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
.settings-header p { color: #718096; }
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
.icon-box-modal { width: 44px; height: 44px; background: #ebf8ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.edit-icon-modal { font-size: 1.2rem; }
.modal-title-main { font-size: 1.2rem; font-weight: 700; color: #1a202c; margin: 0; }
.modal-subtitle { font-size: 0.85rem; color: #718096; margin: 2px 0 0 0; }

.modal-body-wrapper { padding: 8px 4px; }
.form-section-modern { display: flex; flex-direction: column; gap: 8px; }
.form-label-modern { font-size: 0.85rem; font-weight: 700; color: #4a5568; text-transform: uppercase; letter-spacing: 0.025em; }

.modern-input-field {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background-color: #ffffff;
  box-sizing: border-box;
}
.modern-input-field:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}
.modern-input-field:disabled { background-color: #f7fafc; cursor: not-allowed; color: #a0aec0; }

.input-hint-container { display: flex; flex-direction: column; gap: 4px; }
.field-hint { font-size: 0.75rem; color: #a0aec0; }

.modal-footer-modern { display: flex; justify-content: flex-end; gap: 12px; width: 100%; }

.btn-modern-primary {
  background-color: #4299e1;
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
.btn-modern-primary:hover { background-color: #3182ce; }
.btn-modern-primary:disabled { opacity: 0.6; cursor: wait; }

.btn-modern-secondary {
  background-color: #edf2f7;
  color: #4a5568;
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
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.align-items-center { align-items: center; }
.header-right { display: flex; align-items: center; gap: 12px; }
.records-count { background: #f7fafc; padding: 4px 12px; border-radius: 20px; font-size: .85rem; color: #718096; font-weight: 500; }
.page-info { font-size: .85rem; color: #718096; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 16px; border-top: 1px solid #edf2f7; }
.page-btn { background: #f7fafc; border: 1px solid #e2e8f0; color: #4a5568; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: .9rem; transition: all .15s; min-width: 36px; }
.page-btn:hover:not(:disabled) { background: #ebf8ff; border-color: #4299e1; color: #2b6cb0; }
.page-btn.active { background: #4299e1; border-color: #4299e1; color: white; font-weight: 700; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.p-4 { padding: 1rem; }
.text-center { text-align: center; }
.text-muted { color: #718096; }
.py-5 { padding-top: 2rem; padding-bottom: 2rem; }
</style>