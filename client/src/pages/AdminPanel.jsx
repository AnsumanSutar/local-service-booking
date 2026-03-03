import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, MessageSquare, Check, X, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const AdminPanel = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/reviews/pending`);
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const approveReview = async (reviewId) => {
        try {
            await axios.patch(`${API_URL}/admin/reviews/${reviewId}/approve`);
            fetchPendingReviews();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="admin-panel animate-fade">
            <header className="admin-header">
                <h1>Admin <span>Moderation</span></h1>
                <div className="glass-card stat-pill">
                    <AlertCircle size={18} color="var(--primary)" />
                    <span>{reviews.length} Pending Reviews</span>
                </div>
            </header>

            <section className="moderation-queue grid grid-cols-2">
                {loading ? (
                    <p>Loading moderation task...</p>
                ) : reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="glass-card review-card">
                            <div className="review-header">
                                <div className="user">
                                    <span className="avatar-sm">{review.customer.name.charAt(0)}</span>
                                    <div>
                                        <h4>{review.customer.name}</h4>
                                        <span className="service-tag">{review.booking.service.name}</span>
                                    </div>
                                </div>
                                <div className="rating">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < review.rating ? 'active' : ''}>★</span>
                                    ))}
                                </div>
                            </div>

                            <p className="comment">"{review.comment}"</p>

                            <div className="review-actions">
                                <button className="btn btn-primary" onClick={() => approveReview(review.id)}>
                                    <Check size={18} /> Approve Review
                                </button>
                                <button className="btn btn-outline">
                                    <X size={18} /> Dismiss
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full empty-admin">
                        <Check size={48} color="var(--primary)" />
                        <h3>No pending moderation tasks</h3>
                        <p>All reviews are currently moderated.</p>
                    </div>
                )}
            </section>

            <style jsx>{`
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .admin-header h1 span { color: var(--primary); }
        .stat-pill { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 99px; }

        .review-card { display: flex; flex-direction: column; gap: 16px; border-top: 4px solid var(--secondary); }
        .review-header { display: flex; justify-content: space-between; align-items: center; }
        
        .user { display: flex; gap: 12px; align-items: center; }
        .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; color: white; }
        .service-tag { font-size: 0.75rem; color: var(--primary); font-weight: 600; }
        
        .rating { color: #555; font-size: 1.2rem; }
        .rating .active { color: #f59e0b; }

        .comment { font-style: italic; color: var(--text-main); line-height: 1.6; }
        .review-actions { display: flex; gap: 12px; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--glass-border); }
        
        .empty-admin { text-align: center; padding: 60px; }
        .empty-admin h3 { margin-top: 20px; }
        .empty-admin p { color: var(--text-muted); }
      `}</style>
        </div>
    );
};

export default AdminPanel;
