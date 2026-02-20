import { useState, useEffect } from 'react';
import { getCursos } from '../../services/api';
import { updateCurso, createCurso, deleteCurso, getDocentesParaAsignacion, updateDocentesAsignacion } from '../../services/adminApi';
import CreateCursoModal from './modals/CreateCursoModal';
import DeleteCursoModal from './modals/DeleteCursoModal';
import AsignarDocentesModal from './modals/AsignarDocentesModal';

const AdminCursos = () => {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDocenteModal, setShowDocenteModal] = useState(false);

    // Data for modals
    const [cursoToDelete, setCursoToDelete] = useState(null);
    const [selectedCursoId, setSelectedCursoId] = useState(null);
    const [availableDocentes, setAvailableDocentes] = useState([]);
    const [assignedDocentes, setAssignedDocentes] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getCursos();
            setCursos(data);
        } catch (err) {
            console.error('Error cargando cursos:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- TOGGLE ESTADO ---
    const handleToggleEstado = async (curso) => {
        const nuevoEstado = !Boolean(curso.estado);
        setCursos(prev => prev.map(c =>
            c.idCurso === curso.idCurso ? { ...c, estado: nuevoEstado } : c
        ));
        try {
            await updateCurso(curso.idCurso, { ...curso, estado: nuevoEstado });
        } catch {
            alert('Error al actualizar.');
            fetchData();
        }
    };

    // --- CREAR ---
    const handleCreated = async (newCurso) => {
        try {
            await createCurso(newCurso);
            alert('¡Curso creado exitosamente!');
            setShowCreateModal(false);
            fetchData();
        } catch {
            alert('Error al crear el curso');
        }
    };

    // --- ELIMINAR ---
    const handleDeleteClick = (curso) => {
        setCursoToDelete(curso);
        setShowDeleteModal(true);
    };

    const handleDeleted = async (idCurso) => {
        try {
            await deleteCurso(idCurso);
            alert('Curso eliminado correctamente.');
            setShowDeleteModal(false);
            setCursoToDelete(null);
            fetchData();
        } catch {
            alert('Error al eliminar el curso.');
        }
    };

    // --- ASIGNAR DOCENTES ---
    const openAsignarModal = async (idCurso) => {
        setSelectedCursoId(idCurso);
        const all = await getDocentesParaAsignacion(idCurso);
        setAvailableDocentes(all.filter(d => !d.asignado));
        setAssignedDocentes(all.filter(d => d.asignado));
        setShowDocenteModal(true);
    };

    const handleSaveDocentes = async (docenteIds) => {
        try {
            await updateDocentesAsignacion(selectedCursoId, docenteIds);
            alert('¡Asignaciones actualizadas!');
            setShowDocenteModal(false);
            fetchData();
        } catch {
            alert('Error al guardar cambios.');
        }
    };

    if (loading) return <div className="loading">Cargando cursos...</div>;

    return (
        <div>
            {/* Header */}
            <div className="section-header">
                <h1>Gestión de Cursos</h1>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Nuevo Curso
                </button>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Docentes</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cursos.map((curso) => {
                            const isPublic = Boolean(curso.estado);
                            return (
                                <tr key={curso.idCurso}>
                                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                        #{curso.idCurso}
                                    </td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {curso.titulo}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="badge-count">{curso.numDocentes || 0} 👤</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${isPublic ? 'badge-active' : 'badge-hidden'}`}>
                                            {isPublic ? 'Público' : 'Oculto'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-icon" title="Asignar Docente" onClick={() => openAsignarModal(curso.idCurso)}>👨‍🏫</button>
                                        <button className="btn-icon" title={isPublic ? 'Ocultar' : 'Publicar'} onClick={() => handleToggleEstado(curso)}>
                                            {isPublic ? '👁️‍🗨️' : '🔓'}
                                        </button>
                                        <button className="btn-icon btn-delete" title="Eliminar" onClick={() => handleDeleteClick(curso)}>🗑️</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <CreateCursoModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={handleCreated}
            />

            <DeleteCursoModal
                visible={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setCursoToDelete(null); }}
                curso={cursoToDelete}
                onDeleted={handleDeleted}
            />

            <AsignarDocentesModal
                visible={showDocenteModal}
                onClose={() => setShowDocenteModal(false)}
                onSave={handleSaveDocentes}
                availableDocentes={availableDocentes}
                assignedDocentes={assignedDocentes}
            />
        </div>
    );
};

export default AdminCursos;
