<template>
  <div class="personae-list">
    <div class="header">
      <h2> Gestión de Personas</h2>
      <button @click="showAddForm = true" class="btn-primary">
        Agregar Persona
      </button>
    </div>

    <!-- Filtros por Estatus -->
    <div class="status-filters">
      <button
        @click="filterByStatus('')"
        :class="['filter-btn', { active: selectedStatus === '' }]">
        Todos <span class="count-badge">({{ allPersonae.length }})</span>
      </button>
      <button
        v-for="status in availableStatuses"
        :key="status.value"
        @click="filterByStatus(status.value)"
        :class="['filter-btn', { active: selectedStatus === status.value }]">
        {{ status.label }} <span class="count-badge">({{ status.count }})</span>
      </button>
    </div>

    <!-- Buscador -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder=" Buscar por nombre..."
        class="search-input"
      />
    </div>

    <!-- Estado de conexión -->
    <div v-if="dbStatus" class="status-badge" :class="dbStatus.status === 'OK' ? 'success' : 'error'">
      {{ dbStatus.status === 'OK' ? 'Conectado a BD' : '✗ Error de conexión' }}
    </div>

    <!-- Notificación de éxito/error -->
    <div v-if="successMessage" class="success-notification">
      ✓ {{ successMessage }}
    </div>

    <!-- Formulario de agregar/editar -->
    <div v-if="showAddForm" class="modal" @click.self="cancelForm">
      <div class="modal-content">
        <h3>{{ editingId ? ' Editar Persona' : ' Nueva Persona' }}</h3>

        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <!-- Información Personal -->
          <div class="form-section">
            <h4> Información Personal</h4>
            <div class="form-grid">
              <input v-model="form.nombre" placeholder="Nombre *" required />
              <input v-model="form.apellido_paterno" placeholder="Apellido Paterno *" required />
              <input v-model="form.apellido_materno" placeholder="Apellido Materno" />
              <input v-model="form.edad" type="number" placeholder="Edad" min="0" max="120" />
              <input v-model="form.telefono" placeholder="Teléfono" />
              <input v-model="form.direccion" placeholder="Dirección" class="full-width" />
            </div>
          </div>

          <!-- Sección de Aportación Inicial (Solo visualmente separada si es nuevo) -->
          <div v-if="!editingId" class="form-section">
            <h4>Aportación Inicial (Opcional)</h4>
            <div class="form-grid">
              <input v-model="form.aportacion_inicial.cooperacion_rastreo" placeholder="Cooperación de Rastreo" />
              <div class="select-wrapper">
                <select v-model="form.aportacion_inicial.asistio_tequios">
                  <option value="" disabled selected>Asistió Tequios</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div class="select-wrapper">
                <select v-model="form.aportacion_inicial.asistio_reuniones">
                  <option value="" disabled selected>Asistió Reuniones</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
              <input
                v-model="form.aportacion_inicial.multa"
                type="number"
                step="0.01"
                placeholder="Multa ($)"
                :disabled="form.aportacion_inicial.asistio_tequios === 'Sí' && form.aportacion_inicial.asistio_reuniones === 'Sí'"
              />
            </div>
          </div>

          <!-- Información de la Agencia -->
          <div class="form-section">
            <h4> Información de la Agencia</h4>
            <div class="form-grid">
              <input 
                 v-model="form.ano_alta_agencia" 
                 type="number" 
                 placeholder="Año de Alta en Agencia" 
                 min="1900" 
                 :max="new Date().getFullYear()" 
                 :disabled="!!editingId"
              />

              <div v-if="!editingId" class="form-field">
                <label>Cargo</label>
                <select v-model="form.cargo">
                  <option value="">Ninguno</option>
                  <option value="vocal">Vocal</option>
                  <option value="tesorero">Tesorero</option>
                  <option value="agente">Agente</option>
                  <option value="suplente">Suplente</option>
                  <option value="secretari@">Secretari@</option>
                </select>
              </div>

              <!-- Fechas de Cargo (Solo visibles si se selecciona cargo y es registro nuevo) -->
              <div v-if="!editingId" class="form-grid full-width" style="grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                  <div class="form-field">
                      <label>Fecha Inicio Cargo</label>
                      <input v-model="form.cargo_fecha_inicio" type="date" required>
                  </div>
                  <div class="form-field">
                      <label>Fecha Fin Cargo (Opcional)</label>
                      <input v-model="form.cargo_fecha_fin" type="date">
                  </div>
              </div>



              <div class="form-field full-width">
                <label>Estatus *</label>
                <select v-model="form.estatus" required>
                  <option value="">Seleccionar...</option>
                  <option value="directos">Directos</option>
                  <option value="indirectos">Indirectos</option>
                  <option value="madres_solteras">Madres Solteras</option>
                  <option value="activos">Activos</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Requisitos y Documentos -->
          <div class="form-section">
            <h4> Requisitos y Documentos</h4>
            <div class="form-grid">
              <div class="form-field" v-for="req in requisitos" :key="req.key">
                <label>{{ req.label }}</label>
                <select v-model="form[req.key]">
                  <option value="">Seleccionar...</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? ' Guardando...' : ' Guardar' }}
            </button>
            <button type="button" @click="cancelForm" class="btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Detalles -->
    <div v-if="showDetails" class="modal" @click.self="showDetails = false">
      <div class="modal-content-large">
        <h3>{{ selectedPersona.nombre }} {{ selectedPersona.apellido_paterno }} {{ selectedPersona.apellido_materno }}</h3>

        <!-- Tabs -->
        <div class="tabs">
          <button @click="activeTab = 'info'" :class="{ active: activeTab === 'info' }"> Información</button>
          <button @click="activeTab = 'requisitos'" :class="{ active: activeTab === 'requisitos' }"> Requisitos</button>
          <button @click="activeTab = 'cargos'" :class="{ active: activeTab === 'cargos' }"> Cargos</button>
          <button @click="activeTab = 'aportaciones'" :class="{ active: activeTab === 'aportaciones' }"> Aportaciones</button>
        </div>

        <!-- Tab: Información -->
        <div v-if="activeTab === 'info'" class="tab-content">
          <div class="info-grid">
            <div class="info-item"><strong>Edad:</strong> {{ selectedPersona.edad || '-' }}</div>
            <div class="info-item"><strong>Teléfono:</strong> {{ selectedPersona.telefono || '-' }}</div>
            <div class="info-item full-width"><strong>Dirección:</strong> {{ selectedPersona.direccion || '-' }}</div>
            <div class="info-item"><strong>Año de Alta:</strong> {{ selectedPersona.ano_alta_agencia || '-' }}</div>
            <div class="info-item"><strong>Cargo:</strong> <span v-if="selectedPersona.cargo" class="badge badge-cargo">{{ selectedPersona.cargo }}</span><span v-else>-</span></div>
            <div class="info-item"><strong>Estatus:</strong> <span v-if="selectedPersona.estatus" :class="'badge badge-estatus-' + selectedPersona.estatus">{{ formatEstatus(selectedPersona.estatus) }}</span></div>
            <div class="info-item"><strong>Fecha de Registro:</strong> {{ formatDate(selectedPersona.fecha_registro) }}</div>
          </div>
          <div class="edit-btn-container" style="margin-top:20px; text-align:right;">
             <button @click="editPersona(selectedPersona); showDetails = false" class="btn-primary btn-sm">Editar Información</button>
          </div>
        </div>

        <!-- Tab: Requisitos -->
        <div v-if="activeTab === 'requisitos'" class="tab-content">
          <!-- (Contenido requisitos existente) -->
          <div class="requisitos-grid">
            <div v-for="req in requisitos" :key="req.key" class="req-item">
              <span class="req-label">{{ req.label }}</span>
              <span :class="'badge ' + (selectedPersona[req.key] === 'Sí' ? 'badge-si' : 'badge-no')">
                {{ selectedPersona[req.key] || 'No' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Tab: Cargos (NUEVO) -->
        <div v-if="activeTab === 'cargos'" class="tab-content">
            <div class="aportaciones-header">
                <h4>Historial de Cargos</h4>
                <button @click="showCargoForm = true" class="btn-primary btn-sm">Asignar Cargo</button>
            </div>

            <div v-if="showCargoForm" class="aportacion-form">
                <h5>Nuevo Cargo</h5>
                <form @submit.prevent="saveCargo">
                    <div class="form-grid">
                        <div class="select-wrapper">
                            <select v-model="cargoForm.cargo" required>
                                <option value="" disabled>Seleccionar Cargo</option>
                                <option value="agente">Agente</option>
                                <option value="suplente">Suplente</option>
                                <option value="tesorero">Tesorero</option>
                                <option value="secretari@">Secretario/a</option>
                                <option value="vocal">Vocal</option>
                            </select>
                        </div>
                        <input v-model="cargoForm.fecha_inicio" type="date" required placeholder="Fecha Inicio" title="Fecha Inicio">
                        <input v-model="cargoForm.fecha_fin" type="date" placeholder="Fecha Fin (Opcional)" title="Fecha Fin (Opcional)">
                    </div>
                    <div class="form-actions" style="margin-top:15px">
                        <button type="submit" class="btn-primary btn-sm">Guardar</button>
                        <button type="button" @click="cancelCargoForm" class="btn-secondary btn-sm">Cancelar</button>
                    </div>
                </form>
            </div>

            <table class="aportaciones-table">
                <thead>
                    <tr>
                        <th>Cargo</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="cargos.length === 0">
                        <td colspan="3" style="text-align:center;">No hay historial de cargos</td>
                    </tr>
                    <tr v-for="c in cargos" :key="c.id_cargo">
                        <td>{{ c.cargo }}</td>
                        <td>{{ formatDate(c.fecha_inicio) }}</td>
                        <td>{{ c.fecha_fin ? formatDate(c.fecha_fin) : 'Activo' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Tab: Aportaciones -->
        <div v-if="activeTab === 'aportaciones'" class="tab-content">
          <div class="aportaciones-header">
            <h4>Historial de Aportaciones</h4>
            <button @click="showAportacionForm = true" class="btn-primary btn-sm"> Agregar Aportación</button>
          </div>

          <!-- Formulario de Nueva Aportación -->
          <div v-if="showAportacionForm" class="aportacion-form">
            <h5>Nueva Aportación {{ new Date().getFullYear() }}</h5>
            <form @submit.prevent="saveAportacion">
              <div class="form-grid">
                <input v-model="aportacionForm.cooperacion_rastreo" placeholder="Cooperación de rastreo *" required class="full-width" />
                <div class="form-field">
                  <label>¿Asistió a tequios?</label>
                  <select v-model="aportacionForm.asistio_tequios">
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>¿Asistió a reuniones?</label>
                  <select v-model="aportacionForm.asistio_reuniones">
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <input 
                  v-model="aportacionForm.multa" 
                  type="number" 
                  step="0.01" 
                  placeholder="Multa ($)" 
                  :disabled="aportacionForm.asistio_tequios === 'Sí' && aportacionForm.asistio_reuniones === 'Sí'"
                  :title="aportacionForm.asistio_tequios === 'Sí' && aportacionForm.asistio_reuniones === 'Sí' ? 'No aplica multa si asistió a todo' : 'Ingrese monto de multa'"
                />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary btn-sm"> Guardar</button>
                <button type="button" @click="cancelAportacionForm" class="btn-secondary btn-sm"> Cancelar</button>
              </div>
            </form>
          </div>

          <!-- Tabla de Aportaciones -->
          <div v-if="aportaciones.length > 0" class="aportaciones-table">
            <table>
              <thead>
                <tr>
                  <th>Año</th>
                  <th>Cooperación</th>
                  <th>Tequios</th>
                  <th>Reuniones</th>
                  <th>Multa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ap in aportaciones" :key="ap.id_aportacion">
                  <td>{{ ap.ano }}</td>
                  <td>{{ ap.cooperacion_rastreo }}</td>
                  <td><span :class="'badge badge-' + (ap.asistio_tequios === 'Sí' ? 'si' : 'no')">{{ ap.asistio_tequios }}</span></td>
                  <td><span :class="'badge badge-' + (ap.asistio_reuniones === 'Sí' ? 'si' : 'no')">{{ ap.asistio_reuniones }}</span></td>
                  <td>${{ ap.multa }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="no-data">
            No hay aportaciones registradas
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showDetails = false" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Tabla Principal -->
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="list-container">
      <table class="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Completo</th>
            <th>Cargo</th>
            <th>Estatus</th>
            <th>Edad</th>
            <th>Teléfono</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredPersonae.length === 0">
            <td colspan="8" class="empty-state">No hay personas registradas con este filtro.</td>
          </tr>
          <tr v-for="persona in filteredPersonae" :key="persona.id_persona">
            <td>#{{ persona.id_persona }}</td>
            <td class="nombre-col">{{ persona.nombre }} {{ persona.apellido_paterno }} {{ persona.apellido_materno }}</td>
            <td><span v-if="persona.cargo" class="badge badge-cargo">{{ persona.cargo }}</span><span v-else>-</span></td>
            <td><span v-if="persona.estatus" :class="'badge badge-estatus-' + persona.estatus">{{ formatEstatus(persona.estatus) }}</span></td>
            <td>{{ persona.edad || '-' }}</td>
            <td>{{ persona.telefono || '-' }}</td>
            <td>{{ formatDate(persona.fecha_registro) }}</td>
            <td class="actions">
              <button @click="verDetalles(persona)" class="btn-icon view" title="Ver Detalles">👁️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { personaeService, aportacionesService, cargosService, healthCheck } from '../services/api.js';

const allPersonae = ref([]); // Para calcular contadores
const loading = ref(false);
const error = ref(null);
const dbStatus = ref(null);
const successMessage = ref('');
const formError = ref('');
const saving = ref(false);
const selectedStatus = ref('');
const selectedPersona = ref({});
const aportaciones = ref([]);
const cargos = ref([]); // Historial de cargos

const searchQuery = ref('');

// Computed: Filtered Personae (Status + Search)
const filteredPersonae = computed(() => {
  let result = allPersonae.value;

  // 1. Filter by Status
  if (selectedStatus.value) {
    result = result.filter(p => p.estatus === selectedStatus.value);
  }

  // 2. Filter by Search Query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.nombre.toLowerCase().includes(query) || 
      p.apellido_paterno.toLowerCase().includes(query) ||
      (p.apellido_materno && p.apellido_materno.toLowerCase().includes(query))
    );
  }

  return result;
});

const showAddForm = ref(false);
const showDetails = ref(false);
const showAportacionForm = ref(false);
const showCargoForm = ref(false); 
const editingId = ref(null);
const activeTab = ref('info');

const requisitos = [
  { key: 'curp', label: '¿Tiene CURP?' },
  { key: 'credencial', label: '¿Tiene Credencial?' },
  { key: 'carta_compromiso', label: '¿Tiene Carta Compromiso?' },
  { key: 'constancia_no_adeudo', label: '¿Tiene Constancia de No Adeudo?' },
  { key: 'solicitud_toma_agua', label: '¿Tiene Solicitud de Toma de Agua?' },
  { key: 'autorizacion_toma_agua', label: '¿Tiene Autorización de Toma de Agua?' },
  { key: 'solicitud_cambio_propietario', label: '¿Tiene Solicitud de Cambio de Propietario?' },
  { key: 'respuesta_solicitud_cambio_propietario', label: '¿Tiene Respuesta a Solicitud?' }
];

const form = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  edad: '',
  direccion: '',
  telefono: '',
  ano_alta_agencia: '',
  cargo: '',
  estatus: '',
  curp: '',
  credencial: '',
  carta_compromiso: '',
  constancia_no_adeudo: '',
  solicitud_toma_agua: '',
  autorizacion_toma_agua: '',
  solicitud_cambio_propietario: '',
  respuesta_solicitud_cambio_propietario: '',
  fecha_registro: '',
  cargo_fecha_inicio: new Date().toISOString().split('T')[0],
  cargo_fecha_fin: '',
  aportacion_inicial: { // New field structure
    cooperacion_rastreo: '',
    asistio_tequios: 'No',
    asistio_reuniones: 'No',
    multa: 0
  }
});

const originalPersona = ref(null);

const aportacionForm = ref({
  ano: new Date().getFullYear(),
  cooperacion_rastreo: '',
  asistio_tequios: 'No',
  asistio_reuniones: 'No',
  multa: 0
});

const cargoForm = ref({
  cargo: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '' 
});

// Watcher para calcular multa automáticamente...
watch(() => [aportacionForm.value.asistio_tequios, aportacionForm.value.asistio_reuniones], ([tequios, reuniones]) => {
  if (tequios === 'Sí' && reuniones === 'Sí') {
    aportacionForm.value.multa = 0;
  }
});

watch(() => [form.value.aportacion_inicial.asistio_tequios, form.value.aportacion_inicial.asistio_reuniones], ([tequios, reuniones]) => {
  if (tequios === 'Sí' && reuniones === 'Sí') {
    form.value.aportacion_inicial.multa = 0;
  }
});

// Watcher para cargar cargos al cambiar tab
watch(activeTab, async (newTab) => {
    if (newTab === 'cargos' && selectedPersona.value.id_persona) {
        await loadCargos(selectedPersona.value.id_persona);
    }
});

const availableStatuses = computed(() => {
  const statuses = [
    { value: 'directos', label: 'Directos' },
    { value: 'indirectos', label: 'Indirectos' },
    { value: 'madres_solteras', label: 'Madres Solteras' },
    { value: 'activos', label: 'Activos' }
  ];
  
  return statuses.map(s => ({
    ...s,
    count: allPersonae.value.filter(p => p.estatus === s.value).length
  })).filter(s => s.count > 0);
});

const loadPersonae = async (statusFilter = '') => {
  loading.value = true;
  error.value = null;
  try {
    const data = await personaeService.getAll(statusFilter);
    allPersonae.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('Error al cargar personas:', err);
  } finally {
    loading.value = false;
  }
};

const filterByStatus = (status) => { selectedStatus.value = status; };

const formatEstatus = (estatus) => {
  const nombres = { 'directos': 'Directos', 'indirectos': 'Indirectos', 'madres_solteras': 'Madres Solteras', 'activos': 'Activos' };
  return nombres[estatus] || estatus;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', { timeZone: 'UTC' }); // Ajuste simple de zona
};

const checkHealth = async () => { dbStatus.value = await healthCheck(); };

const savePersona = async () => {
  formError.value = '';
  saving.value = true;
  try {
    if (editingId.value) {
      // Build a minimal payload with only changed fields to avoid sending nulls
      const changed = {};
      const skipKeys = ['aportacion_inicial', 'fecha_registro', 'ano_alta_agencia'];
      const src = originalPersona.value || {};
      for (const key of Object.keys(form.value)) {
        if (skipKeys.includes(key)) continue;
        const newVal = form.value[key];
        const oldVal = src[key];
        if (newVal === undefined) continue;
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          if (newVal === null) continue; // avoid nulling NOT NULL columns
          changed[key] = newVal;
        }
      }

      // Include cargo/estatus related fields explicitly if present
      if (form.value.cargo) changed.cargo = form.value.cargo;
      if (form.value.cargo_fecha_inicio) changed.cargo_fecha_inicio = form.value.cargo_fecha_inicio;
      if (form.value.cargo_fecha_fin) changed.cargo_fecha_fin = form.value.cargo_fecha_fin;
      if (form.value.id_cargo) changed.id_cargo = form.value.id_cargo;
      if (form.value.estatus) changed.estatus = form.value.estatus;

      console.log('[savePersona] updating id', editingId.value, 'payload:', JSON.stringify(changed));
      const updateRes = await personaeService.update(editingId.value, changed);
      if (updateRes && updateRes.persona) {
        const updated = updateRes.persona;
        const idx = allPersonae.value.findIndex(p => p.id_persona === updated.id_persona);
        if (idx !== -1) {
          allPersonae.value.splice(idx, 1, updated);
        } else {
          allPersonae.value.push(updated);
        }
      } else {
        await loadPersonae(selectedStatus.value);
      }
      successMessage.value = 'Persona actualizada exitosamente';
    } else {
      console.log('[savePersona] creating payload:', JSON.stringify(form.value));
      await personaeService.create(form.value);
      successMessage.value = 'Persona agregada exitosamente';
      await loadPersonae(selectedStatus.value);
    }
    cancelForm();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err) {
    console.error('Error al guardar:', err);
    formError.value = err.message;
  } finally {
    saving.value = false;
  }
};

