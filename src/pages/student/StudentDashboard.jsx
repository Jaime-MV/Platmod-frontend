import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CourseGrid from '../../components/CourseGrid';
import { getCursos } from '../../services/api';
import {
    Home,
    MessageSquare,
    Map,
    TrendingUp,
    Award,
    Bell,
    User,
    LogOut
} from 'lucide-react';
import './StudentStyles.css';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
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

    const menuItems = [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'comentarios', label: 'Comentarios', icon: MessageSquare },
        { id: 'rutas', label: 'Mis Rutas', icon: Map },
        { id: 'progreso', label: 'Mi progreso', icon: TrendingUp },
        { id: 'certificados', label: 'Mis certificados', icon: Award },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderContent = () => {
        switch (activeTab) {
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
            default:
                return (
                    <div className="placeholder-section">
                        <div className="placeholder-icon">🚧</div>
                        <h2>Sección en construcción</h2>
                        <p>Pronto podrás ver tus {activeTab} aquí.</p>
                    </div>
                );
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
                            {menuItems.map(item => {
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

                    {/* Footer: Perfil + Logout */}
                    <div className="sidebar-footer">
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
