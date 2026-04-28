import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { User, LogOut, Home, FileText } from 'lucide-react';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home size={24} />
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          MeruQ Viáticos
        </Link>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {session ? (
          <>
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <Home size={20} />
              Dashboard
            </Link>
            <Link href="/dashboard/reports" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
              <FileText size={20} />
              Reportes
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
              <User size={20} />
              <span style={{ fontSize: '0.875rem' }}>{session.firstName} {session.lastName}</span>
            </div>
            <LogoutButton />
          </>
        ) : (
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            Iniciar Sesión
          </Link>
        )}
      </nav>
    </header>
  );
}