const handleSubmit = async () => {
  console.log('[handleSubmit] form submit intercepted, calling savePersona');
  await savePersona();
};

const verDetalles = async (persona) => {
  selectedPersona.value = persona;
  showDetails.value = true;
  activeTab.value = 'info';
  try {
    const response = await fetch(`http://localhost:4000/api/personas/${persona.id_persona}/aportaciones`);
    if (response.ok) aportaciones.value = await response.json();
  } catch (err) { console.error('Error aportaciones:', err); }
};

const saveAportacion = async () => {
  try {
    await aportacionesService.create({
      id_persona: selectedPersona.value.id_persona,
      ano: aportacionForm.value.ano,
      cooperacion_rastreo: aportacionForm.value.cooperacion_rastreo,
      asistio_tequios: aportacionForm.value.asistio_tequios,
      asistio_reuniones: aportacionForm.value.asistio_reuniones,
      multa: aportacionForm.value.multa
    });
    
    // Recargar aportaciones
    aportaciones.value = await aportacionesService.getByPersona(selectedPersona.value.id_persona);
    
    showAportacionForm.value = false;
    aportacionForm.value = {
      ano: new Date().getFullYear(),
      cooperacion_rastreo: '',
      asistio_tequios: 'No',
      asistio_reuniones: 'No',
      multa: 0
    };
  } catch (err) {
    alert('Error al guardar aportación: ' + err.message);
  }
};

