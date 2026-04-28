'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Building, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    department: '',
    company: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, password: formData.password })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
        
        router.push('/dashboard');
        router.refresh();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al registrar');
        
        setIsLogin(true);
        setError('Usuario creado exitosamente. Por favor, inicia sesión.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 100px)',
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="h2" style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Usuario'}
        </h1>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: error.includes('exitosamente') ? 'var(--color-primary-light)' : 'var(--color-danger-light)',
            color: error.includes('exitosamente') ? 'white' : 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Nombre</label>
                <input required name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Apellido</label>
                <input required name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input required name="username" value={formData.username} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.5rem' }} />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Departamento</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input required name="department" value={formData.department} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Empresa</label>
                <div style={{ position: 'relative' }}>
                  <Building size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                  <input required name="company" value={formData.company} onChange={handleChange} className="form-input" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: '0.875rem' }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
