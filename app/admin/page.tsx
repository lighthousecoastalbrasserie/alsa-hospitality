import {redirect} from 'next/navigation';
import {requireRole} from '../../lib/auth';
import {getPool} from '../../lib/db';
import InviteForm from './invite-form';
export default async function Admin(){
 const user=await requireRole('admin');if(!user)redirect('/login');
 const pool=getPool();
 const [employees,events]=await Promise.all([
  pool.query('SELECT id,email,full_name,status FROM app_users WHERE role=$1 ORDER BY created_at DESC LIMIT 50',['employee']),
  pool.query("SELECT e.id,e.title,to_char(e.event_date,'MM/DD/YYYY') AS event_date,e.guest_count,e.status,c.name,q.tier,q.subtotal_cents FROM events e JOIN customers c ON c.id=e.customer_id LEFT JOIN LATERAL (SELECT tier,subtotal_cents FROM quotes WHERE event_id=e.id ORDER BY created_at DESC LIMIT 1) q ON true ORDER BY e.created_at DESC LIMIT 50")
 ]);
 return <><p className="eyebrow">ADMIN PORTAL</p><h1>Welcome, {user.full_name}</h1><div className="grid"><section className="card"><h2>Recent inquiries</h2>{events.rows.length?<ul>{events.rows.map(e=><li key={e.id}><strong>{e.name}</strong> — {e.event_date||'Date not set'}<br/>{e.guest_count} guests · {e.tier||'No package'} · {e.status}{e.subtotal_cents!=null?' · '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(e.subtotal_cents/100):''}</li>)}</ul>:<p>No inquiries yet.</p>}</section><section className="card"><h2>Employees</h2>{employees.rows.length?<ul>{employees.rows.map(e=><li key={e.id}>{e.full_name} — {e.email} ({e.status})</li>)}</ul>:<p>No employees yet.</p>}<h2>Invite an employee</h2><InviteForm/></section></div></>
}