const cancelAportacionForm = () => {
    showAportacionForm.value = false;
    aportacionForm.value = {
      ano: new Date().getFullYear(),
      cooperacion_rastreo: '',
      asistio_tequios: 'No',
      asistio_reuniones: 'No',
      multa: 0
    };
};

// Lógica de Cargos
const loadCargos = async (idPersona) => {
    try {
        cargos.value = await cargosService.getByPersona(idPersona);
    } catch (err) {
        console.error('Error cargando cargos:', err);
    }
};

const saveCargo = async () => {
    try {
        await cargosService.create({
            id_persona: selectedPersona.value.id_persona,
            ...cargoForm.value
        });
        await loadCargos(selectedPersona.value.id_persona);
        showCargoForm.value = false;
        cargoForm.value = { cargo: '', fecha_inicio: new Date().toISOString().split('T')[0] };
        // Opcional: Actualizar el cargo "actual" en la lista principal recargando personas
        loadPersonae();
    } catch (err) {
        alert('Error al asignar cargo: ' + err.message);
    }
};

const terminateCargo = async (cargo) => {
    if(!confirm('¿Confirmar que este cargo ha concluido hoy?')) return;
    try {
        const fechaFin = new Date().toISOString().split('T')[0];
        await cargosService.update(cargo.id_cargo, { fecha_fin: fechaFin });
        await loadCargos(selectedPersona.value.id_persona);
        loadPersonae(); // Actualizar lista principal
    } catch (err) {
        alert('Error al finalizar cargo: ' + err.message);
    }
};

