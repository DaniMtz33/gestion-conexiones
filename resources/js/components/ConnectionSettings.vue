<template>
  <div class="settings-page">
    <header class="settings-header">
      <h1>Ajustes de Conexión Individual</h1>
      <p>Busque un usuario para gestionar sus políticas y alertas específicas.</p>
    </header>

    <main class="settings-content">
      <section class="card search-card" :class="{ 'is-verified': userFound === true, 'is-error': userFound === false }">
        <div class="card-header">
          <div class="icon-circle">
            <i class="search-icon">🔍</i>
          </div>
          <h2>Validar Usuario</h2>
        </div>
        
        <div class="search-box">
          <input 
            type="text" 
            v-model="targetUser" 
            placeholder="Ingrese nombre de usuario (e.g., agenteslif_ux)..."
            class="styled-input"
            @keyup.enter="validateUser"
            :disabled="loading"
          >
          <button @click="validateUser" class="btn-verify" :disabled="loading || !targetUser">
            <span v-if="!loading">Verificar</span>
            <span v-else class="loader"></span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="userFound !== null" class="validation-badge" :class="userFound ? 'success' : 'error'">
             <span v-if="userFound">✓ Usuario <strong>{{ validatedUserData.name }}</strong> encontrado.</span>
             <span v-else>✕ El usuario <strong>"{{ targetUser }}"</strong> no existe en el registro.</span>
          </div>
        </transition>
      </section>

      <div class="settings-grid" :class="{ 'is-locked': !userFound }">
        
        <section class="card">
          <div class="card-header">
            <h3>Políticas de Cuenta</h3>
          </div>
          <div class="form-group">
            <label>Política de Expiración</label>
            <div class="select-wrapper">
              <select v-model="settings.expirationPolicy" :disabled="!userFound">
                <option value="none">Sin expiración</option>
                <option value="30">30 días de inactividad</option>
                <option value="60">60 días de inactividad</option>
                <option value="90">90 días de inactividad</option>
              </select>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Alertas Específicas</h3>
          </div>
          
          <div class="toggle-group">
            <div class="toggle-item">
              <div class="toggle-info">
                <label>Tráfico Inusual: </label>
                <span>Notificar picos de conexión anormales.</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.alertExcess" :disabled="!userFound">
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <label>Validación de IP: </label>
                <span>Alertar accesos desde nuevas IPs.</span>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="settings.alertIPChange" :disabled="!userFound">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </section>
      </div>

      <footer class="settings-footer">
        <button 
          @click="saveSettings" 
          class="btn-save" 
          :disabled="!userFound || loading"
        >
          Guardar cambios para {{ validatedUserData.username || '---' }}
        </button>
      </footer>
    </main>
  </div>
</template>

<script>
import apiService from '../apiService';

export default {
  name: 'ConnectionSettings',
  data() {
    return {
      targetUser: '', 
      userFound: null,
      loading: false,
      validatedUserData: {},
      settings: {
        expirationPolicy: 'none',
        alertExcess: true,
        alertIPChange: false
      }
    };
  },
  methods: {
    async validateUser() {
      if (!this.targetUser.trim()) return;
      
      this.loading = true;
      this.userFound = null;
      
      try {
        // Obtenemos la lista de usuarios registrados
        const response = await apiService.getData('GET_USERS');
        const users = response.data || [];
        
        // Buscamos coincidencia por ID o Nombre
        const found = users.find(u => 
          u.username.toLowerCase() === this.targetUser.toLowerCase() || 
          u.name.toLowerCase() === this.targetUser.toLowerCase()
        );
        
        if (found) {
          this.userFound = true;
          this.validatedUserData = found;
        } else {
          this.userFound = false;
          this.validatedUserData = {};
        }
      } catch (error) {
        console.error("Error validando usuario:", error);
        alert("Error de conexión al validar usuario.");
      } finally {
        this.loading = false;
      }
    },

    saveSettings() {
      console.log('Guardando configuración para:', this.validatedUserData.username);
      alert(`Configuración aplicada con éxito a ${this.validatedUserData.username}`);
    }
  }
};
</script>

<style scoped>

.settings-page {
  max-width: 900px;
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
  transition: all 0.3s ease;
}

/* Estados de Validación Estéticos */
.is-verified { border-left: 5px solid #48bb78; }
.is-error { border-left: 5px solid #f56565; }

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
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
}

.btn-verify {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.validation-badge {
  margin-top: 16px;
  padding: 10px 16px;
  border-radius: 8px;
}

.validation-badge.success { background: #f0fff4; color: #2f855a; }
.validation-badge.error { background: #fff5f5; color: #c53030; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.is-locked {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(0.5);
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #cbd5e0;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px; width: 16px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #48bb78; }
input:checked + .slider:before { transform: translateX(22px); }

.btn-save {
  width: 100%;
  padding: 16px;
  background: #2d3748;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>