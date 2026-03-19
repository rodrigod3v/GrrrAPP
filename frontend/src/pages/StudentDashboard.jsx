import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar as CalendarIcon, Award, QrCode, ArrowRight, Zap, Trash2 } from 'lucide-react';

function StudentDashboard() {
  const { session } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [history, setHistory] = useState([]);
  const [checkInMsg, setCheckInMsg] = useState('');

  const todayLocal = new Date();
  const todayDate = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(2, '0')}-${String(todayLocal.getDate()).padStart(2, '0')}`;

  const fetchData = async () => {
    try {
      if (!session?.gym_id || !session?.student_id) return;
      const [resClasses, resStudents, resHistory] = await Promise.all([
        api.get(`/classes/gym/${session.gym_id}`),
        api.get(`/students/gym/${session.gym_id}`),
        api.get(`/attendance/student/${session.student_id}/history`)
      ]);
      setClasses(resClasses.data);
      setHistory(resHistory.data);
      setStudentData(resStudents.data.find(s => s.id === session.student_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  const handleCheckIn = async (classId, modality) => {
    if (!session?.student_id || !session?.gym_id) return;
    
    // Anti-spam: check if already done today for this specific class slot
    const alreadyDone = history.some(h => (h.target_date === todayDate || h.check_in_time?.startsWith(todayDate)) && Number(h.class_id) === Number(classId));
    if (alreadyDone) {
      setCheckInMsg(`⚠️ Você já confirmou presença nesta aula hoje!`);
      setTimeout(() => setCheckInMsg(''), 3000);
      return;
    }

    setCheckingIn(classId);
    try {
      const res = await api.post(`/check-in/?student_id=${session.student_id}&class_id=${classId}&gym_id=${session.gym_id}&qr_code_token=app_self_${Date.now()}&target_date=${todayDate}`);
      setCheckInMsg(`✅ Presença em ${res.data.class} confirmada!`);
      fetchData(); // Refresh history
      setTimeout(() => setCheckInMsg(''), 4000);
    } catch (err) {
      setCheckInMsg(`❌ ${err.response?.data?.detail || "Erro no check-in"}`);
      setTimeout(() => setCheckInMsg(''), 4000);
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCancelCheckIn = async (attendanceId) => {
    if (!window.confirm("Deseja cancelar seu check-in?")) return;
    try {
      await api.delete(`/attendance/${attendanceId}`);
      setCheckInMsg("✅ Check-in cancelado com sucesso.");
      fetchData();
      setTimeout(() => setCheckInMsg(''), 3000);
    } catch (err) {
      setCheckInMsg("❌ Erro ao cancelar check-in.");
      setTimeout(() => setCheckInMsg(''), 3000);
    }
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const todayClasses = classes.filter(c => c.day_of_week.toLowerCase() === todayStr.toLowerCase() || c.day_of_week.toLowerCase().startsWith(todayStr.split('-')[0].toLowerCase()));

  // Filter out classes that have already been checked in today OR have ended
  const activeClasses = todayClasses.filter(cls => {
    const isConfirmed = history.some(h => (h.target_date === todayDate || h.check_in_time?.startsWith(todayDate)) && Number(h.class_id) === Number(cls.id));
    if (isConfirmed) return false;
    
    // Also hide if the class has finished
    const now = new Date();
    const [eH, eM] = cls.end_time.split(':').map(Number);
    const end = new Date(now);
    end.setHours(eH, eM, 0);
    if (now > end) return false;
    
    return true;
  });

  const todayHistory = history.filter(h => h.target_date === todayDate || h.check_in_time?.startsWith(todayDate));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.25rem', color: '#fff' }}>Olá, {session?.name?.split(' ')[0] || 'Guerreiro'}!</h1>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>Foco total no treino de hoje! 🔥</p>
      </header>

      {/* Confirmation Message Overlay */}
      {checkInMsg && (
        <div className="animate-scale-in" style={{ 
          position: 'fixed', top: '20px', left: '20px', right: '20px', zIndex: 1000,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem', borderRadius: '16px', color: '#fff', textAlign: 'center', fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          {checkInMsg}
        </div>
      )}

      {/* Profile Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05 }}>
          <Award size={100} color="#10b981" />
        </div>
        <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1.2rem', transform: 'rotate(-5deg)', flexShrink: 0 }}>
          {session?.name ? session.name.charAt(0).toUpperCase() : 'G'}
        </div>
        <div style={{ flex: 1 }}>
           <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
             {studentData ? studentData.modality : '...'}
           </h3>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{studentData?.belt || 'Praticante'}</span>
              <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Ativo</span>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem', textAlign: 'center' }}>
           <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>Treinos Totais</p>
           <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>{history.length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>Mensalidade</p>
           <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#10b981' }}>EM DIA ✅</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          <Zap size={18} color="var(--primary)" fill="var(--primary)" /> Hoje na Academia
        </h2>
        <Link to="/student/schedule" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Ver Grade <ArrowRight size={14} />
        </Link>
      </div>
      
      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Buscando turmas...</div>
      ) : activeClasses.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
           {todayClasses.length > 0 ? 'Tudo pronto por hoje! Bons treinos! 🥋' : 'Sem aulas hoje. Aproveite o descanso! 😴'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
          {activeClasses.map(cls => (
            <div key={cls.id} style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '20px', padding: '1.25rem', 
              display: 'flex', 
              flexWrap: 'wrap', // Better responsiveness
              justifyContent: 'space-between', alignItems: 'center', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              gap: '12px',
              transition: 'all 0.3s'
            }}>
              <div style={{ flex: '1 1 150px' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{cls.modality}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                  <CalendarIcon size={14} /> {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                </div>
              </div>
              <button 
                onClick={() => handleCheckIn(cls.id, cls.modality)}
                disabled={checkingIn === cls.id}
                style={{ 
                  background: 'var(--primary)', 
                  border: 'none', 
                  color: '#000', 
                  padding: '0.75rem 1.25rem', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900, 
                  cursor: 'pointer', 
                  boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  minWidth: '100px', justifyContent: 'center'
                }}
              >
                {checkingIn === cls.id ? '...' : <><QrCode size={18} /> Check-in</>}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TODAY'S HISTORY SECTION */}
      {todayHistory.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.25rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
             Histórico de Hoje
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
             {todayHistory.map(h => (
                <div key={h.id} style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '1rem 1.25rem', borderRadius: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                         <Zap size={16} fill="#10b981" />
                      </div>
                      <div>
                         <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{h.modality}</p>
                         <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Realizado às {new Date(h.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                         Confirmado
                      </div>
                      <button 
                        onClick={() => handleCancelCheckIn(h.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                         <Trash2 size={14} />
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StudentDashboard;
