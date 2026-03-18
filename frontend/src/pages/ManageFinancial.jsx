import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Search } from 'lucide-react';
import api from '../services/api';

function ManageFinancial() {
  const { session } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students just to generate mock financial data for the MVP
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!session?.gym_id) return;
        const res = await api.get(`/students/gym/${session.gym_id}`);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudents();
  }, [session]);

  const activeStudents = students.filter(s => s.is_active).length;
  // Make believe some students paid, some didn't based on ID odd/even for visual feedback
  const mockPayments = students.map(s => ({
    id: s.id,
    name: s.name,
    amount: 150.00,
    status: s.id % 3 === 0 ? 'Pendente' : 'Pago',
    method: s.id % 2 === 0 ? 'PIX' : 'Cartão de Crédito',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toLocaleDateString('pt-BR')
  }));

  const filteredPayments = mockPayments.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalReceita = activeStudents * 150;
  const recebido = mockPayments.filter(p => p.status === 'Pago').length * 150;
  const pendente = totalReceita - recebido;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <DollarSign size={28} color="var(--primary)" /> Controle Financeiro
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Acompanhe os pagamentos (Integração Gateway MVP).</p>
        </div>
        <button className="btn-primary">
          <CreditCard size={18} /> Gerar Cobrança Avulsa
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {/* Metric Cards */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>Faturamento Previsto (Mês)</p>
          <h3 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>R$ {totalReceita.toFixed(2).replace('.', ',')}</h3>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowUpRight size={16} color="#10b981"/> Valor Recebido</p>
          <h3 style={{ fontSize: '2rem', margin: 0, color: '#10b981' }}>R$ {recebido.toFixed(2).replace('.', ',')}</h3>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowDownRight size={16} color="#ef4444"/> Inadimplência / Pendente</p>
          <h3 style={{ fontSize: '2rem', margin: 0, color: '#ef4444' }}>R$ {pendente.toFixed(2).replace('.', ',')}</h3>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 1rem', width: '300px' }}>
             <Search size={18} color="var(--text-muted)" />
             <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.75rem', width: '100%', outline: 'none' }} />
           </div>
        </div>

        {students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Você ainda não tem alunos para exibir pagamentos.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ALUNO</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>VALOR</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>VENCIMENTO</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>MÉTODO</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 600 }}>{payment.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>R$ {payment.amount.toFixed(2).replace('.', ',')}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{payment.dueDate}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>{payment.method}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    {payment.status === 'Pago' ? 
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>PAGO</span> 
                      : 
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>PENDENTE</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ManageFinancial;
