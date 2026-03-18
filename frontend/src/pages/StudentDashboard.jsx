import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Award, QrCode } from 'lucide-react';

function StudentDashboard() {
  const { session } = useContext(AuthContext);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Olá, {session?.name || 'Guerreiro'}!</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Pronto para mais um treino?</p>
      </header>

      {/* Belt / Progression Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backdropFilter: 'blur(12px)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
          <Award size={120} color="#10b981" />
        </div>
        <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '50%', border: '4px solid #3b82f6', display: 'flex', alignItems: 'center', justifyItems: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)' }}>
           {/* Simulate a blue belt */}
        </div>
        <div>
           <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#fff' }}>Faixa Azul</h3>
           <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>2 Graus • Frequência: Alta</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
           <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mês Atual</p>
           <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>12 Treinos</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
           <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Status Plno</p>
           <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>Ativo</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CalendarIcon size={18} color="#10b981" /> Aulas de Hoje
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>Jiu-Jitsu (No-Gi)</h4>
             <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>19:00 - 20:30 • Prof. Rodrigo</p>
           </div>
           <button style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
             <QrCode size={16} /> Check-in
           </button>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
           <div>
             <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff' }}>Muay Thai Turma B</h4>
             <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>20:30 - 21:30 • Prof. Silva</p>
           </div>
           <button disabled style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)', padding: '0.6rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed' }}>
             Lotada
           </button>
        </div>
      </div>

    </div>
  );
}

export default StudentDashboard;
