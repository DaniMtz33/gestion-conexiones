// resources/js/components/ConnectionHistory.vue

<template>
  <div class="history-container">
    <h1>Historial de Conexiones</h1>
    <p>Registro histórico de todos los intentos de conexión al servidor.</p>
    
    <div class="filter-controls">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar por Usuario o IP de Origen..."
        class="filter-input"
        @keyup.enter="fetchHistory"
      />
      <label for="dateRange" class="date-label">Rango de Fechas:</label>
      <input 
        type="text" 
        v-model="dateRange" 
        placeholder="Defecto: Mes Actual" 
        class="filter-input date-input"
        @change="fetchHistory"
      />
      <button @click="fetchHistory" class="apply-filter-button">Aplicar Filtros</button>
    </div>
    <div class="history-table">
      <table>
        <thead>
          <tr>
            <th @click="sortUsers" style="cursor: pointer; user-select: none;">
              Usuario
              <span v-if="sortOrder === 'asc'" style="color: #34a853;">▲</span>
              <span v-else-if="sortOrder === 'desc'" style="color: #ea4335;">▼</span>
              <span v-else style="color: #ccc;">⇵</span>
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
             <td colspan="6" style="text-align:center; padding: 20px;">No se encontraron registros</td>
          </tr>
          <tr v-for="conn in connections" :key="conn.id">
            <td>{{ conn.user }}</td>
            <td>{{ conn.ip }}</td>
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
  </div>
</template>

<script>
import apiService from '../apiService';

export default {
  name: 'ConnectionHistory',
  data() {
    return {
      connections: [],
      searchQuery: '',
      dateRange: '',
      sortOrder: null // 'asc' o 'desc'
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
    // NUEVO MÉTODO AGREGADO
    getStatusClass(status) {
      if (!status) return 'status';
      
      // Convertimos a mayúsculas para comparar sin errores
      const s = status.toString().toUpperCase();

      // Si dice EXITOSO, CONECTADO o SI -> Verde
      if (s === 'EXITOSO' || s === 'CONECTADO' || s === 'SI') {
          return 'status status-success';
      }
      
      // Cualquier otra cosa -> Rojo (o el color de failed)
      return 'status status-failed';
    }
  }
};
</script>

<style scoped>
.history-container {
  font-family: sans-serif;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}
.filter-controls {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
    align-items: center;
}
.filter-input {
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    flex-grow: 1;
    max-width: 300px;
}
.date-input {
    max-width: 200px;
}
.date-label {
    font-weight: bold;
    color: #555;
    white-space: nowrap;
}
.apply-filter-button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}
.apply-filter-button:hover {
    background-color: #0056b3;
}
.history-table {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow-x: auto;
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
/* Estilos base para el badge */
.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block; /* Para que se vea bien como badge */
}
/* Verde */
.status-success {
  background-color: #e2f5ea;
  color: #34a853;
}
/* Rojo */
.status-failed {
  background-color: #f8e1e1;
  color: #ea4335;
}
</style>