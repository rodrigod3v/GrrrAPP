import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function RegisterGym() {
  const navigate = useNavigate();
  const { setSession } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [gymName, setGymName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submitRegister = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (gymName.trim() === '' || email.trim() === '' || adminName.trim() === '') {
        setErrorMsg('Preencha os dados básicos.');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      if (username.trim() === '' || password.trim() === '') {
         setErrorMsg('Preencha os dados de login.');
         return;
      }
      setIsLoading(true);
      setErrorMsg('');
      try {
        const response = await api.post(`/gyms/register`, {
          name: gymName,
          admin_email: email,
          admin_username: username,
          admin_password: password
        });
        
        // Auto-login after register
        const userSession = { role: 'admin', gym_id: response.data.id, name: adminName };
        setSession(userSession);
        localStorage.setItem('@GrrrAPP:session', JSON.stringify(userSession));
        
        navigate('/admin');
      } catch (err) {
        setErrorMsg(err.response?.data?.detail || "Erro no servidor. O nome de usuário admin já existe?");
        setStep(1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-pane animate-fade-in" style={{ maxWidth: '460px', width: '100%', padding: '3rem 2rem', position: 'relative' }}>
        
        <button type="button" onClick={() => step === 2 ? setStep(1) : navigate('/')} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <span style={{ fontSize: '1.2rem' }}>←</span> Voltar
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>G</span>
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Nova Academia</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Digitalize seu dojô em menos de 1 minuto.</p>
        </div>

        {errorMsg && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{errorMsg}</div>}

        <form onSubmit={submitRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {step === 1 && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Nome do Dojô / Academia</label>
                <input type="text" placeholder="Ex: Gracie Barra Matriz" value={gymName} onChange={(e) => setGymName(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Nome do Administrador</label>
                <input type="text" placeholder="Mestre Carlos" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>E-mail de Contato</label>
                <input type="email" placeholder="mestre@dojo.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>Continuar →</button>
            </div>
          )}
          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Usuário de Acesso (Login)</label>
                <input type="text" placeholder="Ex: admin_gracie" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Senha Administrativa</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', opacity: isLoading ? 0.7 : 1 }}>
                {isLoading ? 'Criando Conta...' : 'Finalizar Cadastro'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegisterGym;
