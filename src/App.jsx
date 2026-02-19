// src/App.jsx


import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useAuth } from './context/AuthContext';

// Tus otros componentes
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import PagoPlanes from './pages/seccionpagos/PagoPlanes';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/planes/:idPlan" element={<PagoPlanes />} />

        {/* RUTA PROTEGIDA DE ADMIN */}
        {/* Si isAdmin es true, deja pasar. Si no, manda al Home (/) */}
        <Route element={<ProtectedRoute isAllowed={isAdmin} redirectTo="/" />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* RUTA PROTEGIDA DE ESTUDIANTE (Cualquier usuario logueado) */}
        <Route element={<ProtectedRoute isAllowed={!!user} redirectTo="/login" />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;