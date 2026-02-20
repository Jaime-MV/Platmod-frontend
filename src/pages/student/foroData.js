// Ejemplo de estructura de preguntas y categorías tipo Brainly
export const foroCategorias = [
  { id: 'matematicas', nombre: 'Matemáticas' },
  { id: 'ciencias', nombre: 'Ciencias' },
  { id: 'historia', nombre: 'Historia' },
  { id: 'idiomas', nombre: 'Idiomas' },
  { id: 'tecnologia', nombre: 'Tecnología' },
];

export const foroPreguntas = [
  {
    id: 1,
    categoria: 'matematicas',
    pregunta: '¿Cómo resuelvo una ecuación cuadrática?',
    respuestas: [
      { id: 1, texto: 'Usa la fórmula general: x = (-b ± √(b²-4ac)) / 2a.', autor: 'Carlos' },
      { id: 2, texto: 'Puedes factorizar si es posible.', autor: 'Ana' }
    ]
  },
  {
    id: 2,
    categoria: 'ciencias',
    pregunta: '¿Qué es la fotosíntesis?',
    respuestas: [
      { id: 1, texto: 'Es el proceso por el cual las plantas convierten luz en energía.', autor: 'Luis' }
    ]
  },
  {
    id: 3,
    categoria: 'idiomas',
    pregunta: '¿Cómo se dice "perro" en inglés?',
    respuestas: [
      { id: 1, texto: 'Dog.', autor: 'María' }
    ]
  },
  {
    id: 4,
    categoria: 'historia',
    pregunta: '¿Quién fue Simón Bolívar?',
    respuestas: [
      { id: 1, texto: 'Fue un líder militar y político sudamericano que liberó varios países.', autor: 'Pedro' }
    ]
  },
  {
    id: 5,
    categoria: 'tecnologia',
    pregunta: '¿Qué es un algoritmo?',
    respuestas: [
      { id: 1, texto: 'Es una secuencia de pasos para resolver un problema.', autor: 'Sofía' }
    ]
  }
];
