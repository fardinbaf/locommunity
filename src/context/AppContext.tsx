import React, { useState, useEffect, createContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import Toast from '../components/Toast';

export const AppContext = createContext<{
    supabase: typeof supabase;
    session: any;
    user: any;
    profile: any;
    signOut: () => Promise<any>;
    showToast: (text: string, type?: 'success' | 'error') => void;
} | null>(null);

export function AppProvider({ children }) {
    const [session, setSession] = useState(undefined);
    const [profile, setProfile] = useState(undefined);
    const [toast, setToast] = useState({ text: '', type: 'success' });

    useEffect(() => {
        // Set initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        // Fetch profile when session changes
        if (session?.user) {
            supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .limit(1)
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error fetching profile:', error);
                        setProfile(null);
                    } else {
                        setProfile(data?.[0] || null);
                    }
                });
        } else {
            setProfile(null); // No user, so no profile
        }
    }, [session]);
    
    const showToast = (text, type = 'success') => {
        setToast({ text, type });
    };

    const value = {
        supabase,
        session,
        user: session?.user,
        profile,
        signOut: () => supabase.auth.signOut(),
        showToast
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            <Toast message={toast.text} type={toast.type} onDismiss={() => setToast({text: '', type: 'success'})} />
        </AppContext.Provider>
    );
}