import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1 className="h1">Mis Reportes de Viáticos</h1>
      <ReportsClient />
    </div>
  );
}
