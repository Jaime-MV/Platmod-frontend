import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPlanes } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './PagoPlanesStyles.css';

const PagoPlanes = () => {
  const { idPlan } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [wasAuthenticating, setWasAuthenticating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(5);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planes = await getPlanes();
        const selectedPlan = planes.find(p => p.idPlan === parseInt(idPlan));
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          setError('Plan no encontrado');
        }
      } catch (err) {
        setError('Error cargando el plan');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [idPlan]);

  // Detectar si el usuario se autenticó después de venir de login/registro
  useEffect(() => {
    if (isAuthenticated && wasAuthenticating) {
      // El usuario se autenticó exitosamente, mantener la página de pagos visible
      setWasAuthenticating(false);
    }
  }, [isAuthenticated, wasAuthenticating]);

  // Countdown para la pantalla de éxito
  useEffect(() => {
    if (paymentSuccess && successCountdown > 0) {
      const timer = setTimeout(() => {
        setSuccessCountdown(successCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && successCountdown === 0) {
      navigate('/dashboard');
    }
  }, [paymentSuccess, successCountdown, navigate]);

  // Detectar si el usuario está intentando iniciar sesión
  const handleLoginRedirect = () => {
    setWasAuthenticating(true);
    navigate('/login', { 
      state: { 
        from: `/planes/${idPlan}`,
        returnToPlan: true 
      } 
    });
  };

  const handleRegisterRedirect = () => {
    setWasAuthenticating(true);
    navigate('/login', { 
      state: { 
        isRegister: true,
        from: `/planes/${idPlan}`,
        returnToPlan: true 
      } 
    });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear número de tarjeta
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }

    // Formatear fecha de vencimiento
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    }

    // Limitar CVV a 4 dígitos
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentForm({
      ...paymentForm,
      [name]: formattedValue
    });
    setPaymentError(null);
  };

  const validatePaymentForm = () => {
    const cardNumberClean = paymentForm.cardNumber.replace(/\s/g, '');
    
    if (!paymentForm.cardName.trim()) {
      setPaymentError('El nombre en la tarjeta es requerido');
      return false;
    }

    if (cardNumberClean.length !== 16) {
      setPaymentError('El número de tarjeta debe tener 16 dígitos');
      return false;
    }

    if (!paymentForm.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setPaymentError('La fecha de vencimiento debe estar en formato MM/YY');
      return false;
    }

    if (paymentForm.cvv.length !== 3 && paymentForm.cvv.length !== 4) {
      setPaymentError('El CVV debe tener 3 o 4 dígitos');
      return false;
    }

    const [month, year] = paymentForm.expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      setPaymentError('La tarjeta ha expirado');
      return false;
    }

    return true;
  };

  const handleProcessPayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // Simulación de procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mostrar pantalla de éxito
      setPaymentSuccess(true);
      setSuccessCountdown(5);
    } catch (err) {
      setPaymentError('Error al procesar el pago. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setProcessingPayment(false);
    }
  };


  if (loading) {
    return <div className="loading-container">Cargando plan...</div>;
  }

  if (error || !plan) {
    return (
      <div className="error-container">
        <h2>{error || 'Plan no encontrado'}</h2>
        <button className="btn-back" onClick={() => navigate('/')}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="pago-planes-container">
        <div className="success-overlay">
          <div className="success-content">
            <div className="success-animation">
              <div className="checkmark-circle">
                <div className="checkmark">✓</div>
              </div>
            </div>
            
            <h1 className="success-title">¡Pago Exitoso!</h1>
            <p className="success-subtitle">Tu suscripción ha sido activada correctamente</p>
            
            <div className="success-plan-info">
              <h3>{plan.nombre}</h3>
              <p className="success-plan-price">${plan.precio}</p>
              <p className="success-plan-duration">Válido por {plan.duracionDias} días</p>
            </div>

            <div className="success-features">
              <h4>Ahora tienes acceso a:</h4>
              <ul>
                {plan.beneficios && plan.beneficios.length > 0 ? (
                  plan.beneficios.map(b => (
                    <li key={b.idBeneficio}>✓ {b.descripcion}</li>
                  ))
                ) : (
                  <>
                    <li>✓ Acceso completo al contenido</li>
                    <li>✓ Soporte prioritario</li>
                    <li>✓ Certificados de finalización</li>
                  </>
                )}
              </ul>
            </div>

            <div className="success-redirect">
              <p>Redirigiendo a tu dashboard en {successCountdown} segundos...</p>
              <button 
                className="btn-go-dashboard"
                onClick={() => navigate('/dashboard')}
              >
                Ir ahora al Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pago-planes-container">
        <header className="pago-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Volver
          </button>
          <h1>Suscribirse al Plan</h1>
          <div></div>
        </header>

        <div className="auth-modal-overlay">
          <div className="auth-modal-content">
            <button className="modal-close" onClick={() => navigate('/')}>✕</button>
            
            <div className="auth-modal-header">
              <h2>Acceso Requerido</h2>
              <p>Para suscribirse a este plan necesitas tener una cuenta activa</p>
            </div>

            <div className="plan-preview">
              <h3>{plan.nombre}</h3>
              <p className="preview-price">${plan.precio}</p>
            </div>

            <div className="auth-options">
              <button
                className="btn-auth-option login"
                onClick={handleLoginRedirect}
              >
                <span className="option-icon">🔑</span>
                <div className="option-text">
                  <strong>Iniciar Sesión</strong>
                  <small>Si ya tienes una cuenta</small>
                </div>
              </button>

              <div className="divider">o</div>

              <button
                className="btn-auth-option register"
                onClick={handleRegisterRedirect}
              >
                <span className="option-icon">✏️</span>
                <div className="option-text">
                  <strong>Registrarse</strong>
                  <small>Crear una nueva cuenta</small>
                </div>
              </button>
            </div>

            <div className="security-info">
              <p>🔒 Tu información está protegida con encriptación SSL</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = plan.ofertaActiva && plan.descuento > 0;
  const finalPrice = hasDiscount
    ? (plan.precio * (1 - plan.descuento / 100)).toFixed(2)
    : plan.precio;

  const totalPrice = (finalPrice * quantity).toFixed(2);

  return (
    <div className="pago-planes-container">
      {/* Header */}
      <header className="pago-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Volver
        </button>
        <h1>Confirmación de Plan</h1>
        <div></div>
      </header>

      {/* Main Content */}
      <div className="pago-content">
        {/* Plan Details */}
        <div className="plan-detail-card">
          <div className="plan-header">
            <h2>{plan.nombre}</h2>
            {hasDiscount && (
              <span className="discount-badge">¡OFERTA {Math.floor(plan.descuento)}% OFF!</span>
            )}
          </div>

          <div className="plan-info">
            <p className="plan-description">{plan.descripcion || 'Plan de suscripción premium'}</p>

            <div className="price-section">
              <div className="price-display">
                <p className="label">Precio por período:</p>
                {hasDiscount && (
                  <p className="original-price">
                    ${plan.precio} <span className="strikethrough">original</span>
                  </p>
                )}
                <p className="final-price">${finalPrice}</p>
                <p className="duration">cada {plan.duracionDias} días</p>
              </div>
            </div>

            <div className="benefits-section">
              <h3>Beneficios incluidos:</h3>
              <ul className="benefits-list">
                {plan.beneficios && plan.beneficios.length > 0 ? (
                  plan.beneficios.map(b => (
                    <li key={b.idBeneficio}>
                      <span className="checkmark">✅</span>
                      <span>{b.descripcion}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li><span className="checkmark">✅</span> Acceso a contenido</li>
                    <li><span className="checkmark">✅</span> Soporte técnico</li>
                    <li><span className="checkmark">✅</span> Materiales descargables</li>
                    <li><span className="checkmark">✅</span> Certificado al completar</li>
                  </>
                )}
              </ul>
            </div>

            {/* User Info */}
            {isAuthenticated && (
              <div className="user-info-section">
                <h3>Información de la cuenta:</h3>
                <div className="info-display">
                  <p><strong>Usuario:</strong> {user?.nombre}</p>
                  <p><strong>Correo:</strong> {user?.correo}</p>
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label htmlFor="quantity">Cantidad de períodos:</label>
              <div className="quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity === 1}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                />
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="total-section">
              <div className="total-row">
                <span className="total-label">Subtotal ({quantity} período(s)):</span>
                <span className="total-amount">${totalPrice}</span>
              </div>
              {hasDiscount && (
                <div className="discount-row">
                  <span>Descuento ({plan.descuento}%):</span>
                  <span className="discount-amount">
                    -${((plan.precio * quantity) - totalPrice).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="btn-subscribe-primary"
                onClick={() => document.getElementById('payment-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Proceder al Pago - ${totalPrice}
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                Ver Otros Planes
              </button>
            </div>
          </div>
        </div>

        {/* Payment Form Section */}
        <div className="payment-section" id="payment-form">
          <div className="payment-card">
            <h3>Información de Pago</h3>
            <p className="payment-subtitle">Completa los datos de tu tarjeta para finalizar la suscripción</p>

            {paymentError && (
              <div className="error-alert">
                ⚠️ {paymentError}
              </div>
            )}

            <div className="payment-form">
              <div className="form-group">
                <label htmlFor="cardName">Nombre en la Tarjeta:</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  placeholder="Juan Pérez"
                  value={paymentForm.cardName}
                  onChange={handlePaymentInputChange}
                  disabled={processingPayment}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Número de Tarjeta:</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={paymentForm.cardNumber}
                  onChange={handlePaymentInputChange}
                  disabled={processingPayment}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Vencimiento (MM/YY):</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="12/25"
                    maxLength="5"
                    value={paymentForm.expiryDate}
                    onChange={handlePaymentInputChange}
                    disabled={processingPayment}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV:</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    maxLength="4"
                    value={paymentForm.cvv}
                    onChange={handlePaymentInputChange}
                    disabled={processingPayment}
                  />
                </div>
              </div>

              <div className="payment-summary">
                <div className="summary-row">
                  <span>Plan: {plan.nombre}</span>
                  <span>${finalPrice} x {quantity}</span>
                </div>
                <div className="summary-row total">
                  <span>Total a Pagar:</span>
                  <span>${totalPrice}</span>
                </div>
              </div>

              <button
                className="btn-confirm-payment"
                onClick={handleProcessPayment}
                disabled={processingPayment}
              >
                {processingPayment ? '⏳ Procesando Pago...' : `Confirmar Pago - $${totalPrice}`}
              </button>

              <p className="security-notice">
                🔒 Tu pago es seguro y está encriptado con SSL de 256 bits
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3>Preguntas Frecuentes</h3>
          <div className="faq-item">
            <h4>¿Puedo cambiar de plan?</h4>
            <p>Sí, puedes cambiar tu plan en cualquier momento desde tu dashboard. Los cambios se aplican en tu próximo período de facturación.</p>
          </div>
          <div className="faq-item">
            <h4>¿Hay período de prueba?</h4>
            <p>Contáctanos para conocer sobre nuestras opciones de prueba gratuita disponibles.</p>
          </div>
          <div className="faq-item">
            <h4>¿Qué pasa si cancelo?</h4>
            <p>Puedes cancelar tu suscripción en cualquier momento. Seguirás teniendo acceso hasta el final de tu período actual.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoPlanes;
