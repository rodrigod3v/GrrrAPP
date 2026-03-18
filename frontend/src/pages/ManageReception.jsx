import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CheckSquare, Scan, UserCheck } from 'lucide-react';
import api from '../services/api';

function ManageReception() {
  const { session } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [checkInMsg, setCheckInMsg] = useState('');

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
      setAttendance(resAttendance.data);
      
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
    // Auto-refresh activity every 20 seconds
    const interval = setInterval(fetchData, 20000);
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

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare size={28} color="var(--primary)" /> Recepção / Check-in
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Controle de entrada da Catraca ou Check-in manual.</p>
        </div>
        <button className="btn-primary" style={{ background: '#10b981' }}>
          <Scan size={18} /> Ler QR Code (Câmera)
        </button>
      </header>

      {checkInMsg && (
        <div style={{ padding: '1rem', background: checkInMsg.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', border: checkInMsg.includes('✅') ? '1px solid #10b981' : '1px solid #ef4444', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600, color: '#fff' }}>
          {checkInMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Panel 1: Class Selection */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <CheckSquare size={18} color="var(--primary)" /> 1. Turma de Hoje
           </h3>
           <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{todayRaw}</p>
           
           {loading ? (
             <p style={{ color: 'var(--text-muted)' }}>Carregando horários...</p>
           ) : filteredClasses.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>Nenhuma aula agendada para hoje.</p>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               {filteredClasses.map(cls => (
                 <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: selectedClass === cls.id.toString() ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)', border: selectedClass === cls.id.toString() ? '1px solid var(--primary)' : '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                   <input 
                     type="radio" 
                     name="class_selection" 
                     value={cls.id} 
                     checked={selectedClass === cls.id.toString()}
                     onChange={(e) => setSelectedClass(e.target.value)}
                     style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
                   />
                   <div style={{ flex: 1 }}>
                     <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{cls.modality}</p>
                     <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}</p>
                   </div>
                 </label>
               ))}
             </div>
           )}
        </div>

        {/* Panel 2: Manual Checkin */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <UserCheck size={18} color="var(--primary)" /> 2. Entrada Manual
           </h3>
           
           {students.length === 0 ? (
             <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Nenhum aluno ativo encontrado.</p>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
               {students.map(student => (
                 <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                   <div>
                     <p style={{ margin: '0 0 0.1rem 0', fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{student.name}</p>
                     <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                       {['Boxe', 'Wrestling', 'MMA'].includes(student.modality) 
                         ? student.modality 
                         : `${student.modality}: ${student.belt}`
                       }
                     </p>
                   </div>
                   <button 
                     onClick={() => handleManualCheckIn(student.id)}
                     style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                     onMouseOver={(e) => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                     onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.color = '#10b981'; }}
                   >
                     <UserCheck size={14} />
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Panel 3: Recent Activity (Real-time pulses) */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backdropFilter: 'blur(12px)' }}>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Scan size={18} color="#10b981" /> 3. Atividade Recente
           </h3>
           
           {attendance.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Aguardando check-ins...</p>
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {attendance.map(att => (
                 <div key={att.id} className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{att.student_name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{att.modality} • {new Date(att.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default ManageReception;
