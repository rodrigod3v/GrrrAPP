import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, CreditCard, Bell, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const StudentLayout = () => {
  const { logout, session } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // If the user is on the notices page, immediately clear the badge locally
    if (location.pathname === '/student/notices') {
      setHasUnread(false);
    }

    const checkUnread = async () => {
      try {
        if (!session?.gym_id) return;
        const res = await api.get(`/notices/gym/${session.gym_id}`);
        const notices = res.data;
        
        if (notices.length > 0) {
          const lastSeenId = localStorage.getItem('lastSeenNoticeId');
          // Only show as unread if NOT on the notices page and ID is different
          if (lastSeenId !== String(notices[0].id) && location.pathname !== '/student/notices') {
            setHasUnread(true);
          } else if (location.pathname === '/student/notices') {
            // Ensure we update the lastSeenId immediately if on the page
            localStorage.setItem('lastSeenNoticeId', String(notices[0].id));
            setHasUnread(false);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar avisos:", err);
      }
    };
    
    checkUnread();
    const interval = setInterval(checkUnread, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [session, location.pathname]);

  const navItems = [
    { name: 'Início', icon: Home, path: '/student' },
    { name: 'Check-in', icon: Calendar, path: '/student/schedule' },
    { name: 'Assinatura', icon: CreditCard, path: '/student/financial' },
    { name: 'Avisos', icon: Bell, path: '/student/notices' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', margin: 0, padding: 0, background: 'var(--bg-dark)' }}>
      {/* Top Header Mobile */}
      <header style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>G</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>GrrrAPP</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/student/notices')}
            style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Bell size={20} />
            {hasUnread && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', border: '2px solid #0f172a', borderRadius: '50%' }}></span>
            )}
          </button>
          <button onClick={logout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', paddingBottom: 'calc(60px + 1.5rem)' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '65px', background: 'rgba(30, 41, 59, 0.9)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 10 }}>
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            end={item.path === '/student'}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              textDecoration: 'none', color: isActive ? '#10b981' : 'var(--text-muted)',
              transition: 'all 0.2s', padding: '0.5rem', minWidth: '60px'
            })}
          >
            <item.icon size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StudentLayout;
