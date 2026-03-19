import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import RegisterGym from './pages/RegisterGym';
import AdminDashboard from './pages/AdminDashboard';
import ManageStudents from './pages/ManageStudents';
import ManageSchedule from './pages/ManageSchedule';
import ManageFinancial from './pages/ManageFinancial';
import ManageReception from './pages/ManageReception';
import ManageNotices from './pages/ManageNotices';
import StudentDashboard from './pages/StudentDashboard';
import StudentSchedule from './pages/StudentSchedule';
import StudentFinancial from './pages/StudentFinancial';
import StudentNotices from './pages/StudentNotices';
import StudentProfile from './pages/StudentProfile';
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
          <Route path="students" element={<ManageStudents />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="students/new" element={<ManageStudents />} /> 
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="financial" element={<ManageFinancial />} />
          <Route path="reception" element={<ManageReception />} />
          <Route path="notices" element={<ManageNotices />} />
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
          <Route path="schedule" element={<StudentSchedule />} />
          <Route path="financial" element={<StudentFinancial />} />
          <Route path="notices" element={<StudentNotices />} />
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
