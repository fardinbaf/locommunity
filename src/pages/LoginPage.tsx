
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function LoginPage() {
    const { supabase, showToast } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Get the page the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || "/dashboard";

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = isSignUp
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            showToast(error.message, "error");
        } else {
            if (isSignUp) {
                showToast("Check your email for a confirmation link!");
                 // Don't navigate on sign up, let them confirm email
            } else {
                showToast("Logged in successfully!");
                navigate(from, { replace: true });
            }
        }
        setLoading(false);
    };

    return (
        <div className="main-content-area container" style={{maxWidth: '400px'}}>
             <div className="page-header"><h1>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h1><p>{isSignUp ? 'Join the community to start contributing.' : 'Login to manage your reports and submit new ones.'}</p></div>
            <form className="auth-form" onSubmit={handleAuth}>
                <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} autoComplete="email" /></div>
                <div className="form-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} autoComplete={isSignUp ? "new-password" : "current-password"} /></div>
                <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={loading}>{loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}</button>
                <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <span onClick={() => setIsSignUp(!isSignUp)} style={{color: 'var(--primary)', cursor: 'pointer', fontWeight: '600'}}>
                         {isSignUp ? 'Log In' : 'Sign Up'}
                    </span>
                </p>
            </form>
        </div>
    );
}