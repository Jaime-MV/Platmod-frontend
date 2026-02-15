import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORTAR ESTO
import { useAuth } from '../context/AuthContext';
import '../components/auth/AuthStyles.css';
import { API_URL } from '../config';

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // <--- 2. INICIALIZAR EL HOOK

  // Estados de vista
  const [isLoginView, setIsLoginView] = useState(true);

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setMessage({ text: '', type: '' });
    setFormData({ nombre: '', correo: '', contrasena: '' });
  };

  // --- LÓGICA DE LOGIN Y REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Procesando...', type: '' });

    const endpoint = isLoginView ? `${API_URL}/auth/login` : `${API_URL}/usuarios`;

    const bodyPayload = isLoginView
      ? { correo: formData.correo, contrasena: formData.contrasena }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      let data = {};
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.warn("No se pudo parsear la respuesta JSON");
      }

      if (response.ok) {
        // --- ÉXITO ---
        if (isLoginView) {
          // 1. Usar función login del contexto
          login({
            id: data.idUsuario,
            nombre: data.nombre,
            correo: data.correo,
            rol: data.rol
          }, data.token);

          setMessage({ text: '¡Bienvenido!', type: 'success' });

          // 3. REDIRECCIÓN INTELIGENTE
          setTimeout(() => {
            if (data.rol === 'ADMINISTRADOR') {
              console.log("Redirigiendo a Dashboard Admin...");
              navigate('/admin'); // <--- Llevamos al Admin a su panel
            } else {
              console.log("Redirigiendo a Home...");
              navigate('/'); // <--- Llevamos a estudiantes/docentes al Home
            }
          }, 1000); // Pequeño delay para que lean "Bienvenido"

        } else {
          setMessage({ text: '¡Cuenta creada! Inicia sesión.', type: 'success' });
          setTimeout(() => toggleView(), 2000);
        }
      } else {
        // --- ERROR ---
        if (response.status === 403) {
          setMessage({ text: 'Acceso denegado (403). Verifica tus credenciales.', type: 'error' });
        } else if (response.status === 401) {
          setMessage({ text: 'Correo o contraseña incorrectos.', type: 'error' });
        } else {
          const errorMsg = data.message || data.error || `Error (${response.status})`;
          setMessage({ text: errorMsg, type: 'error' });
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
      setMessage({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    }
  };

  // --- RENDERIZADO (Sin cambios mayores, solo quité variables no usadas) ---
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLoginView && (
            <div className="input-group">
              <label className="input-label" htmlFor="nombre">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                className="auth-input"
                placeholder="Ej. Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required={!isLoginView}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="correo">Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              className="auth-input"
              placeholder="tu@email.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              name="contrasena"
              className="auth-input"
              placeholder="******"
              value={formData.contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-gold">
            {isLoginView ? 'Ingresar' : 'Registrarme'}
          </button>
        </form>

        <p className="toggle-text">
          {isLoginView ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <span className="toggle-link" onClick={toggleView}>
            {isLoginView ? 'Regístrate aquí' : 'Inicia sesión'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;