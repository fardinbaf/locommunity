import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { HospitalIcon, WrenchIcon, PhoneIcon, TrashIcon } from './Icons';

export default function GeneralInfoCard({ info, onUpdate }: { info: any, onUpdate?: () => void }) {
    const { profile, supabase, showToast } = useContext(AppContext);

    const getIcon = (category) => {
        switch (category) {
            case 'Best Hospital': return <HospitalIcon />;
            case 'Recommended Technician': return <WrenchIcon />;
            case 'Appointment Contact': return <PhoneIcon />;
            default: return <PhoneIcon />;
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        const { error } = await supabase.from('general_info').delete().eq('id', info.id);
        if (error) {
            showToast("Failed to delete item.", "error");
        } else {
            showToast("Item deleted successfully.");
            if(onUpdate) onUpdate();
        }
    };

    return (
        <div className="general-info-card">
            <div>
                <h3>{getIcon(info.category)} {info.title}</h3>
                <span className="category">{info.category}</span>
                <p>{info.description}</p>
            </div>
            <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <p className="contact-info">Contact: {info.contact}</p>
                {profile?.is_admin && onUpdate && (
                     <div className="card-actions">
                        <button onClick={handleDelete} aria-label="Delete item"><TrashIcon/></button>
                    </div>
                )}
            </div>
        </div>
    );
}