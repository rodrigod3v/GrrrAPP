import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Calendar, CreditCard, Bell } from 'lucide-react';

const StudentLayout = () => {
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
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '1rem' }}>🥋</span>
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
