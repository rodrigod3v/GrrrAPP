import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, DollarSign, LogOut, CheckSquare, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, session } = React.useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
    { name: 'Alunos (CRM)', icon: Users, path: '/admin/students' },
    { name: 'Grade de Aulas', icon: Calendar, path: '/admin/schedule' },
    { name: 'Financeiro', icon: DollarSign, path: '/admin/financial' },
    { name: 'Recepção / Check-in', icon: CheckSquare, path: '/admin/reception' },
    { name: 'Avisos / Mural', icon: Bell, path: '/admin/notices' },
  ];

  return (
    <aside style={{ width: '260px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '100vh', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
        <img src="/src/assets/logo.png" alt="Logo" style={{ width: '42px', height: '42px', filter: 'drop-shadow(0 0 10px var(--primary-glow))' }} />
        <div>
          <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>GrrrAPP</h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>Management</span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            end={item.path === '/admin'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.9rem 1.1rem', borderRadius: 'var(--radius-md)',
              textDecoration: 'none', color: isActive ? '#fff' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(90deg, rgba(255, 59, 48, 0.12) 0%, transparent 100%)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              fontWeight: isActive ? 700 : 500, transition: 'var(--transition)'
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#fff' }}>🛡️</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{session?.name}</p>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', width: '100%' }}>
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
