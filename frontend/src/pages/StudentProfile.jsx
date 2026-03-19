import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Calendar, Award, TrendingUp, ArrowLeft, Trash2, CheckCircle } from 'lucide-react';

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [resStudent, resStats, resHistory] = await Promise.all([
        api.get(`/students/gym/${session.gym_id}`), // Getting all to find the specific one for now
        api.get(`/students/${id}/stats`),
        api.get(`/attendance/student/${id}/history`)
      ]);
      
      const currentStudent = resStudent.data.find(s => s.id === parseInt(id));
      if (!currentStudent) {
        navigate('/admin/students');
        return;
      }
      
      setStudent(currentStudent);
      setStats(resStats.data);
      setHistory(resHistory.data);
    } catch (err) {
      console.error(err);
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.gym_id) {
      fetchProfile();
    }
  }, [id, session]);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja remover este aluno?")) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${id}`);
      navigate('/admin/students');
    } catch (err) {
      alert("Erro ao remover aluno");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '2rem' }}>
      <div className="skeleton animate-pulse-slow" style={{ width: '200px', height: '32px', marginBottom: '2rem' }}></div>
      <div className="glass-pane skeleton animate-pulse-slow" style={{ height: '400px' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/admin/students')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Voltar para Lista
        </button>
        <button onClick={handleDelete} disabled={deleting} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Trash2 size={18} /> {deleting ? 'Removendo...' : 'Remover Aluno'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Profile Info */}
        <div className="glass-pane" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
             <Award size={150} color="var(--primary)" />
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '2rem', fontWeight: 900, boxShadow: '0 8px 25px var(--primary-glow)' }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>{student.name}</h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', background: 'rgba(255, 59, 48, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>{student.modality}</span>
                 {!['Boxe', 'Wrestling', 'MMA'].includes(student.modality) && (
                   <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                     {student.belt} {['Jiu-Jitsu', 'Judô'].includes(student.modality) && `• ${student.grade} Graus`}
                   </span>
                 )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '3rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{student.email || 'Não informado'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>ID / Login</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{student.username}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status Financeiro</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>Em Dia ✅</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Matrícula</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{new Date(student.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Evolution Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-pane" style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
             <TrendingUp size={40} color="var(--primary)" style={{ alignSelf: 'center', marginBottom: '1.5rem' }} />
             <h3 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(to right, #fff, var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>{stats?.grrr_score}</h3>
             <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>GRRR SCORE ACUMULADO</p>
             <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '2rem', position: 'relative' }}>
                <div style={{ width: `${(stats?.total_treinos % 10) * 10}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
                <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: 'var(--text-muted)' }}>Nível {stats?.level} • Faltam {10 - (stats?.total_treinos % 10)} treinos para subir</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div className="glass-pane" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <Calendar size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.total_treinos}</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>TREINOS TOTAIS</p>
             </div>
             <div className="glass-pane" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <CheckCircle size={24} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{stats?.status}</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>PATENTE</p>
             </div>
          </div>
        </div>
      </div>

      {/* Recent History Timeline */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>Linha do Tempo de Treino</h3>
        <div className="glass-pane" style={{ padding: '0' }}>
            {history.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Ainda não registrou treinos.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>DATA</th>
                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>MODALIDADE</th>
                    <th style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>HORÁRIO</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <td style={{ padding: '1.25rem 2rem', fontWeight: 600 }}>{new Date(h.target_date).toLocaleDateString('pt-BR')}</td>
                       <td style={{ padding: '1.25rem 2rem' }}>{h.modality}</td>
                       <td style={{ padding: '1.25rem 2rem', color: 'var(--text-muted)' }}>{new Date(h.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
