import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { getPool } from './db';
export type Role = 'admin'|'employee'|'customer';
const COOKIE = 'alsa_session';
function secret(){if(!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');return new TextEncoder().encode(process.env.AUTH_SECRET)}
export async function createSession(id:string){const token=await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(id).setIssuedAt().setExpirationTime('7d').sign(secret());(await cookies()).set(COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800});}
export async function endSession(){(await cookies()).delete(COOKIE)}
export async function currentUser(){try{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret());if(typeof payload.sub!=='string')return null;const {rows}=await getPool().query('SELECT id,email,full_name,role,status FROM app_users WHERE id=$1',[payload.sub]);const user=rows[0];return user?.status==='active'?user as {id:string;email:string;full_name:string;role:Role;status:string}:null}catch{return null}}
export async function requireRole(role:Role){const user=await currentUser();if(!user||user.role!==role)return null;return user}
