import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: 0 }}>{title}</p>
        <div style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#fff' }}>{value}</h3>
        {trend && (
           <span style={{ fontSize: '0.8rem', color: trend.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 600, background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
             {trend} esse mês
           </span>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { session } = useContext(AuthContext);

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>Dashboard Geral</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Bem-vindo de volta, <strong>{session?.name || 'Mestre'}</strong>. Aqui está o resumo da sua academia.</p>
        </div>
        <button className="btn-primary" style={{ height: 'fit-content' }}>
          + Novo Aluno
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <MetricCard title="Alunos Ativos" value="0" icon={Users} trend="+0%" />
        <MetricCard title="Receita Prevista (Mês)" value="R$ 0,00" icon={DollarSign} trend="+0%" />
        <MetricCard title="Aulas Hoje" value="0" icon={Calendar} />
        <MetricCard title="Taxa de Frequência" value="0%" icon={TrendingUp} trend="+0%" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} color="var(--primary)" /> Últimas Matrículas
          </h2>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)' }}>
            Nenhum aluno cadastrado recentemente.
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(12px)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--primary)" /> Próximas Aulas (Hoje)
          </h2>
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)' }}>
            Nhuma aula configurada para hoje.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
