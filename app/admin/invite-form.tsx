'use client';
import {useState} from 'react';
export default function InviteForm(){
 const [email,setEmail]=useState(''); const [message,setMessage]=useState(''); const [link,setLink]=useState(''); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');setLink('');try{const r=await fetch('/api/admin/invitations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const data=await r.json();if(!r.ok){setMessage(data.error||'Unable to create invitation.');return}setLink(data.invitationUrl);setMessage('Invitation created. Share this private link with the employee. It expires in 48 hours.');setEmail('')}catch{setMessage('Connection error. Please try again.')}finally{setBusy(false)}}
 return <form onSubmit={submit}><label>Employee email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required /></label><button className="btn" disabled={busy}>{busy?'Creating invitation...':'Create invitation'}</button><p role="status">{message}</p>{link&&<label>Invitation link<input readOnly value={link} onFocus={e=>e.currentTarget.select()} /></label>}</form>
}
