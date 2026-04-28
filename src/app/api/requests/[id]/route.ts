import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const id = params.id;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = await getConnection();
    const result = await pool.request()
      .input('Id', id)
      .input('UserId', session.id)
      .query(`
        SELECT Id, RequestName, TravelDays, TravelCause, AssignedAmountUSD, AssignedAmountBs, Status, CreatedAt 
        FROM TravelRequests 
        WHERE Id = @Id AND UserId = @UserId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error('Fetch request detail error:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = params.id;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();

    const pool = await getConnection();
    await pool.request()
      .input('Id', id)
      .input('UserId', session.id)
      .input('Status', data.status)
      .query(`
        UPDATE TravelRequests 
        SET Status = @Status 
        WHERE Id = @Id AND UserId = @UserId
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'Error updating request' }, { status: 500 });
  }
}
