import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const pool = await getConnection();
    const result = await pool.request()
      .input('Username', username)
      .input('Password', password) // In production, use bcrypt.compare
      .query('SELECT Id, FirstName, LastName, Department, Company FROM Users WHERE Username = @Username AND Password = @Password');

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = result.recordset[0];

    const sessionData = {
      id: user.Id,
      firstName: user.FirstName,
      lastName: user.LastName,
      department: user.Department,
      company: user.Company
    };

    const session = await encrypt(sessionData);
    
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
