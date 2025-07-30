
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Navbar from './Navbar';
import Footer from './Footer';


export const Layout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </>
    );
};

export const ProtectedRoute = ({ children }) => {
    const { session } = useContext(AppContext);
    const location = useLocation();

    // The session might be loading initially. A loading indicator could be shown here.
    if (session === undefined) {
        return <div>Loading...</div>; // Or a spinner component
    }

    if (!session) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { profile, session } = useContext(AppContext);

    if (session === undefined || profile === undefined) {
        return <div>Loading...</div>; // Or a spinner component
    }
    
    if (!session || !profile?.is_admin) {
        return <Navigate to="/" replace />;
    }
    return children;
}