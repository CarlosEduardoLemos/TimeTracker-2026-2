const API_BASE_URL=(import.meta.env.VITE_API_URL||'http://localhost:8000').replace(/\/$/,'');
const TIMEOUT=15000;
async function request(path,options={}){const c=new AbortController();const id=setTimeout(()=>c.abort(),TIMEOUT);try{const r=await fetch(`${API_BASE_URL}${path}`,{...options,signal:c.signal,headers:{'Content-Type':'application/json',...(options.headers||{})}});if(!r.ok)throw new Error(`API respondeu ${r.status}`);const type=r.headers.get('content-type')||'';return type.includes('application/json')?r.json():r;}finally{clearTimeout(id)}}
export const api={
  users:()=>request('/users/'),
  realtime:()=>request('/activities/realtime'),
  summary:(date,username='')=>request(`/dashboard/summary?date=${encodeURIComponent(date)}${username?`&username=${encodeURIComponent(username)}`:''}`),
  settings:()=>request('/config/'),
  saveSettings:(payload)=>request('/config/',{method:'PUT',body:JSON.stringify(payload)}),
  exportUrl:(format,date,username='')=>`${API_BASE_URL}/dashboard/export/${format}?date=${encodeURIComponent(date)}${username?`&username=${encodeURIComponent(username)}`:''}`,
};
