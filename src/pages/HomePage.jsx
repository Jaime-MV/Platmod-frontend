import { useEffect, useState } from 'react';
import { getCursos, getPlanes } from '../services/api';
import TeachersSection from '../components/TeachersSection';
import CourseGrid from '../components/CourseGrid';
import { useTheme } from '../context/ThemeContext'; // Importar hook de tema
import './HomeStyles.css';

const HomePage = () => {
    const [cursos, setCursos] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme(); // Usar hook

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Ejecutamos ambas peticiones en paralelo para que cargue más rápido
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

    if (loading) return <div className="loading">Cargando la escuela...</div>;

    // --- FILTRADO DE CURSOS ---
    // Filtramos aquí para pasarle al grid SOLO los cursos que deben verse.
    // Usamos Boolean() para asegurar que funcione con 1 (MySQL) o true (Postgres/JSON).
    const cursosVisibles = cursos.filter(curso => Boolean(curso.estado) === true);

    return (
        <div className="home-container">
            {/* ... Navbar ... */}
            <nav className="navbar">
                <div className="logo">PlatMod <span className="dot">.</span></div>
                <div className="nav-links">
                    <a href="#cursos">Cursos</a>
                    <a href="#planes">Precios</a>
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Cambiar tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button className="btn-login" onClick={() => window.location.href = '/login'}>
                        Acceder
                    </button>
                </div>
            </nav>

            {/* ... Hero Section ... */}
            <header className="hero">
                <h1>La escuela de tecnología <br /> <span className="highlight">que necesitas</span></h1>
                <p>Aprende desarrollo de software, diseño e inglés desde cero hasta nivel experto.</p>
                <button className="btn-cta">Comienza Gratis</button>
            </header>

            {/* ⬇️ SECCIÓN DE CURSOS (GRID NUEVO) ⬇️ */}
            <div id="cursos" className="section-container">
                <CourseGrid courses={cursosVisibles} />
            </div>

            {/* Sección de Profesores */}
            <TeachersSection />

            {/* --- PLANES DE SUSCRIPCIÓN --- */}
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
                                        // Fallback si no hay beneficios en DB aún
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