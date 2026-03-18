import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import RegisterGym from './pages/RegisterGym';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import './index.css';

// Protected Route Wrapper for Admin
const PrivateAdminRoute = ({ children }) => {
  const { session, loading } = React.useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!session || session.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Protected Route Wrapper for Student
const PrivateStudentRoute = ({ children }) => {
  const { session, loading } = React.useContext(AuthContext);
  if (loading) return <div>Carregando...</div>;
  if (!session || session.role !== 'student') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterGym />} />
        
        <Route 
          path="/admin" 
          element={
            <PrivateAdminRoute>
              <AdminLayout />
            </PrivateAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        
        <Route 
          path="/student" 
          element={
            <PrivateStudentRoute>
              <StudentLayout />
            </PrivateStudentRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
