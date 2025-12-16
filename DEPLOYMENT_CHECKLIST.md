# Checklist de Deployment

## ✅ Configuración Completada

### Backend
- [x] Variables de entorno en `.env`
- [x] CORS configurado dinámicamente
- [x] Credenciales de BD en variables de entorno
- [x] Puerto configurable
- [x] Documentación de deployment

### Frontend  
- [x] Variables de entorno para API URL
- [x] Archivo `.env` creado
- [x] `.env.example` como referencia

## 🚀 Para Desplegar a Cliente

1. **Copiar todos los archivos del proyecto**

2. **Backend - Configuración:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Editar .env con datos del cliente
   npm start
   ```

3. **Frontend - Configuración:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Editar .env con URL del backend
   npm run dev  # Para desarrollo
   # O npm run build  # Para producción
   ```

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| "Cannot connect to MySQL" | Verificar credenciales en `.env` |
| "CORS error" | Actualizar `CORS_ORIGIN` en backend `.env` |
| "API URL not found" | Verificar `VITE_API_URL` en frontend `.env` |
| "Database does not exist" | Ejecutar `database/schema.sql` y `login_schema.sql` |

## 🔐 Seguridad

- [ ] Cambiar contraseña de admin después de instalar
- [ ] No incluir `.env` en control de versiones (está en .gitignore)
- [ ] Usar HTTPS en producción
- [ ] Cambiar contraseña de BD de MySQL
- [ ] Limitar acceso a la base de datos

## 📝 Documentación Completa

Ver archivo `DEPLOYMENT.md` para instrucciones detalladas.
