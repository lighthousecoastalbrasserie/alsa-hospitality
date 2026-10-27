import {Pool} from 'pg';
let pool:Pool|undefined;
export function getPool(){
 if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
 return pool ??= new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true},max:5});
}
