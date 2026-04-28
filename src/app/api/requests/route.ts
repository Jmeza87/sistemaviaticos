import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = await getConnection();
    const result = await pool.request()
      .input('UserId', session.id)
      .query(`
        SELECT Id, RequestName, TravelDays, TravelCause, AssignedAmountUSD, AssignedAmountBs, Status, CreatedAt 
        FROM TravelRequests 
        WHERE UserId = @UserId 
        ORDER BY CreatedAt DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { requestName, travelDays, travelCause, assignedAmountUSD, assignedAmountBs } = data;

    const pool = await getConnection();
    await pool.request()
      .input('UserId', session.id)
      .input('RequestName', requestName)
      .input('TravelDays', travelDays)
      .input('TravelCause', travelCause)
      .input('AssignedAmountUSD', assignedAmountUSD || 0)
      .input('AssignedAmountBs', assignedAmountBs || 0)
      .query(`
        INSERT INTO TravelRequests (UserId, RequestName, TravelDays, TravelCause, AssignedAmountUSD, AssignedAmountBs)
        VALUES (@UserId, @RequestName, @TravelDays, @TravelCause, @AssignedAmountUSD, @AssignedAmountBs)
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Error creating request' }, { status: 500 });
  }
}
