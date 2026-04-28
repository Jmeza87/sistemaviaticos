'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      title="Cerrar Sesión"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      <LogOut size={20} />
    </button>
  );
}
