import {isSameOrigin} from '@/lib/request-origin';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getPool} from '@/lib/db';
import {calculateQuote} from '@/lib/pricing';
const Schema=z.object({tier:z.enum(['well','standard','premium']),guests:z.number().int().min(20).max(10000),glassware:z.boolean(),extraSparkling:z.boolean(),name:z.string().trim().min(2).max(160),email:z.email().max(320),date:z.iso.date()});
export async function POST(req:Request){if(!isSameOrigin(req))return NextResponse.json({error:'Invalid request origin'},{status:403});
 let body:unknown;try{body=await req.json()}catch{return NextResponse.json({error:'Invalid JSON'},{status:400})}
 const parsed=Schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Invalid request details'},{status:400});
 const d=parsed.data;const calc=calculateQuote(d);const client=await getPool().connect();
 try{await client.query('BEGIN');const customer=await client.query('INSERT INTO customers(name,email) VALUES($1,$2) RETURNING id',[d.name,d.email]);const event=await client.query('INSERT INTO events(customer_id,title,event_date,guest_count) VALUES($1,$2,$3,$4) RETURNING id',[customer.rows[0].id,'Private Bar Service',d.date,d.guests]);const quote=await client.query('INSERT INTO quotes(event_id,tier,guest_count,unit_price_cents,extras_cents,subtotal_cents,selections) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[event.rows[0].id,d.tier,d.guests,calc.perGuestCents,calc.perGuestCents*d.guests-({well:2500,standard:3500,premium:5000}[d.tier]*d.guests),calc.subtotalCents,JSON.stringify({glassware:d.glassware,extraSparkling:d.extraSparkling})]);await client.query('COMMIT');return NextResponse.json({quoteId:quote.rows[0].id},{status:201})}
 catch{await client.query('ROLLBACK');return NextResponse.json({error:'Unable to save quote'},{status:500})}finally{client.release()}
}
