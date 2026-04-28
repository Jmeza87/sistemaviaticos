import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const travelRequestId = params.id;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Validate ownership
    const pool = await getConnection();
    const check = await pool.request()
      .input('Id', travelRequestId)
      .input('UserId', session.id)
      .query('SELECT Id FROM TravelRequests WHERE Id = @Id AND UserId = @UserId');
      
    if (check.recordset.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await pool.request()
      .input('TravelRequestId', travelRequestId)
      .query(`
        SELECT Id, InvoiceNumber, Amount, AmountUSD, AmountBs, CreatedAt 
        FROM Expenses 
        WHERE TravelRequestId = @TravelRequestId 
        ORDER BY CreatedAt ASC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  const params = await context.params;
  const travelRequestId = params.id;
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const { invoiceNumber, amount, amountUSD, amountBs } = data;

    const pool = await getConnection();
    
    // Check if open
    const check = await pool.request()
      .input('Id', travelRequestId)
      .input('UserId', session.id)
      .query('SELECT Status FROM TravelRequests WHERE Id = @Id AND UserId = @UserId');
      
    if (check.recordset.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (check.recordset[0].Status === 'Cerrada') return NextResponse.json({ error: 'La solicitud está cerrada' }, { status: 400 });

    await pool.request()
      .input('TravelRequestId', travelRequestId)
      .input('InvoiceNumber', invoiceNumber || '')
      .input('Amount', amount)
      .input('AmountUSD', amountUSD)
      .input('AmountBs', amountBs)
      .query(`
        INSERT INTO Expenses (TravelRequestId, InvoiceNumber, Amount, AmountUSD, AmountBs)
        VALUES (@TravelRequestId, @InvoiceNumber, @Amount, @AmountUSD, @AmountBs)
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Error creating expense' }, { status: 500 });
  }
}
