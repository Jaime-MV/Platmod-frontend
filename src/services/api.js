// src/services/api.js
import { API_URL } from '../config'; 

// Función auxiliar para obtener headers con Token fresco
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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