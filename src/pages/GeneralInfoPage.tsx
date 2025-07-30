
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function GeneralInfoPage() {
    const { supabase, user, showToast } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        category: 'Best Hospital',
        title: '',
        description: '',
        contact: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const infoData = {
            category: formData.category,
            title: formData.title,
            description: formData.description,
            contact: formData.contact,
            user_id: user.id
        };

        const { error } = await supabase.from('general_info').insert(infoData);
        
        setIsLoading(false);
        if (error) {
            showToast("Failed to submit information.", "error");
            console.error(error);
        } else {
            showToast("Information submitted successfully! Thank you for contributing.");
            navigate('/info/browse');
        }
    };
    
    return (
        <div className="main-content-area container">
             <div className="page-header">
                <h1>Add Community Information</h1>
                <p>Share a useful contact or resource with your neighbors.</p>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select id="category" name="category" value={formData.category} onChange={handleChange} disabled={isLoading}>
                            <option>Best Hospital</option>
                            <option>Recommended Technician</option>
                            <option>Appointment Contact</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="form-group"><label htmlFor="title">Title / Name</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isLoading} placeholder="e.g., City General Hospital or John's Plumbing"/></div>
                    <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} disabled={isLoading} placeholder="e.g., Great for cardiac care, or 'Fixed my leaky faucet in 10 minutes!'"></textarea></div>
                    <div className="form-group"><label htmlFor="contact">Contact Info</label><input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} required disabled={isLoading} placeholder="Phone number, address, or website"/></div>
                    
                    <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={isLoading}>{isLoading ? 'Submitting...' : 'Add Information'}</button>
                </form>
            </div>
        </div>
    );
}