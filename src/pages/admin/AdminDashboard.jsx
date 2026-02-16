import { useState, useEffect } from 'react';
import { getCursos, getPlanes, updateCurso, updateDocentesAsignacion, getDocentesParaAsignacion, createCurso, deleteCurso } from '../../services/api';
import './AdminStyles.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('cursos');
  const [cursos, setCursos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);



  // --- ESTADOS PARA MODALES ---
  const [showDocenteModal, setShowDocenteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Modal eliminar

  // --- ESTADOS DE DATOS ---
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [docentes, setDocentes] = useState([]); // Mantener si se usa en otro lado, o eliminar
  const [availableDocentes, setAvailableDocentes] = useState([]);
  const [assignedDocentes, setAssignedDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- ESTADO PARA EL NUEVO CURSO ---
  const [newCurso, setNewCurso] = useState({
    titulo: '',
    descripcion: '',
    portadaUrl: '',
    estado: false
  });

  // --- ESTADO PARA ELIMINAR CURSO ---
  const [cursoToDelete, setCursoToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataCursos, dataPlanes] = await Promise.all([
        getCursos(),
        getPlanes()
      ]);
      setCursos(dataCursos);
      setPlanes(dataPlanes);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA CREAR CURSO ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCurso({
      ...newCurso,
      [name]: value
    });
  };

  const handleCreateCurso = async (e) => {
    e.preventDefault();
    if (!newCurso.titulo || !newCurso.descripcion) return alert("Llena los campos obligatorios");

    try {
      await createCurso(newCurso);
      alert("¡Curso creado exitosamente!");
      setShowCreateModal(false);
      setNewCurso({ titulo: '', descripcion: '', portadaUrl: '', estado: false });
      fetchData();
    } catch (error) {
      alert("Error al crear el curso");
    }
  };

  // --- LÓGICA ELIMINAR CURSO ---
  const handleDeleteClick = (curso) => {
    setCursoToDelete(curso);
    setDeleteConfirmationText("");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText !== cursoToDelete.titulo) {
      return alert("El nombre ingresado no coincide.");
    }

    try {
      await deleteCurso(cursoToDelete.idCurso);
      alert("Curso eliminado correctamente.");
      setShowDeleteModal(false);
      setCursoToDelete(null);
      fetchData();
    } catch (error) {
      alert("Error al eliminar el curso.");
    }
  };

  // --- LÓGICA EXISTENTE ---
  const handleToggleEstado = async (curso) => {
    const estadoActual = Boolean(curso.estado);
    const nuevoEstado = !estadoActual;

    const cursosActualizados = cursos.map(c =>
      c.idCurso === curso.idCurso ? { ...c, estado: nuevoEstado } : c
    );
    setCursos(cursosActualizados);

    try {
      await updateCurso(curso.idCurso, { ...curso, estado: nuevoEstado });
    } catch (error) {
      alert("Error al actualizar. Revirtiendo...");
      fetchData();
    }
  };

  const openAsignarModal = async (idCurso) => {
    setSelectedCursoId(idCurso);
    setShowDocenteModal(true);
    setSearchTerm("");

    // Obtener datos
    const allDocentes = await getDocentesParaAsignacion(idCurso);

    // Separar en dos listas
    setAvailableDocentes(allDocentes.filter(d => !d.asignado));
    setAssignedDocentes(allDocentes.filter(d => d.asignado));
  };

  // --- LÓGICA DRAG AND DROP ---
  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Helper para obtener la lista correcta según ID
    const getList = (id) => id === 'available' ? availableDocentes : assignedDocentes;

    let sourceList = Array.from(getList(source.droppableId));
    let destList = source.droppableId === destination.droppableId ? sourceList : Array.from(getList(destination.droppableId));

    const [movedItem] = sourceList.splice(source.index, 1);
    destList.splice(destination.index, 0, movedItem);

    if (source.droppableId === 'available') {
      setAvailableDocentes(sourceList);
      if (destination.droppableId === 'assigned') setAssignedDocentes(destList);
    } else {
      setAssignedDocentes(sourceList);
      if (destination.droppableId === 'available') setAvailableDocentes(destList);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const assignedIds = assignedDocentes.map(d => d.idUsuario);
      await updateDocentesAsignacion(selectedCursoId, assignedIds);
      alert("¡Asignaciones actualizadas correctamente!");
      setShowDocenteModal(false);
      fetchData();
    } catch (error) {
      alert("Error al guardar cambios.");
    }
  };

  // Filtro solo para la lista de disponibles (opcional)
  const availableFiltered = availableDocentes.filter(d =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando panel...</div>;

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <h2>PlatMod Admin</h2>
        <button className={`sidebar-btn ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
          📚 Gestión de Cursos
        </button>
        <button className={`sidebar-btn ${activeTab === 'planes' ? 'active' : ''}`} onClick={() => setActiveTab('planes')}>
          💳 Planes y Precios
        </button>
      </aside>

      <main className="content">
        {activeTab === 'cursos' && (
          <div>
            <div className="section-header">
              <h1>Gestión de Cursos</h1>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                + Nuevo Curso
              </button>
            </div>

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
                        <td>#{curso.idCurso}</td>
                        <td>{curso.titulo}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge-count">
                            {curso.numDocentes || 0} 👤
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${isPublic ? 'badge-active' : 'badge-hidden'}`}>
                            {isPublic ? 'Público' : 'Oculto'}
                          </span>
                        </td>
                        <td className="actions">
                          <button className="btn-icon" title="Asignar Docente" onClick={() => openAsignarModal(curso.idCurso)}>
                            👨‍🏫
                          </button>
                          <button className="btn-icon" onClick={() => handleToggleEstado(curso)} title={isPublic ? "Ocultar" : "Publicar"}>
                            {isPublic ? '👁️‍🗨️' : '🔓'}
                          </button>
                          <button className="btn-icon btn-delete" title="Eliminar Curso" onClick={() => handleDeleteClick(curso)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA DE PLANES (Solo placeholder, tu código original iría aquí) */}
        {activeTab === 'planes' && (
          <div className="section-header"><h1>Gestión de Planes</h1></div>
        )}
      </main>

      {/* --- MODAL 1: CREAR CURSO --- */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Crear Nuevo Curso</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCurso} className="modal-form">
              <div className="form-group">
                <label>Título del Curso</label>
                <input type="text" name="titulo" className="form-input" value={newCurso.titulo} onChange={handleInputChange} placeholder="Ej. Curso de React Avanzado" required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" className="form-input" value={newCurso.descripcion} onChange={handleInputChange} placeholder="Breve descripción..." rows="3" required />
              </div>
              <div className="form-group">
                <label>URL de Portada</label>
                <input type="text" name="portadaUrl" className="form-input" value={newCurso.portadaUrl} onChange={handleInputChange} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Visibilidad Inicial</label>
                <select name="estado" className="form-input" value={newCurso.estado} onChange={(e) => setNewCurso({ ...newCurso, estado: e.target.value === 'true' })}>
                  <option value="false">🔒 Oculto (Borrador)</option>
                  <option value="true">🌍 Público (Visible)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar Curso</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ASIGNAR DOCENTE (DRAG AND DROP) --- */}
      {showDocenteModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3>Gestionar Docentes</h3>
              <button className="close-btn" onClick={() => setShowDocenteModal(false)}>×</button>
            </div>

            <p className="modal-subtitle">Arrastra los docentes para asignarlos al curso.</p>

            <DragDropContext onDragEnd={onDragEnd}>
              <div className="dnd-container">
                {/* COLUMNA DISPONIBLES */}
                <div className="dnd-column">
                  <h4>Disponibles</h4>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="search-input-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Droppable droppableId="available">
                    {(provided) => (
                      <div
                        className="dnd-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {availableFiltered.map((docente, index) => (
                          <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                            {(provided) => (
                              <div
                                className="dnd-item"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="docente-info">
                                  <span className="docente-name">{docente.nombre}</span>
                                  <small style={{ color: '#f59e0b' }}>{docente.especialidad}</small>
                                </div>
                                <span className="drag-handle">::::</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* COLUMNA ASIGNADOS */}
                <div className="dnd-column">
                  <h4>Asignados</h4>
                  <Droppable droppableId="assigned">
                    {(provided) => (
                      <div
                        className="dnd-list assigned-list"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {assignedDocentes.map((docente, index) => (
                          <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                            {(provided) => (
                              <div
                                className="dnd-item"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="docente-info">
                                  <span className="docente-name">{docente.nombre}</span>
                                  <small style={{ color: '#f59e0b' }}>{docente.especialidad}</small>
                                </div>
                                <span>✅</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDocenteModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={handleSaveChanges}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ELIMINAR CURSO --- */}
      {showDeleteModal && cursoToDelete && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>⚠️ Eliminar Curso</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>

            <div className="delete-warning">
              <p>Estás a punto de eliminar: <strong>{cursoToDelete.titulo}</strong></p>
              <p>Esta acción es irreversible.</p>
            </div>

            <div className="form-group">
              <label>Escribe <strong>{cursoToDelete.titulo}</strong> para confirmar:</label>
              <input type="text" className="form-input delete-input" value={deleteConfirmationText} onChange={(e) => setDeleteConfirmationText(e.target.value)} placeholder="Nombre del curso" />
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={deleteConfirmationText !== cursoToDelete.titulo}>Eliminar Definitivamente</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;