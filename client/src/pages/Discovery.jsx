import React, { useState, useEffect } from 'react';
import { Search, MapPin, Tag, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Discovery = ({ user }) => {
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/services', {
                params: { query: search, city, category }
            });
            setServices(res.data);
        } catch (err) {
            console.error('Error fetching services', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchServices(), 300);
        return () => clearTimeout(timer);
    }, [search, city, category]);

    return (
        <div className="discovery-page animate-fade">
            <header className="hero">
                <h1>Find Trusted Local <span>Experts</span></h1>
                <p>Book verified professionals for home services, repairs, and more.</p>

                <div className="search-bar glass-card">
                    <div className="search-input">
                        <Search size={20} className="icon" />
                        <input
                            type="text"
                            placeholder="What do you need help with?"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="search-divider"></div>
                    <div className="search-input">
                        <MapPin size={20} className="icon" />
                        <input
                            type="text"
                            placeholder="City (e.g. New York)"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={fetchServices}>Search</button>
                </div>

                <div className="categories-pills">
                    {['Plumbing', 'Painting', 'Cleaning', 'Electrical', 'Gardening'].map(cat => (
                        <button
                            key={cat}
                            className={`pill ${category === cat ? 'active' : ''}`}
                            onClick={() => setCategory(category === cat ? '' : cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <section className="services-grid grid grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center">Loading services...</div>
                ) : services.length > 0 ? (
                    services.map(service => (
                        <div key={service.id} className="glass-card service-card">
                            <div className="service-category">{service.category}</div>
                            <h3>{service.name}</h3>
                            <p>{service.description}</p>

                            <div className="service-meta">
                                <div className="price">
                                    ${service.price} <span>/ {service.priceType.toLowerCase()}</span>
                                </div>
                                <div className="location">
                                    <MapPin size={14} /> {service.city}
                                </div>
                            </div>

                            <div className="provider-info">
                                <div className="provider-name">
                                    <Star size={14} fill="currentColor" /> 4.9 • {service.provider.name}
                                </div>
                            </div>

                            <Link to={`/book/${service.id}`} className="btn btn-outline book-btn">
                                Book Now <ArrowRight size={16} />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <h3>No services found</h3>
                        <p>Try adjusting your search filters</p>
                    </div>
                )}
            </section>

            <style jsx>{`
        .hero {
          text-align: center;
          margin-bottom: 60px;
        }
        
        h1 { font-size: 3.5rem; margin-bottom: 16px; }
        h1 span { color: var(--primary); }
        .hero p { font-size: 1.2rem; color: var(--text-muted); max-width: 600px; margin: 0 auto 40px; }

        .search-bar {
          display: flex;
          align-items: center;
          max-width: 800px;
          margin: 0 auto;
          padding: 8px 12px;
          gap: 12px;
        }

        .search-input {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-input input {
          background: transparent;
          border: none;
          padding: 12px 0;
        }

        .search-input .icon { color: var(--primary); }
        .search-divider { width: 1px; height: 30px; background: var(--glass-border); }

        .categories-pills {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 32px;
        }

        .pill {
          padding: 8px 20px;
          border-radius: 99px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
        }

        .pill:hover, .pill.active {
          background: var(--primary-glow);
          border-color: var(--primary);
          color: white;
        }

        .service-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .service-category {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .service-card h3 { font-size: 1.25rem; }
        .service-card p { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }

        .service-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .price { font-weight: 700; font-size: 1.1rem; color: var(--text-main); }
        .price span { font-size: 0.8rem; color: var(--text-muted); font-weight: 400; }

        .location { font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }

        .provider-info {
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }

        .provider-name {
          font-size: 0.85rem;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .book-btn { width: 100%; margin-top: 8px; }
      `}</style>
        </div>
    );
};

export default Discovery;
