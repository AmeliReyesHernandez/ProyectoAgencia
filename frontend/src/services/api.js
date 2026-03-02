// Configuración de la API - Usar variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Servicio para Personae
export const personaeService = {
    async getAll(estatus) {
        const url = estatus ? `${API_URL}/personas?estatus=${encodeURIComponent(estatus)}` : `${API_URL}/personas`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener personas');
        return response.json();
    },

    async getById(id) {
        const response = await fetch(`${API_URL}/personas/${id}`);
        if (!response.ok) throw new Error('Error al obtener persona');
        return response.json();
    },

    async create(persona) {
        const response = await fetch(`${API_URL}/personas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al crear persona');
        }
        return response.json();
    },

    async update(id, persona) {
        const response = await fetch(`${API_URL}/personas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(persona)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Error al actualizar persona');
        }
        return response.json();
    },

    async delete(id) {
        const response = await fetch(`${API_URL}/personas/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar persona');
        return response.json();
    }
};

// Servicio para Aportaciones
export const aportacionesService = {
    async getByPersona(idPersona) {
        const response = await fetch(`${API_URL}/personas/${idPersona}/aportaciones`);
        if (!response.ok) throw new Error('Error al obtener aportaciones de persona');
        return response.json();
    },

    async create(aportacion) {
        // Expects aportacion to include `id_persona` or receive it separately
        const id_persona = aportacion.id_persona;
        if (!id_persona) throw new Error('Falta id_persona en aportación');
        const payload = { ...aportacion };
        delete payload.id_persona;
        const response = await fetch(`${API_URL}/personas/${id_persona}/aportaciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Error al crear aportación');
        return response.json();
    },

    async update(id, aportacion) {
        const response = await fetch(`${API_URL}/aportaciones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aportacion)
        });
        if (!response.ok) throw new Error('Error al actualizar aportación');
        return response.json();
    }
};

// Servicio para Cargos
export const cargosService = {
    async getAll() {
        const response = await fetch(`${API_URL}/cargos`);
        if (!response.ok) throw new Error('Error al obtener cargos');
        return response.json();
    },

    async getByPersona(idPersona) {
        const response = await fetch(`${API_URL}/personas/${idPersona}/cargos`);
        if (!response.ok) throw new Error('Error al obtener historial de cargos');
        return response.json();
    },

    async create(cargo) {
        const response = await fetch(`${API_URL}/cargos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cargo)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Error al crear cargo');
        }
        return response.json();
    },

    async update(id, cargo) {
        const response = await fetch(`${API_URL}/cargos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cargo)
        });
        if (!response.ok) throw new Error('Error al actualizar cargo');
        return response.json();
    }
};

// Servicio para Estatus
export const estatusService = {
    async getAll() {
        const response = await fetch(`${API_URL}/estatus`);
        if (!response.ok) throw new Error('Error al obtener estatus');
        return response.json();
    }
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_URL}/health`);
        return response.json();
    } catch (error) {
        return { status: 'ERROR', error: error.message };
    }
};