const cancelCargoForm = () => {
    showCargoForm.value = false;
    cargoForm.value = { cargo: '', fecha_inicio: new Date().toISOString().split('T')[0] };
};

// ... Resto de funciones existentes (editPersona, deletePersona, cancelForm) ...

const editPersona = (persona) => {
  editingId.value = persona.id_persona;
  // Ensure aportacion_inicial exists to prevent v-model errors in the hidden form section
  form.value = { 
    ...persona,
    aportacion_inicial: { 
        cooperacion_rastreo: '', 
        asistio_tequios: 'No', 
        asistio_reuniones: 'No', 
        multa: 0 
    }
  };
  // snapshot original values
  originalPersona.value = JSON.parse(JSON.stringify(persona));
  showAddForm.value = true;
};

const deletePersona = async (id) => {
    if (confirm('¿Estás seguro?')) {
        try {
            await personaeService.delete(id);
            await loadPersonae();
            successMessage.value = 'Eliminado correctamente';
        } catch (err) { error.value = err.message; }
    }
};

const cancelForm = () => {
  showAddForm.value = false;
  editingId.value = null;
  form.value = {
    nombre: '', apellido_paterno: '', apellido_materno: '', edad: '', direccion: '', telefono: '', ano_alta_agencia: '',
    curp: '', credencial: '', carta_compromiso: '', constancia_no_adeudo: '', solicitud_toma_agua: '', autorizacion_toma_agua: '',
    solicitud_cambio_propietario: '', respuesta_solicitud_cambio_propietario: '', fecha_registro: '', 
    cargo: '', cargo_fecha_inicio: new Date().toISOString().split('T')[0], cargo_fecha_fin: '', estatus: '',
    aportacion_inicial: { cooperacion_rastreo: '', asistio_tequios: 'No', asistio_reuniones: 'No', multa: 0 }
  };
};

