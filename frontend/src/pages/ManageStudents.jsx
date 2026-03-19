import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, Plus, X, Search, Filter, Eye } from 'lucide-react';

function ManageStudents() {
  const { session } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', name: '', email: '', 
    modality: 'Jiu-Jitsu', belt: 'Branca', grade: 0, is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModality, setFilterModality] = useState('Todas');

  const fetchStudents = async () => {
    try {
      if (!session?.gym_id) return;
      setLoading(true);
      const res = await api.get(`/students/gym/${session.gym_id}`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.gym_id) {
      fetchStudents();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorStatus('');
    try {
      await api.post('/students/', {
        ...formData,
        gym_id: session.gym_id
      });
      setShowModal(false);
      setFormData({ username: '', password: '', name: '', email: '', modality: 'Jiu-Jitsu', belt: 'Branca', grade: 0, is_active: true });
      fetchStudents();
    } catch (err) {
      setErrorStatus(err.response?.data?.detail || "Erro ao salvar aluno");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterModality === 'Todas' || s.modality === filterModality;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={28} color="var(--primary)" /> Gestão de Alunos
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Controle de alunos e evolução dos tatames.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Novo Aluno
          </button>
        </header>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            >
              <option value="Todas">Todas Modalidades</option>
              <option value="Jiu-Jitsu">Jiu-Jitsu</option>
              <option value="Muay Thai">Muay Thai</option>
              <option value="Boxe">Boxe</option>
              <option value="Wrestling">Wrestling</option>
              <option value="MMA">MMA</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }} className="animate-pulse">Carregando tatame...</div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum aluno encontrado.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ALUNO</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOGIN</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>STATUS</th>
                  <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {s.modality} 
                        {!['Boxe', 'Wrestling', 'MMA'].includes(s.modality) && s.belt && ` • ${s.belt}`}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.username}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: s.is_active ? '#10b981' : '#ef4444', background: s.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {s.is_active ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                       <Link to={`/admin/students/${s.id}`} style={{ 
                         background: 'rgba(245, 158, 11, 0.1)', 
                         color: 'var(--primary)', 
                         textDecoration: 'none', 
                         padding: '0.5rem 1rem', 
                         borderRadius: '8px', 
                         fontSize: '0.75rem', 
                         fontWeight: 800, 
                         display: 'inline-flex', 
                         alignItems: 'center', 
                         gap: '6px',
                         border: '1px solid rgba(245, 158, 11, 0.2)' 
                       }}>
                         <Eye size={14} /> Ver Ficha
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '2.5rem', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={20} color="var(--primary)" /> Nova Matrícula</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <input type="text" placeholder="Nome Completo" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: '#fff' }} />
               <input type="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: '#fff' }} />
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" placeholder="ID (Login)" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: '#fff' }} />
                  <input type="password" placeholder="Senha" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: '#fff' }} />
               </div>
               <select value={formData.modality} onChange={e=>setFormData({...formData, modality: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#0f172a', border: '1px solid var(--border-light)', color: '#fff' }}>
                  <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                  <option value="Judô">Judô</option>
                  <option value="Muay Thai">Muay Thai</option>
                  <option value="Boxe">Boxe</option>
                  <option value="MMA">MMA</option>
               </select>
               <input type="text" placeholder="Faixa/Grau" value={formData.belt} onChange={e=>setFormData({...formData, belt: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: '#fff' }} />
               <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '1rem', height: '50px', justifyContent: 'center' }}>
                 {saving ? 'Registrando...' : 'Finalizar Matrícula'}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageStudents;
