// src/App.jsx


import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

// Tus otros componentes
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, isAdmin } = useAuth();

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