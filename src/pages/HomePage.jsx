import { useEffect, useState } from 'react';
import { getCursos, getPlanes } from '../services/api';
import TeachersSection from '../components/TeachersSection';
import CourseGrid from '../components/CourseGrid'; // 👈 1. IMPORTAMOS EL NUEVO COMPONENTE
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
            {/* ... Navbar ... */}
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

            {/* ... Hero Section ... */}
            <header className="hero">
                <h1>La escuela de tecnología <br /> <span className="highlight">que necesitas</span></h1>
                <p>Aprende desarrollo de software, diseño e inglés desde cero hasta nivel experto.</p>
                <button className="btn-cta">Comienza Gratis</button>
            </header>

            {/* ⬇️⬇️⬇️ 2. AQUÍ ESTÁ EL CAMBIO PRINCIPAL ⬇️⬇️⬇️ */}
            {/* Reemplazamos la sección vieja por el nuevo Grid Compacto */}
            <div id="cursos">
                <CourseGrid courses={cursos} />
            </div>
            {/* ⬆️⬆️⬆️ FIN DEL CAMBIO ⬆️⬆️⬆️ */}

            {/* Sección de Profesores (Carrusel Rojo) */}
            <TeachersSection />

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