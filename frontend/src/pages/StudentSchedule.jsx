import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar as CalendarIcon, QrCode, Clock, CheckCircle2, History, Check, Trash2 } from 'lucide-react';

function StudentSchedule() {
  const { session } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);

  const fetchAll = async () => {
    try {
      if (!session?.gym_id || !session?.student_id) return;
      const [resClasses, resHistory] = await Promise.all([
        api.get(`/classes/gym/${session.gym_id}`),
        api.get(`/attendance/student/${session.student_id}/history`)
      ]);
      setClasses(resClasses.data);
      setHistory(resHistory.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [session]);

  const handleCheckIn = async (classId, targetDate) => {
    if (!session?.student_id || !session?.gym_id) return;
    setCheckingIn(`${classId}-${targetDate}`);
    try {
      await api.post(`/check-in/?student_id=${session.student_id}&class_id=${classId}&gym_id=${session.gym_id}&qr_code_token=app_self_${Date.now()}&target_date=${targetDate}`);
      alert("✅ Presença Confirmada! Bom treino!");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Erro ao fazer check-in");
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCancelCheckIn = async (attendanceId) => {
    if (!window.confirm("Deseja cancelar seu check-in?")) return;
    try {
      await api.delete(`/attendance/${attendanceId}`);
      fetchAll();
    } catch (err) {
      alert("Erro ao cancelar check-in.");
    }
  };

  const getDayInfo = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      name: d.toLocaleDateString('pt-BR', { weekday: 'long' }),
      date: d.toISOString().split('T')[0] // YYYY-MM-DD
    };
  };

  const today = getDayInfo(0);
  const tomorrow = getDayInfo(1);

  const filterClasses = (dayName) => classes.filter(c => 
    c.day_of_week.toLowerCase() === dayName.toLowerCase() || 
    c.day_of_week.toLowerCase().startsWith(dayName.split('-')[0].toLowerCase())
  );

  const todayClasses = filterClasses(today.name);
  const tomorrowClasses = filterClasses(tomorrow.name);

  // Filter "Hoje" to show only actionable (not confirmed, not finished) classes
  const activeTodayClasses = todayClasses.filter(cls => {
    const isConfirmed = history.some(h => (h.target_date === today.date || h.check_in_time?.startsWith(today.date)) && h.modality === cls.modality);
    if (isConfirmed) return false;
    
    // Hide finished classes
    const now = new Date();
    const [eH, eM] = cls.end_time.split(':').map(Number);
    const end = new Date(now);
    end.setHours(eH, eM, 0);
    if (now > end) return false;
    
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarIcon size={24} color="var(--primary)" /> Grade de Treinos
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Mantenha o foco e agende sua próxima aula.</p>
      </header>

      {/* TODAY SECTION */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
          Grade de Hoje • {today.name}
        </h3>
        
        {loading ? <p>...</p> : activeTodayClasses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
             <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: '0.9rem' }}>
               {todayClasses.length > 0 ? 'Tudo pronto por hoje! Bons treinos! 🥋' : 'Nenhuma aula agendada para hoje.'}
             </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeTodayClasses.map(cls => (
              <ClassCard key={cls.id} cls={cls} targetDate={today.date} onCheckIn={handleCheckIn} checkingIn={checkingIn} confirmed={false} />
            ))}
          </div>
        )}
      </section>

      {/* TOMORROW SECTION */}
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '0.8rem', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#6366f1', borderRadius: '50%' }}></div>
          Amanhã • {tomorrow.name}
        </h3>
        
        {loading ? <p>...</p> : tomorrowClasses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma aula para amanhã.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tomorrowClasses.map(cls => {
              const confirmed = history.some(h => h.target_date === tomorrow.date && h.modality === cls.modality);
              return <ClassCard key={cls.id} cls={cls} targetDate={tomorrow.date} onCheckIn={handleCheckIn} checkingIn={checkingIn} confirmed={confirmed} isFuture />;
            })}
          </div>
        )}
      </section>

      {/* HISTORY SECTION */}
      <section>
        <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} /> Histórico Recente
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '0.5rem' }}>
          {history.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Você ainda não realizou check-ins.</p>
          ) : (
            history.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: i === history.length - 1 ? 'none' : '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', color: '#fff' }}>{h.modality}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.target_date === today.date ? 'Hoje' : h.target_date === tomorrow.date ? 'Amanhã' : new Date(h.target_date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Confirmado</div>
                   <button 
                     onClick={() => handleCancelCheckIn(h.id)}
                     style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ClassCard({ cls, targetDate, onCheckIn, checkingIn, confirmed, isFuture }) {
  const isPending = checkingIn === `${cls.id}-${targetDate}`;

  return (
    <div style={{ background: 'var(--bg-card)', border: confirmed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: confirmed ? 0.8 : 1 }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem' }}>{cls.modality}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: confirmed ? '#10b981' : isFuture ? '#6366f1' : 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Clock size={14} /> {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
        </div>
      </div>
      <button 
        onClick={() => onCheckIn(cls.id, targetDate)}
        disabled={confirmed || isPending}
        style={{ 
          background: confirmed ? 'rgba(16, 185, 129, 0.1)' : isFuture ? '#6366f1' : 'var(--primary)', 
          border: confirmed ? '1px solid rgba(16, 185, 129, 0.2)' : 'none', 
          color: confirmed ? '#10b981' : isFuture ? '#fff' : '#000', 
          padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: confirmed ? 'default' : 'pointer', 
          boxShadow: confirmed ? 'none' : isFuture ? '0 4px 12px rgba(99, 102, 241, 0.3)' : '0 4px 12px rgba(245, 158, 11, 0.3)', 
          display: 'flex', alignItems: 'center', gap: '8px' 
        }}
      >
        {isPending ? '...' : confirmed ? <><Check size={18} /> Confirmado</> : <><QrCode size={18} /> {isFuture ? 'Agendar' : 'Check-in'}</>}
      </button>
    </div>
  );
}

export default StudentSchedule;
