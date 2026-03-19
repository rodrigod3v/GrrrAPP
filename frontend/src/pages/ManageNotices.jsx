import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Plus, X, Megaphone, AlertTriangle, Info, Trash2, Send } from 'lucide-react';

function ManageNotices() {
  const { session } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'info',
    color: '#34d399'
  });

  const fetchNotices = async () => {
    try {
      if (!session?.gym_id) return;
      const res = await api.get(`/notices/gym/${session.gym_id}`);
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices/', {
        ...formData,
        gym_id: session.gym_id
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', type: 'info', color: '#34d399' });
      fetchNotices();
    } catch (err) {
      alert("Erro ao criar aviso: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este aviso?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const categories = [
    { value: 'info', label: 'Informativo', color: '#34d399', icon: Info, bg: 'rgba(52, 211, 153, 0.1)' },
    { value: 'warning', label: 'Evento', color: '#fbbf24', icon: AlertTriangle, bg: 'rgba(251, 191, 36, 0.1)' },
    { value: 'alert', label: 'Urgente', color: '#f87171', icon: Megaphone, bg: 'rgba(248, 113, 113, 0.1)' }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={32} color="var(--primary)" />
            </div>
            Mural de Avisos
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1.15rem' }}>Sua comunicação direta com os alunos pelo app.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            background: 'var(--primary)', border: 'none', color: '#000', padding: '1rem 2rem', borderRadius: '18px', 
            fontSize: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.25)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformStyle: 'preserve-3d'
          }}
          className="btn-hover-scale"
        >
          <Plus size={22} strokeWidth={3} /> Novo Comunicado
        </button>
      </header>

      {loading ? (
        <div style={{ padding: '6rem', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem auto', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Sincronizando seu mural...</p>
        </div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '40px', border: '2px dashed rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '100px', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
            <Megaphone size={48} color="rgba(255,255,255,0.1)" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Comunique-se com seus alunos</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '450px', margin: '0 auto 2.5rem auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Publique avisos sobre seminários, feriados ou mudanças de horário. Todos os alunos receberão o alerta na tela inicial do app.
          </p>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontSize: '1.05rem' }}
            onClick={() => setIsModalOpen(true)}
          >
            Começar Agora
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2.5rem' }}>
          {notices.map((notice) => {
            const cat = categories.find(c => c.value === notice.type) || categories[0];
            return (
              <div key={notice.id} style={{ 
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', 
                padding: '2.5rem', position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', background: `${notice.color}15`, borderRadius: '14px' }}>
                    <cat.icon size={18} color={notice.color} strokeWidth={2.5} />
                    <span style={{ color: notice.color, fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(notice.id)} 
                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: 'none', color: '#ef4444', width: '42px', height: '42px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 }}>{notice.title}</h3>
                <p style={{ margin: '0 0 2rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: '1.7' }}>{notice.description}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Postado em {new Date(notice.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '8px', background: notice.color }}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Improved & Centralized */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '24px'
        }}>
          <div className="animate-scale-in" style={{ 
            background: '#121212', border: '1px solid rgba(255,255,255,0.1)', 
            padding: '2rem', borderRadius: '32px', width: '100%', maxWidth: '480px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8)', position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Megaphone size={32} color="var(--primary)" strokeWidth={2.5} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>Novo Comunicado</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>TÍTULO</label>
                <input 
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '1rem', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.02)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  placeholder="Ex: Seminário de Graduação"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>DESCRIÇÃO</label>
                <textarea 
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '1rem', borderRadius: '14px', color: '#fff', fontSize: '1rem', outline: 'none',
                    resize: 'none', height: '100px', transition: 'all 0.2s', lineHeight: '1.5'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(245, 158, 11, 0.02)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  placeholder="Detalhes para os alunos..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.02em' }}>CATEGORIA</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({...formData, type: cat.value, color: cat.color})}
                      style={{ 
                        flex: '1 1 100px', padding: '0.85rem 0.5rem', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                        border: formData.type === cat.value ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.05)',
                        background: formData.type === cat.value ? cat.bg : 'rgba(255,255,255,0.01)',
                        color: formData.type === cat.value ? '#fff' : 'rgba(255,255,255,0.3)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <cat.icon size={20} color={formData.type === cat.value ? cat.color : 'rgba(255,255,255,0.15)'} strokeWidth={2.5} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  marginTop: '0.5rem', background: 'var(--primary)', color: '#000', border: 'none', padding: '1.25rem', 
                  borderRadius: '16px', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
                className="btn-hover-scale"
              >
                <Send size={20} strokeWidth={2.5} /> Publicar no App
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CSS For Animations */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .btn-hover-scale:hover { transform: translateY(-3px) scale(1.02); }
        .btn-hover-scale:active { transform: translateY(0) scale(0.98); }
      `}</style>
    </div>
  );
}

export default ManageNotices;
