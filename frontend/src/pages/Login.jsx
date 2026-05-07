import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon } from 'lucide-react';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.role === 'Administrador' || data.user.role === 'Cajero') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(data.error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)', background: 'linear-gradient(135deg, #f4f7f6 0%, #e1e8e7 100%)' }}>
      <form className="glass fade-in" style={{ padding: '50px', width: '450px', display: 'flex', flexDirection: 'column', gap: '25px', borderRadius: '25px' }} onSubmit={handleSubmit}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>Bienvenido</h2>
            <p style={{ color: 'var(--text-muted)' }}>Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
            <div style={{ background: '#fff0f0', color: 'var(--danger)', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid var(--danger)' }}>
                {error}
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Usuario</label>
          <div style={{ position: 'relative' }}>
            <UserIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
                type="text" 
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="Nombre de usuario"
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
                type="password" 
                className="input-field" 
                style={{ width: '100%', paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '15px', fontSize: '1rem', marginTop: '10px' }}>INGRESAR AL SISTEMA</button>
        
        <div style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '15px', marginTop: '10px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
              <strong>Cuentas de prueba:</strong><br/>
              Admin: admin / admin123<br/>
              Cajero: cashier / cashier123
            </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
