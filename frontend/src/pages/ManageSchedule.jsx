import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, Plus, X } from 'lucide-react';

const DAYS = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

function ManageSchedule() {
  const { session } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    modality: '', days_of_week: [], start_time: '', end_time: '', capacity: 20
  });
  const [saving, setSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const fetchClasses = async () => {
    try {
      if (!session?.gym_id) return;
      setLoading(true);
      const res = await api.get(`/classes/gym/${session.gym_id}`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.days_of_week.length === 0) {
      setErrorStatus("Selecione pelo menos um dia da semana.");
      return;
    }
    setSaving(true);
    setErrorStatus('');
    try {
      await api.post('/classes/batch', {
        ...formData,
        gym_id: session.gym_id
      });
      setShowModal(false);
      setFormData({ modality: '', days_of_week: [], start_time: '', end_time: '', capacity: 20 });
      fetchClasses();
    } catch (err) {
      setErrorStatus(err.response?.data?.detail || "Erro ao salvar aula");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover esta aula da grade?")) return;
    try {
      await api.delete(`/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert("Erro ao remover aula");
    }
  };

  const toggleDay = (day) => {
    const current = [...formData.days_of_week];
    if (current.includes(day)) {
      setFormData({...formData, days_of_week: current.filter(d => d !== day)});
    } else {
      setFormData({...formData, days_of_week: [...current, day]});
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={28} color="var(--primary)" /> Grade Semanal
            </h1>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Planeje os horários recorrentes da sua academia.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nova Aula Recorrente
          </button>
        </header>

        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Carregando grade...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {DAYS.map(day => {
              const dayClasses = classes.filter(c => c.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time));
              return (
                <div key={day} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', minHeight: '300px' }}>
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                    {day.split('-')[0]}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dayClasses.length === 0 ? (
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.1)', textAlign: 'center', marginTop: '2rem' }}>Sem aulas</p>
                    ) : (
                      dayClasses.map(cls => (
                        <div key={cls.id} className="animate-fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.75rem', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                          <button onClick={() => handleDelete(cls.id)} style={{ position: 'absolute', top: '4px', right: '4px', padding: '4px', background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#ef4444'} onMouseOut={e=>e.currentTarget.style.color='rgba(239, 68, 68, 0.4)'}>
                            <X size={12} />
                          </button>
                          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#fff' }}>{cls.modality}</h4>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cap: {cls.capacity} alunos</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Nova Aula Batch */}
      {showModal && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="animate-fade-in" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', position: 'relative' }}>
             <button type="button" onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
               <X size={20}/>
             </button>
             
             <div style={{ marginBottom: '2rem' }}>
               <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#fff' }}>Agendar Aula Recorrente</h2>
               <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selecione os dias e horários permanentes.</p>
             </div>
             
             {errorStatus && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{errorStatus}</div>}

             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'block' }}>Modalidade</label>
                 <input type="text" placeholder="Ex: Boxe Iniciante" value={formData.modality} onChange={e => setFormData({...formData, modality: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', outline: 'none' }} />
               </div>
               
               <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.8rem', display: 'block' }}>Dias da Semana (Repetição)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {DAYS.map(day => (
                      <button 
                        key={day} 
                        type="button"
                        onClick={() => toggleDay(day)}
                        style={{ 
                          padding: '0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', border: '1px solid',
                          background: formData.days_of_week.includes(day) ? 'var(--primary)' : 'transparent',
                          borderColor: formData.days_of_week.includes(day) ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          color: formData.days_of_week.includes(day) ? '#000' : '#fff',
                          fontWeight: formData.days_of_week.includes(day) ? 700 : 400,
                          transition: 'all 0.2s'
                        }}
                      >
                        {day.split('-')[0]}
                      </button>
                    ))}
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Início</label>
                   <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', colorScheme: 'dark' }} />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Término</label>
                   <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', colorScheme: 'dark' }} />
                 </div>
               </div>

               <div>
                 <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Capacidade de Alunos</label>
                 <input type="number" min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff' }} />
               </div>
               
               <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '1rem', justifyContent: 'center', width: '100%', padding: '0.85rem', fontSize: '1rem' }}>
                 {saving ? 'Agendando...' : 'Confirmar Horários Recorrentes'}
               </button>
             </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManageSchedule;
