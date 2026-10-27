/* Run only from a trusted terminal connected to the intended database. */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const readline = require('node:readline');
const { stdin, stdout } = require('node:process');
if (!stdin.isTTY || !stdout.isTTY) { console.error('A private interactive terminal is required.'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('Set DATABASE_URL securely before running this script.'); process.exit(1); }
const rl = readline.createInterface({ input: stdin, output: stdout });
const ask = (question) => new Promise(resolve => rl.question(question, resolve));
async function password(prompt) {
  stdout.write(prompt); stdin.setRawMode(true); stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = (chunk) => {
      for (const c of chunk.toString()) {
        if (c === '\u0003') { cleanup(); reject(new Error('Cancelled')); return; }
        if (c === '\r' || c === '\n') { cleanup(); stdout.write('\n'); resolve(value); return; }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else if (c >= ' ') value += c;
      }
    };
    function cleanup() { stdin.off('data', onData); stdin.setRawMode(false); stdin.pause(); }
    stdin.on('data', onData);
  });
}
(async () => {
  const email = (await ask('Administrator email: ')).trim().toLowerCase();
  const name = (await ask('Administrator full name: ')).trim();
  rl.close();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || name.length < 2 || name.length > 120) throw new Error('Invalid name or email.');
  const first = await password('New administrator password (at least 12 characters): ');
  const second = await password('Confirm password: ');
  if (first.length < 12 || Buffer.byteLength(first,'utf8') > 72 || first !== second) throw new Error('Passwords do not match, are too short, or exceed 72 UTF-8 bytes.');
  const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:true}, max:1});
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('alsa_initial_admin'))");
    const existing = await client.query("SELECT 1 FROM app_users WHERE role='admin' LIMIT 1");
    if (existing.rowCount) throw new Error('An administrator already exists. No changes were made.');
    const passwordHash = await bcrypt.hash(first,12);
    await client.query("INSERT INTO app_users(email,full_name,role,status,password_hash) VALUES($1,$2,'admin','active',$3)",[email,name,passwordHash]);
    await client.query('COMMIT');
    console.log('Administrator created. Sign in only after the application is secured and tested.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
})().catch(error => { console.error('Setup failed:', error.message); process.exitCode = 1; });
