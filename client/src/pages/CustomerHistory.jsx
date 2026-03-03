import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, AlertCircle } from 'lucide-react';
import api from '../api';

const CustomerHistory = ({ user }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState(null); // { bookingId, rating, comment }

    const fetchBookings = async () => {
        try {
            const res = await api.get(`/users/${user.id}/bookings`, { params: { role: 'CUSTOMER' } });
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [user.id]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post('/reviews', {
                ...reviewForm,
                customerId: user.id
            });
            alert('Review submitted for approval!');
            setReviewForm(null);
            fetchBookings();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="history-page animate-fade">
            <h1>My Booking <span>History</span></h1>

            <div className="bookings-list grid">
                {loading ? (
                    <p>Loading bookings...</p>
                ) : bookings.length > 0 ? (
                    bookings.map(booking => (
                        <div key={booking.id} className="glass-card booking-item">
                            <div className="booking-header">
                                <div className="service-name">
                                    <h3>{booking.service.name}</h3>
                                    <span className={`badge badge-${booking.status.toLowerCase().replace('_', '-')}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="price">${booking.service.price}</div>
                            </div>

                            <div className="booking-details">
                                <div className="detail">
                                    <Clock size={16} />
                                    {new Date(booking.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                                <div className="detail">
                                    <MapPin size={16} /> {booking.address}
                                </div>
                                <div className="detail provider">
                                    <Star size={16} /> Provider: {booking.provider.name}
                                </div>
                            </div>

                            {booking.status === 'COMPLETED' && !booking.review && (
                                <button
                                    className="btn btn-primary review-btn"
                                    onClick={() => setReviewForm({ bookingId: booking.id, rating: 5, comment: '' })}
                                >
                                    Leave a Review
                                </button>
                            )}

                            {booking.review && (
                                <div className="review-status">
                                    <AlertCircle size={14} />
                                    {booking.review.isApproved ? 'Review Published' : 'Review Pending Admin Approval'}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>You haven't made any bookings yet.</p>
                    </div>
                )}
            </div>

            {reviewForm && (
                <div className="modal-overlay">
                    <div className="glass-card modal">
                        <h3>Share Your Experience</h3>
                        <form onSubmit={submitReview}>
                            <div className="input-group">
                                <label>Rating (1-5)</label>
                                <select
                                    value={reviewForm.rating}
                                    onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                >
                                    <option value="5">5 Stars - Amazing</option>
                                    <option value="4">4 Stars - Great</option>
                                    <option value="3">3 Stars - Good</option>
                                    <option value="2">2 Stars - Poor</option>
                                    <option value="1">1 Star - Terrible</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Comment</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setReviewForm(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .history-page h1 { margin-bottom: 40px; }
        .history-page h1 span { color: var(--primary); }
        .booking-item { display: flex; flex-direction: column; gap: 20px; }
        
        .booking-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .service-name { display: flex; flex-direction: column; gap: 8px; }
        .booking-header .price { font-size: 1.25rem; font-weight: 700; color: var(--primary); }

        .booking-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px; background: var(--glass-bg); border-radius: 12px; }
        .detail { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-muted); }
        .provider { color: var(--secondary); font-weight: 600; }

        .review-btn { margin-top: 8px; }
        .review-status { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-top: 8px; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { width: 100%; max-width: 500px; padding: 32px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }

        @media (max-width: 768px) {
          .booking-details { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default CustomerHistory;
