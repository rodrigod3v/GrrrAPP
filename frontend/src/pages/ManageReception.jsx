import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, Scan, UserCheck, Calendar, Users, X, Trash2 } from 'lucide-react';
import api from '../services/api';

function ManageReception() {
  const { session } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [checkInMsg, setCheckInMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingClass, setViewingClass] = useState(null); // New state for modal

  const fetchData = async () => {
    try {
      if (!session?.gym_id) return;
      const [resStudents, resClasses, resAttendance] = await Promise.all([
        api.get(`/students/gym/${session.gym_id}`),
        api.get(`/classes/gym/${session.gym_id}`),
        api.get(`/attendance/gym/${session.gym_id}`)
      ]);
      
      setStudents(resStudents.data.filter(s => s.is_active));
      setClasses(resClasses.data);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendance = resAttendance.data.filter(att => {
        if (!att.check_in_time && !att.target_date) return false;
        const attDate = att.target_date || (att.check_in_time ? new Date(att.check_in_time).toISOString().split('T')[0] : '');
        return attDate === todayStr;
      }).sort((a,b) => (b.check_in_time ? new Date(b.check_in_time) : 0) - (a.check_in_time ? new Date(a.check_in_time) : 0));
      
      setAttendance(todayAttendance);
      
      const dayRaw = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
      const todayClasses = resClasses.data.filter(c => c.day_of_week.toLowerCase().startsWith(dayRaw.toLowerCase()))
        .sort((a,b) => a.start_time.localeCompare(b.start_time));
        
      if (todayClasses.length > 0 && (!selectedClass || !todayClasses.find(c => c.id.toString() === selectedClass))) {
        setSelectedClass(todayClasses[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // More frequent updates for dashboard feel
    return () => clearInterval(interval);
  }, [session]);

  const handleManualCheckIn = async (studentId) => {
    if (!selectedClass) {
      setCheckInMsg('Selecione uma aula primeiro.');
      return;
    }
    
    try {
      const res = await api.post(`/check-in/?student_id=${studentId}&class_id=${selectedClass}&gym_id=${session.gym_id}&qr_code_token=reception_manual_${Date.now()}`);
      setCheckInMsg(`✅ ${res.data.student} confirmado com sucesso!`);
      fetchData(); // Refresh list immediately
      setTimeout(() => setCheckInMsg(''), 3000);
    } catch (err) {
      setCheckInMsg(`❌ Erro: ${err.response?.data?.detail || err.message}`);
      setTimeout(() => setCheckInMsg(''), 3000);
    }
  };

  const todayRaw = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const filteredClasses = classes.filter(c => c.day_of_week.toLowerCase().startsWith(todayRaw.toLowerCase()));

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.modality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: 'Total Hoje', value: attendance.length, icon: UserCheck, color: '#10b981' },
    { label: 'Alunos Ativos', value: students.length, icon: CheckSquare, color: 'var(--primary)' },
    { label: 'Aulas do Dia', value: filteredClasses.length, icon: Scan, color: '#3b82f6' }
  ];

  const getModalityColor = (m) => {
    const mod = m.toLowerCase();
    if (mod.includes('bjj') || mod.includes('jiu')) return '#a855f7';
    if (mod.includes('muay')) return '#ef4444';
    if (mod.includes('boxe')) return '#f59e0b';
    return 'var(--primary)';
  };

  const getClassStatus = (startTime, endTime) => {
    const now = new Date();
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    
    const start = new Date(now);
    start.setHours(sH, sM, 0);
    
    const end = new Date(now);
    end.setHours(eH, eM, 0);
    
    if (now < start) return { label: 'Espera', color: '#6366f1' }; 
    if (now >= start && now <= end) return { label: 'Ao Vivo', color: '#10b981' }; 
    return { label: 'Encerrada', color: 'rgba(255,255,255,0.2)' }; 
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scan size={32} color="var(--primary)" />
            </div>
            Painel de Recepção
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Monitoramento em tempo real e check-in inteligente.</p>
        </div>
        <button 
          className="btn-hover-scale"
          style={{ 
            background: '#10b981', border: 'none', color: '#000', padding: '1rem 2rem', borderRadius: '18px', 
            fontSize: '1rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
          }}
        >
          <Scan size={22} strokeWidth={3} /> Escanear QR Code
        </button>
      </header>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', 
            padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', backdropFilter: 'blur(20px)'
          }}>
            <div style={{ width: '56px', height: '56px', background: `${s.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon size={28} color={s.color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {checkInMsg && (
        <div className="animate-scale-in" style={{ padding: '1.25rem 2rem', background: checkInMsg.includes('✅') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: checkInMsg.includes('✅') ? '1px solid #10b981' : '1px solid #ef4444', borderRadius: '20px', marginBottom: '2rem', fontWeight: 700, color: '#fff', fontSize: '1.1rem', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          {checkInMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Column 1: Classes */}
        <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '1.75rem', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={20} color="var(--primary)" /> Grade de Hoje
          </h3>
          <p style={{ margin: '-1rem 0 1.5rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', textTransform: 'capitalize', fontWeight: 600 }}>{todayRaw}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto', width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div></div>
            ) : filteredClasses.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Sem aulas agendadas.</p>
            ) : filteredClasses.map(cls => {
              const status = getClassStatus(cls.start_time, cls.end_time);
              
              return (
              <label key={cls.id} 
                onClick={(e) => {
                  if (!e.target.closest('input')) {
                     setViewingClass(cls);
                  }
                }}
                style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', 
                background: selectedClass === cls.id.toString() ? `${status.color}08` : 'rgba(255,255,255,0.02)', 
                border: selectedClass === cls.id.toString() ? `1px solid ${status.color}` : '1px solid rgba(255,255,255,0.05)', 
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', color: status.color, background: `${status.color}15`, padding: '1px 6px', borderRadius: '8px', border: `1px solid ${status.color}30` }}>
                  {status.label}
                </div>
                <input type="radio" name="cls" value={cls.id} checked={selectedClass === cls.id.toString()} onChange={(e) => setSelectedClass(e.target.value)} style={{ display: 'none' }} />
                <div style={{ width: '40px', height: '40px', background: `${getModalityColor(cls.modality)}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={18} color={getModalityColor(cls.modality)} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{cls.modality}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}</p>
                </div>
              </label>
              );
            })}
          </div>
        </section>

        {/* Column 2: Student Search & Manual Entry */}
        <section style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '32px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '800px' }}>
          <div style={{ position: 'relative' }}>
            <Scan size={20} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar aluno por nome ou modalidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.1rem 1.1rem 1.1rem 3.5rem', borderRadius: '18px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {filteredStudents.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}><p style={{ color: 'rgba(255,255,255,0.2)' }}>Nenhum aluno encontrado.</p></div>
            ) : filteredStudents.map(student => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '24px', transition: 'all 0.2s' }} className="btn-hover-scale">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🥋</div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{student.name}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{student.modality}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleManualCheckIn(student.id)}
                  style={{ background: 'var(--primary)', border: 'none', color: '#000', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <UserCheck size={20} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Column 3: Recent Activity */}
        <section style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '1.75rem', maxHeight: '800px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Scan size={20} color="#10b981" /> Histórico do Dia
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
            {attendance.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', textAlign: 'center', padding: '3rem 1rem' }}>Nenhum check-in visto hoje.</p>
            ) : attendance.map(att => (
              <div key={att.id} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', flexShrink: 0 }}></div>
                 <div style={{ flex: 1 }}>
                   <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{att.student_name}</p>
                   <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{att.modality}</span>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>
                      {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                   </p>
                 </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Attendance Details Modal */}
      {viewingClass && (() => {
        const currentClassAttendance = attendance.filter(a => Number(a.class_id) === Number(viewingClass.id));
        return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="animate-scale-in" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
             <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{viewingClass.modality}</h2>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Check-ins Realizados: {currentClassAttendance.length}</p>
                </div>
                <button onClick={() => setViewingClass(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <X size={20} />
                </button>
             </div>
             
             <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentClassAttendance.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                     <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1rem' }}>Ninguém fez check-in ainda.</p>
                  </div>
                ) : currentClassAttendance.map(att => (
                   <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🥋</div>
                      <div style={{ flex: 1 }}>
                         <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{att.student_name}</p>
                         <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Presente às {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                      </div>
                      <button 
                        onClick={() => handleCancelCheckIn(att.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                ))}
             </div>
             
             <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <button 
                  onClick={() => setViewingClass(null)}
                  style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer' }}
                >
                  Fechar Lista
                </button>
             </div>
          </div>
        </div>
        );
      })()}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
        .btn-hover-scale:hover { transform: translateY(-3px) scale(1.02); }
        .btn-hover-scale:active { transform: translateY(0) scale(0.98); }
        .spinner { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
      `}</style>
    </div>
  );
}

export default ManageReception;
