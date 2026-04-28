import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const pool = await getConnection();
    
    // Total Requested in USD and Bs
    const requestsResult = await pool.request()
      .input('UserId', session.id)
      .query(`
        SELECT Status, SUM(AssignedAmountUSD) as TotalAssignedUSD, SUM(AssignedAmountBs) as TotalAssignedBs
        FROM TravelRequests
        WHERE UserId = @UserId
        GROUP BY Status
      `);

    // Total Spent across all requests
    const expensesResult = await pool.request()
      .input('UserId', session.id)
      .query(`
        SELECT SUM(e.AmountUSD) as TotalSpentUSD, SUM(e.AmountBs) as TotalSpentBs
        FROM Expenses e
        JOIN TravelRequests t ON e.TravelRequestId = t.Id
        WHERE t.UserId = @UserId
      `);

    return NextResponse.json({
      requestsData: requestsResult.recordset,
      expensesData: expensesResult.recordset
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}
