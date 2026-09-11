require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(fs.readFileSync(require.resolve('./schema.sql'), 'utf8'));
  await client.end();
  console.log('PostgreSQL schema created.');
}
main().catch(error => { console.error(error); process.exit(1); });