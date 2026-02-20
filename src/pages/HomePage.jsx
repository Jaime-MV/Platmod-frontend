import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCursos, getPlanes } from '../services/api';
import { useAuth } from '../components/auth/AuthContext';
import TeachersSection from '../components/TeachersSection';
import CourseGrid from '../components/CourseGrid';
import { useTheme } from '../context/ThemeContext';
import './HomeStyles.css';

const HomePage = () => {
    const [cursos, setCursos] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Dropdown state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataCursos, dataPlanes] = await Promise.all([
                    getCursos(),
                    getPlanes()
                ]);
                setCursos(dataCursos);
                setPlanes(dataPlanes);
            } catch (error) {
                console.error("Error cargando datos del home:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading) return <div className="loading">Cargando la escuela...</div>;

    const cursosVisibles = cursos.filter(curso => Boolean(curso.estado) === true);

    // Get user initial for avatar
    const userInitial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

    const handleEditProfile = () => {
        setDropdownOpen(false);
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
    };

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">PlatMod <span className="dot">.</span></div>
                <div className="nav-links">
                    <a href="#cursos">Cursos</a>
                    <a href="#planes">Precios</a>
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {/* Conditional: Avatar dropdown or Login button */}
                    {isAuthenticated ? (
                        <div className="user-menu-container" ref={dropdownRef}>
                            <button
                                className="user-avatar-btn"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                title={user?.nombre || 'Mi perfil'}
                            >
                                {userInitial}
                            </button>

                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <div className="user-dropdown-avatar">{userInitial}</div>
                                        <div className="user-dropdown-info">
                                            <span className="user-dropdown-name">{user?.nombre || 'Usuario'}</span>
                                            <span className="user-dropdown-email">{user?.correo || ''}</span>
                                        </div>
                                    </div>
                                    <div className="user-dropdown-divider"></div>
                                    <button className="user-dropdown-item" onClick={handleEditProfile}>
                                        ✏️ Editar Perfil
                                    </button>
                                    <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="btn-login" onClick={() => navigate('/login')}>
                            Acceder
                        </button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <h1>La escuela de tecnología <br /> <span className="highlight">que necesitas</span></h1>
                <p>Aprende desarrollo de software, diseño e inglés desde cero hasta nivel experto.</p>
                <button
                    className="btn-cta"
                    onClick={() => {
                        if (isAuthenticated) {
                            navigate('/dashboard');
                        } else {
                            document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                >
                    {isAuthenticated ? 'Ir al Dashboard' : 'Comienza Gratis'}
                </button>
            </header>

            {/* Cursos */}
            <div id="cursos" className="section-container">
                <CourseGrid courses={cursosVisibles} />
            </div>

            {/* Profesores */}
            <TeachersSection />

            {/* Planes */}
            <section id="planes" className="section-container">
                <h2 className="section-title">Planes de Suscripción</h2>
                <div className="pricing-grid">
                    {planes.map((plan) => {
                        const hasDiscount = plan.ofertaActiva && plan.descuento > 0;
                        const finalPrice = hasDiscount
                            ? (plan.precio * (1 - plan.descuento / 100)).toFixed(2)
                            : plan.precio;

                        return (
                            <div key={plan.idPlan} className={`pricing-card ${plan.nombre.includes('Expert') ? 'featured' : ''}`}>
                                {hasDiscount && (
                                    <div className="discount-badge">¡OFERTA {Math.floor(plan.descuento)}% OFF!</div>
                                )}
                                <h3>{plan.nombre}</h3>
                                <div className="price-container">
                                    {hasDiscount && <span className="original-price">${plan.precio}</span>}
                                    <div className="price">${finalPrice}</div>
                                </div>
                                <p className="duration">cada {plan.duracionDias} días</p>
                                <ul className="benefits">
                                    {plan.beneficios && plan.beneficios.length > 0 ? (
                                        plan.beneficios.map(b => (
                                            <li key={b.idBeneficio}>✅ {b.descripcion}</li>
                                        ))
                                    ) : (
                                        <>
                                            <li>✅ Acceso a contenido</li>
                                            <li>✅ Soporte básico</li>
                                        </>
                                    )}
                                </ul>
                                <button className="btn-subscribe">Elegir Plan</button>
                            </div>
                        );
                    })}
                </div>
            </section>

            <footer className="footer">
                <p>© 2026 PlatMod. Hecho con  Java Spring Boot.</p>
            </footer>
        </div>
    );
};

export default HomePage;