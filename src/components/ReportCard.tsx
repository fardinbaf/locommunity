
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ThumbsUpIcon, MessageSquareIcon, MapPinIcon, EditIcon, TrashIcon } from './Icons';

export default function ReportCard({ report, onUpdate }) {
    const { supabase, user, profile, showToast } = useContext(AppContext);
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    const canManage = user && (profile?.is_admin || user.id === report.user_id);
    
    const issueTypeClasses = { "Maintenance Neglect": "maintenance", "Unfair Charges": "charges", "Harassment": "harassment", "Privacy Violation": "privacy-violation", "Unsafe Conditions": "unsafe-conditions" };
    const issueClass = issueTypeClasses[report.issue_type] || 'default';

    const handleVote = async () => {
        if (!user) {
            showToast("Please log in to vote.", "error");
            navigate('/login');
            return;
        }
        // This is a simplified vote logic. A real implementation would prevent multiple votes from the same user.
        const { error } = await supabase.from('reports').update({ votes: (report.votes || 0) + 1 }).eq('id', report.id);
        if (error) showToast("Failed to vote.", "error"); else onUpdate();
    }
    
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
             showToast("Please log in to comment.", "error");
             navigate('/login');
             return;
        }
        if (!newComment.trim()) return;
        const { error } = await supabase.from('report_comments').insert({ report_id: report.id, user_id: user.id, text: newComment.trim() });
        if (error) {
            showToast("Failed to post comment.", "error");
        } else {
            setNewComment('');
            onUpdate(); // Re-fetch or update parent state
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        const { error } = await supabase.from('reports').delete().eq('id', report.id);
        if (error) showToast("Failed to delete report.", "error"); else {
            showToast("Report deleted successfully.");
            onUpdate();
        }
    }

    return (
        <div className="report-card">
            <div className="card-header">
                <div>
                    <h3>{report.landlord_name}</h3>
                    <p className="card-address">{report.property_address} - {report.area}</p>
                </div>
                <span className={`issue-tag ${issueClass}`}>{report.issue_type}</span>
            </div>
            <p className="card-description">{report.description}</p>
            
            {report.map_url && (
                 <div className="map-link-container">
                    <a href={report.map_url} target="_blank" rel="noopener noreferrer" className="btn-secondary map-link-btn">
                        <MapPinIcon /> View Location on Map
                    </a>
                </div>
            )}
            
            {report.evidence_url && (
                 <div className="map-link-container">
                    <a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="btn-secondary map-link-btn">
                        View Evidence
                    </a>
                </div>
            )}

            <div className="card-footer">
                <div className="card-interactions">
                    <button className="interaction-btn" onClick={handleVote} aria-label="Upvote report"><ThumbsUpIcon /><span>{report.votes || 0}</span></button>
                    <button className="interaction-btn" onClick={() => setIsExpanded(!isExpanded)} aria-label="View comments"><MessageSquareIcon /><span>{report.report_comments?.length || 0}</span></button>
                </div>
                <div className="card-meta">
                    {canManage ? (
                        <div className="card-actions">
                            <button onClick={() => navigate(`/report/edit/${report.id}`)} aria-label="Edit report"><EditIcon/></button>
                            <button onClick={handleDelete} aria-label="Delete report"><TrashIcon/></button>
                        </div>
                    ) : (
                        <span>{new Date(report.created_at).toLocaleDateString()} by {report.profiles?.username || 'Anonymous'}</span>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="card-comments-section">
                    <div className="comment-list">
                        {report.report_comments?.length > 0 ? (
                            report.report_comments.map(comment => (
                                <div key={comment.id} className="comment">
                                    <p>{comment.text}</p>
                                    <div className="comment-meta">
                                        <span>by {comment.profiles?.username || 'Anonymous'}</span>
                                        <span>{new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : <p>No comments yet. Be the first to comment!</p>}
                    </div>
                    {user && (
                         <form className="comment-form" onSubmit={handleCommentSubmit}>
                            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." required />
                            <button type="submit" className="btn-primary">Post</button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}