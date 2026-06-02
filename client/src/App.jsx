import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Core Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dietitian Pages
import DietitianDashboard from './pages/dietitian/DietitianDashboard';
import PatientManagement from './pages/dietitian/PatientManagement';
import CreateDietPlan from './pages/dietitian/CreateDietPlan';
import Analytics from './pages/dietitian/Analytics';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import MyDietPlan from './pages/patient/MyDietPlan';
import Chatbot from './pages/patient/Chatbot';
import Quiz from './pages/patient/Quiz';
import CompatibilityChecker from './pages/patient/CompatibilityChecker';
import Profile from './pages/patient/Profile';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-[#FEFAE0]/15 dark:bg-[#081C15] text-[#3D2B1F] dark:text-[#F8F9FA] flex flex-col transition-colors duration-300">
              <Navbar />
              <div className="flex-1 flex flex-col">
              <Routes>
                {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Dietitian Protected Routes */}
              <Route 
                path="/dietitian/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['dietitian']}>
                    <DietitianDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dietitian/patients" 
                element={
                  <ProtectedRoute allowedRoles={['dietitian']}>
                    <PatientManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dietitian/create-plan" 
                element={
                  <ProtectedRoute allowedRoles={['dietitian']}>
                    <CreateDietPlan />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dietitian/analytics" 
                element={
                  <ProtectedRoute allowedRoles={['dietitian']}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />

              {/* Patient Protected Routes */}
              <Route 
                path="/patient/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/plan" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <MyDietPlan />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/chat" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Chatbot />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/quiz" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Quiz />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/checker" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <CompatibilityChecker />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/profile" 
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
