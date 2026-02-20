import React, { useState, useEffect } from 'react';
import { getEstudianteLecciones, getEstudianteModulos } from '../../services/studentApi';
import { ArrowLeft, PlayCircle, FileText, Link as LinkIcon, Download, BookOpen, Clock, Award, User } from 'lucide-react';
import './StudentCourseView.css';

// Componente para visualizar los módulos y el contenido de una lección seleccionada
const ModulosViewer = ({ leccion, onBack }) => {
    const [modulos, setModulos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModulos = async () => {
            setLoading(true);
            const data = await getEstudianteModulos(leccion.idLeccion);
            // Ordenar por ordenamiento si existe
            data.sort((a, b) => (a.ordenamiento || 0) - (b.ordenamiento || 0));
            setModulos(data);
            setLoading(false);
        };
        fetchModulos();
    }, [leccion]);

    const getRecursoIcon = (url) => {
        if (!url) return <LinkIcon size={16} />;
        if (url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4')) {
            return <PlayCircle size={16} />;
        }
        if (url.endsWith('.pdf')) {
            return <FileText size={16} />;
        }
        return <LinkIcon size={16} />;
    };

    const getRecursoType = (url) => {
        if (!url) return 'Enlace externo';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Video de YouTube';
        if (url.endsWith('.mp4')) return 'Video MP4';
        if (url.endsWith('.pdf')) return 'Documento PDF';
        if (url.includes('supabase.co')) return 'Archivo descargable';
        return 'Enlace externo';
    };

    const renderCover = (modulo) => {
        if (modulo.portadaUrl) {
            // Check if it's a YouTube URL
            const getYouTubeId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            };

            const ytId = getYouTubeId(modulo.portadaUrl);

            if (ytId) {
                return (
                    <div className="sc-modulo-cover-container">
                        <iframe
                            className="sc-modulo-video"
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={modulo.titulo}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                );
            }

            // Regular image
            return (
                <div className="sc-modulo-cover-container">
                    <img src={modulo.portadaUrl} alt={modulo.titulo} className="sc-modulo-cover" />
                </div>
            );
        }

        // Placeholder cover
        return (
            <div className="sc-modulo-cover-container" style={{ background: 'var(--bg-hover)' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--text-secondary)' }}>
                    <PlayCircle size={48} opacity={0.5} />
                </div>
            </div>
        );
    };

    return (
        <div className="sc-modulos-viewer">
            <div className="sc-header">
                <button className="sc-back-btn" onClick={onBack}>
                    <ArrowLeft size={16} /> Volver a Lecciones
                </button>
                <div className="sc-modulos-header">
                    <h2>{leccion.titulo}</h2>
                    <div className="sc-docente-badge">
                        <User size={14} />
                        {leccion.docenteNombre}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="sc-loading">
                    <div className="sc-spinner"></div>
                    <p>Cargando contenido de la lección...</p>
                </div>
            ) : modulos.length === 0 ? (
                <div className="sc-empty-state">
                    <BookOpen size={48} className="sc-empty-state-icon" />
                    <h3>Aún no hay contenido</h3>
                    <p>El docente aún no ha agregado módulos a esta lección.</p>
                </div>
            ) : (
                <div className="sc-modulos-grid">
                    {modulos.map((modulo) => {
                        // Parsear recursos si es string, o usar array vacío
                        let recursos = [];
                        if (typeof modulo.recursosUrls === 'string') {
                            try {
                                recursos = JSON.parse(modulo.recursosUrls);
                                // Check if it parsed into string instead of array (old format fallback)
                                if (typeof recursos === 'string') {
                                    recursos = [{ url: recursos, name: 'Recurso principal' }];
                                }
                            } catch (e) {
                                // Fallback for plain string URLs
                                if (modulo.recursosUrls.trim() !== '') {
                                    recursos = [{ url: modulo.recursosUrls, name: 'Enlace del recurso' }];
                                }
                            }
                        } else if (Array.isArray(modulo.recursosUrls)) {
                            recursos = modulo.recursosUrls;
                        }

                        return (
                            <div key={modulo.idModulo} className="sc-modulo-card">
                                {renderCover(modulo)}
                                <div className="sc-modulo-content">
                                    <h3 className="sc-modulo-title">{modulo.titulo}</h3>
                                    <p className="sc-modulo-desc">{modulo.descripcion}</p>

                                    {recursos.length > 0 && (
                                        <div className="sc-recursos-list">
                                            <div className="sc-recurso-titulo">Recursos adicionales</div>
                                            {recursos.map((rec, index) => (
                                                <a
                                                    key={index}
                                                    href={rec.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="sc-recurso-item"
                                                >
                                                    <div className="sc-recurso-icon">
                                                        {getRecursoIcon(rec.url)}
                                                    </div>
                                                    <div className="sc-recurso-info">
                                                        <span className="sc-recurso-name" title={rec.name || 'Recurso'}>
                                                            {rec.name || 'Recurso'}
                                                        </span>
                                                        <span className="sc-recurso-type">
                                                            {getRecursoType(rec.url)}
                                                        </span>
                                                    </div>
                                                    <Download size={16} className="sc-recurso-action" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Componente para listar las lecciones de un curso
const StudentCourseView = ({ curso, onBack }) => {
    const [lecciones, setLecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeccion, setSelectedLeccion] = useState(null);

    useEffect(() => {
        const fetchLecciones = async () => {
            setLoading(true);
            const data = await getEstudianteLecciones(curso.idCurso);
            setLecciones(data);
            setLoading(false);
        };
        fetchLecciones();
    }, [curso]);

    if (selectedLeccion) {
        return <ModulosViewer leccion={selectedLeccion} onBack={() => setSelectedLeccion(null)} />;
    }

    return (
        <div className="sc-view-container">
            <div className="sc-header">
                <button className="sc-back-btn" onClick={onBack}>
                    <ArrowLeft size={16} /> Volver a Mis Cursos
                </button>
            </div>

            <div className="sc-course-info">
                <img
                    src={curso.portadaUrl || "https://via.placeholder.com/300x200?text=Curso"}
                    alt={curso.titulo}
                    className="sc-course-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Curso'; }}
                />
                <div className="sc-course-details">
                    <h1>{curso.titulo}</h1>
                    <p className="sc-course-description">
                        {curso.descripcion || "Explora el contenido de este curso y comienza a aprender a tu propio ritmo. Aquí encontrarás todas las lecciones y recursos necesarios."}
                    </p>
                </div>
            </div>

            <div className="sc-lecciones-section">
                <h2>Lecciones del Curso</h2>

                {loading ? (
                    <div className="sc-loading">
                        <div className="sc-spinner"></div>
                        <p>Cargando lecciones...</p>
                    </div>
                ) : lecciones.length === 0 ? (
                    <div className="sc-empty-state">
                        <BookOpen size={48} className="sc-empty-state-icon" />
                        <h3>Aún no hay lecciones</h3>
                        <p>Este curso se está preparando. Pronto habrá contenido disponible.</p>
                    </div>
                ) : (
                    <div className="sc-lecciones-list">
                        {lecciones.map(leccion => (
                            <div
                                key={leccion.idLeccion}
                                className="sc-leccion-card"
                                onClick={() => setSelectedLeccion(leccion)}
                            >
                                <div className="sc-leccion-info">
                                    <h3 className="sc-leccion-title">{leccion.titulo}</h3>
                                    <p className="sc-leccion-desc">{leccion.descripcion}</p>
                                    <div className="sc-leccion-meta">
                                        <div className="sc-docente-badge" title="Docente a cargo">
                                            <User size={14} />
                                            {leccion.docenteNombre}
                                        </div>
                                    </div>
                                </div>
                                <div className="sc-leccion-action">
                                    <PlayCircle size={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCourseView;
