import type {ReactNode} from 'react';
import './style.css';
export const metadata={title:'ALSA Hospitality',description:'Private bar experiences and event services'};
export default function Layout({children}:{children:ReactNode}){return <html lang="en"><body><header><a className="brand" href="/">ALSA <span>HOSPITALITY</span></a><nav><a href="/quote">Get a quote</a><a href="/customer">Customer</a><a href="/admin">Admin</a><a href="/employee">Employee</a><a href="/login">Sign in</a></nav></header><main>{children}</main><footer>ALSA Hospitality Services · Private Bar Experiences</footer></body></html>}
