
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BloodDropIcon, EditIcon, TrashIcon } from './Icons';

export default function BloodRequestCard({ request, onUpdate }) {
    const { profile, supabase, showToast, user } = useContext(AppContext);
    const navigate = useNavigate();

    const canManage = user && (profile?.is_admin || user.id === request.user_id);
    
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this blood request?")) return;
        const { error } = await supabase.from('blood_requests').delete().eq('id', request.id);
        if (error) {
            showToast("Failed to delete request.", "error");
        } else {
            showToast("Request deleted successfully.");
            onUpdate();
        }
    };

    return (
        <div className="blood-request-card">
            <div className="card-header">
                 <h3 className="blood-request-header"><BloodDropIcon /> Urgent Request: {request.blood_group} 🩸</h3>
                 {canManage && (
                    <div className="card-actions">
                        <button onClick={() => navigate(`/blood-request/edit/${request.id}`)} aria-label="Edit request"><EditIcon/></button>
                        <button onClick={handleDelete} aria-label="Delete request"><TrashIcon/></button>
                    </div>
                 )}
            </div>
           
            <div className="blood-request-grid">
                <p><strong>😥 Patient:</strong> {request.patient_identity}</p>
                <p><strong>✴️ Reason:</strong> {request.reason}</p>
                <p><strong>🎒 Needed:</strong> {request.bags_needed} bag(s)</p>
                <p><strong>📅 On:</strong> {new Date(request.collection_date).toLocaleDateString()}</p>
                <p><strong>⏰ Time:</strong> {request.collection_time}</p>
                <p className="blood-request-place"><strong>🏨 Location:</strong> {request.collection_place}</p>
                <p className="blood-request-place"><strong>📱 Contact:</strong> <a href={`tel:${request.contact}`}>{request.contact}</a></p>
            </div>
        </div>
    );
}
