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

    // Add columns if they don't exist
    try {
      await pool.request().query('ALTER TABLE TravelRequests ADD AssignedAmountUSD DECIMAL(18,2) DEFAULT 0 NOT NULL');
      await pool.request().query('ALTER TABLE TravelRequests ADD AssignedAmountBs DECIMAL(18,2) DEFAULT 0 NOT NULL');
      console.log('Added new columns');
      
      // Migrate data
      await pool.request().query("UPDATE TravelRequests SET AssignedAmountUSD = AssignedAmount WHERE Currency = 'USD'");
      await pool.request().query("UPDATE TravelRequests SET AssignedAmountBs = AssignedAmount WHERE Currency = 'Bs'");
      console.log('Migrated data');
      
      // Drop old columns
      await pool.request().query('ALTER TABLE TravelRequests DROP COLUMN AssignedAmount');
      await pool.request().query('ALTER TABLE TravelRequests DROP COLUMN Currency');
      console.log('Dropped old columns');
    } catch (e) {
      console.log('Migration might have already run or failed:', e.message);
    }
    
    // Check Expenses table
    try {
      // In Expenses, we don't need "Amount" anymore as a single value, we only care about AmountUSD and AmountBs.
      // But we can keep it for backwards compatibility or drop it. We'll leave it as is to not break things, just won't use it.
    } catch (e) {}

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
