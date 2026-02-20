import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getPreguntas, crearPregunta, getRespuestas, crearRespuesta,
    getMisPreguntas, getFavoritos, toggleFavorito, eliminarPregunta
} from '../../services/api';
import { uploadForoFile, isImageFile } from '../../services/supabase';
import {
    ArrowLeft,
    MessageCircle,
    Plus,
    Send,
    Search,
    Clock,
    User,
    CheckCircle2,
    X,
    Tag,
    Heart,
    Trash2,
    List,
    Star,
    Paperclip,
    FileText,
    Image,
    Download
} from 'lucide-react';
import './ForoStyles.css';

const CATEGORIAS = ['General', 'Cursos', 'Técnico', 'Sugerencias', 'Otro'];

const TABS = [
    { id: 'todas', label: 'Todas', icon: List },
    { id: 'mis', label: 'Mis Preguntas', icon: User },
    { id: 'favoritos', label: 'Favoritos', icon: Star },
];

const ForoPage = () => {
    const { user } = useAuth();
    const [preguntas, setPreguntas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vista, setVista] = useState('lista');
    const [tabActivo, setTabActivo] = useState('todas');
    const [preguntaActual, setPreguntaActual] = useState(null);
    const [respuestas, setRespuestas] = useState([]);
    const [loadingRespuestas, setLoadingRespuestas] = useState(false);
    const [busqueda, setBusqueda] = useState('');

    // Form states
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [nuevoContenido, setNuevoContenido] = useState('');
    const [nuevaCategoria, setNuevaCategoria] = useState('General');
    const [nuevaRespuesta, setNuevaRespuesta] = useState('');
    const [enviando, setEnviando] = useState(false);

    // File upload
    const [archivo, setArchivo] = useState(null);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);
    const [errorArchivo, setErrorArchivo] = useState('');

    // Delete modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        cargarPreguntas();
    }, [tabActivo]);

    const cargarPreguntas = async () => {
        setLoading(true);
        let data = [];
        switch (tabActivo) {
            case 'mis':
                data = await getMisPreguntas();
                break;
            case 'favoritos':
                data = await getFavoritos();
                break;
            default:
                data = await getPreguntas();
                break;
        }
        setPreguntas(data);
        setLoading(false);
    };

    const abrirPregunta = async (pregunta) => {
        setPreguntaActual(pregunta);
        setVista('detalle');
        setLoadingRespuestas(true);
        const data = await getRespuestas(pregunta.idPregunta);
        setRespuestas(data);
        setLoadingRespuestas(false);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setErrorArchivo('');

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setErrorArchivo('El archivo excede el límite de 5MB');
            return;
        }

        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) {
            setErrorArchivo('Tipo no permitido. Usa PNG, JPG, PDF o Word');
            return;
        }

        setArchivo(file);
    };

    const handleRemoveFile = () => {
        setArchivo(null);
        setErrorArchivo('');
    };

    const handleCrearPregunta = async (e) => {
        e.preventDefault();
        if (!nuevoTitulo.trim() || !nuevoContenido.trim()) return;

        setEnviando(true);
        try {
            let archivoUrl = null;
            let archivoNombre = null;

            // Upload file to Supabase if present
            if (archivo) {
                setSubiendoArchivo(true);
                const result = await uploadForoFile(archivo);
                archivoUrl = result.url;
                archivoNombre = result.nombre;
                setSubiendoArchivo(false);
            }

            await crearPregunta({
                titulo: nuevoTitulo.trim(),
                contenido: nuevoContenido.trim(),
                categoria: nuevaCategoria,
                archivoUrl,
                archivoNombre
            });

            setNuevoTitulo('');
            setNuevoContenido('');
            setNuevaCategoria('General');
            setArchivo(null);
            setVista('lista');
            setTabActivo('todas');
            await cargarPreguntas();
        } catch (err) {
            console.error('Error al crear pregunta:', err);
            setErrorArchivo(err.message);
        }
        setEnviando(false);
        setSubiendoArchivo(false);
    };

    const handleCrearRespuesta = async (e) => {
        e.preventDefault();
        if (!nuevaRespuesta.trim() || !preguntaActual) return;

        setEnviando(true);
        try {
            await crearRespuesta(preguntaActual.idPregunta, {
                contenido: nuevaRespuesta.trim()
            });
            setNuevaRespuesta('');
            const data = await getRespuestas(preguntaActual.idPregunta);
            setRespuestas(data);
            setPreguntaActual(prev => ({
                ...prev,
                totalRespuestas: data.length
            }));
        } catch (err) {
            console.error('Error al crear respuesta:', err);
        }
        setEnviando(false);
    };

    const handleToggleFavorito = async (e, pregunta) => {
        e.stopPropagation();
        try {
            const result = await toggleFavorito(pregunta.idPregunta);
            setPreguntas(prev => prev.map(p =>
                p.idPregunta === pregunta.idPregunta
                    ? { ...p, esFavorito: result.favorito }
                    : p
            ));
            if (tabActivo === 'favoritos' && !result.favorito) {
                setPreguntas(prev => prev.filter(p => p.idPregunta !== pregunta.idPregunta));
            }
            if (preguntaActual && preguntaActual.idPregunta === pregunta.idPregunta) {
                setPreguntaActual(prev => ({ ...prev, esFavorito: result.favorito }));
            }
        } catch (err) {
            console.error('Error al cambiar favorito:', err);
        }
    };

    const handleEliminar = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await eliminarPregunta(deleteTarget.idPregunta);
            setDeleteTarget(null);
            if (vista === 'detalle') {
                setVista('lista');
                setPreguntaActual(null);
            }
            await cargarPreguntas();
        } catch (err) {
            console.error('Error al eliminar:', err);
            alert(err.message);
        }
        setDeleting(false);
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '';
        const d = new Date(fecha);
        const ahora = new Date();
        const diffMs = ahora - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHoras / 24);

        if (diffMin < 1) return 'Justo ahora';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        if (diffHoras < 24) return `Hace ${diffHoras}h`;
        if (diffDias < 7) return `Hace ${diffDias}d`;
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const esMiPregunta = (pregunta) => {
        return user && pregunta.idUsuario === user.id;
    };

    const preguntasFiltradas = preguntas.filter(p =>
        p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.contenido.toLowerCase().includes(busqueda.toLowerCase())
    );

    // ============ ATTACHMENT DISPLAY ============
    const renderAttachment = (archivoUrl, archivoNombre, isDetail = false) => {
        if (!archivoUrl) return null;

        if (isImageFile(archivoNombre)) {
            return (
                <div className={`foro-attachment ${isDetail ? 'detail' : 'card'}`}>
                    <img
                        src={archivoUrl}
                        alt={archivoNombre}
                        className="foro-attachment-img"
                        onClick={(e) => { e.stopPropagation(); window.open(archivoUrl, '_blank'); }}
                    />
                </div>
            );
        }

        return (
            <a
                href={archivoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="foro-attachment-link"
                onClick={(e) => e.stopPropagation()}
            >
                <FileText size={16} />
                <span>{archivoNombre || 'Archivo adjunto'}</span>
                <Download size={14} />
            </a>
        );
    };

    // ============ DELETE MODAL ============
    const renderDeleteModal = () => {
        if (!deleteTarget) return null;
        return (
            <div className="foro-modal-overlay" onClick={() => setDeleteTarget(null)}>
                <div className="foro-modal" onClick={e => e.stopPropagation()}>
                    <div className="foro-modal-icon">
                        <Trash2 size={28} />
                    </div>
                    <h3>¿Eliminar esta pregunta?</h3>
                    <p className="foro-modal-text">
                        "<strong>{deleteTarget.titulo}</strong>" y todas sus respuestas serán eliminadas permanentemente.
                    </p>
                    <div className="foro-modal-actions">
                        <button className="foro-modal-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Cancelar
                        </button>
                        <button className="foro-modal-delete" onClick={handleEliminar} disabled={deleting}>
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ============ VISTA: NUEVA PREGUNTA ============
    const renderNuevaPregunta = () => (
        <div className="foro-nueva-pregunta">
            <div className="foro-header-bar">
                <button className="foro-back-btn" onClick={() => setVista('lista')}>
                    <ArrowLeft size={20} />
                    <span>Volver</span>
                </button>
            </div>
            <div className="foro-form-card">
                <h2 className="foro-form-title">
                    <Plus size={24} />
                    Nueva Pregunta
                </h2>
                <form onSubmit={handleCrearPregunta}>
                    <div className="foro-form-group">
                        <label>Título</label>
                        <input
                            type="text"
                            placeholder="¿Cuál es tu pregunta?"
                            value={nuevoTitulo}
                            onChange={(e) => setNuevoTitulo(e.target.value)}
                            maxLength={200}
                            required
                        />
                    </div>
                    <div className="foro-form-group">
                        <label>Categoría</label>
                        <div className="foro-categorias-selector">
                            {CATEGORIAS.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    className={`foro-cat-btn ${nuevaCategoria === cat ? 'active' : ''}`}
                                    onClick={() => setNuevaCategoria(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="foro-form-group">
                        <label>Descripción</label>
                        <textarea
                            placeholder="Describe tu pregunta con detalle..."
                            value={nuevoContenido}
                            onChange={(e) => setNuevoContenido(e.target.value)}
                            rows={6}
                            required
                        />
                    </div>

                    {/* File Upload */}
                    <div className="foro-form-group">
                        <label>Archivo adjunto <span className="foro-label-optional">(opcional, máx 5MB)</span></label>
                        {!archivo ? (
                            <label className="foro-file-input">
                                <Paperclip size={18} />
                                <span>Seleccionar archivo (PNG, JPG, PDF, Word)</span>
                                <input
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
                                    onChange={handleFileSelect}
                                    hidden
                                />
                            </label>
                        ) : (
                            <div className="foro-file-preview">
                                <div className="foro-file-info">
                                    {archivo.type.startsWith('image/') ? <Image size={18} /> : <FileText size={18} />}
                                    <span className="foro-file-name">{archivo.name}</span>
                                    <span className="foro-file-size">
                                        {(archivo.size / 1024).toFixed(0)} KB
                                    </span>
                                </div>
                                <button type="button" className="foro-file-remove" onClick={handleRemoveFile}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        {errorArchivo && <p className="foro-file-error">{errorArchivo}</p>}
                    </div>

                    <button
                        type="submit"
                        className="foro-submit-btn"
                        disabled={enviando || !nuevoTitulo.trim() || !nuevoContenido.trim()}
                    >
                        {subiendoArchivo ? 'Subiendo archivo...' : enviando ? 'Publicando...' : 'Publicar Pregunta'}
                    </button>
                </form>
            </div>
        </div>
    );

    // ============ VISTA: DETALLE ============
    const renderDetalle = () => (
        <div className="foro-detalle">
            <div className="foro-header-bar">
                <button className="foro-back-btn" onClick={() => { setVista('lista'); setPreguntaActual(null); }}>
                    <ArrowLeft size={20} />
                    <span>Volver al foro</span>
                </button>
            </div>

            <div className="foro-pregunta-detalle-card">
                <div className="foro-pregunta-meta-top">
                    {preguntaActual.categoria && (
                        <span className="foro-tag">
                            <Tag size={12} />
                            {preguntaActual.categoria}
                        </span>
                    )}
                    <div className="foro-detalle-actions">
                        <button
                            className={`foro-fav-btn ${preguntaActual.esFavorito ? 'active' : ''}`}
                            onClick={(e) => handleToggleFavorito(e, preguntaActual)}
                            title={preguntaActual.esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        >
                            <Heart size={18} fill={preguntaActual.esFavorito ? 'currentColor' : 'none'} />
                        </button>
                        {esMiPregunta(preguntaActual) && (
                            <button
                                className="foro-delete-btn"
                                onClick={() => setDeleteTarget(preguntaActual)}
                                title="Eliminar pregunta"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
                <h2 className="foro-pregunta-titulo-detalle">{preguntaActual.titulo}</h2>
                <p className="foro-pregunta-contenido-detalle">{preguntaActual.contenido}</p>

                {renderAttachment(preguntaActual.archivoUrl, preguntaActual.archivoNombre, true)}

                <div className="foro-pregunta-autor-bar">
                    <div className="foro-autor-info">
                        <div className="foro-avatar-sm"><User size={14} /></div>
                        <span className="foro-autor-nombre">{preguntaActual.nombreUsuario}</span>
                    </div>
                    <div className="foro-fecha-info">
                        <Clock size={13} />
                        <span>{formatFecha(preguntaActual.fechaCreacion)}</span>
                    </div>
                </div>
            </div>

            <div className="foro-respuestas-section">
                <h3 className="foro-respuestas-titulo">
                    <MessageCircle size={20} />
                    {preguntaActual.totalRespuestas || 0} Respuesta{(preguntaActual.totalRespuestas !== 1) ? 's' : ''}
                </h3>

                {loadingRespuestas ? (
                    <div className="foro-loading-inline">Cargando respuestas...</div>
                ) : respuestas.length === 0 ? (
                    <div className="foro-empty-respuestas">
                        <MessageCircle size={32} />
                        <p>Aún no hay respuestas. ¡Sé el primero en responder!</p>
                    </div>
                ) : (
                    <div className="foro-respuestas-list">
                        {respuestas.map(r => (
                            <div key={r.idRespuesta} className={`foro-respuesta-card ${r.esVerificada ? 'verificada' : ''}`}>
                                {r.esVerificada && (
                                    <div className="foro-verificada-badge">
                                        <CheckCircle2 size={14} />
                                        <span>Respuesta verificada</span>
                                    </div>
                                )}
                                <p className="foro-respuesta-contenido">{r.contenido}</p>
                                <div className="foro-respuesta-footer">
                                    <div className="foro-autor-info">
                                        <div className="foro-avatar-sm"><User size={14} /></div>
                                        <span className="foro-autor-nombre">{r.nombreUsuario}</span>
                                    </div>
                                    <div className="foro-fecha-info">
                                        <Clock size={13} />
                                        <span>{formatFecha(r.fechaCreacion)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <form className="foro-responder-form" onSubmit={handleCrearRespuesta}>
                    <div className="foro-responder-input-wrap">
                        <textarea
                            placeholder="Escribe tu respuesta..."
                            value={nuevaRespuesta}
                            onChange={(e) => setNuevaRespuesta(e.target.value)}
                            rows={3}
                        />
                        <button
                            type="submit"
                            className="foro-responder-btn"
                            disabled={enviando || !nuevaRespuesta.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ============ QUESTION CARD ============
    const renderPreguntaCard = (p) => (
        <div
            key={p.idPregunta}
            className="foro-pregunta-card"
            onClick={() => abrirPregunta(p)}
        >
            <div className="foro-pregunta-card-top">
                <div className="foro-card-left-meta">
                    {p.categoria && (
                        <span className="foro-tag">
                            <Tag size={11} />
                            {p.categoria}
                        </span>
                    )}
                    <span className="foro-respuestas-count">
                        <MessageCircle size={14} />
                        {p.totalRespuestas}
                    </span>
                    {p.archivoUrl && (
                        <span className="foro-has-attachment">
                            <Paperclip size={13} />
                        </span>
                    )}
                </div>
                <div className="foro-card-actions">
                    <button
                        className={`foro-fav-btn-sm ${p.esFavorito ? 'active' : ''}`}
                        onClick={(e) => handleToggleFavorito(e, p)}
                        title={p.esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        <Heart size={16} fill={p.esFavorito ? 'currentColor' : 'none'} />
                    </button>
                    {esMiPregunta(p) && (
                        <button
                            className="foro-delete-btn-sm"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                            title="Eliminar pregunta"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                </div>
            </div>
            <h3 className="foro-pregunta-titulo">{p.titulo}</h3>
            <p className="foro-pregunta-preview">
                {p.contenido.length > 120 ? p.contenido.slice(0, 120) + '...' : p.contenido}
            </p>

            {renderAttachment(p.archivoUrl, p.archivoNombre, false)}

            <div className="foro-pregunta-footer">
                <div className="foro-autor-info">
                    <div className="foro-avatar-sm"><User size={12} /></div>
                    <span>{p.nombreUsuario}</span>
                </div>
                <div className="foro-fecha-info">
                    <Clock size={12} />
                    <span>{formatFecha(p.fechaCreacion)}</span>
                </div>
            </div>
        </div>
    );

    // ============ VISTA: LISTA ============
    const renderLista = () => (
        <div className="foro-lista">
            <div className="foro-lista-header">
                <div>
                    <h1 className="foro-titulo-principal">Foro Q&A</h1>
                    <p className="foro-subtitulo">Pregunta, responde y aprende con la comunidad</p>
                </div>
                <button className="foro-nueva-btn" onClick={() => setVista('nueva')}>
                    <Plus size={18} />
                    Nueva Pregunta
                </button>
            </div>

            {/* Tabs */}
            <div className="foro-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`foro-tab ${tabActivo === tab.id ? 'active' : ''}`}
                        onClick={() => setTabActivo(tab.id)}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="foro-search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar preguntas..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                {busqueda && (
                    <button className="foro-search-clear" onClick={() => setBusqueda('')}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Questions list */}
            {loading ? (
                <div className="foro-loading">
                    <div className="foro-spinner" />
                    <p>Cargando preguntas...</p>
                </div>
            ) : preguntasFiltradas.length === 0 ? (
                <div className="foro-empty">
                    <MessageCircle size={48} />
                    <h3>
                        {busqueda ? 'Sin resultados' :
                            tabActivo === 'mis' ? 'No has creado preguntas aún' :
                                tabActivo === 'favoritos' ? 'No tienes favoritos aún' :
                                    'No hay preguntas aún'}
                    </h3>
                    <p>
                        {busqueda ? 'Intenta con otros términos de búsqueda' :
                            tabActivo === 'mis' ? '¡Crea tu primera pregunta!' :
                                tabActivo === 'favoritos' ? 'Marca preguntas con ❤️ para verlas aquí' :
                                    '¡Sé el primero en preguntar!'}
                    </p>
                </div>
            ) : (
                <div className="foro-preguntas-grid">
                    {preguntasFiltradas.map(p => renderPreguntaCard(p))}
                </div>
            )}
        </div>
    );

    // ============ RENDER ============
    return (
        <div className="foro-container">
            {vista === 'lista' && renderLista()}
            {vista === 'nueva' && renderNuevaPregunta()}
            {vista === 'detalle' && preguntaActual && renderDetalle()}
            {renderDeleteModal()}
        </div>
    );
};

export default ForoPage;
