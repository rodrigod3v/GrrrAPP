import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, DollarSign, TrendingUp, Plus } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function MetricCard({ title, value, icon: Icon, trend }) {
  const [isHovered, setIsHovered] = React.useState(false);
  return (
    <div 
      style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-light)', 
        borderRadius: 'var(--radius-md)', 
        padding: '1.5rem', 
        transition: 'var(--transition)', 
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? 'var(--glass-shadow)' : 'none',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>{title}</p>
        <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>{value}</h3>
        {trend && (
           <span style={{ fontSize: '0.8rem', color: trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600, background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
             {trend}
           </span>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { session } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!session?.gym_id) return;
        
        const [resStudents, resClasses] = await Promise.all([
          api.get(`/students/gym/${session.gym_id}`),
          api.get(`/classes/gym/${session.gym_id}`)
        ]);
        
        setStudents(resStudents.data);
        setClasses(resClasses.data);
      } catch (err) {
        console.error("Erro ao puxar dados da API", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session]);

  const activeStudents = students.filter(s => s.is_active).length;
  // A simple fake revenue metric based on active students
  const expectedRevenue = activeStudents * 150; 

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Dashboard Geral</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Bem-vindo de volta, <strong>{session?.name || 'Mestre'}</strong>. Resumo da sua academia.</p>
        </div>
        <button className="btn-primary" style={{ height: 'fit-content' }} onClick={() => navigate('/admin/students/new')}>
          <Plus size={18} /> Novo Aluno
        </button>
      </header>

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Carregando dados da API...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <MetricCard title="Alunos Ativos" value={activeStudents} icon={Users} trend={activeStudents > 0 ? "+ novos" : ""} />
            <MetricCard title="Receita (Base R$150/mês)" value={`R$ ${expectedRevenue},00`} icon={DollarSign} trend="+ estável" />
            <MetricCard title="Aulas (Grade Total)" value={classes.length} icon={Calendar} />
            <MetricCard title="Taxa de Frequência" value={activeStudents > 0 ? "85%" : "0%"} icon={TrendingUp} trend="+5% mês" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Lista de Alunos Recentes */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="var(--primary)" /> Últimas Matrículas
                </h2>
                <button onClick={() => navigate('/admin/students')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Ver Todos</button>
              </div>
              
              {students.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)' }}>
                  Nenhum aluno cadastrado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {students.slice(-4).reverse().map(student => (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#fff' }}>{student.name}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                           {['Boxe', 'Wrestling', 'MMA'].includes(student.modality) 
                             ? student.modality
                             : `${student.modality || 'Jiu-Jitsu'} • ${student.belt} ${['Jiu-Jitsu', 'Judô'].includes(student.modality || 'Jiu-Jitsu') ? `• ${student.degree || 0} Graus` : ''}`
                           }
                        </p>
                      </div>
                      <div style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', background: student.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: student.is_active ? '#10b981' : '#ef4444' }}>
                        {student.is_active ? 'Ativo' : 'Inativo'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de Aulas */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="var(--primary)" /> Grade de Aulas
                </h2>
                <button onClick={() => navigate('/admin/schedule')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>Cofigurar</button>
              </div>

              {classes.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)' }}>
                  Nenhuma aula configurada na grade.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classes.slice(0, 4).map(cls => (
                    <div key={cls.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: '#fff' }}>{cls.modality} - {cls.day_of_week}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cls.start_time} às {cls.end_time}</p>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Vagas: {cls.capacity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
