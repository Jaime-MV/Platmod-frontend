import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import CourseGrid from '../../components/CourseGrid';
import ForoPage from './ForoPage';
import { getCursos } from '../../services/api';
import {
    Home,
    MessageSquare,
    Map,
    TrendingUp,
    Award,
    Bell,
    HelpCircle,
    User,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import './StudentStyles.css';

// Hoisted outside component — static data, no re-creation per render (rendering-hoist-jsx)
const MENU_ITEMS = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'comentarios', label: 'Comentarios', icon: MessageSquare },
    { id: 'rutas', label: 'Mis Rutas', icon: Map },
    { id: 'progreso', label: 'Mi progreso', icon: TrendingUp },
    { id: 'certificados', label: 'Mis certificados', icon: Award },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    { id: 'foro', label: 'Foro Q&A', icon: HelpCircle },
];

const PLACEHOLDER_DATA = {
    comentarios: {
        icon: '💬',
        title: 'Tus Comentarios',
        description: 'Aquí podrás ver y gestionar tus comentarios en los cursos.',
        features: ['Historial de comentarios', 'Respuestas recibidas', 'Discusiones activas']
    },
    rutas: {
        icon: '🗺️',
        title: 'Mis Rutas de Aprendizaje',
        description: 'Rutas personalizadas para guiar tu proceso de aprendizaje.',
        features: ['Rutas sugeridas', 'Progreso por ruta', 'Objetivos de aprendizaje']
    },
    progreso: {
        icon: '📊',
        title: 'Mi Progreso',
        description: 'Métricas detalladas de tu avance en los cursos.',
        features: ['Horas de estudio', 'Cursos completados', 'Racha de aprendizaje']
    },
    certificados: {
        icon: '🏆',
        title: 'Mis Certificados',
        description: 'Certificados obtenidos al completar los cursos.',
        features: ['Descargar certificados', 'Compartir en LinkedIn', 'Verificación digital']
    },
    notificaciones: {
        icon: '🔔',
        title: 'Notificaciones',
        description: 'Mantente al día con las novedades de tus cursos.',
        features: ['Nuevas lecciones', 'Actualizaciones de cursos', 'Mensajes del instructor']
    }
};

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [cursos, setCursos] = useState([]);
    const [activeTab, setActiveTab] = useState('inicio');

    useEffect(() => {
        const fetchCursos = async () => {
            const data = await getCursos();
            // Filtrar solo cursos activos
            const visibles = data.filter(curso => Boolean(curso.estado) === true);
            setCursos(visibles);
        };
        fetchCursos();
    }, []);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'foro':
                return <ForoPage />;
            case 'inicio':
                return (
                    <div>
                        <div className="welcome-header">
                            <h1>Hola, {user?.nombre || 'Estudiante'} 👋</h1>
                            <p>Continúa aprendiendo hoy.</p>
                        </div>
                        <h2 className="courses-section-title">Cursos Disponibles</h2>
                        <div className="courses-grid-wrapper">
                            <CourseGrid courses={cursos} />
                        </div>
                    </div>
                );
            case 'foro':
                return <ForoPage />;
            case 'perfil':
                return (
                    <div className="profile-section">
                        <div className="profile-card">
                            <div className="profile-avatar">
                                <User size={48} />
                            </div>
                            <h2>{user?.nombre || 'Estudiante'}</h2>
                            <p className="profile-email">{user?.correo || 'correo@email.com'}</p>
                            <span className="profile-role-badge">{user?.rol || 'ESTUDIANTE'}</span>
                        </div>
                    </div>
                );
            default: {
                const data = PLACEHOLDER_DATA[activeTab];
                if (!data) return null;
                return (
                    <div className="placeholder-section">
                        <div className="placeholder-card">
                            <div className="placeholder-icon-wrapper">
                                <span className="placeholder-icon">{data.icon}</span>
                            </div>
                            <h2>{data.title}</h2>
                            <p className="placeholder-desc">{data.description}</p>
                            <div className="placeholder-features">
                                {data.features.map((feature, i) => (
                                    <div key={i} className="placeholder-feature-item">
                                        <span className="feature-check">✓</span>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="placeholder-badge">Próximamente</div>
                        </div>
                    </div>
                );
            }
        }
    };

    return (
        <div className="student-layout">
            {/* Sidebar */}
            <aside className="student-sidebar">
                {/* Green accent bar */}
                <div className="sidebar-accent-bar"></div>

                <div className="sidebar-inner">
                    {/* Logo */}
                    <div className="sidebar-logo">
                        PlatMod <span className="dot">.</span>
                    </div>

                    {/* Navigation menu */}
                    <nav className="sidebar-nav">
                        <ul className="sidebar-menu">
                            {MENU_ITEMS.map(item => {
                                const IconComponent = item.icon;
                                return (
                                    <li
                                        key={item.id}
                                        className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(item.id)}
                                    >
                                        <IconComponent size={20} strokeWidth={1.8} />
                                        <span>{item.label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer: Theme Toggle + Perfil + Logout */}
                    <div className="sidebar-footer">
                        <button
                            className="sidebar-item sidebar-theme-btn"
                            onClick={toggleTheme}
                            title="Cambiar tema"
                        >
                            {theme === 'light' ? <Moon size={20} strokeWidth={1.8} /> : <Sun size={20} strokeWidth={1.8} />}
                            <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
                        </button>
                        <button
                            className={`sidebar-item sidebar-profile-btn ${activeTab === 'perfil' ? 'active' : ''}`}
                            onClick={() => setActiveTab('perfil')}
                        >
                            <User size={20} strokeWidth={1.8} />
                            <span>Perfil</span>
                        </button>
                        <button className="sidebar-item sidebar-logout-btn" onClick={handleLogout}>
                            <LogOut size={20} strokeWidth={1.8} />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="student-content">
                {renderContent()}
            </main>
        </div>
    );
};

export default StudentDashboard;
