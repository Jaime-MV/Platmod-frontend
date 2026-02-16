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

        <div className="carousel-wrapper" style={{ position: 'relative' }}>
          <button
            className="carousel-btn prev"
            onClick={() => document.querySelector('.teachers-grid').scrollBy({ left: -300, behavior: 'smooth' })}
          >
            &#8249;
          </button>

          <div className="teachers-grid">
            {docentes.map((docente) => (
              <div key={docente.idDocente} className="teacher-card">
                <div className="teacher-image-wrapper">
                  <img
                    src={docente.fotoUrl && !docente.fotoUrl.includes('?text=C:') ? docente.fotoUrl : "https://via.placeholder.com/300x400?text=Docente"}
                    alt={docente.nombre}
                    className="teacher-image"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x400?text=Docente"; }}
                  />
                </div>

                <div className="teacher-info">
                  <h3 className="teacher-name">{docente.nombre}</h3>
                  <p className="teacher-specialty">{docente.especialidad}</p>

                  {docente.cursoTitulo && (
                    <div className="teacher-course">
                      <span className="course-icon">🚀</span>
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

          <button
            className="carousel-btn next"
            onClick={() => document.querySelector('.teachers-grid').scrollBy({ left: 300, behavior: 'smooth' })}
          >
            &#8250;
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;