import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './components/HomePage';
import StudentDashboard from './components/StudentDashboard';
import Login from './components/Login';
import Registration from './components/Registration';
import LogHistory from './components/LogHistory';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import StaffDashboard from './components/StaffDashboard';
import ProgramsForm from './components/ProgramsForm';
import AdminDashboard from './components/AdminDashboard';
import ProgramManagement from './components/ProgramManagement';
import UserManagement from './components/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import DetailsProgram from './components/DetailsProgram'; 
import UniversityDetails from './components/UniversityDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="programs-form" element={<ProgramsForm />} />
          {/* Define route for program details */}
          <Route path="/program-details/:programID" element={<DetailsProgram />} />

          {/* Define other routes like university details */}
          <Route path="/university-details/:universityID" element={<UniversityDetails />} />

          {/* Admin and Private Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute roles={['Admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/log-history"
            element={
              <PrivateRoute roles={['Admin']}>
                <LogHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-manage"
            element={
              <PrivateRoute roles={['Admin']}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/program-manage"
            element={
              <PrivateRoute roles={['Admin']}>
                <ProgramManagement />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
