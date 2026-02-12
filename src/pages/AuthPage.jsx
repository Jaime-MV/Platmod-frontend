import { useState } from 'react';
import '../components/auth/AuthStyles.css'; 
import { API_URL } from '../config'; 

const AuthPage = () => {
  // Estados de vista
  const [isLoginView, setIsLoginView] = useState(true);
  const [isVerifyView, setIsVerifyView] = useState(false);

  // Datos del formulario (YA NO INCLUYE ROL)
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: ''
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
    setIsVerifyView(false);
    setMessage({ text: '', type: '' });
    // Al limpiar, ya no reiniciamos el rol
    setFormData({ nombre: '', correo: '', contrasena: '' });
  };

  // --- LÓGICA DE LOGIN Y REGISTRO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: 'Procesando...', type: '' });

    const endpoint = isLoginView ? `${API_URL}/auth/login` : `${API_URL}/usuarios`;
    
    // El backend ahora se encarga del Rol, así que enviamos formData limpio
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
           // window.location.href = '/dashboard'; // Descomentar cuando tengas dashboard
        } else {
           // REGISTRO EXITOSO
           setMessage({ text: '¡Cuenta creada con éxito! Por favor inicia sesión.', type: 'success' });
           // Si no tienes verificación por correo real, mandamos directo al login
           setTimeout(() => {
               toggleView(); // Cambia a vista de Login automáticamente
           }, 2000);
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

  // --- RENDERIZADO ---
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

            {/* SE ELIMINÓ EL SELECT DE ROL AQUÍ */}

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