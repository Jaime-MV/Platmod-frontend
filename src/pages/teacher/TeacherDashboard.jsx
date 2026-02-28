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
    ChevronRight, FileText, Upload, Image as ImageIcon, Link as LinkIcon, MessageCircle
} from 'lucide-react';
import ForoPage from '../student/ForoPage';
import './TeacherStyles.css';

// ============ MULTIPLE FILE INPUT COMPONENT ============
const MultiFileInput = ({ recursos, onFileChange, onAddUrl, onRemove, inputRef, uploading, accept, label, mode, setMode, urlValue, setUrlValue, urlNameValue, setUrlNameValue }) => (
    <div className="tc-form-group">
        <label>{label}</label>

        <div className="tc-toggle-btns" style={{ marginBottom: '12px' }}>
            <button type="button" className={`tc-toggle-btn ${mode === 'url' ? 'active' : ''}`}
                onClick={() => setMode('url')}>Agregar URL</button>
            <button type="button" className={`tc-toggle-btn ${mode === 'upload' ? 'active' : ''}`}
                onClick={() => setMode('upload')}>Subir Archivos</button>
        </div>

        {mode === 'url' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <input type="text" placeholder="Nombre (Ej: Video de YouTube)" value={urlNameValue} onChange={e => setUrlNameValue(e.target.value)} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="url" placeholder="https://youtube.com/..." value={urlValue} onChange={e => setUrlValue(e.target.value)} style={{ flex: 1, margin: 0 }} />
                    <button type="button" className="tc-add-btn" style={{ padding: '0 20px', height: '44px', borderRadius: '10px', margin: 0 }} onClick={onAddUrl} disabled={!urlValue.trim()}>
                        Agregar
                    </button>
                </div>
            </div>
        ) : (
            <div className="tc-upload-area" onClick={() => inputRef.current?.click()} style={{ marginBottom: '16px' }}>
                <input type="file" ref={inputRef} accept={accept} onChange={onFileChange} multiple hidden />
                {uploading ? (
                    <div className="tc-upload-loading"><div className="tc-spinner-sm" /> Subiendo archivos...</div>
                ) : (
                    <div className="tc-upload-placeholder">
                        <Upload size={24} className="tc-upload-icon" />
                        <span className="tc-upload-title">Haz clic para agregar {recursos.length > 0 ? 'más archivos' : 'archivos'}</span>
                        <span className="tc-upload-hint">{accept === 'image/*' ? 'PNG, JPG, JPEG, WEBP' : 'Imágenes, PDF, Video'} — Máx 10MB c/u</span>
                    </div>
                )}
            </div>
        )}

        {recursos.length > 0 && (
            <div className="tc-recursos-stack">
                <label style={{ fontSize: '0.85rem', color: 'var(--tc-text-secondary)', marginBottom: '8px', display: 'block' }}>Recursos Añadidos:</label>
                {recursos.map((rec) => (
                    <div key={rec.id} className="tc-recurso-item">
                        {rec.preview ? (
                            <img src={rec.preview} alt="preview" className="tc-recurso-thumb" />
                        ) : (
                            <div className="tc-recurso-file-icon"><FileText size={20} /></div>
                        )}
                        <span className="tc-recurso-name">{rec.name}</span>
                        <button type="button" className="tc-recurso-remove" onClick={() => onRemove(rec.id)}>
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ============ FILE INPUT COMPONENT (SINGLE) ============
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
    const [formPortadaMode, setFormPortadaMode] = useState('url'); // url | upload
    const [portadaFile, setPortadaFile] = useState(null);
    const [portadaPreview, setPortadaPreview] = useState('');
    const [uploadingPortada, setUploadingPortada] = useState(false);
    const portadaInputRef = useRef(null);

    // Form fields - Módulo
    const [formTituloSeccion, setFormTituloSeccion] = useState('');
    const [formModuloPortadaMode, setFormModuloPortadaMode] = useState('url'); // url | upload
    const [formModuloPortadaUrl, setFormModuloPortadaUrl] = useState('');
    const [moduloPortadaFile, setModuloPortadaFile] = useState(null);
    const [moduloPortadaPreview, setModuloPortadaPreview] = useState('');
    const [uploadingModuloPortada, setUploadingModuloPortada] = useState(false);
    const moduloPortadaInputRef = useRef(null);
    const [formDescripcion, setFormDescripcion] = useState('');
    const [formRecursos, setFormRecursos] = useState([]); // Array of { id, url, name, file, type, preview }
    const [formRecursoMode, setFormRecursoMode] = useState('url'); // url | upload
    const [formRecursoUrl, setFormRecursoUrl] = useState('');
    const [formRecursoNombreUrl, setFormRecursoNombreUrl] = useState('');
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
        setFormTituloSeccion('');
        setFormModuloPortadaUrl(''); setFormModuloPortadaMode('url');
        setModuloPortadaFile(null); setModuloPortadaPreview('');
        setFormDescripcion('');
        setFormRecursos([]);
        setFormRecursoMode('url');
        setFormRecursoUrl('');
        setFormRecursoNombreUrl('');
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
        setFormModuloPortadaUrl(modulo.portadaUrl || '');
        setFormModuloPortadaMode('url');
        setModuloPortadaFile(null); setModuloPortadaPreview(modulo.portadaUrl || '');
        setFormDescripcion(modulo.descripcion || '');

        // Load existing resources if any
        try {
            const parsedRecursos = modulo.recursos ? JSON.parse(modulo.recursos) : [];
            setFormRecursos(parsedRecursos.map((r, i) => ({
                id: `existing-${i}`,
                url: r.url,
                name: r.nombre,
                type: 'existing'
            })));
        } catch (e) {
            setFormRecursos([]);
        }

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

    const handleModuloPortadaFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setModuloPortadaFile(file);
        if (file.type.startsWith('image/')) {
            setModuloPortadaPreview(URL.createObjectURL(file));
        } else {
            setModuloPortadaPreview('');
        }
    };

    const handleRecursoFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newRecursos = files.map(file => {
            const isImage = file.type.startsWith('image/');
            return {
                id: `new-${Date.now()}-${Math.random()}`,
                file: file,
                name: file.name,
                type: 'new',
                preview: isImage ? URL.createObjectURL(file) : ''
            };
        });

        setFormRecursos(prev => [...prev, ...newRecursos]);
        if (recursoInputRef.current) recursoInputRef.current.value = '';
    };

    const handleAddRecursoUrl = () => {
        if (!formRecursoUrl.trim()) return;
        const newUrlRecurso = {
            id: `url-${Date.now()}-${Math.random()}`,
            url: formRecursoUrl.trim(),
            name: formRecursoNombreUrl.trim() || formRecursoUrl.trim(),
            type: 'url'
        };
        setFormRecursos(prev => [...prev, newUrlRecurso]);
        setFormRecursoUrl('');
        setFormRecursoNombreUrl('');
    };

    const handleRemoveRecurso = (id) => {
        setFormRecursos(prev => prev.filter(r => r.id !== id));
    };

    // ============ CRUD: LECCIONES ============
    const handleSubmitLeccion = async (e) => {
        e.preventDefault();
        if (!formTitulo.trim()) return;
        setSubmitting(true);
        try {
            let finalPortadaUrl = formPortadaUrl.trim() || null;

            // Upload file if selected
            if (formPortadaMode === 'upload' && portadaFile) {
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
            const finalRecursos = [];

            // Subir archivos nuevos secuencialmente (o mantener los existentes)
            for (const rec of formRecursos) {
                if (rec.type === 'new') {
                    setUploadingRecurso(true);
                    const result = await uploadDocenteFile(rec.file);
                    finalRecursos.push({ url: result.url, nombre: result.nombre || rec.name });
                } else if (rec.type === 'existing' || rec.type === 'url') {
                    finalRecursos.push({ url: rec.url, nombre: rec.name });
                }
            }
            setUploadingRecurso(false);

            let finalModuloPortadaUrl = formModuloPortadaUrl.trim() || null;
            if (formModuloPortadaMode === 'upload' && moduloPortadaFile) {
                setUploadingModuloPortada(true);
                const result = await uploadDocenteFile(moduloPortadaFile);
                finalModuloPortadaUrl = result.url;
                setUploadingModuloPortada(false);
            }

            const data = { tituloSeccion: formTituloSeccion.trim() };
            if (formDescripcion.trim()) data.descripcion = formDescripcion.trim();
            if (finalModuloPortadaUrl) data.portadaUrl = finalModuloPortadaUrl;
            data.recursos = JSON.stringify(finalRecursos);
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
                            <div className="tc-leccion-img-wrap" onClick={() => navigateToModulos(leccion)}>
                                {leccion.portadaUrl ? (
                                    <div className="tc-curso-img" style={{ backgroundImage: `url(${leccion.portadaUrl})` }} />
                                ) : (
                                    <div className="tc-leccion-img-placeholder">
                                        <BookOpen size={36} strokeWidth={1.2} />
                                    </div>
                                )}
                                <div className="tc-leccion-card-actions" onClick={e => e.stopPropagation()}>
                                    <button className="tc-card-edit-btn" onClick={() => openEditLeccionModal(leccion)} title="Editar"><Edit3 size={14} /></button>
                                    <button className="tc-card-delete-btn" onClick={() => setDeleteTarget(leccion)} title="Eliminar"><Trash2 size={14} /></button>
                                </div>
                            </div>
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

    // Helper function to extract YouTube ID
    const getYouTubeEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // Helper to group resources by type (Video vs Others)
    const renderCategorizedResources = (recursosJson) => {
        try {
            const arr = JSON.parse(recursosJson);
            if (!Array.isArray(arr) || arr.length === 0) return null;

            const videos = [];
            const docs = [];
            const externalLinks = [];

            arr.forEach(r => {
                const url = r.url?.toLowerCase() || '';
                if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || getYouTubeEmbedUrl(url)) {
                    videos.push(r);
                } else if (url.startsWith('http') && !url.includes('supabase.co')) {
                    externalLinks.push(r);
                } else {
                    docs.push(r);
                }
            });

            return (
                <div className="tc-moodle-resource-container">
                    {docs.length > 0 && (
                        <div className="tc-moodle-category">
                            <div className="tc-moodle-banner tc-banner-material">
                                MATERIAL DISPONIBLE
                            </div>
                            <ul className="tc-moodle-res-list">
                                {docs.map((d, i) => (
                                    <li key={i} className="tc-moodle-res-row">
                                        <div className="tc-moodle-res-left">
                                            <FileText size={20} className="tc-res-icon ic-doc" />
                                            <span className="tc-res-name">{d.nombre}</span>
                                        </div>
                                        <div className="tc-moodle-res-right">
                                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="tc-moodle-action-btn">
                                                Ver
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {externalLinks.length > 0 && (
                        <div className="tc-moodle-category">
                            <div className="tc-moodle-banner tc-banner-material" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                                ENLACES EXTERNOS
                            </div>
                            <ul className="tc-moodle-res-list">
                                {externalLinks.map((l, i) => (
                                    <li key={i} className="tc-moodle-res-row">
                                        <div className="tc-moodle-res-left">
                                            <LinkIcon size={20} className="tc-res-icon ic-doc" style={{ color: '#38bdf8' }} />
                                            <span className="tc-res-name">{l.nombre}</span>
                                        </div>
                                        <div className="tc-moodle-res-right">
                                            <a href={l.url} target="_blank" rel="noopener noreferrer" className="tc-moodle-action-btn">
                                                Visitar
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {videos.length > 0 && (
                        <div className="tc-moodle-category">
                            <div className="tc-moodle-banner tc-banner-video">
                                VIDEOGRAFÍA
                            </div>
                            <ul className="tc-moodle-res-list tc-moodle-video-list">
                                {videos.map((v, i) => {
                                    const ytEmbedUrl = getYouTubeEmbedUrl(v.url);
                                    return (
                                        <li key={i} className="tc-moodle-res-row tc-moodle-video-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                            <div className="tc-moodle-res-left">
                                                <MonitorPlay size={20} className="tc-res-icon ic-vid" />
                                                <span className="tc-res-name">{v.nombre}</span>
                                            </div>
                                            {ytEmbedUrl ? (
                                                <div className="tc-moodle-embed-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                                                    <iframe src={ytEmbedUrl} title={v.nombre} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                                </div>
                                            ) : (
                                                <div className="tc-moodle-video-player" style={{ borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                                                    <video src={v.url} controls style={{ width: '100%', maxHeight: '400px', display: 'block' }} />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            );
        } catch (e) {
            return null; // Invalid JSON or empty
        }
    };

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
                <div className="tc-moodle-list">
                    <p className="tc-drag-hint" style={{ marginBottom: '16px' }}>↕ Arrastra desde el icono gris para reordenar los módulos</p>
                    {modulos.map((modulo, idx) => (
                        <div
                            key={modulo.idModulo}
                            className={`tc-moodle-card tc-draggable ${draggedIdx === idx ? 'dragging' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="tc-moodle-header">
                                <div className="tc-moodle-header-main">
                                    <GripVertical size={20} className="tc-grip" />
                                    <h3 className="tc-moodle-title">
                                        <span className="tc-moodle-order">{modulo.orden ?? idx + 1}.- </span>
                                        {modulo.tituloSeccion}
                                    </h3>
                                </div>
                                <div className="tc-item-actions">
                                    <button className="tc-edit-btn" onClick={() => openEditModuloModal(modulo)} title="Editar"><Edit3 size={16} /></button>
                                    <button className="tc-delete-btn" onClick={() => setDeleteTarget(modulo)} title="Eliminar"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            {modulo.portadaUrl && (
                                <div className="tc-moodle-cover" style={{ marginTop: '8px', marginBottom: '8px' }}>
                                    {getYouTubeEmbedUrl(modulo.portadaUrl) ? (
                                        <div className="tc-moodle-embed-wrapper" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                                            <iframe src={getYouTubeEmbedUrl(modulo.portadaUrl)} title="Portada Módulo" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                        </div>
                                    ) : modulo.portadaUrl.match(/\.(mp4|webm|mov)$/i) ? (
                                        <video src={modulo.portadaUrl} controls className="tc-moodle-cover-media" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                                    ) : (
                                        <img src={modulo.portadaUrl} alt="Portada Módulo" className="tc-moodle-cover-media" style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'cover' }} />
                                    )}
                                </div>
                            )}

                            {modulo.descripcion && <div className="tc-moodle-desc">{modulo.descripcion}</div>}

                            {modulo.recursos && renderCategorizedResources(modulo.recursos)}
                        </div>
                    ))}
                </div>
            )}
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
                        <div className="tc-form-group tc-portada-group">
                            <label>Portada del Módulo <span className="tc-optional">(opcional)</span></label>
                            <div className="tc-toggle-btns">
                                <button type="button" className={`tc-toggle-btn ${formModuloPortadaMode === 'url' ? 'active' : ''}`}
                                    onClick={() => setFormModuloPortadaMode('url')}>Usar URL</button>
                                <button type="button" className={`tc-toggle-btn ${formModuloPortadaMode === 'upload' ? 'active' : ''}`}
                                    onClick={() => setFormModuloPortadaMode('upload')}>Subir Archivo</button>
                            </div>

                            {formModuloPortadaMode === 'url' ? (
                                <>
                                    <input type="url" placeholder="https://ejemplo.com/imagen.jpg o .mp4"
                                        value={formModuloPortadaUrl} onChange={e => {
                                            setFormModuloPortadaUrl(e.target.value);
                                            setModuloPortadaPreview(e.target.value);
                                        }} />
                                    {moduloPortadaPreview && (
                                        <div className="tc-moodle-cover-preview-wrapper" style={{ marginTop: '12px' }}>
                                            {moduloPortadaPreview.match(/\.(mp4|webm|mov)$/i) ? (
                                                <video src={moduloPortadaPreview} className="tc-upload-preview-scaled" controls style={{ maxHeight: '150px' }} />
                                            ) : (
                                                <img src={moduloPortadaPreview} alt="preview" className="tc-upload-preview-scaled" style={{ maxHeight: '150px' }} onError={(e) => e.target.style.display = 'none'} />
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <FileOrUrlInput
                                    file={moduloPortadaFile} onFileChange={handleModuloPortadaFileChange}
                                    inputRef={moduloPortadaInputRef} preview={moduloPortadaPreview}
                                    uploading={uploadingModuloPortada} accept="image/*,video/mp4,video/webm"
                                    label=""
                                />
                            )}
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

                        <MultiFileInput
                            recursos={formRecursos}
                            onFileChange={handleRecursoFileChange}
                            onAddUrl={handleAddRecursoUrl}
                            onRemove={handleRemoveRecurso}
                            inputRef={recursoInputRef}
                            uploading={uploadingRecurso}
                            accept="image/*,application/pdf,video/mp4,video/webm"
                            label="Recursos adicionales (Opcional)"
                            mode={formRecursoMode}
                            setMode={setFormRecursoMode}
                            urlValue={formRecursoUrl}
                            setUrlValue={setFormRecursoUrl}
                            urlNameValue={formRecursoNombreUrl}
                            setUrlNameValue={setFormRecursoNombreUrl}
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
                            <li className={`tc-sidebar-item ${vista === 'foro' ? 'active' : ''}`} onClick={() => { setVista('foro'); setCursoActual(null); setLeccionActual(null); }}>
                                <MessageCircle size={20} strokeWidth={1.8} /><span>Foro Q&A</span>
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
                {vista !== 'foro' && renderBreadcrumb()}
                {vista === 'cursos' && renderCursos()}
                {vista === 'lecciones' && renderLecciones()}
                {vista === 'modulos' && renderModulos()}
                {vista === 'foro' && <ForoPage />}
                {showModal && vista === 'lecciones' && renderLeccionModal()}
                {showModal && vista === 'modulos' && renderModuloModal()}
                {renderDeleteModal()}
            </main>
        </div>
    );
};

export default TeacherDashboard;
