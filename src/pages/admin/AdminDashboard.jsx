import { useState, useEffect } from 'react';
import { getCursos, getPlanes, updateCurso, updatePlan, asignarDocente, getAllDocentes } from '../../services/api';
import './AdminStyles.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('cursos');
  const [cursos, setCursos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA EL MODAL DE DOCENTES ---
  const [showDocenteModal, setShowDocenteModal] = useState(false);
  const [selectedCursoId, setSelectedCursoId] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // --- CARGA INICIAL ---
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

  // --- LOGICA CURSOS ---
  const handleToggleEstado = async (curso) => {
    // Usamos Boolean() para asegurar que trabajamos con true/false real
    const estadoActual = Boolean(curso.estado);
    const nuevoEstado = !estadoActual; 
    
    // Optimistic UI Update
    const cursosActualizados = cursos.map(c => 
        c.idCurso === curso.idCurso ? { ...c, estado: nuevoEstado } : c
    );
    setCursos(cursosActualizados);

    try {
      // Enviamos el objeto actualizado
      await updateCurso(curso.idCurso, { ...curso, estado: nuevoEstado });
    } catch (error) {
      alert("Error al actualizar en el servidor. Revirtiendo...");
      fetchData(); 
    }
  };

  // --- LOGICA MODAL DOCENTES ---
  const openAsignarModal = async (idCurso) => {
    setSelectedCursoId(idCurso);
    setShowDocenteModal(true);
    const dataDocentes = await getAllDocentes();
    setDocentes(dataDocentes);
  };

  const confirmarAsignacion = async (idDocente) => {
    try {
        await asignarDocente(selectedCursoId, idDocente);
        alert("¡Docente asignado correctamente!");
        setShowDocenteModal(false);
        setSearchTerm("");
    } catch (error) {
        alert("Error al asignar docente.");
    }
  };

  // Filtrado de docentes
  const docentesFiltrados = docentes.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Cargando panel de administración...</div>;

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>PlatMod Admin</h2>
        <button className={`sidebar-btn ${activeTab === 'cursos' ? 'active' : ''}`} onClick={() => setActiveTab('cursos')}>
            📚 Gestión de Cursos
        </button>
        <button className={`sidebar-btn ${activeTab === 'planes' ? 'active' : ''}`} onClick={() => setActiveTab('planes')}>
            💳 Planes y Precios
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="content">
        
        {/* TABLA DE CURSOS */}
        {activeTab === 'cursos' && (
          <div>
            <div className="section-header">
              <h1>Gestión de Cursos</h1>
              <button className="btn-primary">+ Nuevo Curso</button>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursos.map((curso) => {
                    // 👇👇👇 AQUÍ ESTÁ LA CORRECCIÓN CLAVE 👇👇👇
                    // Convertimos el 1 o 0 de la BD en true/false real para la vista
                    const isPublic = Boolean(curso.estado); 

                    return (
                    <tr key={curso.idCurso}>
                      <td>#{curso.idCurso}</td>
                      <td>{curso.titulo}</td>
                      <td>
                        <span className={`badge ${isPublic ? 'badge-active' : 'badge-hidden'}`}>
                          {isPublic ? 'Público' : 'Oculto'}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                            className="btn-icon" 
                            title="Asignar Docente"
                            onClick={() => openAsignarModal(curso.idCurso)}
                        >
                            👨‍🏫 Asignar
                        </button>

                        <button 
                            className="btn-icon" 
                            onClick={() => handleToggleEstado(curso)}
                            title={isPublic ? "Ocultar" : "Publicar"}
                        >
                            {isPublic ? '👁️‍🗨️' : '🔓'}
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA DE PLANES (Sin cambios) */}
        {activeTab === 'planes' && (
             // ... Puedes dejar tu código de planes anterior aquí ...
             // Para no alargar la respuesta, asumo que usas el mismo que ya tenías
             <div className="section-header">
                <h1>Planes y Precios</h1>
                {/* ... tu lógica de planes ... */}
             </div>
        )}
        
      </main>

      {/* MODAL DE SELECCIÓN DE DOCENTE (Sin cambios) */}
      {showDocenteModal && (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Seleccionar Docente</h3>
                    <button className="close-btn" onClick={() => setShowDocenteModal(false)}>×</button>
                </div>
                
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o correo..." 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="docentes-list">
                    {docentesFiltrados.length > 0 ? (
                        docentesFiltrados.map(docente => (
                            <div key={docente.idUsuario} className="docente-item">
                                <div className="docente-info">
                                    <span className="docente-name">{docente.nombre}</span>
                                    <span className="docente-email">{docente.correo}</span>
                                </div>
                                <div className="docente-status">
                                    <span className={`status-dot ${docente.estado ? 'online' : 'offline'}`}></span>
                                    <small>{docente.estado ? 'Activo' : 'Inactivo'}</small>
                                </div>
                                <button 
                                    className="btn-gold-sm"
                                    disabled={!docente.estado} 
                                    onClick={() => confirmarAsignacion(docente.idUsuario)}
                                >
                                    Seleccionar
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-results">No se encontraron docentes.</p>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;