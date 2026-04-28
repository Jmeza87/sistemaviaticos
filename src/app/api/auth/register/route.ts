import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName, username, password, department, company } = data;

    const pool = await getConnection();

    // Check if user exists
    const checkResult = await pool.request()
      .input('Username', username)
      .query('SELECT Id FROM Users WHERE Username = @Username');

    if (checkResult.recordset.length > 0) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    // Insert new user
    // In production, encrypt password with bcrypt
    await pool.request()
      .input('FirstName', firstName)
      .input('LastName', lastName)
      .input('Username', username)
      .input('Password', password)
      .input('Department', department)
      .input('Company', company)
      .query(`
        INSERT INTO Users (FirstName, LastName, Username, Password, Department, Company)
        VALUES (@FirstName, @LastName, @Username, @Password, @Department, @Company)
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
