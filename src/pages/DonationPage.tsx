
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function DonationPage() {
    const { supabase, user, showToast } = useContext(AppContext);
    const navigate = useNavigate();

    const [donationTypes, setDonationTypes] = useState([]);
    const [amount, setAmount] = useState(20);
    const [customAmount, setCustomAmount] = useState('');
    const [donationType, setDonationType] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const fetchTypes = async () => {
            const { data } = await supabase.from('donation_types').select('*');
            if (data) {
                setDonationTypes(data);
                if (data.length > 0) setDonationType(data[0].name);
            }
        };
        fetchTypes();
    }, [supabase]);
    
    const handlePresetClick = (presetAmount) => {
        setAmount(presetAmount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e) => {
        const value = e.target.value;
        setCustomAmount(value);
        if (value && !isNaN(parseFloat(value))) {
            setAmount(parseFloat(value));
        } else if (value === '') {
            setAmount(0); // or some default
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const donationData = {
            user_id: user.id,
            email: user.email,
            amount,
            donation_type: donationType,
            name: name || 'Anonymous',
            message
        };

        const { error } = await supabase.from('donations').insert(donationData);

        setIsLoading(false);
        if (error) {
            showToast("Failed to process donation. Please try again.", "error");
            console.error(error);
        } else {
            showToast("Thank you for your generous donation!");
            navigate('/');
        }
    };

    return (
        <div className="main-content-area container">
            <div className="page-header">
                <h1>Support Community Hub</h1>
                <p>Your generous donations help us maintain and improve this platform for everyone.</p>
            </div>
            <div className="form-container">
                <form className="donation-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select an Amount</label>
                        <div className="donation-preset-amounts">
                            {[10, 20, 50, 100].map(p => (
                                <button type="button" key={p} onClick={() => handlePresetClick(p)} className={`donation-preset-btn ${amount === p && !customAmount ? 'active' : ''}`}>${p}</button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="custom-amount">Or Enter a Custom Amount</label>
                        <div style={{position: 'relative'}}>
                            <span className="currency-symbol">$</span>
                            <input type="number" id="custom-amount" name="custom-amount" min="1" step="0.01"
                                   value={customAmount} onChange={handleCustomAmountChange}
                                   placeholder="e.g., 25.50" disabled={isLoading} />
                        </div>
                    </div>
                     <div className="form-group">
                        <label htmlFor="donation-type">Donation Type</label>
                        <select id="donation-type" value={donationType} onChange={(e) => setDonationType(e.target.value)} disabled={isLoading}>
                             {donationTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Your Name (Optional)</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Leave blank to remain anonymous" disabled={isLoading} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="message">Message (Optional)</label>
                        <textarea id="message" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a nice message for the community!" disabled={isLoading}></textarea>
                    </div>
                    <button type="submit" className="btn-primary" style={{width: '100%'}} disabled={isLoading || amount < 1}>{isLoading ? 'Processing...' : `Donate $${amount}`}</button>
                </form>
            </div>
        </div>
    );
}