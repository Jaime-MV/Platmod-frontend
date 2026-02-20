import { API_URL } from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return {
        'Content-Type': 'application/json',
        'Authorization': authHeader
    };
};

export const getEstudianteLecciones = async (idCurso) => {
    try {
        const response = await fetch(`${API_URL}/estudiantes/contenido/cursos/${idCurso}/lecciones`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar lecciones del curso');
        return await response.json();
    } catch (error) {
        console.error("Error getEstudianteLecciones:", error);
        return [];
    }
};

export const getEstudianteModulos = async (idLeccion) => {
    try {
        const response = await fetch(`${API_URL}/estudiantes/contenido/lecciones/${idLeccion}/modulos`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar modulos de la leccion');
        return await response.json();
    } catch (error) {
        console.error("Error getEstudianteModulos:", error);
        return [];
    }
};
