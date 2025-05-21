import React, { createContext, useContext, useState, useEffect } from 'react';
import Axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode directamente
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Utiliza jwtDecode directamente
        const intervalId = setInterval(() => {
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp > currentTime) {
            setIsAuthenticated(true);
            setUser(decodedToken);
          } else {
            showAlert("warning", "Sesión expirada.", 2500);
            setTimeout(() => {
              logout()
            }, 1000);
          }
        }, 600000);//cada 10 minutos
        return () => clearInterval(intervalId);
      } catch (e) {
        console.error('Error decoding token', e);
        localStorage.removeItem('idRol');
        localStorage.removeItem('auth');
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  const showAlert = (icon = "error", title, timer = 1500) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      icon: icon,
      title: title,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
  };

  const login = async (email, password) => {
    try {
      const response = await Axios.post("http://localhost:8080/api/auth/login", {
        Correo: email,
        Pass: password
      })
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data.usuario);
        localStorage.setItem('idU', response.data.usuario.IdUsuario);
        localStorage.setItem('auth', true);
        localStorage.setItem('token', response.data.token);
      } else {
        console.log("error con el login: ", response);
      }
      return { success: true, user: response.data.usuario };
    } catch (error) {
      showAlert("error", error.response.data.msg || "Login failed");
      return { success: false, message: error.response.data.msg };
    }
  };

  const logout = () => {
    navigate("/auth/sign-in");
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    localStorage.removeItem('idRol');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
