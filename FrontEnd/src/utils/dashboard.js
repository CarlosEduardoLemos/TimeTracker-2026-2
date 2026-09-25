export const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const fmtDuration=(s=0)=>`${Math.floor(Number(s)/3600)}h ${String(Math.floor((Number(s)%3600)/60)).padStart(2,'0')}min`;
export const totalSeconds=(summary)=>summary?.users?.reduce((a,u)=>a+(Number(u.total_seconds)||0),0)||0;
export function deriveTeam(users=[],realtime=[]){const map=new Map(realtime.map(x=>[x.username,x]));return users.map(u=>({...u,realtime:map.get(u.username)||null,status:map.has(u.username)?map.get(u.username).status:'offline'}));}
export function categoryTotals(summary){const m=new Map();for(const u of summary?.users||[])for(const c of u.by_category||[])m.set(c.category,(m.get(c.category)||0)+(c.total_seconds||0));return [...m.entries()].map(([name,seconds])=>({name,seconds})).sort((a,b)=>b.seconds-a.seconds)}
