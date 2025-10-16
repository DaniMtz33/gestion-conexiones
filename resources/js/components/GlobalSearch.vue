<template>
  <div v-if="isOpen" class="global-search-overlay" @click.self="$emit('close')">
    <div class="search-content">
      <div class="search-header">
        <input 
          type="text" 
          v-model="query" 
          placeholder="Buscar usuarios, IPs, o eventos... (p.ej. user_05, 192.168.1.77)"
          class="search-input"
          @keyup.esc="$emit('close')"
          autofocus
        >
        <button @click="$emit('close')" class="close-button">&times;</button>
      </div>

      <div class="search-results">
        <div v-if="filteredResults.length === 0 && query.length > 0" class="no-results">
          No se encontraron resultados para "{{ query }}".
        </div>
        
        <template v-else-if="filteredResults.length > 0">
            <div v-for="category in filteredResults" :key="category.title" class="result-category">
                <h4>{{ category.title }} ({{ category.items.length }})</h4>
                <ul>
                    <li v-for="item in category.items" :key="item.id" @click="$emit('close')">
                        <router-link :to="item.link">{{ item.label }}</router-link>
                    </li>
                </ul>
            </div>
        </template>
        
        <div v-else class="initial-message">
            Escriba para buscar en **Usuarios**, **Historial** y **Administración**.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalSearch',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      query: '',
      // Base de datos simulada para la búsqueda
      mockData: [
        { category: 'Usuarios', label: 'user_05 - Límite: 10', link: '/usuarios?search=user_05' },
        { category: 'Usuarios', label: 'user_08 - Propietario: IT', link: '/usuarios?search=user_08' },
        { category: 'Historial', label: 'Conexión Fallida desde 192.168.1.77', link: '/historial?search=192.168.1.77' },
        { category: 'Historial', label: 'Desconexión Exitosa: user_05 (01:23:45)', link: '/historial?search=user_05' },
        { category: 'Administración', label: 'Registro: user_maria actualizó política', link: '/administracion' },
      ]
    };
  },
  computed: {
    filteredResults() {
      if (this.query.length < 2) return [];

      const lowerQuery = this.query.toLowerCase();
      const results = this.mockData.filter(item => 
        item.label.toLowerCase().includes(lowerQuery)
      );

      // Agrupar resultados por categoría
      return ['Usuarios', 'Historial', 'Administración'].map(cat => ({
        title: cat,
        items: results.filter(item => item.category === cat)
      })).filter(group => group.items.length > 0);
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          document.querySelector('.search-input').focus();
        });
      } else {
        // Limpiar búsqueda al cerrar
        this.query = '';
      }
    }
  }
};
</script>

<style scoped>
.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  padding-top: 10vh;
  z-index: 2000; /* Asegura que esté por encima de todo */
}
.search-content {
  width: 600px;
  max-width: 90%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.search-header {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.search-input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  outline: none;
}
.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
  color: #777;
}
.search-results {
  padding: 15px;
  overflow-y: auto;
  flex-grow: 1;
}
.initial-message, .no-results {
    color: #999;
    text-align: center;
    padding: 40px;
}
.result-category h4 {
  margin: 10px 0 5px 0;
  color: #007bff;
  font-size: 14px;
  padding-bottom: 5px;
  border-bottom: 1px solid #f0f0f0;
}
.result-category ul {
  list-style: none;
  padding: 0;
}
.result-category li {
  padding: 8px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
}
.result-category li:hover {
  background-color: #f4f4f4;
}
.result-category li a {
  display: block;
  padding: 5px 10px;
  color: #333;
  text-decoration: none;
}
</style>