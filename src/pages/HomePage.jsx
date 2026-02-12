import { useEffect, useState } from 'react';
import { getCursos, getPlanes } from '../services/api';
import TeachersSection from '../components/TeachersSection'; // 👈 1. IMPORTA EL COMPONENTE (Asegúrate que la ruta sea correcta)
import './HomeStyles.css';

const HomePage = () => {
    const [cursos, setCursos] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const dataCursos = await getCursos();
            const dataPlanes = await getPlanes();
            setCursos(dataCursos);
            setPlanes(dataPlanes);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Cargando la escuela...</div>;

    return (
        <div className="home-container">
            {/* ... Navbar y Hero ... (déjalos igual) */}
            <nav className="navbar">
                <div className="logo">PlatMod <span className="dot">.</span></div>
                <div className="nav-links">
                    <a href="#cursos">Cursos</a>
                    <a href="#planes">Precios</a>
                    <button className="btn-login" onClick={() => window.location.href='/login'}>
                        Acceder
                    </button>
                </div>
            </nav>

            <header className="hero">
                <h1>La escuela de tecnología <br /> <span className="highlight">que necesitas</span></h1>
                <p>Aprende desarrollo de software, diseño e inglés desde cero hasta nivel experto.</p>
                <button className="btn-cta">Comienza Gratis</button>
            </header>

            {/* --- LISTA DE CURSOS --- */}
            <section id="cursos" className="section-container">
                <h2 className="section-title">Nuestros Cursos Recientes</h2>
                <div className="courses-grid">
                    {cursos.map((curso) => (
                        <div key={curso.idCurso} className="course-card">
                            <img src={curso.portadaUrl} alt={curso.titulo} className="course-img" />
                            <div className="course-info">
                                <h3>{curso.titulo}</h3>
                                <p>{curso.descripcion.substring(0, 80)}...</p>
                                <div className="course-footer">
                                    <span className="badge">Nuevo</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ⬇️⬇️⬇️ 2. AQUÍ AGREGAS LA SECCIÓN ⬇️⬇️⬇️ */}
            <TeachersSection />
            {/* ⬆️⬆️⬆️ ESTO ES LO QUE FALTABA ⬆️⬆️⬆️ */}

            {/* --- PLANES DE SUSCRIPCIÓN --- */}
            <section id="planes" className="section-container dark-bg">
                <h2 className="section-title text-white">Planes de Suscripción</h2>
                <div className="pricing-grid">
                    {planes.map((plan) => (
                        <div key={plan.idPlan} className={`pricing-card ${plan.nombre.includes('Expert') ? 'featured' : ''}`}>
                            <h3>{plan.nombre}</h3>
                            <div className="price">${plan.precio}</div>
                            <p className="duration">cada {plan.duracionDias} días</p>
                            <ul className="benefits">
                                <li>✅ Acceso a todos los cursos</li>
                                <li>✅ Certificados digitales</li>
                                {plan.nombre.includes('Expert') && <li>✅ Mentoría personalizada</li>}
                            </ul>
                            <button className="btn-subscribe">Elegir Plan</button>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="footer">
                <p>© 2026 PlatMod. Hecho con ❤️ y Java Spring Boot.</p>
            </footer>
        </div>
    );
};

export default HomePage;