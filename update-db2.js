const sql = require('mssql');

const config = {
  server: '207.244.236.74\\saint',
  user: 'sa',
  password: 'Rsistems86',
  database: 'viaticos',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

async function run() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected');

    try {
      await pool.request().query('ALTER TABLE Expenses ADD Concept NVARCHAR(MAX) NULL');
      console.log('Added Concept column to Expenses');
    } catch (e) {
      console.log('Column might already exist:', e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
