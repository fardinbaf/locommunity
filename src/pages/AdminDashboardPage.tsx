
import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { TrashIcon, EditIcon } from '../components/Icons';

// A generic management list component
const ManagementList = ({ items, onEdit, onDelete, renderItem }: { items: any[]; onEdit?: (item: any) => void; onDelete?: (id: any) => void; renderItem: (item: any, onEdit?: any, onDelete?: any) => React.ReactNode; }) => (
    <div className="management-list">
        {items.map(item => renderItem(item, onEdit, onDelete))}
    </div>
);

// A generic form section
const AdminFormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode; }) => (
    <div className="admin-form-section">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {children}
    </div>
);


export default function AdminDashboardPage() {
    const { supabase, showToast } = useContext(AppContext);
    const { tab } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(tab || 'users');
    
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [generalInfos, setGeneralInfos] = useState([]);
    const [forRent, setForRent] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [donations, setDonations] = useState([]);
    const [donationTypes, setDonationTypes] = useState([]);
    const [siteContent, setSiteContent] = useState({ marquee: '', footer: {} });

    // State for forms
    const [newSponsor, setNewSponsor] = useState({ image_url: '', link_url: '' });
    const [newDonationType, setNewDonationType] = useState('');
    const [marqueeText, setMarqueeText] = useState('');
    const [footerData, setFooterData] = useState({ logoUrl: '', about: '', links: [], contact: { address: '', phone: '', email: '' } });

    const fetchData = async (tableName, setter, options: { query?: string, orderBy?: string, ascending?: boolean } = {}) => {
        const { query = '*', orderBy, ascending = false } = options;
        
        let selectQuery = supabase
            .from(tableName)
            .select(query);
            
        if (orderBy) {
            selectQuery = selectQuery.order(orderBy, { ascending });
        }

        const { data, error } = await selectQuery;
        if (error) {
            console.error(`Error fetching ${tableName}`, error);
            showToast(`Failed to fetch ${tableName}`, 'error');
        }
        else setter(data);
    };
    
    const fetchSiteContent = async () => {
        const { data } = await supabase.from('site_content').select('*');
        const content = data.reduce((acc, curr) => ({...acc, [curr.key]: curr.value }), {});
        setSiteContent(content);
        setMarqueeText(content.marquee || '');
        setFooterData(content.footerData || { logoUrl: '', about: '', links: [], contact: { address: '', phone: '', email: '' } });
    };
    
    const fetchAllData = () => {
        fetchData('profiles', setUsers, { orderBy: 'username', ascending: true });
        fetchData('reports', setReports, { orderBy: 'created_at' });
        fetchData('blood_requests', setBloodRequests, { orderBy: 'created_at' });
        fetchData('general_info', setGeneralInfos, { orderBy: 'created_at' });
        fetchData('for_rent', setForRent, { query: '*, profiles(username)', orderBy: 'created_at' });
        fetchData('sponsors', setSponsors, { orderBy: 'created_at' });
        fetchData('donations', setDonations, { orderBy: 'created_at' });
        fetchData('donation_types', setDonationTypes, { orderBy: 'name' });
        fetchSiteContent();
    };


    useEffect(() => {
        fetchAllData();
    }, [supabase]);
    
    useEffect(() => {
        if(tab) setActiveTab(tab);
    }, [tab]);
    
    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        navigate(`/admin/${tabName}`);
    }

    const handleDelete = async (tableName, id) => {
        if (!window.confirm(`Are you sure you want to delete this item from ${tableName}?`)) return;
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) {
            showToast(`Error deleting item from ${tableName}`, 'error');
        } else {
            showToast('Item deleted successfully.');
            fetchAllData();
        }
    };
    
    const handleSponsorToggle = async (sponsor) => {
        const { error } = await supabase.from('sponsors').update({ is_active: !sponsor.is_active }).eq('id', sponsor.id);
        if (error) showToast("Failed to update sponsor status.", "error");
        else {
            showToast("Sponsor status updated.");
            fetchData('sponsors', setSponsors, { orderBy: 'created_at' });
        }
    }

    const handleForRentApprovalToggle = async (item) => {
        const { error } = await supabase.from('for_rent').update({ is_approved: !item.is_approved }).eq('id', item.id);
        if (error) showToast("Failed to update listing status.", "error");
        else {
            showToast("Listing status updated.");
            fetchData('for_rent', setForRent, { query: '*, profiles(username)', orderBy: 'created_at' });
        }
    };
    
    const handleAddSponsor = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('sponsors').insert(newSponsor);
        if (error) showToast("Failed to add sponsor.", "error");
        else {
            showToast("Sponsor added.");
            setNewSponsor({ image_url: '', link_url: '' });
            fetchData('sponsors', setSponsors, { orderBy: 'created_at' });
        }
    }
    
    const handleUpdateContent = async (key, value) => {
        const { error } = await supabase.from('site_content').upsert({ key, value }, { onConflict: 'key' });
        if (error) showToast(`Failed to update ${key}.`, "error");
        else {
            showToast(`${key} updated successfully.`);
            fetchSiteContent();
        }
    }

    const tabs = [
        'users', 'reports', 'for_rent', 'blood_requests', 'general_info', 
        'sponsors', 'donations', 'content'
    ];
    
    return (
        <div className="main-content-area container-xl admin-dashboard">
            <div className="page-header">
                <h1>Admin Dashboard</h1>
                <p>Manage all aspects of the Community Hub platform.</p>
            </div>

            <div className="tabs">
                {tabs.map(t => (
                    <button key={t} onClick={() => handleTabClick(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>
                        {t.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'users' && (
                     <ManagementList items={users} onDelete={(id) => handleDelete('profiles', id)} renderItem={(item, _, onDelete) => (
                        <div key={item.id} className="management-list-item">
                            <div className="management-list-item-info">
                                <p>{item.username}</p>
                                <span>{item.is_admin ? 'Admin' : 'User'} | ID: {item.id}</span>
                            </div>
                            <div className="management-list-item-actions">
                                {!item.is_admin && <button onClick={() => onDelete(item.id)}><TrashIcon/></button>}
                            </div>
                        </div>
                    )}/>
                )}
                
                {activeTab === 'reports' && (
                     <ManagementList items={reports} onDelete={(id) => handleDelete('reports', id)} renderItem={(item, _, onDelete) => (
                        <div key={item.id} className="management-list-item">
                             <div className="management-list-item-info">
                                <p>{item.landlord_name} - {item.issue_type}</p>
                                <span>Reported by user: {item.user_id} on {new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="management-list-item-actions">
                                <button onClick={() => navigate(`/report/edit/${item.id}`)}><EditIcon/></button>
                                <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                            </div>
                        </div>
                    )}/>
                )}
                
                {activeTab === 'for_rent' && (
                    <ManagementList items={forRent} onDelete={(id) => handleDelete('for_rent', id)} renderItem={(item, _, onDelete) => (
                        <div key={item.id} className="management-list-item">
                            <img src={item.image_url} width={100} height={60} style={{objectFit: 'cover', borderRadius: '4px'}} alt={item.title} />
                            <div className="management-list-item-info">
                                <p>{item.title}</p>
                                <span>By: {item.profiles?.username || 'N/A'} | Status: <span style={{color: item.is_approved ? 'var(--success)' : 'var(--warning)'}}>{item.is_approved ? 'Approved' : 'Pending'}</span></span>
                            </div>
                            <div className="management-list-item-actions">
                                 <label className="toggle-switch" title={item.is_approved ? 'Click to Unapprove' : 'Click to Approve'}><input type="checkbox" checked={item.is_approved} onChange={() => handleForRentApprovalToggle(item)} /><span className="slider"></span></label>
                                 <button onClick={() => navigate(`/for-rent/edit/${item.id}`)}><EditIcon/></button>
                                <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                            </div>
                        </div>
                    )}/>
                )}

                {activeTab === 'blood_requests' && (
                     <ManagementList items={bloodRequests} onDelete={(id) => handleDelete('blood_requests', id)} renderItem={(item, _, onDelete) => (
                        <div key={item.id} className="management-list-item">
                            <div className="management-list-item-info">
                                <p>{item.patient_identity} - Group {item.blood_group}</p>
                                <span>Contact: {item.contact}</span>
                            </div>
                            <div className="management-list-item-actions">
                                <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                            </div>
                        </div>
                    )}/>
                )}

                {activeTab === 'general_info' && (
                     <ManagementList items={generalInfos} onDelete={(id) => handleDelete('general_info', id)} renderItem={(item, _, onDelete) => (
                        <div key={item.id} className="management-list-item">
                            <div className="management-list-item-info">
                                <p>{item.title} - [{item.category}]</p>
                                <span>Contact: {item.contact}</span>
                            </div>
                            <div className="management-list-item-actions">
                                <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                            </div>
                        </div>
                    )}/>
                )}
                
                {activeTab === 'sponsors' && (
                    <>
                        <AdminFormSection title="Add New Sponsor">
                             <form onSubmit={handleAddSponsor} className="form-container" style={{padding: 0, background: 'none', border: 'none'}}>
                                <div className="form-row">
                                    <div className="form-group"><label>Image URL</label><input type="url" value={newSponsor.image_url} onChange={e => setNewSponsor({...newSponsor, image_url: e.target.value})} required/></div>
                                    <div className="form-group"><label>Link URL</label><input type="url" value={newSponsor.link_url} onChange={e => setNewSponsor({...newSponsor, link_url: e.target.value})} required/></div>
                                </div>
                                <button type="submit" className="btn-primary">Add Sponsor</button>
                            </form>
                        </AdminFormSection>
                         <ManagementList items={sponsors} onDelete={(id) => handleDelete('sponsors', id)} renderItem={(item, _, onDelete) => (
                            <div key={item.id} className="management-list-item">
                                <img src={item.image_url} width={100} alt="Sponsor" />
                                <div className="management-list-item-info">
                                    <p>{item.link_url}</p>
                                </div>
                                <div className="management-list-item-actions">
                                    <label className="toggle-switch"><input type="checkbox" checked={item.is_active} onChange={() => handleSponsorToggle(item)} /><span className="slider"></span></label>
                                    <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                                </div>
                            </div>
                        )}/>
                    </>
                )}
                
                 {activeTab === 'donations' && (
                    <>
                        <AdminFormSection title="Manage Donation Types">
                            <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('donation_types').insert({ name: newDonationType }); fetchData('donation_types', setDonationTypes, {orderBy: 'name'}); setNewDonationType(''); }} className="form-container" style={{padding: 0, background: 'none', border: 'none'}}>
                                <div className="form-group"><label>New Type Name</label><input type="text" value={newDonationType} onChange={e => setNewDonationType(e.target.value)} required/></div>
                                <button type="submit" className="btn-primary">Add Type</button>
                            </form>
                            <ManagementList items={donationTypes} onDelete={(id) => handleDelete('donation_types', id)} renderItem={(item, _, onDelete) => (
                                <div key={item.id} className="management-list-item">
                                    <p>{item.name}</p>
                                    <button onClick={() => onDelete(item.id)}><TrashIcon/></button>
                                </div>
                            )}/>
                        </AdminFormSection>
                        <h3 className="dashboard-section-header">Received Donations</h3>
                         <ManagementList items={donations} renderItem={(item) => (
                            <div key={item.id} className="management-list-item">
                                <div className="management-list-item-info">
                                    <p>${item.amount} - {item.donation_type}</p>
                                    <span>From: {item.name} ({item.email}) on {new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}/>
                    </>
                )}
                
                {activeTab === 'content' && (
                     <>
                        <AdminFormSection title="Manage Marquee Text">
                            <div className="form-group">
                                <label>Marquee Scroll Text</label>
                                <input type="text" value={marqueeText} onChange={e => setMarqueeText(e.target.value)} />
                            </div>
                            <button className="btn-primary" onClick={() => handleUpdateContent('marquee', marqueeText)}>Save Marquee</button>
                        </AdminFormSection>

                        <AdminFormSection title="Manage Footer Content">
                             <div className="form-group"><label>Logo URL</label><input type="url" value={footerData.logoUrl} onChange={e => setFooterData({...footerData, logoUrl: e.target.value})} /></div>
                             <div className="form-group"><label>About Text</label><textarea rows={3} value={footerData.about} onChange={e => setFooterData({...footerData, about: e.target.value})} /></div>
                             <div className="form-group"><label>Contact Address</label><input type="text" value={footerData.contact?.address} onChange={e => setFooterData({...footerData, contact: {...footerData.contact, address: e.target.value}})} /></div>
                             <div className="form-group"><label>Contact Phone</label><input type="tel" value={footerData.contact?.phone} onChange={e => setFooterData({...footerData, contact: {...footerData.contact, phone: e.target.value}})} /></div>
                             <div className="form-group"><label>Contact Email</label><input type="email" value={footerData.contact?.email} onChange={e => setFooterData({...footerData, contact: {...footerData.contact, email: e.target.value}})} /></div>
                            
                             <div className="form-group">
                                 <label>Useful Links (one per line, format: Label,URL)</label>
                                 <textarea rows={5}
                                    value={footerData.links?.map(l => `${l.label},${l.url}`).join('\n')}
                                    onChange={e => {
                                        const links = e.target.value.split('\n').map(line => {
                                            const [label, url] = line.split(',');
                                            return { label, url };
                                        }).filter(l => l.label && l.url);
                                        setFooterData({...footerData, links });
                                    }}
                                 />
                             </div>
                             <button className="btn-primary" onClick={() => handleUpdateContent('footerData', footerData)}>Save Footer</button>
                        </AdminFormSection>
                     </>
                )}

            </div>
        </div>
    );
}
