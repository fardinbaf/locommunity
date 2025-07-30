
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Marquee from '../components/Marquee';
import ReportCard from '../components/ReportCard';
import BloodRequestCard from '../components/BloodRequestCard';
import ForRentCard from '../components/ForRentCard';
import GeneralInfoCard from '../components/GeneralInfoCard';

const Section = ({ title, viewAllLink, children }) => (
    <section>
        <div className="section-header-with-link">
            <h2 className="section-title">{title}</h2>
            {viewAllLink && <Link to={viewAllLink} className="view-all-link">View All &rarr;</Link>}
        </div>
        {children}
    </section>
);

export default function HomePage() {
    const { supabase } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [siteContent, setSiteContent] = useState({ bannerUrl: '', marquee: '' });
    const [activeSponsor, setActiveSponsor] = useState(null);
    const [latestReports, setLatestReports] = useState([]);
    const [bloodRequest, setBloodRequest] = useState(null);
    const [forRent, setForRent] = useState([]);
    const [generalInfo, setGeneralInfo] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Using Promise.all to fetch data concurrently
        const [
            contentRes,
            reportsRes,
            bloodRes,
            forRentRes,
            infoRes,
        ] = await Promise.all([
            supabase.from('site_content').select('key, value'),
            supabase.from('reports').select('*, profiles(username), report_comments(*, profiles(username))').order('created_at', { ascending: false }).limit(3),
            supabase.from('blood_requests').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('for_rent').select('*').eq('is_approved', true).order('created_at', { ascending: false }).limit(4),
            supabase.from('general_info').select('*').order('created_at', { ascending: false }).limit(3),
        ]);
        
        // Fetch active sponsor separately for clarity and robustness
        const { data: sponsorData, error: sponsorError } = await supabase.from('sponsors').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();

        if (sponsorError) {
            console.error("Error fetching active sponsor:", sponsorError);
        }
        setActiveSponsor(sponsorData);

        if (contentRes.data) {
             const content = contentRes.data.reduce((acc, curr) => ({...acc, [curr.key]: curr.value }), {});
             setSiteContent(content);
        }
        setLatestReports(reportsRes.data || []);
        setBloodRequest(bloodRes.data);
        setForRent(forRentRes.data || []);
        setGeneralInfo(infoRes.data || []);

        setLoading(false);
    }, [supabase]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="homepage-layout">
            <header className="banner-header" style={{backgroundImage: `url(${siteContent.bannerUrl || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'})`}}>
                <div className="banner-content">
                    <h1>Welcome to Living Out Community Hub</h1>
                    <p>Your one-stop platform for community support, information, and action.</p>
                </div>
            </header>
            
            <Marquee text={siteContent.marquee} />
            
            {activeSponsor && (
                <div className="sponsor-banner">
                     <a href={activeSponsor.link_url} target="_blank" rel="noopener noreferrer">
                        <img src={activeSponsor.image_url} alt="Sponsor Advertisement" />
                    </a>
                </div>
            )}
            
            <div className="homepage-main-grid">
                <section>
                     <h2 className="section-title">Emergency Blood Request</h2>
                     {loading ? <p>Loading...</p> : (
                         bloodRequest ? <BloodRequestCard request={bloodRequest} onUpdate={fetchData} /> : <p>No active blood requests right now.</p>
                     )}
                </section>
                <aside>
                     <h2 className="section-title">For Rent</h2>
                     <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                         {loading ? <p>Loading...</p> : (
                             forRent.length > 0 ? forRent.map(item => <ForRentCard key={item.id} item={item} onUpdate={fetchData} />) : <p>No listings available.</p>
                         )}
                     </div>
                </aside>
            </div>
            
            <div className="homepage-grid-3col">
                <Section title="Latest Landlord Reports" viewAllLink="/reports">
                    {loading ? <p>Loading...</p> : (
                        <div className="grid-3col">
                            {latestReports.length > 0 ? latestReports.map(report => <ReportCard key={report.id} report={report} onUpdate={fetchData} />) : <p>No reports submitted yet.</p>}
                        </div>
                    )}
                </Section>
            </div>

            <div className="homepage-grid-3col">
                 <Section title="General Information" viewAllLink="/info/browse">
                      {loading ? <p>Loading...</p> : (
                        <div className="grid-3col">
                           {generalInfo.length > 0 ? generalInfo.map(info => <GeneralInfoCard key={info.id} info={info}/>) : <p>No information shared yet.</p>}
                        </div>
                    )}
                 </Section>
            </div>
        </div>
    );
}
