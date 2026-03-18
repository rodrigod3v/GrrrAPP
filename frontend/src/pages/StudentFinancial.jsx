import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, CheckCircle, Clock, ArrowRight } from 'lucide-react';

function StudentFinancial() {
  const { session } = useContext(AuthContext);

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CreditCard size={24} color="var(--primary)" /> Minha Assinatura
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Gerencie seu plano e histórico de pagamentos.</p>
      </header>

      {/* Current Plan Card */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}>
          <CheckCircle size={100} color="#10b981" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#10b981', color: '#000', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ativo</span>
            <h2 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1.5rem', color: '#fff' }}>Plano Black Full</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Acesso ILIMITADO a todas as modalidades</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Valor Mensal</p>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>R$ 149,90</p>
          </div>
        </div>
        
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Próxima cobrança: <strong>10/Abril</strong></span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            Alterar <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Histórico Recente</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { date: '10 de Março, 2026', status: 'Pago', amount: 'R$ 149,90', method: 'Cartão •••• 4242' },
          { date: '10 de Fevereiro, 2026', status: 'Pago', amount: 'R$ 149,90', method: 'Cartão •••• 4242' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{item.date}</p>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.method}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 0.25rem 0', color: '#fff', fontWeight: 700 }}>{item.amount}</p>
              <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
      
      <button style={{ width: '100%', marginTop: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: '#fff', padding: '1rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>
        Ver faturas antigas
      </button>
    </div>
  );
}

export default StudentFinancial;
