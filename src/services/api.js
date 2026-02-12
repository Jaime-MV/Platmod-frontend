// src/services/api.js
import { API_URL } from '../config'; // Asegúrate de tener tu URL base (http://localhost:8080/api)

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