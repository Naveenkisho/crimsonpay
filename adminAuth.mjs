import { randomBytes, timingSafeEqual } from 'node:crypto';
const sessions=new Map(); const cookieName='crimson_admin';
const equal=(a,b)=>{const x=Buffer.from(String(a||''));const y=Buffer.from(String(b||''));return x.length===y.length&&timingSafeEqual(x,y)};
export function adminLogin(password){if(!process.env.ADMIN_PASSWORD||!equal(password,process.env.ADMIN_PASSWORD))return '';const token=randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*60*60*1000);return `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`}
export function isAdminRequest(req){const token=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.split('=')[1];const expiry=sessions.get(token);if(!expiry||expiry<Date.now()){if(token)sessions.delete(token);return false}return true}
export function adminLogout(req){const token=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.split('=')[1];if(token)sessions.delete(token);return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`}
