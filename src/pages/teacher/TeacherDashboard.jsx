import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
    getDocenteCursos,
    getDocenteLecciones, crearLeccion, editarLeccion, eliminarLeccion,
    getModulos, crearModulo, editarModulo, eliminarModulo, reordenarModulos
} from '../../services/api';
import { uploadDocenteFile } from '../../services/supabase';
import {
    Home, BookOpen, Layers, User, LogOut, Sun, Moon,
    Plus, Edit3, Trash2, X, Send, GripVertical,
    ChevronRight, FileText, Upload
} from 'lucide-react';
import './TeacherStyles.css';

const TeacherDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    // Navigation state
    const [vista, setVista] = useState('cursos'); // cursos | lecciones | modulos
    const [cursoActual, setCursoActual] = useState(null);
    const [leccionActual, setLeccionActual] = useState(null);

    // Data
    const [cursos, setCursos] = useState([]);
    const [lecciones, setLecciones] = useState([]);
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('crear'); // crear | editar
    const [modalTarget, setModalTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form fields - Lección
    const [formTitulo, setFormTitulo] = useState('');
    const [formPortadaUrl, setFormPortadaUrl] = useState('');
    const [formPortadaMode, setFormPortadaMode] = useState('url');
    const [portadaFile, setPortadaFile] = useState(null);
    const [portadaPreview, setPortadaPreview] = useState('');
    const [uploadingPortada, setUploadingPortada] = useState(false);
    const portadaInputRef = useRef(null);

    // Form fields - Módulo
    const [formTituloSeccion, setFormTituloSeccion] = useState('');
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formUrlRecurso, setFormUrlRecurso] = useState('');
    const [formRecursoMode, setFormRecursoMode] = useState('url');
    const [recursoFile, setRecursoFile] = useState(null);
    const [recursoPreview, setRecursoPreview] = useState('');
    const [uploadingRecurso, setUploadingRecurso] = useState(false);
    const recursoInputRef = useRef(null);
    const [formOrden, setFormOrden] = useState('');

    // Drag & Drop
    const [draggedIdx, setDraggedIdx] = useState(null);

    // ============ DATA LOADING ============
    const fetchCursos = useCallback(async () => {
        setLoading(true);
        const data = await getDocenteCursos();
        setCursos(data);
        setLoading(false);
    }, []);

    const fetchLecciones = useCallback(async (idCurso) => {
        setLoading(true);
        const data = await getDocenteLecciones(idCurso);
        setLecciones(data);
        setLoading(false);
    }, []);

    const fetchModulos = useCallback(async (idLeccion) => {
        setLoading(true);
        const data = await getModulos(idLeccion);
        setModulos(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCursos(); }, [fetchCursos]);

    // ============ NAVIGATION ============
    const navigateToCursos = () => {
        setVista('cursos');
        setCursoActual(null);
        setLeccionActual(null);
        fetchCursos();
    };

    const navigateToLecciones = (curso) => {
        setCursoActual(curso);
        setVista('lecciones');
        fetchLecciones(curso.idCurso);
    };

    const navigateToModulos = (leccion) => {
        setLeccionActual(leccion);
        setVista('modulos');
        fetchModulos(leccion.idLeccion);
    };

    // ============ MODAL HELPERS ============
    const resetForm = () => {
        setFormTitulo(''); setFormPortadaUrl(''); setFormPortadaMode('url');
        setPortadaFile(null); setPortadaPreview('');
        setFormTituloSeccion(''); setFormDescripcion('');
        setFormUrlRecurso(''); setFormRecursoMode('url');
        setRecursoFile(null); setRecursoPreview('');
        setFormOrden('');
    };

    const openCreateModal = () => {
        setModalMode('crear'); setModalTarget(null); resetForm(); setShowModal(true);
    };

    const openEditLeccionModal = (leccion) => {
        setModalMode('editar'); setModalTarget(leccion);
        setFormTitulo(leccion.titulo || '');
        setFormPortadaUrl(leccion.portadaUrl || '');
        setFormPortadaMode('url');
        setPortadaFile(null); setPortadaPreview(leccion.portadaUrl || '');
        setShowModal(true);
    };

    const openEditModuloModal = (modulo) => {
        setModalMode('editar'); setModalTarget(modulo);
        setFormTituloSeccion(modulo.tituloSeccion || '');
        setFormDescripcion(modulo.descripcion || '');
        setFormUrlRecurso(modulo.urlRecurso || '');
        setFormRecursoMode('url');
        setRecursoFile(null); setRecursoPreview('');
        setFormOrden(modulo.orden?.toString() || '');
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setModalTarget(null); resetForm(); };

    // ============ FILE HANDLING ============
    const handlePortadaFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Solo se permiten imágenes PNG, JPG, JPEG o WEBP');
            return;
        }
        setPortadaFile(file);
        setPortadaPreview(URL.createObjectURL(file));
    };

    const handleRecursoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRecursoFile(file);
        if (file.type.startsWith('image/')) {
            setRecursoPreview(URL.createObjectURL(file));
        } else {
            setRecursoPreview('');
        }
    };

    // ============ CRUD: LECCIONES ============
    const handleSubmitLeccion = async (e) => {
        e.preventDefault();
        if (!formTitulo.trim()) return;
        setSubmitting(true);
        try {
            let finalPortadaUrl = formPortadaUrl.trim() || null;
            if (portadaFile) {
                setUploadingPortada(true);
                const result = await uploadDocenteFile(portadaFile);
                finalPortadaUrl = result.url;
                setUploadingPortada(false);
            }
            const data = { titulo: formTitulo.trim() };
            if (finalPortadaUrl) data.portadaUrl = finalPortadaUrl;
            if (modalMode === 'crear') {
                await crearLeccion(cursoActual.idCurso, data);
            } else {
                await editarLeccion(modalTarget.idLeccion, data);
            }
            closeModal();
            fetchLecciones(cursoActual.idCurso);
        } catch (err) {
            console.error('Error lección:', err);
            alert(err.message);
            setUploadingPortada(false);
        }
        setSubmitting(false);
    };

    const handleDeleteLeccion = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await eliminarLeccion(deleteTarget.idLeccion);
            setDeleteTarget(null);
            fetchLecciones(cursoActual.idCurso);
        } catch (err) { console.error(err); alert(err.message); }
        setDeleting(false);
    };

    // ============ CRUD: MÓDULOS ============
    const handleSubmitModulo = async (e) => {
        e.preventDefault();
        if (!formTituloSeccion.trim()) return;
        setSubmitting(true);
        try {
            let finalUrlRecurso = formUrlRecurso.trim() || null;
            if (recursoFile) {
                setUploadingRecurso(true);
                const result = await uploadDocenteFile(recursoFile);
                finalUrlRecurso = result.url;
                setUploadingRecurso(false);
            }
            const data = { tituloSeccion: formTituloSeccion.trim() };
            if (formDescripcion.trim()) data.descripcion = formDescripcion.trim();
            if (finalUrlRecurso) data.urlRecurso = finalUrlRecurso;
            if (formOrden) data.orden = parseInt(formOrden);
            if (modalMode === 'crear') {
                await crearModulo(leccionActual.idLeccion, data);
            } else {
                await editarModulo(modalTarget.idModulo, data);
            }
            closeModal();
            fetchModulos(leccionActual.idLeccion);
        } catch (err) {
            console.error('Error módulo:', err);
            alert(err.message);
            setUploadingRecurso(false);
        }
        setSubmitting(false);
    };

    const handleDeleteModulo = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await eliminarModulo(deleteTarget.idModulo);
            setDeleteTarget(null);
            fetchModulos(leccionActual.idLeccion);
        } catch (err) { console.error(err); alert(err.message); }
        setDeleting(false);
    };

    // ============ DRAG & DROP ============
    const handleDragStart = (idx) => setDraggedIdx(idx);
    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === idx) return;
        const reordered = [...modulos];
        const [moved] = reordered.splice(draggedIdx, 1);
        reordered.splice(idx, 0, moved);
        setModulos(reordered);
        setDraggedIdx(idx);
    };
    const handleDragEnd = async () => {
        setDraggedIdx(null);
        const ordenData = modulos.map((m, i) => ({ idModulo: m.idModulo, orden: i + 1 }));
        try { await reordenarModulos(leccionActual.idLeccion, ordenData); }
        catch (err) { console.error(err); fetchModulos(leccionActual.idLeccion); }
    };

    // ============ RENDER: BREADCRUMB ============
    const renderBreadcrumb = () => (
        <div className="tc-breadcrumb">
            <button className={`tc-crumb ${vista === 'cursos' ? 'active' : ''}`} onClick={navigateToCursos}>
                Mis Cursos
            </button>
            {cursoActual && (
                <>
                    <ChevronRight size={14} className="tc-crumb-sep" />
                    <button className={`tc-crumb ${vista === 'lecciones' ? 'active' : ''}`}
                        onClick={() => { setVista('lecciones'); setLeccionActual(null); fetchLecciones(cursoActual.idCurso); }}>
                        {cursoActual.titulo?.length > 30 ? cursoActual.titulo.slice(0, 30) + '…' : cursoActual.titulo}
                    </button>
                </>
            )}
            {leccionActual && (
                <>
                    <ChevronRight size={14} className="tc-crumb-sep" />
                    <span className="tc-crumb active">
                        {leccionActual.titulo?.length > 30 ? leccionActual.titulo.slice(0, 30) + '…' : leccionActual.titulo}
                    </span>
                </>
            )}
        </div>
    );

    // ============ RENDER: CURSOS ============
    const renderCursos = () => (
        <div className="tc-section">
            <div className="tc-section-header">
                <div>
                    <h1 className="tc-page-title">Mis Cursos Asignados</h1>
                    <p className="tc-page-sub">Gestiona las lecciones y módulos de tus cursos</p>
                </div>
            </div>
            {loading ? (
                <div className="tc-loading"><div className="tc-spinner" /><p>Cargando cursos...</p></div>
            ) : cursos.length === 0 ? (
                <div className="tc-empty">
                    <BookOpen size={48} strokeWidth={1} />
                    <h3>Sin cursos asignados</h3>
                    <p>Aún no tienes cursos asignados. Contacta al administrador.</p>
                </div>
            ) : (
                <div className="tc-grid">
                    {cursos.map(curso => (
                        <div key={curso.idCurso} className="tc-curso-card" onClick={() => navigateToLecciones(curso)}>
                            {curso.portadaUrl && (
                                <div className="tc-curso-img" style={{ backgroundImage: `url(${curso.portadaUrl})` }} />
                            )}
                            <div className="tc-curso-body">
                                <h3>{curso.titulo}</h3>
                                <p className="tc-curso-desc">{curso.descripcion?.slice(0, 100) || 'Sin descripción'}</p>
                                <div className="tc-curso-footer">
                                    <span className="tc-curso-count">{curso.totalLecciones || 0} lecciones</span>
                                    <div className="tc-curso-action">
                                        <span>Gestionar</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ============ RENDER: LECCIONES ============
    const renderLecciones = () => (
        <div className="tc-section">
            <div className="tc-section-header">
                <div>
                    <h1 className="tc-page-title">Lecciones</h1>
                    <p className="tc-page-sub">Curso: {cursoActual?.titulo}</p>
                </div>
                <button className="tc-add-btn" onClick={openCreateModal}>
                    <Plus size={18} /><span>Nueva Lección</span>
                </button>
            </div>
            {loading ? (
                <div className="tc-loading"><div className="tc-spinner" /><p>Cargando lecciones...</p></div>
            ) : lecciones.length === 0 ? (
                <div className="tc-empty">
                    <BookOpen size={48} strokeWidth={1} />
                    <h3>Sin lecciones</h3>
                    <p>Crea la primera lección para este curso.</p>
                </div>
            ) : (
                <div className="tc-grid">
                    {lecciones.map(leccion => (
                        <div key={leccion.idLeccion} className="tc-leccion-card">
                            {/* Clickable image/header area */}
                            <div className="tc-leccion-img-wrap" onClick={() => navigateToModulos(leccion)}>
                                {leccion.portadaUrl ? (
                                    <div className="tc-curso-img" style={{ backgroundImage: `url(${leccion.portadaUrl})` }} />
                                ) : (
                                    <div className="tc-leccion-img-placeholder">
                                        <BookOpen size={36} strokeWidth={1.2} />
                                    </div>
                                )}
                                {/* Action buttons — positioned top-right over the image */}
                                <div className="tc-leccion-card-actions" onClick={e => e.stopPropagation()}>
                                    <button
                                        className="tc-card-edit-btn"
                                        onClick={() => openEditLeccionModal(leccion)}
                                        title="Editar"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        className="tc-card-delete-btn"
                                        onClick={() => setDeleteTarget(leccion)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            {/* Clickable body */}
                            <div className="tc-curso-body" onClick={() => navigateToModulos(leccion)} style={{ cursor: 'pointer' }}>
                                <h3>{leccion.titulo}</h3>
                                <div className="tc-curso-footer">
                                    <span className="tc-curso-count">{leccion.totalModulos || 0} módulos</span>
                                    <div className="tc-curso-action">
                                        <span>Ver módulos</span>
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ============ RENDER: MÓDULOS ============
    const renderModulos = () => (
        <div className="tc-section">
            <div className="tc-section-header">
                <div>
                    <h1 className="tc-page-title">Módulos</h1>
                    <p className="tc-page-sub">Lección: {leccionActual?.titulo}</p>
                </div>
                <button className="tc-add-btn" onClick={openCreateModal}>
                    <Plus size={18} /><span>Nuevo Módulo</span>
                </button>
            </div>
            {loading ? (
                <div className="tc-loading"><div className="tc-spinner" /><p>Cargando módulos...</p></div>
            ) : modulos.length === 0 ? (
                <div className="tc-empty">
                    <Layers size={48} strokeWidth={1} />
                    <h3>Sin módulos</h3>
                    <p>Agrega el primer módulo a esta lección.</p>
                </div>
            ) : (
                <div className="tc-list">
                    <p className="tc-drag-hint">↕ Arrastra para reordenar los módulos</p>
                    {modulos.map((modulo, idx) => (
                        <div
                            key={modulo.idModulo}
                            className={`tc-item-card tc-draggable ${draggedIdx === idx ? 'dragging' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="tc-item-main">
                                <GripVertical size={18} className="tc-grip" />
                                <span className="tc-orden-badge">{modulo.orden ?? idx + 1}</span>
                                <FileText size={18} className="tc-item-icon" />
                                <div className="tc-item-info">
                                    <h4>{modulo.tituloSeccion}</h4>
                                    {modulo.descripcion && <p className="tc-modulo-desc">{modulo.descripcion.slice(0, 120)}{modulo.descripcion.length > 120 ? '…' : ''}</p>}
                                    <div className="tc-modulo-meta">
                                        {modulo.urlRecurso && (
                                            <a href={modulo.urlRecurso} target="_blank" rel="noopener noreferrer" className="tc-resource-link" onClick={e => e.stopPropagation()}>
                                                Ver recurso
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="tc-item-actions">
                                <button className="tc-edit-btn" onClick={() => openEditModuloModal(modulo)} title="Editar"><Edit3 size={16} /></button>
                                <button className="tc-delete-btn" onClick={() => setDeleteTarget(modulo)} title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ============ FILE INPUT COMPONENT ============
    const FileOrUrlInput = ({ file, onFileChange, inputRef, preview, uploading, accept, label }) => (
        <div className="tc-form-group">
            <label>{label}</label>
            <div className="tc-upload-area" onClick={() => inputRef.current?.click()}>
                <input type="file" ref={inputRef} accept={accept} onChange={onFileChange} hidden />
                {uploading ? (
                    <div className="tc-upload-loading"><div className="tc-spinner-sm" /> Subiendo...</div>
                ) : file ? (
                    <div className="tc-upload-selected">
                        {preview && <div className="tc-upload-img-wrapper"><img src={preview} alt="preview" className="tc-upload-preview-scaled" /></div>}
                        <span className="tc-upload-name">{file.name}</span>
                        <button type="button" className="tc-upload-change-btn">Cambiar</button>
                    </div>
                ) : (
                    <div className="tc-upload-placeholder">
                        <Upload size={24} className="tc-upload-icon" />
                        <span className="tc-upload-title">Haz clic para buscar un archivo</span>
                        <span className="tc-upload-hint">{accept === 'image/*' ? 'PNG, JPG, JPEG, WEBP' : 'Imágenes, PDF, Video'} — Máx 10MB</span>
                    </div>
                )}
            </div>
        </div>
    );

    // ============ MODAL/DRAWER: LECCIÓN ============
    const renderLeccionModal = () => (
        <div className="tc-modal-overlay" onClick={closeModal}>
            <div className="tc-drawer" onClick={e => e.stopPropagation()}>
                <div className="tc-drawer-header">
                    <h2>{modalMode === 'crear' ? 'Nueva Lección' : 'Editar Lección'}</h2>
                    <button className="tc-modal-close" onClick={closeModal}><X size={20} /></button>
                </div>
                <div className="tc-drawer-body">
                    <form onSubmit={handleSubmitLeccion}>
                        <div className="tc-form-group">
                            <label>Título *</label>
                            <input type="text" placeholder="Título de la lección" value={formTitulo}
                                onChange={e => setFormTitulo(e.target.value)} required maxLength={200} />
                        </div>
                        <FileOrUrlInput
                            file={portadaFile} onFileChange={handlePortadaFileChange}
                            inputRef={portadaInputRef} preview={portadaPreview}
                            uploading={uploadingPortada} accept="image/*"
                            label="Portada de la lección"
                        />
                        <div className="tc-modal-footer">
                            <button type="button" className="tc-cancel-btn" onClick={closeModal}>Cancelar</button>
                            <button type="submit" className="tc-submit-btn" disabled={submitting || !formTitulo.trim()}>
                                <Send size={16} />
                                <span>{submitting ? 'Guardando...' : modalMode === 'crear' ? 'Crear Lección' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // ============ MODAL/DRAWER: MÓDULOS ============
    const renderModuloModal = () => (
        <div className="tc-modal-overlay" onClick={closeModal}>
            <div className="tc-drawer" onClick={e => e.stopPropagation()}>
                <div className="tc-drawer-header">
                    <h2>{modalMode === 'crear' ? 'Nuevo Módulo' : 'Editar Módulo'}</h2>
                    <button className="tc-modal-close" onClick={closeModal}><X size={20} /></button>
                </div>
                <div className="tc-drawer-body">
                    <form onSubmit={handleSubmitModulo}>
                        <div className="tc-form-group">
                            <label>Título de sección *</label>
                            <input type="text" placeholder="Nombre del módulo" value={formTituloSeccion}
                                onChange={e => setFormTituloSeccion(e.target.value)} required maxLength={200} />
                        </div>
                        <div className="tc-form-group">
                            <label>Descripción del módulo <span className="tc-optional">(opcional)</span></label>
                            <textarea
                                placeholder="Describe el contenido de este módulo..."
                                value={formDescripcion}
                                onChange={e => setFormDescripcion(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <FileOrUrlInput
                            file={recursoFile} onFileChange={handleRecursoFileChange}
                            inputRef={recursoInputRef} preview={recursoPreview}
                            uploading={uploadingRecurso}
                            accept="image/*,application/pdf,video/mp4,video/webm"
                            label="Recurso del módulo"
                        />
                        <div className="tc-form-group">
                            <label>Orden <span className="tc-optional">(opcional)</span></label>
                            <input type="number" placeholder="Ej: 1" value={formOrden}
                                onChange={e => setFormOrden(e.target.value)} min={1} />
                        </div>
                        <div className="tc-modal-footer">
                            <button type="button" className="tc-cancel-btn" onClick={closeModal}>Cancelar</button>
                            <button type="submit" className="tc-submit-btn" disabled={submitting || !formTituloSeccion.trim()}>
                                <Send size={16} />
                                <span>{submitting ? 'Guardando...' : modalMode === 'crear' ? 'Crear Módulo' : 'Guardar Cambios'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // ============ DELETE CONFIRMATION ============
    const renderDeleteModal = () => {
        if (!deleteTarget) return null;
        const isLeccion = vista === 'lecciones';
        const label = isLeccion ? 'lección' : 'módulo';
        const title = isLeccion ? deleteTarget.titulo : deleteTarget.tituloSeccion;
        return (
            <div className="tc-modal-overlay tc-modal-sm-overlay" onClick={() => setDeleteTarget(null)}>
                <div className="tc-modal-sm-wrapper">
                    <div className="tc-modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="tc-modal-delete-icon"><Trash2 size={28} /></div>
                        <h3>¿Eliminar esta {label}?</h3>
                        <p className="tc-modal-text">
                            "<strong>{title}</strong>" será eliminada permanentemente{isLeccion ? ' junto con todos sus módulos' : ''}.
                        </p>
                        <div className="tc-modal-footer">
                            <button className="tc-cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</button>
                            <button className="tc-danger-btn" onClick={isLeccion ? handleDeleteLeccion : handleDeleteModulo} disabled={deleting}>
                                {deleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    // ============ MAIN RENDER ============
    return (
        <div className="tc-layout">
            <aside className="tc-sidebar">
                <div className="tc-sidebar-accent" />
                <div className="tc-sidebar-inner">
                    <div className="tc-sidebar-logo">PlatMod <span className="dot">.</span></div>
                    <nav className="tc-sidebar-nav">
                        <ul className="tc-sidebar-menu">
                            <li className={`tc-sidebar-item ${vista === 'cursos' && !cursoActual ? 'active' : ''}`} onClick={navigateToCursos}>
                                <Home size={20} strokeWidth={1.8} /><span>Mis Cursos</span>
                            </li>
                        </ul>
                    </nav>
                    <div className="tc-sidebar-footer">
                        <button className="tc-sidebar-item tc-theme-btn" onClick={toggleTheme} title="Cambiar tema">
                            {theme === 'light' ? <Moon size={20} strokeWidth={1.8} /> : <Sun size={20} strokeWidth={1.8} />}
                            <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </button>
                        <button className="tc-sidebar-item tc-profile-btn">
                            <User size={20} strokeWidth={1.8} /><span>{user?.nombre || 'Docente'}</span>
                        </button>
                        <button className="tc-sidebar-item tc-logout-btn" onClick={handleLogout}>
                            <LogOut size={20} strokeWidth={1.8} /><span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="tc-content">
                {renderBreadcrumb()}
                {vista === 'cursos' && renderCursos()}
                {vista === 'lecciones' && renderLecciones()}
                {vista === 'modulos' && renderModulos()}
                {showModal && vista === 'lecciones' && renderLeccionModal()}
                {showModal && vista === 'modulos' && renderModuloModal()}
                {renderDeleteModal()}
            </main>
        </div>
    );
};

export default TeacherDashboard;