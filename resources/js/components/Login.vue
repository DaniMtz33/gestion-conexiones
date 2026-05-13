<template>
<div class="login-container">
    <div class="login-card">
    <h2>Gestión RPC</h2>
    <p>Inicie sesión para continuar</p>
    <form @submit.prevent="handleLogin">
        <div class="form-group">
        <label>Usuario</label>
        <input 
            v-model="username" 
            @input="error = false" 
            type="text" 
            placeholder="Ingresa tu usuario" 
            required
        >
        </div>
        <div class="form-group">
        <label>Contraseña</label>
        <input 
            v-model="password" 
            @input="error = false" 
            type="password" 
            placeholder="••••••••" 
            required
        >
        </div>
        <button type="submit" class="login-button">Entrar</button>
        <p v-if="error" class="error-msg">Credenciales incorrectas</p>
    </form>
    </div>
</div>
</template>

<script>
export default {
name: 'Login',
data() {
    return {
    username: '',
    password: '',
    error: false
    }
},
methods: {
    handleLogin() {
      // Simulación de validación
    if (this.username === 'admin' && this.password === '1234') {
        // Usamos la misma clave que configuramos en router/index.js
        localStorage.setItem('app_authenticated', 'true');
        this.$router.push('/');
    } else {
        this.error = true;
    }
    }
}
}
</script>

<style scoped>
.login-container {
height: 100vh;
display: flex;
align-items: center;
justify-content: center;
background-color: #f4f6f9;
}
.login-card {
background: white;
padding: 40px;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
width: 100%;
max-width: 400px;
text-align: center;
}
h2 { color: #2c3e50; margin-bottom: 10px; }
.form-group { text-align: left; margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; color: #2c3e50; font-weight: bold; }
input {
width: 100%;
padding: 10px;
border: 1px solid #ddd;
border-radius: 4px;
outline: none;
}
input:focus {
border-color: #2c3e50;
}
.login-button {
width: 100%;
padding: 12px;
background-color: #2c3e50;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 16px;
transition: background-color 0.2s;
}
.login-button:hover { background-color: #34495e; }
.error-msg { color: #e74c3c; margin-top: 10px; font-weight: bold; }
</style>