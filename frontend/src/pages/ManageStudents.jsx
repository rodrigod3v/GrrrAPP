import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, Plus, X } from 'lucide-react';

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
    fetchStudents();
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

  return (
    <>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={28} color="var(--primary)" /> Gestão de Alunos
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Adicione e controle seus tatames.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Novo Aluno
          </button>
        </header>

        {/* List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum aluno matriculado.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>NOME</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>LOGIN (APP)</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>MODALIDADE E GRADUAÇÃO</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.email}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{student.username}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                       {['Boxe', 'Wrestling', 'MMA'].includes(student.modality) ? (
                         <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                            {student.modality}
                         </span>
                       ) : (
                         <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                            {student.modality || 'Jiu-Jitsu'} • {student.belt} {['Jiu-Jitsu', 'Judô'].includes(student.modality || 'Jiu-Jitsu') && `• ${student.degree} Graus`}
                         </span>
                       )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {student.is_active ? 
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>ATIVO</span> 
                        : 
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>INATIVO</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Novo Aluno */}
      {showModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
             <button type="button" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
               <X size={20}/>
             </button>
             
             <div style={{ marginBottom: '2rem' }}>
               <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                 <Users size={20} color="var(--primary)" /> Nova Matrícula
               </h2>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Crie um novo acesso para o aluno no aplicativo.</p>
             </div>
             
             {errorStatus && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{errorStatus}</div>}

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Nome Completo</label>
                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
               </div>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Email</label>
                 <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>ID (Login)</label>
                   <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Senha Provisória</label>
                   <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
                 </div>
               </div>

               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Modalidade Principal</label>
                 <select value={formData.modality} onChange={e => {
                    const newMod = e.target.value;
                    const canHaveDegree = ['Jiu-Jitsu', 'Judô'].includes(newMod);
                    setFormData({...formData, modality: newMod, grade: canHaveDegree ? formData.grade : 0});
                 }} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem', cursor: 'pointer' }}>
                   <option value="Jiu-Jitsu">Jiu-Jitsu</option>
                   <option value="Judô">Judô</option>
                   <option value="Muay Thai">Muay Thai</option>
                   <option value="Boxe">Boxe</option>
                   <option value="Wrestling">Wrestling</option>
                   <option value="MMA">MMA</option>
                 </select>
               </div>

               {!['Boxe', 'Wrestling', 'MMA'].includes(formData.modality) && (
                 <div style={{ display: 'grid', gridTemplateColumns: ['Jiu-Jitsu', 'Judô'].includes(formData.modality) ? '2fr 1fr' : '1fr', gap: '1.25rem' }}>
                   <div>
                     <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Grau/Nível/Faixa Atual</label>
                     <input type="text" placeholder="Ex: Branca, Kruang Vermelho" value={formData.belt} onChange={e => setFormData({...formData, belt: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
                   </div>
                   {['Jiu-Jitsu', 'Judô'].includes(formData.modality) && (
                     <div>
                       <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Graus</label>
                       <input type="number" min="0" max="4" value={formData.grade} onChange={e => setFormData({...formData, grade: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none', fontSize: '0.95rem' }} />
                     </div>
                   )}
                 </div>
               )}
               
               <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '1rem', justifyContent: 'center', width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
                 {saving ? 'Registrando...' : 'Finalizar Matrícula do Aluno'}
               </button>
             </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageStudents;
