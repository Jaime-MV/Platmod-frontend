// src/App.jsx


import { useState, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Tus otros componentes
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Ahora sí funcionará porque useState ya está importado
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    }
  }, []);

  // Validación segura con encadenamiento opcional (?.)
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* RUTA PROTEGIDA DE ADMIN */}
        {/* Si isAdmin es true, deja pasar. Si no, manda al Home (/) */}
        <Route element={<ProtectedRoute isAllowed={isAdmin} redirectTo="/" />}>
           <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;