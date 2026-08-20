import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AiAssistantWidget from './components/AiAssistantWidget';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PhoneLoginPage from './pages/PhoneLoginPage';
import DashboardPage from './pages/DashboardPage';
import DocumentVaultPage from './pages/DocumentVaultPage';
import CivicProblemPage from './pages/CivicProblemPage';
import RtiGeneratorPage from './pages/RtiGeneratorPage';

// Root route resolver
const RootRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/phone-login" element={<PhoneLoginPage />} />
          
          {/* Protected Temporary SevaAI Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-vault"
            element={
              <ProtectedRoute>
                <DocumentVaultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report-civic-problem"
            element={
              <ProtectedRoute>
                <CivicProblemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rti-generator"
            element={
              <ProtectedRoute>
                <RtiGeneratorPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* Global Floating AI Assistant in bottom right corner */}
        <AiAssistantWidget />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