onMounted(() => {
  loadPersonae();
  checkHealth();
});
</script>

<style scoped>
/* Layout principal - Full screen */
.personae-list {
  width: 100%;
  max-width: 100%;
  padding: 0;
  box-sizing: border-box;
}

/* Header mejorado */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* Sombra más suave */
}

/* Buscador */
.search-bar {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.search-input {
  width: 100%;
  max-width: 500px;
  padding: 12px 20px;
  border-radius: 30px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #6a11cb;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.15);
}

/* Modal Content - Asegurar colores legibles */
.modal-content, .modal-content-large {
  background: white;
  color: #333; /* Texto oscuro explícito */
}

/* Inputs y Selects - Asegurar contraste */
input, select {
  background: white;
  color: #333 !important;
  border: 1px solid #ccc;
}

h2, h3, h4, h5, label, strong {
  color: #2c3e50 !important; /* Texto oscuro forzado */
}


h2 {
  color: #1a1a1a;
  font-weight: 700;
  letter-spacing: -0.5px;
  font-size: 28px;
  font-weight: 700;
}

/* Status badge */
.status-badge {
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  display: inline-block;
}

.status-badge.success {
  background: #d4edda;
  color: #155724;
  border: 2px solid #28a745;
}

.status-badge.error {
  background: #f8d7da;
  color: #721c24;
  border: 2px solid #dc3545;
}

/* Success notification */
.success-notification {
  background: #d4edda;
  color: #155724;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 600;
  border-left: 5px solid #28a745;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

/* Form error */
.form-error {
  background: #f8d7da;
  color: #721c24;
  padding: 14px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-weight: 500;
  border-left: 5px solid #dc3545;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: transform 0.2s;
  padding: 5px;
}

.btn-icon:hover {
  transform: scale(1.3);
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

.modal-content {
  background: white;
  padding: 35px;
  border-radius: 20px;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
}

.modal-content-large {
  background: white;
  padding: 35px;
  border-radius: 20px;
  width: 95%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
}

.modal-content h3, .modal-content-large h3 {
  margin-top: 0;
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 700;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid #e0e0e0;
}

.tabs button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tabs button:hover {
  color: #667eea;
}

.tabs button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-content {
  padding: 20px 0;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item strong {
  color: #495057;
  display: block;
  margin-bottom: 5px;
}

/* Requisitos Grid */
.requisitos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.req-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.req-label {
  font-weight: 500;
  color: #495057;
}

/* Aportaciones */
.aportaciones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.aportaciones-header h4 {
  margin: 0;
  color: #2c3e50;
}

.aportacion-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #667eea;
}

.aportacion-form h5 {
  margin-top: 0;
  color: #2c3e50;
}

/* Tabla Estilo Moderno */
.list-container {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  padding: 0;
  margin-bottom: 40px; /* Espacio extra abajo probar evitar traslape */
}

/* Layout principal - Full screen pero en flujo normal */
.personae-list {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
  /* Eliminado position: absolute que causaba el traslape con el footer */
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f8f9fa;
  padding: 18px 25px;
  text-align: left;
  font-weight: 700;
  color: #4a5568;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #edf2f7;
}

.modern-table td {
  padding: 16px 25px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.modern-table tr:hover {
  background-color: #f8fbff;
}

.modern-table tr:last-child td {
  border-bottom: none;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #888;
  font-style: italic;
}

/* Acciones en Columna */
.actions {
  display: flex;
  gap: 10px;
}

.btn-icon.view {
  background-color: #e3f2fd;
  color: #1976d2;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
}

.btn-icon.view:hover {
  background-color: #1976d2;
  color: white;
}

.btn-icon.delete {
  background-color: #ffebee;
  color: #c62828;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
}

.btn-icon.delete:hover {
  background-color: #c62828;
  color: white;
}

/* Estilos para la tabla de aportaciones dentro del modal */
.aportaciones-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.aportaciones-table th {
  background: #f1f5f9;
  color: #334155; /* Texto oscuro para encabezados */
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.aportaciones-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b; /* Texto oscuro para el contenido */
}

.aportaciones-table tr:hover {
  background-color: #f8fafc;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.modal-footer {
  margin-top: 25px;
  text-align: right;
}

/* Form sections */
.form-section {
  margin-bottom: 30px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 14px;
  border-left: 5px solid #667eea;
}

.form-section h4 {
  margin: 0 0 18px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-grid input,
.form-grid select {
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s;
  background: white;
  color: #2c3e50;
}

.form-grid input:focus,
.form-grid select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

/* Form field */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.form-field select {
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  color: #2c3e50;
}

.form-field select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
}

/* Loading and error states */
.loading {
  text-align: center;
  padding: 60px;
  font-size: 20px;
  color: #667eea;
  font-weight: 600;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 500;
  border-left: 5px solid #dc3545;
}

/* Table container */
.table-container {
  overflow-x: auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 18px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

td {
  padding: 16px 14px;
  border-bottom: 1px solid #e0e0e0;
  color: #2c3e50;
  font-size: 14px;
}

.nombre-col {
  font-weight: 600;
  color: #495057;
}

tbody tr {
  transition: background 0.2s;
}

tbody tr:hover {
  background: #f8f9fa;
}

/* Badge styles for Sí/No */
.badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.badge-si {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.badge-no {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
}

/* Badge for Cargo */
.badge-cargo {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  font-weight: 700;
  text-transform: capitalize;
}

/* Badges for Estatus */
.badge-estatus-directos {
  background: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
  font-weight: 700;
}

.badge-estatus-indirectos {
  background: #cce5ff;
  color: #004085;
  border: 1px solid #007bff;
  font-weight: 700;
}

.badge-estatus-madres_solteras {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #dc3545;
  font-weight: 700;
}

.badge-estatus-activos {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
  font-weight: 700;
}

/* Actions column */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Status Filters */
.status-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 12px 24px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #495057;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>
