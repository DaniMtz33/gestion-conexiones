<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Historial de Conexiones</h1>
      <p>Registro histórico de todos los intentos de conexión al servidor.</p>
    </header>

    <main class="settings-content">
      <section class="card mb-4 shadow-sm">
        <div class="card-header">
          <div class="icon-circle">
            <i class="search-icon">🔍</i>
          </div>
          <h2>Filtrar Resultados</h2>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Buscar por Usuario o IP..."
            class="styled-input"
            @keyup.enter="fetchHistory"
          >
          <div class="date-input-wrapper">
            <input 
              type="text" 
              v-model="dateRange" 
              placeholder="Rango (DD/MM/YYYY)" 
              class="styled-input"
              @change="fetchHistory"
            >
          </div>
          <button @click="fetchHistory" class="btn-verify">
            Aplicar Filtros
          </button>
        </div>
      </section>

      <section class="card p-0 overflow-hidden">
        <div class="card-header p-4 d-flex justify-content-between align-items-center">
          <h3>Registros de Acceso</h3>
          <span class="records-count">{{ connections.length }} resultados encontrados</span>
        </div>
        
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th @click="sortUsers" class="sortable-header">
                  Usuario
                  <span v-if="sortOrder === 'asc'" class="sort-icon">▲</span>
                  <span v-else-if="sortOrder === 'desc'" class="sort-icon">▼</span>
                  <span v-else class="sort-icon neutral">⇵</span>
                </th>
                <th>IP de Origen</th>
                <th>Fecha y Hora</th>
                <th>Resultado</th>
                <th>Duración</th> 
                <th>Motivo de desconexión</th> 
              </tr>
            </thead>
            <tbody>
              <tr v-if="connections.length === 0">
                 <td colspan="6" class="text-center py-5 text-muted">No se encontraron registros en este periodo</td>
              </tr>
              <tr v-for="conn in connections" :key="conn.id">
                <td class="font-weight-bold text-dark">{{ conn.user }}</td>
                <td class="text-mono">{{ conn.ip }}</td>
                <td>{{ conn.timestamp }}</td>
                <td>
                  <span :class="getStatusClass(conn.status)">
                    {{ conn.status }}
                  </span>
                </td>
                <td>{{ conn.duration || 'N/A' }}</td>
                <td>{{ conn.disconnectionReason || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
/* LÓGICA CONSERVADA INTACTA */
import apiService from '../apiService';

export default {
  name: 'ConnectionHistory',
  data() {
    return {
      connections: [],
      searchQuery: '',
      dateRange: '',
      sortOrder: null 
    };
  },
  mounted() {
    this.fetchHistory();
  },
  methods: {
    async fetchHistory() {
      try {
        const params = {
            search: this.searchQuery,
            dateRange: this.dateRange
        };
        const response = await apiService.getData('GET_HISTORY', params);
        this.connections = response.data;
      } catch (error) {
        console.error("Hubo un error al obtener el historial:", error);
      }
    },

    sortUsers() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

      this.connections.sort((a, b) => {
        const userA = (a.user || '').toLowerCase();
        const userB = (b.user || '').toLowerCase();
        
        if (this.sortOrder === 'asc') {
          return userA.localeCompare(userB);
        } else {
          return userB.localeCompare(userA);
        }
      });
    },

    getStatusClass(status) {
      if (!status) return 'status';
      const s = status.toString().toUpperCase();
      if (s === 'EXITOSO' || s === 'CONECTADO' || s === 'SI') {
          return 'status-badge success';
      }
      return 'status-badge error';
    }
  }
};
</script>

<style scoped>
/* Unificación con ConnectionSettings.vue */
.settings-page {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Inter', -apple-system, sans-serif;
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

.settings-header p {
  color: #718096;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
  align-items: center;
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

.date-input-wrapper {
  max-width: 220px;
}

.btn-verify {
  background: #4299e1;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.records-count {
  background: #f7fafc;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
}

/* Tabla Estilizada */
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

.sortable-header {
  cursor: pointer;
  user-select: none;
}

.sortable-header:hover {
  color: #4299e1;
}

.sort-icon {
  margin-left: 5px;
  font-size: 0.8rem;
}

.sort-icon.neutral {
  color: #cbd5e0;
}

.custom-table td {
  padding: 15px;
  border-bottom: 1px solid #edf2f7;
  font-size: 0.95rem;
}

.text-mono {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 600;
}

/* Badges de estado modernos */
.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-block;
}

.status-badge.success { background: #f0fff4; color: #2f855a; }
.status-badge.error { background: #fff5f5; color: #c53030; }

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
    align-items: stretch;
  }
  .date-input-wrapper {
    max-width: 100%;
  }
}
</style>