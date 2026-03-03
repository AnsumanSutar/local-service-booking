import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, MapPin, User as UserIcon, Briefcase, Settings, LogOut, LayoutGrid, History, Calendar } from 'lucide-react';
import Discovery from './pages/Discovery';
import BookingFlow from './pages/BookingFlow';
import ProviderDashboard from './pages/ProviderDashboard';
import CustomerHistory from './pages/CustomerHistory';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_v1');
    const defaultUser = { id: 'b4f92c3a-329b-4cde-972a-9d31175bf62f', role: 'CUSTOMER', name: 'John Doe' };
    return saved ? JSON.parse(saved) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('user_v1', JSON.stringify(user));
  }, [user]);

  const switchRole = (role) => {
    // Demo helper to switch roles between seeded users
    const roles = {
      CUSTOMER: { id: 'b4f92c3a-329b-4cde-972a-9d31175bf62f', role: 'CUSTOMER', name: 'John Doe' },
      PROVIDER: { id: '9fefe809-ca37-49ed-a8d9-beeb03ed604a', role: 'PROVIDER', name: 'Pro Handyman' },
      ADMIN: { id: '42f00566-8c52-4d78-81da-9acd6223b313', role: 'ADMIN', name: 'Admin User' }
    };
    // Note: In a real app we'd fetch these from the seeded DB. 
    // Since seed IDs vary, we'll try to find them or use placeholders.
    setUser({ ...roles[role], role });
  };

  return (
    <Router>
      <div className="layout">
        <nav className="glass-nav">
          <div className="container nav-content">
            <Link to="/" className="logo">
              <div className="logo-icon">✨</div>
              Service<span>Flow</span>
            </Link>

            <div className="nav-links">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                <LayoutGrid size={18} /> Discover
              </NavLink>
              {user.role === 'CUSTOMER' && (
                <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
                  <History size={18} /> My Bookings
                </NavLink>
              )}
              {user.role === 'PROVIDER' && (
                <NavLink to="/workspace" className={({ isActive }) => isActive ? 'active' : ''}>
                  <Briefcase size={18} /> Workspace
                </NavLink>
              )}
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''}>
                  <Settings size={18} /> Admin
                </NavLink>
              )}
            </div>

            <div className="user-menu">
              <div className="role-switcher-container">
                <span className="role-label">Mode</span>
                <select value={user.role} onChange={(e) => switchRole(e.target.value)}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="avatar-wrapper">
                <div className="avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="online-indicator"></div>
              </div>
            </div>
          </div>
        </nav>

        <main className="container main-content">
          <Routes>
            <Route path="/" element={<Discovery user={user} />} />
            <Route path="/book/:serviceId" element={<BookingFlow user={user} />} />
            <Route path="/workspace" element={<ProviderDashboard user={user} />} />
            <Route path="/history" element={<CustomerHistory user={user} />} />
            <Route path="/admin" element={<AdminPanel user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
