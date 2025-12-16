<script setup>
import { ref, onMounted, reactive } from 'vue';
import PersonaeList from './components/PersonaeList.vue';
import Login from './components/Login.vue';

const isAuthenticated = ref(false);
const currentUser = ref('');

// Estado para cambio de contraseña
const showChangePassword = ref(false);
const pwdForm = reactive({ current: '', new: '' });
const pwdMsg = ref('');
const pwdType = ref('');

onMounted(() => {
  const session = localStorage.getItem('userSession');
  if (session) {
    const data = JSON.parse(session);
    isAuthenticated.value = true;
    currentUser.value = data.username;
  }
});

const onLoginSuccess = (data) => {
  isAuthenticated.value = true;
  currentUser.value = data.username;
};

const logout = () => {
  localStorage.removeItem('userSession');
  isAuthenticated.value = false;
  currentUser.value = '';
};

const changePassword = async () => {
  pwdMsg.value = '';
  try {
    const response = await fetch('http://localhost:4000/api/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.value,
        currentPassword: pwdForm.current,
        newPassword: pwdForm.new
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error);
    
    pwdMsg.value = 'Contraseña actualizada correctamente';
    pwdType.value = 'success';
    setTimeout(() => {
      showChangePassword.value = false;
      pwdForm.current = ''; 
      pwdForm.new = '';
      pwdMsg.value = '';
    }, 2000);
  } catch (err) {
    pwdMsg.value = err.message;
    pwdType.value = 'error';
  }
};
</script>

<template>
  <div v-if="isAuthenticated" class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-text">
          <h1>🏢 Sistema de Gestión de Agencia</h1>
          <p class="subtitle">Gestión completa de personas, aportaciones y cargos</p>
        </div>
        
        <div class="header-actions">
          <button @click="showChangePassword = true" class="action-btn">
            Cambiar Contraseña
          </button>
          <button @click="logout" class="action-btn logout">
            Cerrar Sesión ({{ currentUser }})
          </button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <PersonaeList />
    </main>

    <!-- Footer eliminado para evitar obstrucciones -->
  </div>

  <Login v-else @login-success="onLoginSuccess" />

  <!-- Modal Cambio de Contraseña (fuera del container principal para mejor stacking) -->
  <div v-if="showChangePassword" class="modal-overlay">
    <div class="modal-card">
      <h3>Cambiar Contraseña</h3>
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label>Contraseña Actual</label>
          <input v-model="pwdForm.current" type="password" required>
        </div>
        <div class="form-group">
          <label>Nueva Contraseña</label>
          <input v-model="pwdForm.new" type="password" required>
        </div>
        <div v-if="pwdMsg" :class="['msg', pwdType]">{{ pwdMsg }}</div>
        <div class="modal-actions">
          <button type="submit" class="btn-primary">Actualizar</button>
          <button type="button" @click="showChangePassword = false" class="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style>
/* Global Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.header-text {
  text-align: left;
}

.app-header h1 { font-size: 2rem; margin-bottom: 5px; }
.subtitle { opacity: 0.9; }

.header-actions { 
  display: flex; 
  gap: 8px; 
  flex-shrink: 0;
}

.action-btn { 
  background: rgba(255,255,255,0.2); 
  border: 1px solid rgba(255,255,255,0.4); 
  color: white; 
  padding: 6px 12px; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: 0.2s; 
  font-weight: 500; 
  font-size: 0.85rem;
  white-space: nowrap;
}

.action-btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-1px); }
.action-btn.logout:hover { background: rgba(255,255,255,0.9); color: #c62828; }

/* Main Content */
.app-main {
  flex: 1 0 auto; 
  padding: 20px;
  padding-bottom: 60px; 
}

/* Footer Styles Removed */

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 2000; }
.modal-card { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.modal-card h3 { color: #2c3e50; margin-bottom: 20px; text-align: center; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; color: #4a5568; font-weight: 600; }
.form-group input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
.btn-primary { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #cbd5e0; color: #4a5568; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.msg { padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 0.9rem; text-align: center; }
.msg.success { background: #d4edda; color: #155724; }
.msg.error { background: #f8d7da; color: #721c24; }
</style>
