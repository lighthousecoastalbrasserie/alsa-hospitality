import {redirect} from 'next/navigation';
import {requireRole} from '../../lib/auth';
import {getPool} from '../../lib/db';
export default async function Customer(){
 const user=await requireRole('customer');if(!user)redirect('/login');
 const {rows}=await getPool().query("SELECT e.id,e.title,to_char(e.event_date,'MM/DD/YYYY') AS event_date,e.status,e.guest_count,q.tier,q.subtotal_cents FROM customers c JOIN events e ON e.customer_id=c.id LEFT JOIN LATERAL (SELECT tier,subtotal_cents FROM quotes WHERE event_id=e.id ORDER BY created_at DESC LIMIT 1) q ON true WHERE c.user_id=$1 ORDER BY e.created_at DESC",[user.id]);
 return <section className="card"><p className="eyebrow">CUSTOMER PORTAL</p><h1>Welcome, {user.full_name}</h1><h2>Your events</h2>{rows.length?<ul>{rows.map(e=><li key={e.id}><strong>{e.title}</strong> — {e.event_date||'Date not set'} · {e.status}<br/>{e.guest_count} guests{e.tier?' · '+e.tier+' package':''}{e.subtotal_cents!=null?' · '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(e.subtotal_cents/100):''}</li>)}</ul>:<p>No events are linked to your account yet. <a href="/quote">Request a quote</a> or contact ALSA to connect an existing inquiry.</p>}</section>
}
