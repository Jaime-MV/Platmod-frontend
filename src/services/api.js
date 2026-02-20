// Eliminar plan de suscripción
export const eliminarPlan = async (idPlan) => {
    const response = await fetch(`${API_URL}/admin/planes/${idPlan}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar plan');
    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
};

// CRUD DOCENTES (ajustado a la especificación)
// Crear docente
export const crearDocente = async ({ nombre, correo, contrasena, especialidad }) => {
    const body = { nombre, correo, contrasena };
    if (especialidad) body.especialidad = especialidad;
    const response = await fetch(`${API_URL}/admin/docentes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Error al crear docente');
    return await response.json();
};

// Editar docente (solo enviar campos a cambiar)
export const editarDocente = async (idDocente, data) => {
    const body = {};
    if (data.nombre) body.nombre = data.nombre;
    if (data.correo) body.correo = data.correo;
    if (data.contrasena) body.contrasena = data.contrasena;
    if (data.especialidad) body.especialidad = data.especialidad;
    if (data.estadoDocente !== undefined) body.estadoDocente = data.estadoDocente;
    const response = await fetch(`${API_URL}/admin/docentes/${idDocente}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error('Error al editar docente');
    return await response.json();
};

// Eliminar docente (soft delete)
export const eliminarDocente = async (idDocente) => {
    const response = await fetch(`${API_URL}/admin/docentes/${idDocente}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar docente');
    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
};
// Elimina una respuesta — solo el autor puede hacerlo
export const eliminarRespuesta = async (idRespuesta) => {
    const response = await fetch(`${API_URL}/foro/respuestas/${idRespuesta}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar respuesta');
    // Si la respuesta está vacía, no intentes parsear JSON
    const text = await response.text();
    if (!text) return {};
    return JSON.parse(text);
};
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
        const response = await fetch(`${API_URL}/admin/docentes`, {
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

export const updateCurso = async (id, cursoData) => {
    const response = await fetch(`${API_URL}/admin/cursos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Token fresco
        body: JSON.stringify(cursoData)
    });
    if (!response.ok) throw new Error('Error al actualizar curso');
    return await response.json();
};

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

// Actualizar asignaciones masivamente (Drag & Drop)
export const updateDocentesAsignacion = async (idCurso, docentesIds) => {
    const response = await fetch(`${API_URL}/admin/cursos/${idCurso}/asignaciones`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(docentesIds)
    });
    return response.ok;
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

// --- FORO SERVICES ---

export const getPreguntas = async () => {
    try {
        const response = await fetch(`${API_URL}/foro/preguntas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar preguntas del foro');
        return await response.json();
    } catch (error) {
        console.error("Error getPreguntas:", error);
        return [];
    }
};

export const getPregunta = async (id) => {
    try {
        const response = await fetch(`${API_URL}/foro/preguntas/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar pregunta');
        return await response.json();
    } catch (error) {
        console.error("Error getPregunta:", error);
        return null;
    }
};

export const crearPregunta = async (data) => {
    const response = await fetch(`${API_URL}/foro/preguntas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear pregunta');
    return await response.json();
};

// Listar respuestas — ahora devuelve archivoUrl + archivoNombre en cada item (si el backend lo provee)
export const getRespuestas = async (idPregunta) => {
    try {
        const response = await fetch(`${API_URL}/foro/preguntas/${idPregunta}/respuestas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar respuestas');
        // Se espera que cada respuesta tenga archivoUrl y archivoNombre si existen
        return await response.json();
    } catch (error) {
        console.error("Error getRespuestas:", error);
        return [];
    }
};

// Crear respuesta — ahora enviar archivoUrl + archivoNombre en el body si corresponde
export const crearRespuesta = async (idPregunta, data) => {
    // data debe incluir: { texto, archivoUrl, archivoNombre }
    const response = await fetch(`${API_URL}/foro/preguntas/${idPregunta}/respuestas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear respuesta');
    return await response.json();
};

export const getMisPreguntas = async () => {
    try {
        const response = await fetch(`${API_URL}/foro/mis-preguntas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar mis preguntas');
        return await response.json();
    } catch (error) {
        console.error("Error getMisPreguntas:", error);
        return [];
    }
};

export const getFavoritos = async () => {
    try {
        const response = await fetch(`${API_URL}/foro/favoritos`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar favoritos');
        return await response.json();
    } catch (error) {
        console.error("Error getFavoritos:", error);
        return [];
    }
};

export const toggleFavorito = async (idPregunta) => {
    const response = await fetch(`${API_URL}/foro/favoritos/${idPregunta}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cambiar favorito');
    return await response.json();
};

export const eliminarPregunta = async (id) => {
    const response = await fetch(`${API_URL}/foro/preguntas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al eliminar pregunta');
    }
    return true;
};