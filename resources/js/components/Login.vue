<template>
  <div class="login-container">
    <div class="login-card">

      <div class="login-brand">
        <div class="brand-icon">
          <span>🔌</span>
        </div>
        <h1>Gestión RPC</h1>
        <p>Inicie sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="username"
            @input="error = false"
            type="text"
            placeholder="Ingresa tu usuario"
            class="styled-input"
            :class="{ 'input-error': error }"
            required
            autocomplete="username"
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            @input="error = false"
            type="password"
            placeholder="••••••••"
            class="styled-input"
            :class="{ 'input-error': error }"
            required
            autocomplete="current-password"
          >
        </div>

        <transition name="fade">
          <div v-if="error" class="error-banner">
            <span>✕</span> {{ errorMessage }}
          </div>
        </transition>

        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Verificando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import apiService from '../apiService.js';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      error: false,
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.error = false;
      try {
        const result = await apiService.login(this.username, this.password);
        localStorage.setItem('app_authenticated', 'true');
        localStorage.setItem('app_user', this.username);
        localStorage.setItem('app_user_id', result.OUTPUT);
        this.$router.push('/');
      } catch (e) {
        this.errorMessage = e.message || 'Error de autenticación';
        this.error = true;
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f6f9;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.login-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #edf2f7;
  width: 100%;
  max-width: 420px;
}

/* Marca / Encabezado */
.login-brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  background: #ebf8ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  margin: 0 auto 16px;
}

.login-brand h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 6px;
}

.login-brand p {
  font-size: 0.95rem;
  color: #718096;
  margin: 0;
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.styled-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2d3748;
  background: #ffffff;
  transition: all 0.2s;
  box-sizing: border-box;
}

.styled-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.styled-input.input-error {
  border-color: #fc8181;
}

/* Banner de error */
.error-banner {
  background: #fff5f5;
  color: #c53030;
  border: 1px solid #feb2b2;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Botón */
.btn-login {
  width: 100%;
  padding: 13px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 4px;
}

.btn-login:hover {
  background: #3182ce;
}

/* Transición del error */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>