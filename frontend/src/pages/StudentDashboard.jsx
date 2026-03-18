import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar as CalendarIcon, Award, QrCode, ArrowRight, Zap } from 'lucide-react';

function StudentDashboard() {
  const { session } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.gym_id || !session?.student_id) return;
        
        const [resClasses, resStudents, resAttendance] = await Promise.all([
          api.get(`/classes/gym/${session.gym_id}`),
          api.get(`/students/gym/${session.gym_id}`),
          api.get(`/attendance/student/${session.student_id}/summary`)
        ]);
        
        setClasses(resClasses.data);
        setAttendanceCount(resAttendance.data.count);
        
        const me = resStudents.data.find(s => s.id === session.student_id);
        setStudentData(me);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleCheckIn = async (classId) => {
    if (!session?.student_id || !session?.gym_id) return;
    setCheckingIn(classId);
    try {
      const res = await api.post(`/check-in/?student_id=${session.student_id}&class_id=${classId}&gym_id=${session.gym_id}&qr_code_token=app_self_${Date.now()}`);
      alert(`✅ Presença Confirmada! Bom treino de ${res.data.class}!`);
      setAttendanceCount(prev => prev + 1);
    } catch (err) {
      alert("Erro ao fazer check-in: " + (err.response?.data?.detail || err.message));
    } finally {
      setCheckingIn(null);
    }
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
  const todayClasses = classes.filter(c => c.day_of_week.toLowerCase() === todayStr.toLowerCase() || c.day_of_week.toLowerCase().startsWith(todayStr.split('-')[0].toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Olá, {session?.name?.split(' ')[0] || 'Guerreiro'}!</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Foco total no treino de hoje! 🔥</p>
      </header>

      {/* Profile Card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.05 }}>
          <Award size={100} color="#10b981" />
        </div>
        <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900, fontSize: '1.2rem', transform: 'rotate(-5deg)' }}>
          {session?.name ? session.name.charAt(0).toUpperCase() : 'G'}
        </div>
        <div style={{ flex: 1 }}>
           <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: '#fff' }}>
             {studentData ? (
               ['Boxe', 'Wrestling', 'MMA'].includes(studentData.modality) 
                 ? studentData.modality 
                 : `${studentData.modality}: ${studentData.belt}`
             ) : '...'}
           </h3>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>{studentData?.degree ? `${studentData.degree} Graus` : 'Iniciante'}</span>
              <div style={{ width: '4px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Ativo</span>
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem', textAlign: 'center' }}>
           <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Meus Treinos</p>
           <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{attendanceCount}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '1.25rem', textAlign: 'center' }}>
           <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mensalidade</p>
           <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#10b981', marginTop: '0.5rem' }}>EM DIA</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--primary)" fill="var(--primary)" /> Hoje na Academia
        </h2>
        <Link to="/student/schedule" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          Ver tudo <ArrowRight size={14} />
        </Link>
      </div>
      
      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Buscando turmas...</div>
      ) : todayClasses.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border-light)' }}>
           Sem aulas hoje. Aproveite o descanso! 😴
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {todayClasses.map(cls => (
            <div key={cls.id} style={{ background: 'var(--bg-card)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '20px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#fff', fontSize: '1rem' }}>{cls.modality}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                  <CalendarIcon size={14} /> {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                </div>
              </div>
              <button 
                onClick={() => handleCheckIn(cls.id)}
                disabled={checkingIn === cls.id}
                style={{ background: 'var(--primary)', border: 'none', color: '#000', padding: '0.6rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                {checkingIn === cls.id ? '...' : <QrCode size={18} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
