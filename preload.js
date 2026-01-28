// Preload script para SistemaAgencia
// Este archivo se ejecuta antes de que la página web se cargue
// y proporciona un puente seguro entre el proceso principal y el renderizador

const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al frontend
contextBridge.exposeInMainWorld('electronAPI', {
    // Obtener versión de la aplicación
    getVersion: () => ipcRenderer.invoke('app-version'),

    // Aquí puedes agregar más funcionalidades en el futuro
    // Por ejemplo:
    // - Acceso al sistema de archivos
    // - Notificaciones del sistema
    // - Comunicación con el proceso principal
});

console.log('[Preload] Script cargado correctamente');
