import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <AuthForm />;
}

export default HomePage;