// ProtectedRoute.jsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const ProtectedRoute = ({ element, redirectTo, ...props }) => {
  const { userId } = useUser();

  return userId ? (
    <Route {...props} element={element} />
  ) : (
    <Navigate to={redirectTo} replace />
  );
};

export default ProtectedRoute;
