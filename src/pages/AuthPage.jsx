import { useState } from 'react';
import '../components/auth/AuthStyles.css'; 
import { API_URL } from '../config'; 

const AuthPage = () => {
  // Estados de vista
  const [isLoginView, setIsLoginView] = useState(true);
  const [isVerifyView, setIsVerifyView] = useState(false); // NUEVO ESTADO: Vista de verificación

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'ESTUDIANTE'
  });

  // Estado para el código de verificación
  const [codigo, setCodigo] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setIsVerifyView(false); // Reiniciar verificación si cambia de vista manual
    setMessage({ text: '', type: '' });
    setFormData({ nombre: '', correo: '', contrasena: '', rol: 'ESTUDIANTE' });
  };

  // --- 1. LÓGICA DE LOGIN Y REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Procesando...', type: '' });

    const endpoint = isLoginView ? `${API_URL}/auth/login` : `${API_URL}/usuarios`;
    
    // Si es login, solo mandamos correo/pass. Si es registro, todo el objeto.
    const bodyPayload = isLoginView 
      ? { correo: formData.correo, contrasena: formData.contrasena }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLoginView) {
           // LOGIN EXITOSO
           localStorage.setItem('token', data.token);
           setMessage({ text: '¡Bienvenido! Redirigiendo...', type: 'success' });
           // Aquí podrías redirigir al dashboard
        } else {
           // REGISTRO EXITOSO -> MOSTRAR PANTALLA DE VERIFICACIÓN
           setMessage({ text: '¡Cuenta creada! Revisa tu correo e ingresa el código.', type: 'success' });
           setIsVerifyView(true); // <--- CAMBIO CLAVE: Activamos la vista de verificación
        }
      } else {
        const errorMsg = data.message || data.error || 'Ocurrió un error.';
        setMessage({ text: `Error: ${errorMsg}`, type: 'error' });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ text: 'No se pudo conectar con el servidor.', type: 'error' });
    }
  };

  // --- 2. NUEVA LÓGICA DE VERIFICACIÓN ---
  const handleVerifySubmit = async (e) => {
      e.preventDefault();
      setMessage({ text: 'Verificando código...', type: '' });

      try {
          const response = await fetch(`${API_URL}/auth/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  correo: formData.correo, // Usamos el correo que ya escribió el usuario
                  codigo: codigo
              })
          });

          if (response.ok) {
              setMessage({ text: '¡Verificación exitosa! Ahora puedes iniciar sesión.', type: 'success' });
              setTimeout(() => {
                  setIsVerifyView(false); // Ocultamos verificación
                  setIsLoginView(true);   // Mostramos Login
                  setCodigo('');          // Limpiamos código
              }, 2000);
          } else {
              setMessage({ text: 'Código incorrecto o expirado.', type: 'error' });
          }
      } catch (error) {
          setMessage({ text: 'Error de conexión al verificar.', type: 'error' });
      }
  };

  // --- RENDERIZADO ---
  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* TÍTULO DINÁMICO */}
        <h2 className="auth-title">
          {isVerifyView ? 'Verificar Cuenta' : (isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta')}
        </h2>

        {message.text && (
            <div className={`message ${message.type}`}>
                {message.text}
            </div>
        )}

        {/* --- VISTA DE VERIFICACIÓN (NUEVA) --- */}
        {isVerifyView ? (
            <form className="auth-form" onSubmit={handleVerifySubmit}>
                <p style={{marginBottom: '15px', color: '#666'}}>
                    Hemos enviado un código de 6 dígitos a <strong>{formData.correo}</strong>
                </p>
                <div className="input-group">
                    <label className="input-label">Código de Verificación</label>
                    <input
                        type="text"
                        className="auth-input"
                        placeholder="Ej. 123456"
                        maxLength="6"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-gold">Verificar Código</button>
                <p className="toggle-text" style={{cursor:'pointer'}} onClick={() => setIsVerifyView(false)}>
                    Volver
                </p>
            </form>
        ) : (
            /* --- VISTAS NORMALES (LOGIN / REGISTRO) --- */
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

               {!isLoginView && (
                <div className="input-group">
                  <label className="input-label" htmlFor="rol">Rol</label>
                  <select
                      name="rol"
                      className="auth-select"
                      value={formData.rol}
                      onChange={handleChange}
                  >
                      <option value="ESTUDIANTE">Estudiante</option>
                      <option value="DOCENTE">Docente</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn-gold">
                {isLoginView ? 'Ingresar' : 'Registrarme'}
              </button>
            </form>
        )}

        {/* --- PIE DE PÁGINA (Toggle Login/Registro) --- */}
        {!isVerifyView && (
            <p className="toggle-text">
            {isLoginView ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <span className="toggle-link" onClick={toggleView}>
                {isLoginView ? 'Regístrate aquí' : 'Inicia sesión'}
            </span>
            </p>
        )}

      </div>
    </div>
  );
};

export default AuthPage;