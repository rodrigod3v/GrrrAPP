import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const { loginAdmin, loginStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const submitLogin = async (e) => {
    e.preventDefault();
    if (username.trim() !== '' && password.trim() !== '') {
      setIsLoading(true);
      setErrorMsg('');

      let res;
      if (role === 'admin') {
        res = await loginAdmin(username, password);
      } else {
        res = await loginStudent(username, password);
      }

      setIsLoading(false);

      if (res.success) {
        if (role === 'admin') navigate('/admin');
        else navigate('/student');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      setErrorMsg("Preencha usuário/ID e senha.");
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-pane animate-fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>G</span>
          </div>
          <h2>GrrrAPP</h2>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>Escolha seu portal e entre na plataforma.</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button type="button" onClick={() => setRole('admin')} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: role === 'admin' ? 'var(--primary)' : 'transparent', color: role === 'admin' ? '#fff' : 'var(--text-muted)', fontWeight: role === 'admin' ? 700 : 500, transition: 'all 0.3s' }}>
            Portal Academia
          </button>
          <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: role === 'student' ? '#10b981' : 'transparent', color: role === 'student' ? '#fff' : 'var(--text-muted)', fontWeight: role === 'student' ? 700 : 500, transition: 'all 0.3s' }}>
            Portal Aluno
          </button>
        </div>

        {errorMsg && <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{errorMsg}</div>}

        <form onSubmit={submitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>{role === 'admin' ? 'Usuário da Academia' : 'ID do Aluno'}</label>
            <input type="text" placeholder={role === 'admin' ? "Ex: admin_gracie" : "Ex: joao_silva"} value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Senha</span>
              <a href="#" style={{ color: role === 'admin' ? 'var(--primary)' : '#10b981', textDecoration: 'none', fontWeight: 400 }}>Esqueceu?</a>
            </div>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none' }} />
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', background: role === 'admin' ? 'var(--primary)' : '#10b981', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, borderRadius: 'var(--radius-md)', cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Conectando...' : (role === 'admin' ? 'Acessar Gestão' : 'Ver Meu Treino')}
          </button>
        </form>

        {role === 'admin' && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Sua academia ainda não utiliza o GrrrAPP ?</p>
            <button onClick={() => navigate('/register')} type="button" style={{ width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Cadastre-se
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
