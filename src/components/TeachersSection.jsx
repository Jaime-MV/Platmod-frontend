import { useEffect, useState } from 'react';
import { getDocentesHome } from '../services/api';
import './TeachersSection.css';

const TeachersSection = () => {
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    const fetchDocentes = async () => {
      const data = await getDocentesHome();
      setDocentes(data);
    };
    fetchDocentes();
  }, []);

  if (docentes.length === 0) return null;

  return (
    <section className="teachers-section">
      <div className="teachers-container">
        <h2 className="section-title">
          Nuestros profesores son <span className="highlight">expertos de la industria</span>
        </h2>

        {/* Usamos un contenedor con scroll horizontal (tipo carrusel simple) */}
        <div className="teachers-grid">
          {docentes.map((docente) => (
            <div key={docente.idDocente} className="teacher-card">
              <div className="teacher-image-wrapper">
                <img
                  src={docente.fotoUrl || "https://via.placeholder.com/300x400"}
                  alt={docente.nombre}
                  className="teacher-image"
                />
              </div>

              <div className="teacher-info">
                <h3 className="teacher-name">{docente.nombre}</h3>
                <p className="teacher-specialty">{docente.especialidad}</p>

                {docente.cursoTitulo && (
                  <div className="teacher-course">
                    <span className="course-icon">🚀</span>
                    {/* Cortamos el título si es muy largo para que no rompa el diseño */}
                    <span className="course-name">
                      {docente.cursoTitulo.length > 25
                        ? docente.cursoTitulo.substring(0, 25) + '...'
                        : docente.cursoTitulo}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;