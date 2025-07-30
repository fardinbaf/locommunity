
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function ForRentFormPage() {
    const { supabase, user, showToast, profile } = useContext(AppContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    const [formData, setFormData] = useState({
        title: '',
        address: '',
        description: '',
        rent: '',
        contact: '',
        image_url: ''
    });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setIsLoading(true);
            supabase.from('for_rent').select('*').eq('id', id).single()
                .then(({ data, error }) => {
                    if (error || !data || (!profile?.is_admin && data.user_id !== user.id)) {
                        showToast("Could not fetch listing data or permission denied.", "error");
                        navigate('/for-rent/browse');
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

        let image_url = formData.image_url || null;
        if (file) {
            const fileName = `${user.id}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('for-rent-images').upload(fileName, file);
            if (uploadError) {
                showToast("Failed to upload image file.", "error");
                setIsLoading(false);
                return;
            }
            const { data } = supabase.storage.from('for-rent-images').getPublicUrl(fileName);
            image_url = data.publicUrl;
        }

        const listingPayload = {
            title: formData.title,
            address: formData.address,
            description: formData.description,
            rent: parseInt(formData.rent) || 0,
            contact: formData.contact,
            image_url,
        };
        
        let error;
        if (isEditMode) {
            // In edit mode, we only update the fields from the form.
            // is_approved is handled by admins separately, and user_id should not change.
            ({ error } = await supabase.from('for_rent').update(listingPayload).eq('id', id));
        } else {
            // For new listings, add user_id and set is_approved to false for regular users, true for admins.
            const insertPayload = { 
                ...listingPayload,
                user_id: user.id, 
                is_approved: profile?.is_admin || false 
            };
            ({ error } = await supabase.from('for_rent').insert(insertPayload));
        }

        setIsLoading(false);
        if (error) {
            showToast(`Failed to ${isEditMode ? 'update' : 'submit'} listing.`, "error");
            console.error(error);
        } else {
            showToast(`Listing ${isEditMode ? 'updated' : 'submitted'} successfully! ${!isEditMode && !profile?.is_admin ? 'It will be visible after admin approval.' : ''}`);
            navigate('/dashboard');
        }
    };
    
    if (isLoading && isEditMode) return <div className="main-content-area container"><p>Loading listing...</p></div>;

    return (
        <div className="main-content-area container">
            <div className="page-header">
                <h1>{isEditMode ? 'Edit Rental Listing' : 'Post a New Rental Listing'}</h1>
                <p>Provide details about the place for rent. Listings require admin approval to become public.</p>
            </div>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label htmlFor="title">Title</label><input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isLoading} placeholder="e.g., 2 Bedroom Apartment in ZHR" /></div>
                    <div className="form-group"><label htmlFor="address">Full Address</label><input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required disabled={isLoading} /></div>
                    <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" rows={5} value={formData.description} onChange={handleChange} required disabled={isLoading} placeholder="Describe the property, amenities, rules, etc."></textarea></div>
                    <div className="form-row">
                        <div className="form-group"><label htmlFor="rent">Rent per Month ($)</label><input type="number" id="rent" name="rent" value={formData.rent} onChange={handleChange} required disabled={isLoading} min="0" /></div>
                        <div className="form-group"><label htmlFor="contact">Contact Info</label><input type="text" id="contact" name="contact" value={formData.contact} onChange={handleChange} required disabled={isLoading} placeholder="Phone number or email"/></div>
                    </div>
                    <div className="form-group">
                        <label>Upload Image</label>
                        <div className="file-input-wrapper">
                            <span className="file-input-label">{file ? file.name : (formData.image_url ? 'An image is already uploaded' : 'Click to upload an image')}</span>
                            <input type="file" onChange={handleFileChange} disabled={isLoading} accept="image/*" />
                        </div>
                         {formData.image_url && !file && <img src={formData.image_url} alt="Current" style={{maxWidth: '200px', marginTop: '1rem', borderRadius: '8px'}}/>}
                    </div>
                    <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={isLoading}>{isLoading ? 'Saving...' : (isEditMode ? 'Update Listing' : 'Submit for Approval')}</button>
                </form>
            </div>
        </div>
    );
}
