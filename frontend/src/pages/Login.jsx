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
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at top right, rgba(255, 59, 48, 0.08), transparent)' }}>
      <div className="glass-pane animate-fade-in" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '3.5rem 2.5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <img src="/src/assets/logo.png" alt="GrrrAPP Icon" style={{ width: '120px', height: 'auto', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px var(--primary-glow))' }} />
          <h1 style={{ fontSize: '2.8rem', color: '#fff', marginBottom: '0.25rem' }}>GrrrAPP</h1>
          <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Onde a raiva vira resultado. Entre e treine.</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.4rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
          <button type="button" onClick={() => setRole('admin')} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: role === 'admin' ? 'var(--primary)' : 'transparent', color: role === 'admin' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'var(--transition)' }}>
            Academia
          </button>
          <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: role === 'student' ? 'var(--primary)' : 'transparent', color: role === 'student' ? '#fff' : 'var(--text-muted)', fontWeight: 700, transition: 'var(--transition)' }}>
            Aluno
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(255, 59, 48, 0.15)', border: '1px solid var(--primary)', color: '#ff8a80', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', animation: 'fadeIn 0.4s ease' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={submitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'block' }}>
              {role === 'admin' ? 'Usuário Administrativo' : 'ID do Aluno'}
            </label>
            <input
              type="text"
              placeholder={role === 'admin' ? "admin_gracie" : "000123"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'var(--transition)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Senha</span>
              <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Esqueceu?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'var(--transition)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isLoading ? 'Conectando...' : (role === 'admin' ? 'Entrar no Sistema' : 'Acessar Treino')}
          </button>
        </form>

        {role === 'admin' && (
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>Ainda não tem o GrrrAPP ?</p>
            <button onClick={() => navigate('/register')} type="button" style={{ width: '100%', padding: '0.85rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, transition: 'var(--transition)' }} onMouseOver={(e) => e.target.style.background = 'rgba(255, 59, 48, 0.05)'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
              Cadastre-se
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
