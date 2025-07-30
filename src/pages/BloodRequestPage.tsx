
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function BloodRequestPage() {
    const { supabase, user, showToast } = useContext(AppContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        patient_identity: '',
        reason: '',
        blood_group: 'A+',
        bags_needed: 1,
        collection_date: '',
        collection_time: '',
        collection_place: '',
        contact: ''
    });
    const [isLoading, setIsLoading] = useState(false);

     useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            supabase.from('blood_requests').select('*').eq('id', id).single()
                .then(({ data, error }) => {
                    if (error || !data) {
                        showToast("Could not fetch request data.", "error");
                        navigate('/dashboard');
                    } else {
                        // Format date for input field
                        const formattedData = { ...data, collection_date: new Date(data.collection_date).toISOString().split('T')[0] };
                        setFormData(formattedData);
                    }
                    setIsLoading(false);
                });
        }
    }, [id, isEditMode, navigate, showToast, supabase]);


    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const finalRequestData = {
            patient_identity: formData.patient_identity,
            reason: formData.reason,
            blood_group: formData.blood_group,
            bags_needed: formData.bags_needed,
            collection_date: formData.collection_date,
            collection_time: formData.collection_time,
            collection_place: formData.collection_place,
            contact: formData.contact,
            user_id: user.id
        };
        
        let error;
        if (isEditMode) {
            ({ error } = await supabase.from('blood_requests').update(finalRequestData).eq('id', id));
        } else {
            ({ error } = await supabase.from('blood_requests').insert(finalRequestData));
        }

        setIsLoading(false);
        if (error) {
            showToast(`Failed to ${isEditMode ? 'update' : 'submit'} request.`, "error");
            console.error(error);
        } else {
            showToast(`Request ${isEditMode ? 'updated' : 'submitted'} successfully!`);
            navigate('/dashboard');
        }
    };
    
    if (isLoading && isEditMode) return <div className="main-content-area container"><p>Loading request...</p></div>;

    return (
        <div className="main-content-area container">
            <div className="page-header">
                <h1>{isEditMode ? 'Edit Blood Request' : 'Post an Emergency Blood Request'}</h1>
                <p>Please provide accurate information. This will be publicly visible.</p>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="patient_identity">😥 Patient's Identity (রোগীর পরিচয়)</label><input type="text" id="patient_identity" name="patient_identity" value={formData.patient_identity} onChange={handleChange} required disabled={isLoading} /></div>
                    <div className="form-group"><label htmlFor="reason">✴️ Reason for Blood (কেন প্রয়োজন)</label><input type="text" id="reason" name="reason" value={formData.reason} onChange={handleChange} required disabled={isLoading} /></div>
                    <div className="form-row">
                        <div className="form-group"><label htmlFor="blood_group">🩸 Blood Group (রক্তের গ্রুপ)</label><select id="blood_group" name="blood_group" value={formData.blood_group} onChange={handleChange} disabled={isLoading}><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                        <div className="form-group"><label htmlFor="bags_needed">🎒 Bags Needed (কত ব্যাগ লাগবে)</label><input type="number" id="bags_needed" name="bags_needed" min="1" value={formData.bags_needed} onChange={handleChange} required disabled={isLoading} /></div>
                    </div>
                    <div className="form-row">
                         <div className="form-group"><label htmlFor="collection_date">📅 Collection Date (রক্ত সংগ্রহের তারিখ)</label><input type="date" id="collection_date" name="collection_date" value={formData.collection_date} onChange={handleChange} required disabled={isLoading} /></div>
                        <div className="form-group"><label htmlFor="collection_time">⏰ Collection Time (রক্ত সংগ্রহের সময়)</label><input type="text" id="collection_time" name="collection_time" value={formData.collection_time} onChange={handleChange} required disabled={isLoading} /></div>
                    </div>
                    <div className="form-group"><label htmlFor="collection_place">🏨 Collection Place (রক্ত সংগ্রহের স্থান)</label><input type="text" id="collection_place" name="collection_place" value={formData.collection_place} onChange={handleChange} required disabled={isLoading} /></div>
                    <div className="form-group"><label htmlFor="contact">📱 Contact Number (যোগাযোগ)</label><input type="tel" id="contact" name="contact" value={formData.contact} onChange={handleChange} required disabled={isLoading} /></div>
                    <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={isLoading}>{isLoading ? 'Saving...' : (isEditMode ? 'Update Request' : 'Submit Request')}</button>
                </form>
            </div>
        </div>
    );
}