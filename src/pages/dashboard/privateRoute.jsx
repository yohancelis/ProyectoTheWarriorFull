// privateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const auth = localStorage.getItem("auth");
  return auth ? children : <Navigate to="/auth/sign-in" />;
};

export default PrivateRoute;