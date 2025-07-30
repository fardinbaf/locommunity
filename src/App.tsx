
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout, ProtectedRoute, AdminRoute } from './components/Router';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AllReportsPage from './pages/AllReportsPage';
import ReportFormPage from './pages/ReportFormPage';
import AllGeneralInfoPage from './pages/AllGeneralInfoPage';
import GeneralInfoPage from './pages/GeneralInfoPage';
import BloodRequestPage from './pages/BloodRequestPage';
import DonationPage from './pages/DonationPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AllForRentPage from './pages/AllForRentPage';
import ForRentFormPage from './pages/ForRentFormPage';


// --- MAIN APP ROUTER ---
export default function App() {
    return (
       <AppProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/reports" element={<AllReportsPage />} />
                        <Route path="/info/browse" element={<AllGeneralInfoPage />} />
                        <Route path="/for-rent/browse" element={<AllForRentPage />} />
                        
                        {/* Protected Routes (requires login) */}
                        <Route path="/report/new" element={<ProtectedRoute><ReportFormPage /></ProtectedRoute>} />
                        <Route path="/report/edit/:id" element={<ProtectedRoute><ReportFormPage /></ProtectedRoute>} />
                        <Route path="/for-rent/new" element={<ProtectedRoute><ForRentFormPage /></ProtectedRoute>} />
                        <Route path="/for-rent/edit/:id" element={<ProtectedRoute><ForRentFormPage /></ProtectedRoute>} />
                        <Route path="/blood-request/new" element={<ProtectedRoute><BloodRequestPage /></ProtectedRoute>} />
                        <Route path="/blood-request/edit/:id" element={<ProtectedRoute><BloodRequestPage /></ProtectedRoute>} />
                        <Route path="/info/add" element={<ProtectedRoute><GeneralInfoPage /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/donate" element={<ProtectedRoute><DonationPage /></ProtectedRoute>} />

                        {/* Admin Routes (requires admin role) */}
                        <Route path="/admin/:tab" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AppProvider>
    );
}