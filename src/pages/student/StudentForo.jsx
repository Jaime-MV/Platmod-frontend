import React, { useState } from 'react';
import './StudentForoBraile.css';
import { useAuth } from '../../context/AuthContext';

const categorias = [
  { id: 'matematicas', nombre: 'Matemáticas' },
  { id: 'ciencias', nombre: 'Ciencias' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'idiomas', nombre: 'Idiomas' },
  { id: 'tecnologia', nombre: 'Tecnología' },
];

const preguntasEjemploInicial = [
  {
    id: 1,
    categoria: 'matematicas',
    pregunta: '¿Cómo resuelvo una ecuación cuadrática?',
    autor: 'Carlos',
    respuestas: [
      { id: 1, texto: 'Usa la fórmula general: x = (-b ± √(b²-4ac)) / 2a.', autor: 'Ana' },
      { id: 2, texto: 'Puedes factorizar si es posible.', autor: 'Luis' }
    ]
  },
  {
    id: 2,
    categoria: 'ciencias',
    pregunta: '¿Qué es la fotosíntesis?',
    autor: 'María',
    respuestas: [
      { id: 1, texto: 'Es el proceso por el cual las plantas convierten luz en energía.', autor: 'Pedro' }
    ]
  },
  {
    id: 3,
    categoria: 'idiomas',
    pregunta: '¿Cómo se dice "perro" en inglés?',
    autor: 'Sofía',
    respuestas: [
      { id: 1, texto: 'Dog.', autor: 'Ana' }
    ]
  },
  {
    id: 4,
    categoria: 'historia',
    pregunta: '¿Quién fue Simón Bolívar?',
    autor: 'Pedro',
    respuestas: [
      { id: 1, texto: 'Fue un líder militar y político sudamericano que liberó varios países.', autor: 'Luis' }
    ]
  },
  {
    id: 5,
    categoria: 'tecnologia',
    pregunta: '¿Qué es un algoritmo?',
    autor: 'Sofía',
    respuestas: [
      { id: 1, texto: 'Es una secuencia de pasos para resolver un problema.', autor: 'Carlos' }
    ]
  }
];

