import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { createHash } from 'node:crypto';
import { getPool } from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';
import { isSameOrigin } from '@/lib/request-origin';
import { z } from 'zod';
const schema = z.object({email:z.email().max(254),password:z.string().min(1).max(256)});
const dummyHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxcD9xjQBnB4p6nTYm/9V8lEMaW';
export async function POST(req:Request){
 if(!isSameOrigin(req)) return NextResponse.json({error:'Invalid request origin'},{status:403});
 try {
  const input=schema.safeParse(await req.json().catch(()=>null));
  if(!input.success || Buffer.byteLength(input.success?input.data.password:'','utf8')>72) return NextResponse.json({error:'Invalid credentials'},{status:401});
  const email=input.data.email.trim().toLowerCase();
  const key=createHash('sha256').update(email).digest('hex');
  const pool=getPool();
  const limit=await pool.query(`INSERT INTO login_attempt_limits(account_key,attempts,window_started_at) VALUES($1,1,now())
   ON CONFLICT(account_key) DO UPDATE SET
   attempts=CASE WHEN login_attempt_limits.window_started_at < now()-interval '15 minutes' THEN 1 ELSE login_attempt_limits.attempts+1 END,
   window_started_at=CASE WHEN login_attempt_limits.window_started_at < now()-interval '15 minutes' THEN now() ELSE login_attempt_limits.window_started_at END
   RETURNING attempts`,[key]);
  if(limit.rows[0].attempts>5) return NextResponse.json({error:'Too many attempts. Please try again later.'},{status:429});
  const {rows}=await pool.query('SELECT id,role,password_hash,status FROM app_users WHERE lower(email)=lower($1)',[email]);
  const user=rows[0];
  const valid=await compare(input.data.password,user?.password_hash || dummyHash);
  if(!user || user.status!=='active' || !user.password_hash || !valid) return NextResponse.json({error:'Invalid credentials'},{status:401});
  await pool.query('DELETE FROM login_attempt_limits WHERE account_key=$1',[key]);
  await createSession(user.id);
  return NextResponse.json({ok:true,role:user.role});
 } catch {return NextResponse.json({error:'Unable to sign in'},{status:500});}
}
