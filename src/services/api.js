// src/services/api.js
import { API_URL } from '../config';

// Función auxiliar para obtener headers con Token fresco
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.warn("⚠️ No auth token found in localStorage!");
        return { 'Content-Type': 'application/json' };
    }

    // Decode to check expiration (Debug purpose)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expDate = new Date(payload.exp * 1000);
        console.log("🔑 Token Log:", {
            sub: payload.sub,
            rol: payload.rol,
            exp: expDate.toLocaleString(),
            isExpired: Date.now() >= payload.exp * 1000
        });

        if (Date.now() >= payload.exp * 1000) {
            console.error("⛔ TOKEN EXPIRED! This will cause 401.");
        }
    } catch (e) {
        console.error("⚠️ Could not parse token payload.", e);
    }

    // Ensure we don't double-add "Bearer " if the token already has it (some backends return it)
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    return {
        'Content-Type': 'application/json',
        'Authorization': authHeader
    };
};

export const getCursos = async () => {
    try {
        const response = await fetch(`${API_URL}/cursos`);
        if (!response.ok) throw new Error('Error al cargar cursos');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getPlanes = async () => {
    try {
        const response = await fetch(`${API_URL}/planes`);
        if (!response.ok) throw new Error('Error al cargar planes');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getDocentesHome = async () => {
    try {
        const response = await fetch(`${API_URL}/docentes/home`);
        if (!response.ok) throw new Error('Error al cargar docentes');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

// --- ADMIN SERVICES ---

// Obtener lista completa de docentes (Usando el endpoint que creamos)
export const getAllDocentes = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/docentes-list`, {
            method: 'GET',
            headers: getAuthHeaders() // Usamos el helper
        });
        if (!response.ok) throw new Error('Error al cargar docentes');
        return await response.json();
    } catch (error) {
        console.error("Error getAllDocentes:", error);
        return [];
    }
};

export const updateCurso = async (id, cursoData) => {
    const response = await fetch(`${API_URL}/admin/cursos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Token fresco
        body: JSON.stringify(cursoData)
    });
    if (!response.ok) throw new Error('Error al actualizar curso');
    return await response.json();
};

export const updatePlan = async (id, planData) => {
    const response = await fetch(`${API_URL}/admin/planes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData)
    });
    return await response.json();
};

export const asignarDocente = async (idCurso, idUsuario) => {
    const response = await fetch(`${API_URL}/admin/cursos/${idCurso}/asignar-docente/${idUsuario}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return response.ok;
};

// Obtener docentes con estado de asignación para un curso específico
export const getDocentesParaAsignacion = async (idCurso) => {
    try {
        const response = await fetch(`${API_URL}/admin/cursos/${idCurso}/docentes-asignacion`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar docentes para asignación');
        return await response.json();
    } catch (error) {
        console.error("Error getDocentesParaAsignacion:", error);
        return [];
    }
};

// Crear nuevo curso
export const createCurso = async (cursoData) => {
    const response = await fetch(`${API_URL}/admin/cursos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cursoData)
    });
    if (!response.ok) throw new Error('Error al crear el curso');
    return await response.json();
};

export const deleteCurso = async (id) => {
    const response = await fetch(`${API_URL}/admin/cursos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar curso');
    return true;
};