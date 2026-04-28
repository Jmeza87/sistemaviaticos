import sql from 'mssql';

const sqlConfig = {
  server: '207.244.236.74\\saint',
  user: 'sa',
  password: 'Rsistems86',
  database: 'viaticos',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectionTimeout: 30000, 
    requestTimeout: 300000     
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(sqlConfig);
    return pool;
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}
