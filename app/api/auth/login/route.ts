import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { getPool } from '../../../../lib/db';
import { createSession } from '../../../../lib/auth';
import { z } from 'zod';
const schema=z.object({email:z.email().max(254),password:z.string().min(1).max(256)});
export async function POST(req:Request){try{const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({error:'Invalid credentials'},{status:401});const {rows}=await getPool().query('SELECT id,role,password_hash,status FROM app_users WHERE lower(email)=lower($1)',[body.data.email.trim()]);const u=rows[0];if(!u||u.status!=='active'||!u.password_hash||!(await compare(body.data.password,u.password_hash)))return NextResponse.json({error:'Invalid credentials'},{status:401});await createSession(u.id);return NextResponse.json({ok:true,role:u.role});}catch{return NextResponse.json({error:'Unable to sign in'},{status:500})}}
