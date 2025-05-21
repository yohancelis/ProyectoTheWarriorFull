import React, { useState, useEffect } from 'react';
import Axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './pages/dashboard/authContext';
import PrivateRoute from './pages/dashboard/privateRoute';
import { Dashboard, Auth } from '@/layouts';

function App() {

  const [rolesList, setRolesL] = useState([]);
  const URLRols = "https://http://localhost:8080//api/roles";

  const getRoles = async () => {
    try {
      const resp = await Axios.get(URLRols);
      setRolesL(resp.data.roles);
    } catch (error) {
      console.error("Error al obtener datos de los roles: ", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      // console.log("Cargando datos...")
      await getRoles();
      // console.log("Datos cargados.")
    }, 180000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/*" element={
            <Auth />} />
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute >
          } />
          <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;