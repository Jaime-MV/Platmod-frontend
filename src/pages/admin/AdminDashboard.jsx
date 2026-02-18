import { useState, useEffect } from 'react';
import { getCursos, updateCurso, updateDocentesAsignacion, getDocentesParaAsignacion, createCurso, deleteCurso } from '../../services/api';
import './AdminStyles.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AdminPlanes from './AdminPlanes';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('cursos');
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- TEMA ---
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // --- MODALES ---
  const [showDocenteModal, setShowDocenteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- DATOS ---
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [availableDocentes, setAvailableDocentes] = useState([]);
  const [assignedDocentes, setAssignedDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [newCurso, setNewCurso] = useState({ titulo: '', descripcion: '', portadaUrl: '', estado: false });
  const [cursoToDelete, setCursoToDelete] = useState(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCursos();
      setCursos(data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCurso({ ...newCurso, [name]: value });
  };

  const handleCreateCurso = async (e) => {
    e.preventDefault();
    if (!newCurso.titulo || !newCurso.descripcion) return alert('Llena los campos obligatorios');
    try {
      await createCurso(newCurso);
      alert('¡Curso creado exitosamente!');
      setShowCreateModal(false);
      setNewCurso({ titulo: '', descripcion: '', portadaUrl: '', estado: false });
      fetchData();
    } catch {
      alert('Error al crear el curso');
    }
  };

  const handleDeleteClick = (curso) => {
    setCursoToDelete(curso);
    setDeleteConfirmationText('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmationText !== cursoToDelete.titulo) return alert('El nombre no coincide.');
    try {
      await deleteCurso(cursoToDelete.idCurso);
      alert('Curso eliminado correctamente.');
      setShowDeleteModal(false);
      setCursoToDelete(null);
      fetchData();
    } catch {
      alert('Error al eliminar el curso.');
    }
  };

  const handleToggleEstado = async (curso) => {
    const nuevoEstado = !Boolean(curso.estado);
    setCursos(cursos.map(c => c.idCurso === curso.idCurso ? { ...c, estado: nuevoEstado } : c));
    try {
      await updateCurso(curso.idCurso, { ...curso, estado: nuevoEstado });
    } catch {
      alert('Error al actualizar.');
      fetchData();
    }
  };

  const openAsignarModal = async (idCurso) => {
    setSelectedCursoId(idCurso);
    setSearchTerm('');
    const all = await getDocentesParaAsignacion(idCurso);
    setAvailableDocentes(all.filter(d => !d.asignado));
    setAssignedDocentes(all.filter(d => d.asignado));
    setShowDocenteModal(true);
  };

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const getList = (id) => id === 'available' ? availableDocentes : assignedDocentes;
    let src = Array.from(getList(source.droppableId));
    let dst = source.droppableId === destination.droppableId ? src : Array.from(getList(destination.droppableId));

    const [moved] = src.splice(source.index, 1);
    dst.splice(destination.index, 0, moved);

    if (source.droppableId === 'available') {
      setAvailableDocentes(src);
      if (destination.droppableId === 'assigned') setAssignedDocentes(dst);
    } else {
      setAssignedDocentes(src);
      if (destination.droppableId === 'available') setAvailableDocentes(dst);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await updateDocentesAsignacion(selectedCursoId, assignedDocentes.map(d => d.idUsuario));
      alert('¡Asignaciones actualizadas!');
      setShowDocenteModal(false);
      fetchData();
    } catch {
      alert('Error al guardar cambios.');
    }
  };

  const availableFiltered = availableDocentes.filter(d =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estilos inline para mostrar/ocultar modales sin desmontarlos
  const overlayStyle = (visible) => ({
    position: 'fixed',
    inset: 0,
    background: visible ? 'rgba(0,0,0,0.5)' : 'transparent',
    backdropFilter: visible ? 'blur(4px)' : 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: visible ? 9999 : -1,
    padding: '20px',
    pointerEvents: visible ? 'all' : 'none',
    visibility: visible ? 'visible' : 'hidden',
  });

  if (loading) return <div className="loading">Cargando panel...</div>;

  return (
    <div className="admin-container">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <h2>PlatMod Admin</h2>

        <button
          className={`sidebar-btn ${activeTab === 'cursos' ? 'active' : ''}`}
          onClick={() => setActiveTab('cursos')}
        >
          📚 Gestión de Cursos
        </button>

        <button
          className={`sidebar-btn ${activeTab === 'planes' ? 'active' : ''}`}
          onClick={() => setActiveTab('planes')}
        >
          💳 Planes y Precios
        </button>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
        </button>
      </aside>

      {/* ===== CONTENT ===== */}
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
                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>#{curso.idCurso}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{curso.titulo}</td>
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
          </div>
        )}

        {activeTab === 'planes' && <AdminPlanes />}

      </main>

      {/* ===== MODAL: CREAR CURSO ===== */}
      <div style={overlayStyle(showCreateModal)}>
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
              <textarea name="descripcion" className="form-input" value={newCurso.descripcion} onChange={handleInputChange} placeholder="Breve descripción..." rows="3" required style={{ resize: 'vertical' }} />
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

      {/* ===== MODAL: ASIGNAR DOCENTES ===== */}
      <div style={overlayStyle(showDocenteModal)}>
        <div className="modal-content modal-lg">
          <div className="modal-header">
            <h3>Gestionar Docentes</h3>
            <button className="close-btn" onClick={() => setShowDocenteModal(false)}>×</button>
          </div>
          <p className="modal-subtitle">Arrastra los docentes para asignarlos al curso.</p>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="dnd-container">
              <div className="dnd-column">
                <h4>Disponibles</h4>
                <input type="text" placeholder="Buscar docente..." className="search-input-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Droppable droppableId="available">
                  {(provided) => (
                    <div className="dnd-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {availableFiltered.map((docente, index) => (
                        <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                          {(provided) => (
                            <div className="dnd-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <div className="docente-info">
                                <span className="docente-name">{docente.nombre}</span>
                                <small style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{docente.especialidad}</small>
                              </div>
                              <span className="drag-handle">⠿</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              <div className="dnd-column">
                <h4>Asignados al Curso</h4>
                <Droppable droppableId="assigned">
                  {(provided) => (
                    <div className="dnd-list assigned-list" {...provided.droppableProps} ref={provided.innerRef}>
                      {assignedDocentes.map((docente, index) => (
                        <Draggable key={docente.idUsuario} draggableId={String(docente.idUsuario)} index={index}>
                          {(provided) => (
                            <div className="dnd-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <div className="docente-info">
                                <span className="docente-name">{docente.nombre}</span>
                                <small style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{docente.especialidad}</small>
                              </div>
                              <span style={{ fontSize: '0.85rem' }}>✅</span>
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

      {/* ===== MODAL: ELIMINAR CURSO ===== */}
      <div style={overlayStyle(showDeleteModal)}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 style={{ color: 'var(--red)' }}>⚠️ Eliminar Curso</h3>
            <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
          </div>
          {cursoToDelete && (
            <>
              <div className="delete-warning">
                <p>Estás a punto de eliminar: <strong>{cursoToDelete.titulo}</strong></p>
                <p style={{ marginTop: 6 }}>Esta acción es <strong>irreversible</strong>.</p>
              </div>
              <div className="form-group">
                <label>Escribe <strong style={{ color: 'var(--text-primary)' }}>{cursoToDelete.titulo}</strong> para confirmar:</label>
                <input
                  type="text"
                  className="form-input delete-input"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Nombre del curso"
                  style={{ marginTop: 8 }}
                />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-danger" onClick={confirmDelete} disabled={deleteConfirmationText !== cursoToDelete.titulo}>
                  Eliminar Definitivamente
                </button>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
