
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Footer() {
    const { supabase } = useContext(AppContext);
    const [footerData, setFooterData] = useState(null);

    useEffect(() => {
        const fetchFooterData = async () => {
            const { data, error } = await supabase.from('site_content').select('value').eq('key', 'footerData').single();
            if (!error && data) {
                setFooterData(data.value);
            }
        };
        fetchFooterData();
    }, [supabase]);

    if (!footerData) return <footer className="footer" />;

    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-column">
                    {footerData.logoUrl && <img src={footerData.logoUrl} alt="Community Hub Logo" className="footer-logo"/>}
                    <p>{footerData.about}</p>
                </div>
                <div className="footer-column">
                    <h4>Useful Links</h4>
                    <nav className="footer-links">
                        <ul>
                            {footerData.links?.map(link => (
                                <li key={link.label}>
                                    <Link to={link.url}>{link.label}</Link>

                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="footer-column">
                    <h4>Contact Us</h4>
                    <div className="footer-contact">
                        <p>{footerData.contact?.address}</p>
                        <p><strong>Phone:</strong> {footerData.contact?.phone}</p>
                        <p><strong>Email:</strong> {footerData.contact?.email}</p>
                    </div>
                </div>
            </div>
            <div className="footer-bottom-bar">
                <p>&copy; {new Date().getFullYear()} Community Hub. All Rights Reserved.</p>
            </div>
        </footer>
    );
}