const StudentForo = () => {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [respuestas, setRespuestas] = useState('');
  const [preguntas, setPreguntas] = useState(preguntasEjemploInicial);
  const [showForm, setShowForm] = useState(false);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');

  // Filtrar preguntas
  const preguntasFiltradas = preguntas.filter(p => {
    const matchCategoria = categoria ? p.categoria === categoria : true;
    const matchBusqueda = busqueda
      ? busqueda
          .toLowerCase()
          .split(' ')
          .every(word => p.pregunta.toLowerCase().includes(word))
      : true;
    return matchCategoria && matchBusqueda;
  });

  // Función para resaltar coincidencias
  const highlightMatch = (text, search) => {
    if (!search) return text;
    const words = search.toLowerCase().split(' ').filter(Boolean);
    let result = text;
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<span class="foro-highlight">$1</span>');
    });
    return result;
  };

  // Añadir respuesta
  const handleResponder = () => {
    if (respuestas && preguntaSeleccionada) {
      const nuevasPreguntas = preguntas.map(p => {
        if (p.id === preguntaSeleccionada.id) {
          return {
            ...p,
            respuestas: [...p.respuestas, { id: p.respuestas.length + 1, texto: respuestas, autor: user?.nombre || user?.correo || 'Tú' }]
          };
        }
        return p;
      });
      setPreguntas(nuevasPreguntas);
      setRespuestas('');
    }
  };

  // Crear nueva pregunta
  const handleCrearPregunta = e => {
    e.preventDefault();
    if (nuevaPregunta && nuevaCategoria) {
      setPreguntas([
        {
          id: preguntas.length + 1,
          categoria: nuevaCategoria,
          pregunta: nuevaPregunta,
          autor: user?.nombre || user?.correo || 'Tú',
          respuestas: [],
          propia: true
        },
        ...preguntas
      ]);
      setNuevaPregunta('');
      setNuevaCategoria('');
      setShowForm(false);
    }
  };

  // Determinar si la pregunta es propia
  const esPropia = (p) => {
    return p.propia || (user && (p.autor === user?.nombre || p.autor === user?.correo));
  };

  return (
    <div className="foro-main-wrapper">
      <div className="foro-header-modern animate-fade-in">
        <h1>Foro de la Comunidad</h1>
        <p>Pregunta, responde y aprende junto a otros estudiantes.</p>
      </div>
      <div className="foro-search-bar">
        <input
          type="text"
          placeholder="Buscar pregunta..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <button className="foro-agregar-btn" onClick={() => setShowForm(true)}>
          + Agregar pregunta
        </button>
      </div>
      {showForm && (
        <div className="foro-form-modal animate-scale-in">
          <form className="foro-form foro-form-mejorado" onSubmit={handleCrearPregunta}>
            <div className="foro-form-header">
              <h2>Agregar nueva pregunta</h2>
              <span className="foro-form-close" onClick={() => setShowForm(false)}>✕</span>
            </div>
            <div className="foro-form-user">Usuario: <span>{user?.nombre || user?.correo || 'Tú'}</span></div>
            <select
              value={nuevaCategoria}
              onChange={e => setNuevaCategoria(e.target.value)}
              required
            >
              <option value="">Selecciona categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <textarea
              placeholder="Escribe tu pregunta..."
              value={nuevaPregunta}
              onChange={e => setNuevaPregunta(e.target.value)}
              required
              rows={3}
            />
            <div className="foro-form-actions">
              <button type="submit" className="foro-form-btn">Agregar</button>
              <button type="button" className="foro-form-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {!preguntaSeleccionada ? (
        <div className="foro-lista-preguntas animate-slide-up">
          <h2>Preguntas recientes</h2>
          <ul>
            {preguntasFiltradas.length === 0 ? (
              <li className="foro-no-pregunta">No se encontraron preguntas.</li>
            ) : (
              preguntasFiltradas.map(p => (
                <li key={p.id} className={`foro-pregunta-card animate-scale-in${esPropia(p) ? ' foro-pregunta-propia' : ''}`}>
                  <div className="foro-pregunta-info">
                    <span className="foro-pregunta-categoria">{categorias.find(cat => cat.id === p.categoria)?.nombre}</span>
                    <strong dangerouslySetInnerHTML={{__html: highlightMatch(p.pregunta, busqueda)}} />
                    <span className="foro-pregunta-autor">Por {p.autor}</span>
                  </div>
                  {esPropia(p) && <span className="foro-pregunta-badge">Tu pregunta</span>}
                  <button className="foro-detalles-btn" onClick={() => setPreguntaSeleccionada(p)}>
                    Ver detalles
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <div className="foro-detalle-pregunta animate-fade-in">
          <button className="foro-volver-btn" onClick={() => setPreguntaSeleccionada(null)}>← Volver</button>
          <div className="foro-detalle-header">
            <span className="foro-detalle-categoria">{categorias.find(cat => cat.id === preguntaSeleccionada.categoria)?.nombre}</span>
            <h2>{preguntaSeleccionada.pregunta}</h2>
            <span className="foro-detalle-autor">Por {preguntaSeleccionada.autor}</span>
            {esPropia(preguntaSeleccionada) && <span className="foro-pregunta-badge">Tu pregunta</span>}
          </div>
          <div className="foro-respuestas-list">
            <h3>Respuestas</h3>
            <ul>
              {preguntaSeleccionada.respuestas.length === 0 ? (
                <li className="foro-no-respuesta">Sé el primero en responder.</li>
              ) : (
                preguntaSeleccionada.respuestas.map(r => (
                  <li key={r.id} className="foro-respuesta-card animate-scale-in">
                    <span className="foro-respuesta-autor">{r.autor}</span>
                    <span className="foro-respuesta-texto">{r.texto}</span>
                  </li>
                ))
              )}
            </ul>
            <div className="foro-responder-box">
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                value={respuestas}
                onChange={e => setRespuestas(e.target.value)}
              />
              <button className="foro-responder-btn" onClick={handleResponder}>Responder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForo;
