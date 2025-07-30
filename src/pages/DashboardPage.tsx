import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ReportCard from '../components/ReportCard';
import BloodRequestCard from '../components/BloodRequestCard';
import ForRentCard from '../components/ForRentCard';

export default function DashboardPage() {
    const { supabase, user, profile } = useContext(AppContext);
    const [myReports, setMyReports] = useState([]);
    const [myBloodRequests, setMyBloodRequests] = useState([]);
    const [myForRentListings, setMyForRentListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyContent = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const [reportsRes, bloodRes, forRentRes] = await Promise.all([
             supabase.from('reports').select('*, profiles(username), report_comments(*, profiles(username))').eq('user_id', user.id).order('created_at', { ascending: false }),
             supabase.from('blood_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
             supabase.from('for_rent').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        ]);

        if (reportsRes.error) console.error("Error fetching user reports:", reportsRes.error);
        else setMyReports(reportsRes.data);

        if (bloodRes.error) console.error("Error fetching user blood requests:", bloodRes.error);
        else setMyBloodRequests(bloodRes.data);

        if (forRentRes.error) console.error("Error fetching user rental listings:", forRentRes.error);
        else setMyForRentListings(forRentRes.data);

        setLoading(false);
    }, [supabase, user]);
    
    useEffect(() => {
        fetchMyContent();
    }, [fetchMyContent]);


    if (loading) {
        return <div className="main-content-area container"><p>Loading your dashboard...</p></div>;
    }
    
    return (
        <div className="main-content-area container">
            <div className="page-header">
                <h1>My Dashboard</h1>
                <p>Welcome, {profile?.username || user?.email}! Here you can manage your contributions.</p>
            </div>
            
            <section>
                <h2 className="dashboard-section-header">My Reports</h2>
                {myReports.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {myReports.map(report => (
                            <ReportCard key={report.id} report={report} onUpdate={fetchMyContent} />
                        ))}
                    </div>
                ) : (
                    <p>You have not submitted any reports yet.</p>
                )}
            </section>
            
            <section>
                <h2 className="dashboard-section-header">My Rental Listings</h2>
                 {myForRentListings.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {myForRentListings.map(item => (
                            <ForRentCard key={item.id} item={item} onUpdate={fetchMyContent} />
                        ))}
                    </div>
                ) : (
                    <p>You have not posted any rental listings yet.</p>
                )}
            </section>
            
            <section>
                <h2 className="dashboard-section-header">My Blood Requests</h2>
                 {myBloodRequests.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                        {myBloodRequests.map(request => (
                            <BloodRequestCard key={request.id} request={request} onUpdate={fetchMyContent} />
                        ))}
                    </div>
                ) : (
                    <p>You have not submitted any blood requests yet.</p>
                )}
            </section>
        </div>
    );
}