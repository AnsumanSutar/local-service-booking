import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, FileText, Camera, CheckCircle } from 'lucide-react';
import api from '../api';

const BookingFlow = ({ user }) => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [formData, setFormData] = useState({
        scheduledAt: '',
        address: '',
        notes: '',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [booked, setBooked] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await api.get('/api/services');
                const item = res.data.find(s => s.id === serviceId);
                setService(item);
            } catch (err) {
                console.error(err);
            }
        };
        fetchService();
    }, [serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('serviceId', serviceId);
        data.append('customerId', user.id);
        data.append('providerId', service.providerId);
        data.append('scheduledAt', formData.scheduledAt);
        data.append('address', formData.address);
        data.append('notes', formData.notes);
        if (file) data.append('requirements', file);

        try {
            await api.post('/api/bookings', data);
            setBooked(true);
            setTimeout(() => navigate('/history'), 2000);
        } catch (err) {
            alert('Booking failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (booked) {
        return (
            <div className="success-view glass-card animate-fade">
                <CheckCircle size={64} color="var(--primary)" />
                <h2>Booking Confirmed!</h2>
                <p>Your request has been sent to {service?.provider.name}.</p>
                <p>Redirecting to your history...</p>
            </div>
        );
    }

    return (
        <div className="booking-page animate-fade">
            <div className="booking-container bg-grid">
                <div className="booking-form-wrapper">
                    <h2>Secure Your Booking</h2>
                    <p className="subtitle">Fill in the details to schedule your service with elite professionals.</p>

                    <form onSubmit={handleSubmit} className="glass-card">
                        <div className="input-group">
                            <label><Calendar size={16} /> Preferred Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label><MapPin size={16} /> Service Address</label>
                            <input
                                type="text"
                                placeholder="Where should they come?"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label><FileText size={16} /> Additional Notes</label>
                            <textarea
                                rows="3"
                                placeholder="Tell the provider about your specific needs..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <label><Camera size={16} /> Upload Requirements (Optional)</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    id="req-file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    hidden
                                />
                                <label htmlFor="req-file" className="file-label">
                                    {file ? file.name : "Select an image showing the job details"}
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                            {loading ? 'Processing...' : `Confirm Booking • $${service?.price}`}
                        </button>
                    </form>
                </div>

                <div className="service-summary">
                    {service && (
                        <div className="glass-card sticky-summary">
                            <h3>Service Summary</h3>
                            <div className="summary-item">
                                <span className="label">Service</span>
                                <span className="value">{service.name}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Provider</span>
                                <span className="value">{service.provider.name}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Category</span>
                                <span className="value">{service.category}</span>
                            </div>
                            <div className="price-breakdown">
                                <div className="summary-item total">
                                    <span>Total Price</span>
                                    <span>${service.price}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .booking-page { max-width: 1000px; margin: 0 auto; }
        .booking-container { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
        
        h2 { font-size: 2rem; margin-bottom: 8px; }
        .subtitle { color: var(--text-muted); margin-bottom: 32px; }

        .file-upload {
          border: 2px dashed var(--glass-border);
          border-radius: 12px;
          text-align: center;
          padding: 20px;
          cursor: pointer;
          transition: var(--transition);
        }

        .file-upload:hover { border-color: var(--primary); background: var(--glass-bg); }
        .file-label { cursor: pointer; color: var(--text-muted); font-size: 0.9rem; width: 100%; display: block; }

        .submit-btn { width: 100%; margin-top: 24px; font-size: 1.1rem; padding: 16px; }

        .sticky-summary { position: sticky; top: 120px; }
        .summary-item { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 0.95rem; }
        .summary-item .label { color: var(--text-muted); }
        .price-breakdown { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--glass-border); }
        .total { font-size: 1.2rem; font-weight: 700; color: var(--primary); }

        .success-view { text-align: center; padding: 60px; max-width: 500px; margin: 60px auto; }
        .success-view h2 { margin-top: 24px; }
        .success-view p { color: var(--text-muted); }

        @media (max-width: 768px) {
          .booking-container { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
};

export default BookingFlow;
