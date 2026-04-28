import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CaseDetailClient from './CaseDetailClient';

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // await params is needed in Next.js 15
  const resolvedParams = await params;

  return (
    <div>
      <CaseDetailClient caseId={resolvedParams.id} userSession={session} />
    </div>
  );
}
