import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Info, AlertTriangle, Megaphone } from 'lucide-react';

function StudentNotices() {
  const { session } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        if (!session?.gym_id) return;
        const res = await api.get(`/notices/gym/${session.gym_id}`);
        const data = res.data;
        setNotices(data);
        
        // Mark as read by saving the most recent notice ID
        if (data.length > 0) {
          localStorage.setItem('lastSeenNoticeId', String(data[0].id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [session]);

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'alert': return Megaphone;
      default: return Info;
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={24} color="var(--primary)" /> Mural de Avisos
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Fique por dentro das novidades da sua academia.</p>
      </header>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Carregando avisos...</p>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', border: '1px dashed var(--border-light)', borderRadius: '16px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Você está em dia com todos os avisos!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {notices.map((notice) => {
            const Icon = getIcon(notice.type);
            return (
              <div key={notice.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', background: `${notice.color}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={notice.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#fff' }}>{notice.title}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: '1.5' }}>{notice.description}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: notice.color }}></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentNotices;
