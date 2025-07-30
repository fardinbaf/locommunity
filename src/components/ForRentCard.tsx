
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { EditIcon, TrashIcon } from './Icons';

export default function ForRentCard({ item, onUpdate }) {
    const { profile, supabase, showToast, user } = useContext(AppContext);
    const navigate = useNavigate();

    const canManage = user && (profile?.is_admin || user.id === item.user_id);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        
        // Delete image from storage first
        if (item.image_url) {
            const path = new URL(item.image_url).pathname.split('/for-rent-images/')[1];
            if(path) {
                await supabase.storage.from('for-rent-images').remove([path]);
            }
        }

        const { error } = await supabase.from('for_rent').delete().eq('id', item.id);

        if (error) {
            showToast("Failed to delete listing.", "error");
        } else {
            showToast("Listing deleted successfully.");
            if (onUpdate) onUpdate();
        }
    };

    return (
        <div className="for-rent-card report-card">
            {!item.is_approved && <span className="issue-tag warning" style={{position: 'absolute', top: '1rem', right: '1rem', zIndex: 2}}>Pending Approval</span>}
            <img src={item.image_url || 'https://placehold.co/400x300?text=No+Image'} alt={item.title} />
            <div className="for-rent-content">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem'}}>
                    <div>
                        <h3>{item.title}</h3>
                        <p>{item.address}</p>
                    </div>
                     <p className="for-rent-price">${item.rent?.toLocaleString()}/mo</p>
                </div>
                
                <p className="card-description" style={{margin: '1rem 0', flexGrow: '1'}}>{item.description}</p>
                
                <div className="card-footer" style={{padding:0, paddingTop: '1rem', marginTop: 'auto'}}>
                     <p className="contact-info">Contact: {item.contact}</p>
                     {canManage && (
                        <div className="card-actions">
                            <button onClick={() => navigate(`/for-rent/edit/${item.id}`)} aria-label="Edit listing"><EditIcon /></button>
                            <button onClick={handleDelete} aria-label="Delete listing"><TrashIcon /></button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}