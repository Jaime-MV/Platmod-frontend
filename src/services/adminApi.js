// src/services/adminApi.js
// Admin-only API calls — all require authentication
import { getAuthHeaders } from './api';
import { API_URL } from '../config';

// --- DOCENTES ---

export const getAllDocentes = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/docentes-list`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar docentes');
        return await response.json();
    } catch (error) {
        console.error("Error getAllDocentes:", error);
        return [];
    }
};

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

export const asignarDocente = async (idCurso, idUsuario) => {
    const response = await fetch(`${API_URL}/admin/cursos/${idCurso}/asignar-docente/${idUsuario}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return response.ok;
};

export const updateDocentesAsignacion = async (idCurso, docentesIds) => {
    const response = await fetch(`${API_URL}/admin/cursos/${idCurso}/asignaciones`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(docentesIds)
    });
    return response.ok;
};

// --- CURSOS (Admin) ---

export const updateCurso = async (id, cursoData) => {
    const response = await fetch(`${API_URL}/admin/cursos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cursoData)
    });
    if (!response.ok) throw new Error('Error al actualizar curso');
    return await response.json();
};

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

// --- PLANES (Admin) ---

export const createPlan = async (planData) => {
    const response = await fetch(`${API_URL}/admin/planes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(planData)
    });
    if (!response.ok) throw new Error('Error al crear plan');
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

export const addBeneficio = async (idPlan, descripcion) => {
    const response = await fetch(`${API_URL}/admin/planes/${idPlan}/beneficios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ descripcion })
    });
    return await response.json();
};

export const deleteBeneficio = async (idBeneficio) => {
    const response = await fetch(`${API_URL}/admin/planes/beneficios/${idBeneficio}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return response.ok;
};
