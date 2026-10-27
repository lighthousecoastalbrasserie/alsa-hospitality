import {redirect} from 'next/navigation';
import {requireRole} from '../../lib/auth';
import {getPool} from '../../lib/db';
export default async function Employee(){
 const user=await requireRole('employee');if(!user)redirect('/login');
 const {rows}=await getPool().query("SELECT e.id,e.title,to_char(e.event_date,'MM/DD/YYYY') AS event_date,e.venue_address,a.assignment_role,a.confirmation FROM event_assignments a JOIN events e ON e.id=a.event_id WHERE a.employee_id=$1 ORDER BY e.event_date ASC LIMIT 30",[user.id]);
 return <section className="card"><p className="eyebrow">EMPLOYEE PORTAL</p><h1>Welcome, {user.full_name}</h1><h2>My assigned events</h2>{rows.length?<ul>{rows.map(e=><li key={e.id}>{e.title} — {e.event_date||'Date not set'} — {e.assignment_role} ({e.confirmation}){e.venue_address&&<> · {e.venue_address}</>}</li>)}</ul>:<p>No events assigned yet.</p>}</section>
}
