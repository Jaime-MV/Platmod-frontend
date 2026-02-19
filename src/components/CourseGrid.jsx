import React from 'react';
import './CourseGrid.css';

// Hoisted fallback handler outside component (rendering-hoist-jsx)
const handleImgError = (e) => {
  e.target.src = 'https://via.placeholder.com/50?text=C';
};

const CourseGrid = React.memo(({ courses }) => {
  // 1. Manejo de estado vacío — check length first (js-length-check-first)
  if (!courses || courses.length === 0) {
    return (
      <section className="course-grid-section">
        <h2 className="section-title">Explora nuestros cursos</h2>
        <div style={{ textAlign: 'center', color: '#8da2c0', padding: '40px' }}>
          <p>No hay cursos disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="course-grid-section">
      <h2 className="section-title">Explora nuestros cursos</h2>

      <div className="course-grid-container">
        {courses.map((curso) => (
          <div key={curso.idCurso} className="course-card-compact">
            {/* ICONO / PORTADA */}
            <div className="course-icon-wrapper">
              <img
                src={curso.portadaUrl || "https://via.placeholder.com/50"}
                alt={curso.titulo}
                className="course-icon-img"
                onError={handleImgError}
              />
            </div>

            {/* TEXTOS */}
            <div className="course-info-compact">
              <h3 className="course-title-compact">{curso.titulo}</h3>
              <div className="course-meta">
                <span>Ver contenido</span>
                <span className="meta-arrow">→</span>
              </div>
            </div>

            {/* LINK FANTASMA */}
            <a href={`#curso-${curso.idCurso}`} className="card-link-overlay" aria-label={`Ver curso ${curso.titulo}`}></a>
          </div>
        ))}
      </div>
    </section>
  );
});

CourseGrid.displayName = 'CourseGrid';

export default CourseGrid;