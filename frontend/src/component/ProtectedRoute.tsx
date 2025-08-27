import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/" replace />;
  }

  // If token exists, render children
  return <>{children}</>;
};

export default ProtectedRoute;
