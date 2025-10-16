<template>
  <div class="settings-container">
    <h1>Ajustes de Conexiones</h1>
    <p>Gestione políticas de uso, límites y alertas para todos los usuarios.</p>

    <div class="setting-card">
      <h2>Límites y Políticas Globales</h2>
      
      <div class="form-group">
        <label for="globalLimit">Límite Máximo de Conexiones (Por Defecto)</label>
        <input type="number" id="globalLimit" v-model.number="settings.globalLimit" min="0">
        <p class="description">Establece el número máximo de conexiones simultáneas por defecto para nuevos usuarios. (0 = Ilimitado)</p>
      </div>

      <div class="form-group">
        <label>Políticas de Expiración de Cuentas</label>
        <select v-model="settings.expirationPolicy">
          <option value="none">Sin expiración</option>
          <option value="60">Expiran después de 60 días de inactividad</option>
          <option value="90">Expiran después de 90 días de inactividad</option>
        </select>
        <p class="description">Define cuándo se desactivarán automáticamente las cuentas inactivas.</p>
      </div>
    </div>

    <div class="setting-card">
      <h2>Configuración de Alertas</h2>
      
      <div class="form-group switch-group">
        <label for="alertExcess">Alerta por Exceso de Conexiones</label>
        <input type="checkbox" id="alertExcess" v-model="settings.alertExcess" class="switch">
        <p class="description">Notificar cuando un usuario exceda el 80% de su límite definido.</p>
      </div>

      <div class="form-group switch-group">
        <label for="alertIPChange">Alerta por Cambio de IP Inusual</label>
        <input type="checkbox" id="alertIPChange" v-model="settings.alertIPChange" class="switch">
        <p class="description">Notificar cuando un usuario se conecte desde una IP no registrada previamente.</p>
      </div>
    </div>
    
    <button @click="saveSettings" class="button-primary save-button">Guardar Configuración</button>
  </div>
</template>

<script>
// Nota: La persistencia de estos ajustes requeriría un nuevo endpoint API (e.g., /Settings.rpc)
export default {
  name: 'ConnectionSettings',
  data() {
    return {
      settings: {
        globalLimit: 5,
        expirationPolicy: 'none',
        alertExcess: true,
        alertIPChange: false
      }
    };
  },
  methods: {
    saveSettings() {
      // **Simulación de Módulo 4: Guardado de Configuración**
      console.log('Guardando ajustes:', this.settings);
      alert('Configuración de Ajustes de Conexiones guardada (Simulación).');
    }
  }
};
</script>

<style scoped>
.settings-container {
  font-family: sans-serif;
  max-width: 800px;
  margin: 40px auto;
}
.setting-card {
  background-color: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  border-left: 5px solid #007bff;
}
.setting-card h2 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
  color: #333;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #555;
}
.description {
  font-size: 14px;
  color: #777;
  margin-top: 5px;
}
input[type="number"], select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.switch-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed #eee;
    padding-bottom: 15px;
}
.switch-group .description {
    max-width: 70%;
    margin: 0;
    line-height: 1.2;
}
/* Estilo del botón de guardado */
.save-button {
    display: block;
    width: 100%;
    padding: 12px;
    font-size: 16px;
    text-align: center;
}
.button-primary {
  padding: 10px 15px; 
  border: none; 
  background-color: #007bff; 
  color: white; 
  border-radius: 5px; 
  cursor: pointer;
  transition: background-color 0.3s;
}
</style>