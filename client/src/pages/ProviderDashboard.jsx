import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckCircle, XCircle, Camera, Clock, User } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const ProviderDashboard = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // bookingId

    const fetchJobs = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/${user.id}/bookings`, { params: { role: 'PROVIDER' } });
            setJobs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [user.id]);

    const transitionJob = async (bookingId, nextStatus, file = null) => {
        const data = new FormData();
        data.append('nextStatus', nextStatus);
        if (file) data.append('photo', file);

        try {
            await axios.patch(`${API_URL}/bookings/${bookingId}/status`, data);
            fetchJobs();
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        }
    };

    return (
        <div className="provider-dashboard animate-fade">
            <h1>Provider <span>Workspace</span></h1>

            <div className="jobs-list grid">
                {loading ? (
                    <p>Loading projects...</p>
                ) : jobs.length > 0 ? (
                    jobs.map(job => (
                        <div key={job.id} className="glass-card job-item">
                            <div className="job-header">
                                <div>
                                    <span className={`badge badge-${job.status.toLowerCase().replace('_', '-')}`}>
                                        {job.status}
                                    </span>
                                    <h3>{job.service.name}</h3>
                                </div>
                                <div className="customer-info">
                                    <User size={16} /> {job.customer.name}
                                </div>
                            </div>

                            <div className="job-details">
                                <p><strong>Address:</strong> {job.address}</p>
                                <p><strong>Schedule:</strong> {new Date(job.scheduledAt).toLocaleString()}</p>
                                {job.notes && <p className="notes"><strong>Notes:</strong> {job.notes}</p>}
                            </div>

                            <div className="job-actions">
                                {job.status === 'REQUESTED' && (
                                    <button className="btn btn-primary" onClick={() => transitionJob(job.id, 'CONFIRMED')}>
                                        Confirm Request
                                    </button>
                                )}

                                {job.status === 'CONFIRMED' && (
                                    <div className="action-group">
                                        <input
                                            type="file"
                                            id={`before-${job.id}`}
                                            hidden
                                            onChange={(e) => transitionJob(job.id, 'IN_PROGRESS', e.target.files[0])}
                                        />
                                        <label htmlFor={`before-${job.id}`} className="btn btn-primary">
                                            <Camera size={18} /> Start Job (Upload Before Photo)
                                        </label>
                                    </div>
                                )}

                                {job.status === 'IN_PROGRESS' && (
                                    <div className="action-group">
                                        <input
                                            type="file"
                                            id={`after-${job.id}`}
                                            hidden
                                            onChange={(e) => transitionJob(job.id, 'COMPLETED', e.target.files[0])}
                                        />
                                        <label htmlFor={`after-${job.id}`} className="btn btn-primary">
                                            <CheckCircle size={18} /> Finish Job (Upload After Photo)
                                        </label>
                                    </div>
                                )}

                                {job.status === 'COMPLETED' && <p className="status-msg">✅ Job Completed Successfully</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>No active jobs at the moment. Stay online for new requests!</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .provider-dashboard h1 { margin-bottom: 40px; }
        .provider-dashboard h1 span { color: var(--primary); }
        
        .job-item { border-left: 4px solid var(--primary); }
        .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .job-header h3 { margin-top: 8px; font-size: 1.25rem; }
        
        .customer-info { font-size: 0.85rem; color: var(--secondary); font-weight: 600; display: flex; align-items: center; gap: 6px; }

        .job-details { margin-bottom: 24px; font-size: 0.95rem; color: var(--text-muted); }
        .job-details p { margin-bottom: 8px; }
        .notes { font-style: italic; background: var(--glass-bg); padding: 12px; border-radius: 8px; margin-top: 12px; }

        .job-actions { display: flex; gap: 12px; border-top: 1px solid var(--glass-border); padding-top: 20px; }
        .action-group label { cursor: pointer; }
        .status-msg { color: var(--primary); font-weight: 600; font-size: 0.9rem; }
      `}</style>
        </div>
    );
};

export default ProviderDashboard;
