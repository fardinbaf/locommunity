
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function ReportFormPage() {
    const { supabase, user, showToast, profile } = useContext(AppContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    const [formData, setFormData] = useState({ id: null, landlord_name: '', property_address: '', area: 'MTR', issue_type: 'Maintenance Neglect', description: '', map_url: '', evidence_url: '' });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            supabase.from('reports').select('*').eq('id', id).single()
                .then(({ data, error }) => {
                    if (error || !data || (!profile?.is_admin && data.user_id !== user.id)) {
                        showToast("Could not fetch report data or permission denied.", "error");
                        navigate('/reports');
                    } else {
                        setFormData(data);
                    }
                    setIsLoading(false);
                });
        }
    }, [id, isEditMode, navigate, showToast, supabase, user.id, profile?.is_admin]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => e.target.files && setFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let evidence_url = formData.evidence_url || null;
        if (file) {
            const fileName = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('evidence-uploads').upload(fileName, file);
            if (uploadError) {
                showToast("Failed to upload evidence file.", "error");
                setIsLoading(false);
                return;
            }
            const { data } = supabase.storage.from('evidence-uploads').getPublicUrl(fileName);
            evidence_url = data.publicUrl;
        }

        const reportData = { ...formData, evidence_url, user_id: user.id };
        
        // Remove properties that shouldn't be in the final object for DB
        const finalReportData = {
            landlord_name: reportData.landlord_name,
            property_address: reportData.property_address,
            area: reportData.area,
            issue_type: reportData.issue_type,
            description: reportData.description,
            map_url: reportData.map_url,
            evidence_url: reportData.evidence_url,
            user_id: reportData.user_id
        };


        let error;
        if (isEditMode) {
            ({ error } = await supabase.from('reports').update(finalReportData).eq('id', id));
        } else {
            ({ error } = await supabase.from('reports').insert(finalReportData));
        }

        setIsLoading(false);
        if (error) {
            showToast(`Failed to ${isEditMode ? 'update' : 'submit'} report.`, "error");
            console.error(error);
        } else {
            showToast(`Report ${isEditMode ? 'updated' : 'submitted'} successfully!`);
            navigate('/dashboard');
        }
    };
    
    if (isLoading && isEditMode) return <div className="main-content-area container"><p>Loading report...</p></div>;

    return (
        <div className="main-content-area container">
            <div className="page-header"><h1>{isEditMode ? 'Edit Report' : 'Submit a New Report'}</h1><p>Your report is public and helps others in the community.</p></div>
            <div className="form-container">
            <form onSubmit={handleSubmit}>
                <div className="form-group"><label htmlFor="landlord_name">Landlord's Name</label><input type="text" id="landlord_name" name="landlord_name" value={formData.landlord_name} onChange={handleChange} required disabled={isLoading} /></div>
                <div className="form-group"><label htmlFor="property_address">Property Address</label><input type="text" id="property_address" name="property_address" value={formData.property_address} onChange={handleChange} required disabled={isLoading} /></div>
                <div className="form-group"><label htmlFor="area">Area</label><select id="area" name="area" value={formData.area} onChange={handleChange} disabled={isLoading}><option>AKR-BSR-HQ</option><option>ZHR</option><option>MTR</option><option>SMD</option></select></div>
                <div className="form-group"><label htmlFor="issue_type">Issue Type</label><select id="issue_type" name="issue_type" value={formData.issue_type} onChange={handleChange} disabled={isLoading}><option>Maintenance Neglect</option><option>Unfair Charges</option><option>Harassment</option><option>Privacy Violation</option><option>Unsafe Conditions</option></select></div>
                <div className="form-group"><label htmlFor="description">Detailed Description</label><textarea id="description" name="description" rows={5} value={formData.description} onChange={handleChange} required disabled={isLoading}></textarea></div>
                <div className="form-row">
                     <div className="form-group"><label htmlFor="map_url">Google Maps Link (Optional)</label><input type="url" id="map_url" name="map_url" value={formData.map_url || ''} onChange={handleChange} placeholder="Paste shareable Google Maps link" disabled={isLoading}/></div>
                    <div className="form-group"><label>Upload Evidence (Optional)</label><div className="file-input-wrapper"><span className="file-input-label">{file ? file.name : (formData.evidence_url ? 'File already uploaded' : 'Click to upload a file')}</span><input type="file" onChange={handleFileChange} disabled={isLoading}/></div></div>
                </div>
                <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={isLoading}>{isLoading ? 'Saving...' : (isEditMode ? 'Update Report' : 'Submit Report')}</button>
            </form>
        </div>
        </div>
    );
}