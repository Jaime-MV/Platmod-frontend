import React from 'react';
import './CourseGrid.css';

const CourseGrid = ({ courses }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="course-grid-section">
      <h2 className="section-title">Explora nuestras Escuelas</h2>
      
      <div className="course-grid-container">
        {courses.map((curso) => (
          <div key={curso.idCurso} className="course-card-compact">
            {/* IZQUIERDA: ICONO */}
            <div className="course-icon-wrapper">
              <img 
                src={curso.portadaUrl || "https://static.platzi.com/media/learningpath/emblems/80b010b7-adb8-4274-965d-113d97cb0d5b.jpg"} 
                alt={curso.titulo} 
                className="course-icon-img" 
              />
            </div>

            {/* DERECHA: TEXTO */}
            <div className="course-info-compact">
              <h3 className="course-title-compact">{curso.titulo}</h3>
              <p className="course-meta">
                {/* Texto simulado "X rutas/clases" con flechita verde */}
                <span className="meta-text">12 clases disponibles</span>
                <svg className="meta-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="#98ca3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </p>
            </div>
            
            {/* Enlace que cubre toda la tarjeta para clickear */}
            <a href={`/curso/${curso.idCurso}`} className="card-link-overlay"></a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;