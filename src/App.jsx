import{useState,useCallback}from"react";
function u(k,i){const[v,s]=useState(()=>{try{const x=localStorage.getItem(k);return x?JSON.parse(x):i}catch{return i}});const set=useCallback(n=>{s(p=>{const x=typeof n==="function"?n(p):n;try{localStorage.setItem(k,JSON.stringify(x))}catch{}return x})},[k]);return[v,set]}
const fmt=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const td=()=>new Date().toISOString().slice(0,10);
const CATS=["Food","Transport","Shopping","Bills","Entertainment","Health","Groceries","Rent","UPI","Other"];
const ICONS={Food:"🍽️",Transport:"🚗",Shopping:"🛍️",Bills:"⚡",Entertainment:"🎬",Health:"💊",Groceries:"🛒",Rent:"🏠",UPI:"📲",Other:"📦",Salary:"💰",Bonus:"🎁",Freelance:"💼"};
const CLR={Food:"#ff6b6b",Transport:"#ffa94d",Shopping:"#da77f2",Bills:"#4dabf7",Entertainment:"#f06595",Health:"#69db7c",Groceries:"#a9e34b",Rent:"#ffd43b",UPI:"#63e6be",Other:"#868e96"};
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const mon=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`};

export default function App(){
  const[dark,setDark]=u("dark",true);
  const T=dark?{bg:"#0f1117",card:"#1a1d2e",card2:"#222640",border:"#2d3158",text:"#e8e6ff",muted:"#7c7aad",accent:"#7c6fff",green:"#10b981",red:"#ef4444",amber:"#f59e0b"}
              :{bg:"#f5f3ff",card:"#fff",card2:"#f0edff",border:"#e0d9ff",text:"#1a1035",muted:"#7c6fa0",accent:"#6c63ff",green:"#10b981",red:"#ef4444",amber:"#f59e0b"};
  const[tab,setTab]=useState("home");
  const[modal,setModal]=useState(null);
  const[form,setForm]=useState({});
  const[expenses,setExpenses]=u("exp",[
    {id:"e1",name:"Grocery",amount:3200,category:"Groceries",date:"2025-05-03"},
    {id:"e2",name:"Electricity",amount:1800,category:"Bills",date:"2025-05-04"},
    {id:"e3",name:"GPay Zomato",amount:650,category:"UPI",date:"2025-05-05"},
  ]);
  const[salaries,setSalaries]=u("sal",[
    {id:"s1",source:"Salary",amount:55000,date:"2025-05-01",category:"Salary"},
  ]);
  const[emis,setEmis]=u("emi",[
    {id:"em1",name:"Home Loan",amount:18500,dueDay:5,totalMonths:240,paidMonths:36,icon:"🏠"},
    {id:"em2",name:"Car Loan",amount:8200,dueDay:10,totalMonths:60,paidMonths:24,icon:"🚗"},
  ]);
  const[investments,setInvestments]=u("inv",[
    {id:"i1",name:"HDFC Flexi Cap",type:"Mutual Fund",invested:120000,current:143500,monthly:5000},
    {id:"i2",name:"PPF",type:"PPF",invested:85000,current:92000,monthly:0},
  ]);
  const[budgets,setBudgets]=u("bud",{Food:5000,Groceries:8000,Transport:3000,Bills:4000,UPI:10000});
  const[taxIncome,setTaxIncome]=useState(800000);
  const[taxRegime,setTaxRegime]=useState("new");
  const[profile,setProfile]=u("prof",{name:"Your Name",company:"Your Company",designation:"Engineer",basicSalary:40000,hra:15000,da:2000,ta:1000,pf:1800,tds:2500,professional:200});

  const M=mon();
  const monthInc=salaries.filter(s=>s.date.startsWith(M)).reduce((a,s)=>a+s.amount,0);
  const monthExp=expenses.filter(e=>e.date.startsWith(M)).reduce((a,e)=>a+e.amount,0);
  const monthEMI=emis.reduce((a,e)=>a+e.amount,0);
  const bal=monthInc-monthExp-monthEMI;
  const totInv=investments.reduce((a,i)=>a+i.invested,0);
  const totCur=investments.reduce((a,i)=>a+i.current,0);
  const gain=totCur-totInv;

  function calcTax(inc,regime){
    const taxable=Math.max(0,inc-50000);
    let tax=0;
    if(regime==="new"){
      const s=[[300000,0],[400000,.05],[300000,.1],[300000,.15],[300000,.2],[Infinity,.3]];
      let r=taxable;for(const[l,rt]of s){if(r<=0)break;const c=Math.min(r,l);tax+=c*rt;r-=c;}
    }else{
      const s=[[250000,0],[250000,.05],[500000,.2],[Infinity,.3]];
      let r=taxable;for(const[l,rt]of s){if(r<=0)break;const c=Math.min(r,l);tax+=c*rt;r-=c;}
    }
    return{tax,cess:tax*.04,total:tax+tax*.04,monthly:Math.round((tax+tax*.04)/12),taxable};
  }
  const TR=calcTax(taxIncome,taxRegime);
  const gross=profile.basicSalary+profile.hra+profile.da+profile.ta;
  const ded=profile.pf+profile.tds+profile.professional;
  const net=gross-ded;

  const openM=(t,d={})=>{setModal(t);setForm(d)};
  const closeM=()=>{setModal(null);setForm({})};
  const sf=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const saveExp=()=>{
    if(!form.name||!form.amount)return;
    const item={id:uid(),name:form.name,amount:+form.amount,category:form.category||"Other",date:form.date||td()};
    if(form.id)setExpenses(e=>e.map(x=>x.id===form.id?{...x,...item,id:form.id}:x));
    else setExpenses(e=>[item,...e]);
    closeM();
  };
  const saveSal=()=>{
    if(!form.source||!form.amount)return;
    const item={id:uid(),source:form.source,amount:+form.amount,date:form.date||td(),category:form.category||"Salary"};
    if(form.id)setSalaries(s=>s.map(x=>x.id===form.id?{...x,...item,id:form.id}:x));
    else setSalaries(s=>[item,...s]);
    closeM();
  };
  const saveEMI=()=>{
    if(!form.name||!form.amount)return;
    const item={id:uid(),name:form.name,amount:+form.amount,dueDay:+form.dueDay||5,totalMonths:+form.totalMonths||12,paidMonths:+form.paidMonths||0,icon:form.icon||"💳"};
    if(form.id)setEmis(e=>e.map(x=>x.id===form.id?{...x,...item,id:form.id}:x));
    else setEmis(e=>[item,...e]);
    closeM();
  };
  const saveInv=()=>{
    if(!form.name||!form.invested)return;
    const item={id:uid(),name:form.name,type:form.type||"Mutual Fund",invested:+form.invested,current:+form.current||+form.invested,monthly:+form.monthly||0};
    if(form.id)setInvestments(i=>i.map(x=>x.id===form.id?{...x,...item,id:form.id}:x));
    else setInvestments(i=>[item,...i]);
    closeM();
  };
  const del=(type,id)=>{
    if(type==="exp")setExpenses(e=>e.filter(x=>x.id!==id));
    if(type==="sal")setSalaries(s=>s.filter(x=>x.id!==id));
    if(type==="emi")setEmis(e=>e.filter(x=>x.id!==id));
    if(type==="inv")setInvestments(i=>i.filter(x=>x.id!==id));
    closeM();
  };

  const G=`linear-gradient(135deg,${T.accent},#a78bfa)`;
  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
    body{background:${T.bg};color:${T.text};font-family:'Sora',sans-serif;overflow:hidden;height:100vh}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
    .app{height:100vh;display:flex;flex-direction:column;max-width:430px;margin:0 auto;background:${T.bg}}
    .hdr{background:${G};padding:44px 18px 56px;position:relative;overflow:hidden;flex-shrink:0}
    .hdr::before{content:'';position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,.07)}
    .hr{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
    .ht{font-size:21px;font-weight:800;color:#fff}
    .ib{width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.18);border:none;color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer}
    .bl{font-size:10px;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:1px;margin:12px 0 3px;position:relative;z-index:1}
    .bb{font-family:'JetBrains Mono',monospace;font-size:34px;font-weight:700;color:#fff;position:relative;z-index:1}
    .br{display:flex;gap:8px;margin-top:12px;position:relative;z-index:1}
    .bc{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);border-radius:11px;padding:8px 11px;flex:1}
    .bcl{font-size:9px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
    .bcv{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;color:#fff}
    .sc{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:70px}
    .pg{padding:0 13px 13px;animation:pu .2s ease}
    @keyframes pu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .pull{background:${T.card};border-radius:18px;margin:-26px 13px 10px;position:relative;z-index:10;padding:13px;box-shadow:0 8px 28px rgba(0,0,0,.15)}
    .card{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:13px;margin-bottom:9px}
    .card2{background:${T.card2};border-radius:12px;padding:11px;margin-bottom:8px}
    .ct{font-size:10px;font-weight:700;color:${T.muted};text-transform:uppercase;letter-spacing:1px;margin-bottom:11px;display:flex;align-items:center;gap:6px}
    .ct::after{content:'';flex:1;height:1px;background:${T.border}}
    .nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${T.card};border-top:1px solid ${T.border};display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0)}
    .nb{flex:1;display:flex;flex-direction:column;align-items:center;padding:8px 0 5px;background:none;border:none;color:${T.muted};font-size:9px;font-weight:700;gap:2px;cursor:pointer;text-transform:uppercase;letter-spacing:.3px}
    .nb.on{color:${T.accent}}
    .ni{font-size:19px}
    .fab{position:fixed;bottom:64px;right:calc(50% - 198px);width:50px;height:50px;border-radius:14px;background:${G};color:#fff;font-size:23px;border:none;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(108,99,255,.4);z-index:99;cursor:pointer}
    .btn{padding:11px 18px;border-radius:11px;border:none;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;font-family:'Sora',sans-serif}
    .bp{background:${G};color:#fff}
    .bo{background:transparent;color:${T.accent};border:1.5px solid ${T.accent}}
    .bd{background:rgba(239,68,68,.1);color:${T.red};border:1px solid rgba(239,68,68,.2)}
    .bsm{padding:7px 13px;font-size:11px;border-radius:8px}
    .row{display:flex;justify-content:space-between;align-items:center}
    .mono{font-family:'JetBrains Mono',monospace}
    .muted{color:${T.muted};font-size:11px}
    .txn{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid ${T.border};cursor:pointer}
    .txn:last-child{border:none}
    .tic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
    .ti{flex:1;min-width:0}
    .tn{font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tm{font-size:10px;color:${T.muted};margin-top:1px}
    .ta{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;flex-shrink:0}
    .prog{height:7px;background:${T.border};border-radius:4px;overflow:hidden;margin-top:5px}
    .progf{height:100%;border-radius:4px;transition:width .4s}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(5px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
    .sh{background:${T.card};border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:16px 16px calc(env(safe-area-inset-bottom,0px)+16px);max-height:88vh;overflow-y:auto;animation:su .25s cubic-bezier(.4,0,.2,1)}
    @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .hdl{width:32px;height:4px;background:${T.border};border-radius:2px;margin:0 auto 14px}
    .sht{font-size:18px;font-weight:800;margin-bottom:14px}
    .fld{margin-bottom:11px}
    .fld label{display:block;font-size:10px;font-weight:700;color:${T.muted};text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}
    .inp{width:100%;background:${T.bg};border:1.5px solid ${T.border};color:${T.text};padding:10px 12px;border-radius:10px;font-size:13px;outline:none;font-family:'Sora',sans-serif}
    .inp:focus{border-color:${T.accent}}
    select.inp{cursor:pointer}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:9px}
    .sr{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid ${T.border}}
    .sr:last-child{border:none}
    .al{border-radius:10px;padding:9px 11px;margin-bottom:7px;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500}
    .aw{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:${T.amber}}
    .ad{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:${T.red}}
    .chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px}
    .chip{padding:5px 11px;border-radius:18px;font-size:11px;font-weight:600;border:1.5px solid ${T.border};background:${T.bg};color:${T.muted};cursor:pointer}
    .chip.on{background:${T.accent};border-color:${T.accent};color:#fff}
    .div{height:1px;background:${T.border};margin:9px 0}
    .sg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px}
    .sc2{background:${T.card2};border-radius:12px;padding:11px}
    .si{font-size:20px;margin-bottom:5px}
    .sv{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600}
    .sl2{font-size:10px;color:${T.muted};margin-top:2px}
    .tax-r{background:${G};border-radius:13px;padding:14px;margin-bottom:11px;color:#fff}
    .slip{background:${T.card};border:1px solid ${T.border};border-radius:14px;padding:14px}
    .slip-h{text-align:center;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid ${T.accent}}
    .slip-co{font-size:15px;font-weight:800;color:${T.accent};margin-bottom:3px}
    .slip-r{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid ${T.border};font-size:12px}
    .slip-r:last-child{border:none}
    .slip-t{font-weight:700;font-size:12px;color:${T.green};margin-top:8px;padding-top:8px;border-top:2px solid ${T.border};display:flex;justify-content:space-between}
    .empty{text-align:center;padding:24px;color:${T.muted};font-size:12px}
  `;

  const TABS=[{id:"home",ic:"🏠",l:"Home"},{id:"exp",ic:"🧾",l:"Expenses"},{id:"tax",ic:"🧮",l:"Tax"},{id:"slip",ic:"📄",l:"Slip"},{id:"more",ic:"📊",l:"More"}];

  function Overlay({title,children}){
    return(
      <div className="ov" onClick={e=>e.target===e.currentTarget&&closeM()}>
        <div className="sh"><div className="hdl"/><div className="sht">{title}</div>{children}</div>
      </div>
    );
  }

  function BRow({isEdit,type,onSave,lbl}){
    return(
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {isEdit&&<button className="btn bd bsm" onClick={()=>del(type,form.id)}>Delete</button>}
        <button className="btn bp" style={{flex:1}} onClick={onSave}>{lbl}</button>
      </div>
    );
  }

  const recent=[...expenses.map(e=>({...e,kind:"exp"})),...salaries.map(s=>({...s,name:s.source,kind:"sal"}))]
    .sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);

  const budAlerts=Object.entries(budgets).map(([cat,lim])=>{
    const spent=expenses.filter(e=>e.category===cat&&e.date.startsWith(M)).reduce((a,e)=>a+e.amount,0);
    return{cat,spent,lim,pct:lim?spent/lim*100:0};
  }).filter(b=>b.pct>75).sort((a,b)=>b.pct-a.pct);

  const expByCat=CATS.map(c=>({label:c,color:CLR[c]||"#868e96",value:expenses.filter(e=>e.category===c&&e.date.startsWith(M)).reduce((a,e)=>a+e.amount,0)})).filter(d=>d.value>0);
  const totalExp=expByCat.reduce((a,d)=>a+d.value,0);

  return(
    <>
      <style>{css}</style>
      <div className="app">
        <div className="hdr">
          <div className="hr">
            <div><div className="ht">FinBook ✦</div><div style={{fontSize:10,color:"rgba(255,255,255,.6)",marginTop:1}}>{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</div></div>
            <div style={{display:"flex",gap:8}}>
              <button className="ib" onClick={()=>setDark(d=>!d)}>{dark?"☀️":"🌙"}</button>
              <button className="ib" onClick={()=>openM("addExp")}>+</button>
            </div>
          </div>
          <div className="bl">Net Balance</div>
          <div className="bb" style={{color:bal>=0?"#fff":"#fca5a5"}}>{bal>=0?"":"-"}{fmt(Math.abs(bal))}</div>
          <div className="br">
            <div className="bc"><div className="bcl">Income</div><div className="bcv">{fmt(monthInc)}</div></div>
            <div className="bc"><div className="bcl">Spent</div><div className="bcv">{fmt(monthExp+monthEMI)}</div></div>
            <div className="bc"><div className="bcl">Inv.Gain</div><div className="bcv" style={{color:gain>=0?"#86efac":"#fca5a5"}}>{gain>=0?"+":""}{fmt(gain)}</div></div>
          </div>
        </div>

        <div className="sc">

          {/* HOME */}
          {tab==="home"&&(
            <div>
              <div className="pull">
                <div className="sg">
                  {[{ic:"🏦",v:fmt(monthEMI),l:"EMI/mo",c:T.amber},{ic:"📈",v:fmt(totInv),l:"Invested",c:T.accent},{ic:"💹",v:totInv>0?((gain/totInv)*100).toFixed(1)+"%":"0%",l:"Returns",c:gain>=0?T.green:T.red},{ic:"📲",v:fmt(expenses.filter(e=>e.category==="UPI"&&e.date.startsWith(M)).reduce((a,e)=>a+e.amount,0)),l:"UPI Spend",c:"#63e6be"}].map(s=>(
                    <div key={s.l} className="sc2"><div className="si">{s.ic}</div><div className="sv" style={{color:s.c}}>{s.v}</div><div className="sl2">{s.l}</div></div>
                  ))}
                </div>
              </div>
              <div className="pg">
                {budAlerts.slice(0,2).map(b=>(
                  <div key={b.cat} className={`al ${b.pct>=100?"ad":"aw"}`}>{b.pct>=100?"🚨":"⚠️"}<span><b>{b.cat}</b> {b.pct>=100?"exceeded":"at "+Math.round(b.pct)+"%"} — {fmt(b.spent)}/{fmt(b.lim)}</span></div>
                ))}
                <div className="card">
                  <div className="ct">This Month</div>
                  {[{l:"Income",v:monthInc,c:T.green},{l:"Expenses",v:monthExp,c:T.red},{l:"EMIs",v:monthEMI,c:T.amber},{l:"Net",v:bal,c:bal>=0?T.green:T.red}].map(r=>(
                    <div key={r.l} className="sr"><span className="muted">{r.l}</span><span className="mono" style={{fontSize:13,fontWeight:600,color:r.c}}>{fmt(r.v)}</span></div>
                  ))}
                </div>
                {expByCat.length>0&&(
                  <div className="card">
                    <div className="ct">Spending Breakdown</div>
                    {expByCat.map(d=>(
                      <div key={d.label} style={{marginBottom:8}}>
                        <div className="row" style={{marginBottom:4}}><span style={{fontSize:12}}>{ICONS[d.label]||"📦"} {d.label}</span><span className="mono" style={{fontSize:11,color:T.muted}}>{fmt(d.value)} ({totalExp>0?Math.round(d.value/totalExp*100):0}%)</span></div>
                        <div className="prog"><div className="progf" style={{width:(totalExp>0?d.value/totalExp*100:0)+"%",background:d.color}}/></div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{fontWeight:700,fontSize:15,marginBottom:9}}>Recent Activity</div>
                <div className="card">
                  {recent.map(t=>(
                    <div key={t.id} className="txn" onClick={()=>openM(t.kind==="sal"?"editSal":"editExp",t)}>
                      <div className="tic" style={{background:(CLR[t.category]||T.accent)+"22"}}>{ICONS[t.category]||"💸"}</div>
                      <div className="ti"><div className="tn">{t.name}</div><div className="tm">{t.category} · {t.date}</div></div>
                      <div className="ta" style={{color:t.kind==="sal"?T.green:T.red}}>{t.kind==="sal"?"+":"-"}{fmt(t.amount)}</div>
                    </div>
                  ))}
                  {recent.length===0&&<div className="empty">No transactions yet. Tap + to add!</div>}
                </div>
              </div>
            </div>
          )}

          {/* EXPENSES */}
          {tab==="exp"&&(
            <div className="pg" style={{paddingTop:14}}>
              <div className="row" style={{marginBottom:11}}>
                <div style={{fontWeight:700,fontSize:15}}>Expenses</div>
                <div className="mono" style={{fontSize:13,color:T.red}}>{fmt(monthExp)}</div>
              </div>
              <div className="card">
                <div className="ct">Budget Status</div>
                {Object.entries(budgets).map(([cat,lim])=>{
                  const spent=expenses.filter(e=>e.category===cat&&e.date.startsWith(M)).reduce((a,e)=>a+e.amount,0);
                  const pct=Math.min(100,lim?spent/lim*100:0);
                  const col=pct>=100?T.red:pct>=80?T.amber:T.green;
                  return(
                    <div key={cat} style={{marginBottom:10}}>
                      <div className="row" style={{marginBottom:4}}><span style={{fontSize:12}}>{ICONS[cat]||"📦"} {cat}</span><span className="mono" style={{fontSize:10,color:T.muted}}>{fmt(spent)}/{fmt(lim)}</span></div>
                      <div className="prog"><div className="progf" style={{width:pct+"%",background:col}}/></div>
                    </div>
                  );
                })}
                <button className="btn bo bsm" style={{marginTop:4}} onClick={()=>openM("editBud")}>✏️ Edit Budgets</button>
              </div>
              <div className="card">
                {expenses.map(e=>(
                  <div key={e.id} className="txn" onClick={()=>openM("editExp",e)}>
                    <div className="tic" style={{background:(CLR[e.category]||T.accent)+"22"}}>{ICONS[e.category]||"💸"}</div>
                    <div className="ti"><div className="tn">{e.name}</div><div className="tm">{e.category} · {e.date}</div></div>
                    <div className="ta" style={{color:T.red}}>-{fmt(e.amount)}</div>
                  </div>
                ))}
                {expenses.length===0&&<div className="empty">No expenses yet</div>}
              </div>
            </div>
          )}

          {/* TAX */}
          {tab==="tax"&&(
            <div className="pg" style={{paddingTop:14}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:11}}>Income Tax Calculator</div>
              <div className="tax-r">
                <div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginBottom:3}}>Estimated Annual Tax</div>
                <div className="mono" style={{fontSize:30,fontWeight:700}}>{fmt(Math.round(TR.total))}</div>
                <div style={{display:"flex",gap:14,marginTop:9}}>
                  {[{l:"Monthly",v:fmt(TR.monthly)},{l:"Base Tax",v:fmt(Math.round(TR.tax))},{l:"Cess 4%",v:fmt(Math.round(TR.cess))}].map(s=>(
                    <div key={s.l}><div style={{fontSize:9,color:"rgba(255,255,255,.65)"}}>{s.l}</div><div className="mono" style={{fontSize:13}}>{s.v}</div></div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="fld"><label>Annual Income (₹)</label><input className="inp" type="number" value={taxIncome} onChange={e=>setTaxIncome(+e.target.value)}/></div>
                <div className="fld" style={{marginBottom:0}}><label>Regime</label>
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    {["new","old"].map(r=><button key={r} className={`btn bsm ${taxRegime===r?"bp":"bo"}`} style={{flex:1}} onClick={()=>setTaxRegime(r)}>{r==="new"?"New Regime":"Old Regime"}</button>)}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="ct">Summary</div>
                {[{l:"Gross Income",v:fmt(taxIncome)},{l:"Standard Deduction",v:"−₹50,000"},{l:"Taxable Income",v:fmt(TR.taxable)},{l:"Effective Rate",v:taxIncome>0?((TR.total/taxIncome)*100).toFixed(1)+"%":"0%"}].map(r=>(
                  <div key={r.l} className="sr"><span className="muted">{r.l}</span><span className="mono" style={{fontSize:12}}>{r.v}</span></div>
                ))}
              </div>
            </div>
          )}

          {/* SALARY SLIP */}
          {tab==="slip"&&(
            <div className="pg" style={{paddingTop:14}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:11}}>Salary Slip</div>
              <button className="btn bo bsm" style={{width:"100%",marginBottom:11}} onClick={()=>openM("editProf")}>✏️ Edit Profile & Salary</button>
              <div className="slip">
                <div className="slip-h"><div className="slip-co">{profile.company}</div><div style={{fontSize:10,color:T.muted}}>Salary Slip — {MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</div></div>
                <div className="card2" style={{marginBottom:11}}>
                  <div className="g2" style={{gap:6}}>
                    {[{l:"Name",v:profile.name},{l:"Designation",v:profile.designation}].map(r=>(
                      <div key={r.l}><div style={{fontSize:9,color:T.muted,marginBottom:1}}>{r.l}</div><div style={{fontSize:12,fontWeight:600}}>{r.v}</div></div>
                    ))}
                  </div>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:T.green,marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Earnings</div>
                {[{l:"Basic Salary",v:profile.basicSalary},{l:"HRA",v:profile.hra},{l:"DA",v:profile.da},{l:"TA",v:profile.ta}].map(r=>(
                  <div key={r.l} className="slip-r"><span style={{color:T.muted}}>{r.l}</span><span className="mono">{fmt(r.v)}</span></div>
                ))}
                <div className="slip-r" style={{fontWeight:700}}><span>Gross</span><span className="mono" style={{color:T.green}}>{fmt(gross)}</span></div>
                <div className="div"/>
                <div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Deductions</div>
                {[{l:"PF",v:profile.pf},{l:"TDS",v:profile.tds},{l:"Professional Tax",v:profile.professional}].map(r=>(
                  <div key={r.l} className="slip-r"><span style={{color:T.muted}}>{r.l}</span><span className="mono" style={{color:T.red}}>-{fmt(r.v)}</span></div>
                ))}
                <div className="slip-t"><span>💰 Net Pay</span><span className="mono">{fmt(net)}</span></div>
              </div>
            </div>
          )}

          {/* MORE */}
          {tab==="more"&&(
            <div className="pg" style={{paddingTop:14}}>
              <div className="chips">
                {[{id:"inv",l:"Investments"},{id:"emi",l:"EMI"},{id:"inc",l:"Income"}].map(s=>(
                  <div key={s.id} className={`chip ${form._sub===s.id?"on":""}`} onClick={()=>setForm(f=>({...f,_sub:s.id}))}>{s.l}</div>
                ))}
              </div>

              {(!form._sub||form._sub==="inv")&&(
                <>
                  <div className="card">
                    <div className="ct">Portfolio</div>
                    <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
                      {[{l:"Invested",v:fmt(totInv),c:T.accent},{l:"Current",v:fmt(totCur),c:T.text},{l:"Gain",v:(gain>=0?"+":"")+fmt(gain),c:gain>=0?T.green:T.red}].map(s=>(
                        <div key={s.l} style={{textAlign:"center"}}><div className="mono" style={{fontSize:13,fontWeight:600,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:T.muted,marginTop:2}}>{s.l}</div></div>
                      ))}
                    </div>
                  </div>
                  {investments.map(i=>{
                    const g=i.current-i.invested,gp=i.invested>0?(g/i.invested*100).toFixed(1):0;
                    return(
                      <div key={i.id} className="card" onClick={()=>openM("editInv",i)}>
                        <div className="row" style={{marginBottom:7}}>
                          <div><div style={{fontWeight:600,fontSize:13}}>{i.name}</div><span style={{fontSize:10,background:T.accent+"20",color:T.accent,padding:"1px 7px",borderRadius:5}}>{i.type}</span></div>
                          <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:13,fontWeight:600,color:g>=0?T.green:T.red}}>{g>=0?"+":""}{fmt(g)}</div><div style={{fontSize:10,color:T.muted}}>{gp}%</div></div>
                        </div>
                        <div style={{display:"flex",gap:9}}>
                          {[{l:"Invested",v:fmt(i.invested)},{l:"Current",v:fmt(i.current)},{l:"SIP",v:i.monthly>0?fmt(i.monthly):"—"}].map(s=>(
                            <div key={s.l} style={{flex:1}}><div style={{fontSize:9,color:T.muted}}>{s.l}</div><div className="mono" style={{fontSize:11,fontWeight:500}}>{s.v}</div></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <button className="btn bo" style={{width:"100%"}} onClick={()=>openM("addInv")}>+ Add Investment</button>
                </>
              )}

              {form._sub==="emi"&&(
                <>
                  <div className="card" style={{marginBottom:11}}>
                    <div style={{fontSize:11,color:T.muted,marginBottom:3}}>Total Monthly EMI</div>
                    <div className="mono" style={{fontSize:26,fontWeight:700,color:T.red}}>{fmt(monthEMI)}</div>
                    {monthInc>0&&<div style={{fontSize:11,color:T.muted,marginTop:3}}>{Math.round(monthEMI/monthInc*100)}% of income</div>}
                  </div>
                  {emis.map(e=>{
                    const prog=e.totalMonths>0?e.paidMonths/e.totalMonths*100:0;
                    return(
                      <div key={e.id} className="card" onClick={()=>openM("editEMI",e)} style={{display:"flex",alignItems:"center",gap:11}}>
                        <div style={{width:40,height:40,borderRadius:11,background:T.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{e.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{e.name}</div>
                          <div style={{fontSize:10,color:T.muted}}>Due {e.dueDay}th · {e.totalMonths-e.paidMonths}mo left</div>
                          <div className="prog"><div className="progf" style={{width:prog+"%",background:T.accent}}/></div>
                        </div>
                        <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:13,fontWeight:600,color:T.red}}>{fmt(e.amount)}</div><div style={{fontSize:9,color:T.muted}}>/mo</div></div>
                      </div>
                    );
                  })}
                  <button className="btn bo" style={{width:"100%"}} onClick={()=>openM("addEMI")}>+ Add EMI</button>
                </>
              )}

              {form._sub==="inc"&&(
                <>
                  {salaries.map(s=>(
                    <div key={s.id} className="txn" onClick={()=>openM("editSal",s)}>
                      <div className="tic" style={{background:T.green+"22"}}>{ICONS[s.category]||"💰"}</div>
                      <div className="ti"><div className="tn">{s.source}</div><div className="tm">{s.category} · {s.date}</div></div>
                      <div className="ta" style={{color:T.green}}>+{fmt(s.amount)}</div>
                    </div>
                  ))}
                  <button className="btn bo" style={{width:"100%",marginTop:9}} onClick={()=>openM("addSal")}>+ Add Income</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* FAB */}
        {(tab==="home"||tab==="exp")&&<button className="fab" onClick={()=>openM("addExp")}>+</button>}
        {tab==="more"&&<button className="fab" onClick={()=>openM("addInv")}>+</button>}

        {/* NAV */}
        <nav className="nav">
          {TABS.map(t=>(
            <button key={t.id} className={`nb ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
              <span className="ni">{t.ic}</span>{t.l}
            </button>
          ))}
        </nav>

        {/* MODALS */}
        {(modal==="addExp"||modal==="editExp")&&(
          <Overlay title={modal==="addExp"?"Add Expense":"Edit Expense"}>
            <div className="fld"><label>Description</label><input className="inp" placeholder="e.g. Lunch" value={form.name||""} onChange={sf("name")}/></div>
            <div className="fld"><label>Amount (₹)</label><input className="inp" type="number" value={form.amount||""} onChange={sf("amount")}/></div>
            <div className="g2">
              <div className="fld"><label>Category</label><select className="inp" value={form.category||"Other"} onChange={sf("category")}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fld"><label>Date</label><input className="inp" type="date" value={form.date||td()} onChange={sf("date")}/></div>
            </div>
            <BRow isEdit={modal==="editExp"} type="exp" onSave={saveExp} lbl={modal==="addExp"?"Add Expense":"Save Changes"}/>
          </Overlay>
        )}
        {(modal==="addSal"||modal==="editSal")&&(
          <Overlay title={modal==="addSal"?"Add Income":"Edit Income"}>
            <div className="fld"><label>Source</label><input className="inp" placeholder="e.g. Salary" value={form.source||""} onChange={sf("source")}/></div>
            <div className="fld"><label>Amount (₹)</label><input className="inp" type="number" value={form.amount||""} onChange={sf("amount")}/></div>
            <div className="g2">
              <div className="fld"><label>Type</label><select className="inp" value={form.category||"Salary"} onChange={sf("category")}>{["Salary","Bonus","Freelance","Business","Other"].map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="fld"><label>Date</label><input className="inp" type="date" value={form.date||td()} onChange={sf("date")}/></div>
            </div>
            <BRow isEdit={modal==="editSal"} type="sal" onSave={saveSal} lbl={modal==="addSal"?"Add Income":"Save Changes"}/>
          </Overlay>
        )}
        {(modal==="addEMI"||modal==="editEMI")&&(
          <Overlay title={modal==="addEMI"?"Add EMI":"Edit EMI"}>
            <div className="fld"><label>Name</label><input className="inp" placeholder="e.g. Home Loan" value={form.name||""} onChange={sf("name")}/></div>
            <div className="fld"><label>Monthly Amount (₹)</label><input className="inp" type="number" value={form.amount||""} onChange={sf("amount")}/></div>
            <div className="g2">
              <div className="fld"><label>Due Day</label><input className="inp" type="number" min="1" max="31" value={form.dueDay||""} onChange={sf("dueDay")}/></div>
              <div className="fld"><label>Total Months</label><input className="inp" type="number" value={form.totalMonths||""} onChange={sf("totalMonths")}/></div>
            </div>
            <div className="fld"><label>Months Paid</label><input className="inp" type="number" value={form.paidMonths||""} onChange={sf("paidMonths")}/></div>
            <BRow isEdit={modal==="editEMI"} type="emi" onSave={saveEMI} lbl={modal==="addEMI"?"Add EMI":"Save Changes"}/>
          </Overlay>
        )}
        {(modal==="addInv"||modal==="editInv")&&(
          <Overlay title={modal==="addInv"?"Add Investment":"Edit Investment"}>
            <div className="fld"><label>Name</label><input className="inp" value={form.name||""} onChange={sf("name")}/></div>
            <div className="fld"><label>Type</label><select className="inp" value={form.type||"Mutual Fund"} onChange={sf("type")}>{["Mutual Fund","Stocks","FD","PPF","Gold","NPS","RD","Crypto","Other"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="g2">
              <div className="fld"><label>Invested (₹)</label><input className="inp" type="number" value={form.invested||""} onChange={sf("invested")}/></div>
              <div className="fld"><label>Current Value (₹)</label><input className="inp" type="number" value={form.current||""} onChange={sf("current")}/></div>
            </div>
            <div className="fld"><label>Monthly SIP (₹)</label><input className="inp" type="number" value={form.monthly||""} onChange={sf("monthly")}/></div>
            <BRow isEdit={modal==="editInv"} type="inv" onSave={saveInv} lbl={modal==="addInv"?"Add Investment":"Save Changes"}/>
          </Overlay>
        )}
        {modal==="editBud"&&(
          <Overlay title="Monthly Budgets">
            {CATS.slice(0,7).map(cat=>(
              <div key={cat} className="fld"><label>{ICONS[cat]||"📦"} {cat}</label><input className="inp" type="number" placeholder="0" value={budgets[cat]||""} onChange={e=>setBudgets(b=>({...b,[cat]:+e.target.value}))}/></div>
            ))}
            <button className="btn bp" style={{width:"100%"}} onClick={closeM}>Save Budgets</button>
          </Overlay>
        )}
        {modal==="editProf"&&(
          <Overlay title="Profile & Salary">
            {[{l:"Name",k:"name"},{l:"Designation",k:"designation"},{l:"Company",k:"company"}].map(f=>(
              <div key={f.k} className="fld"><label>{f.l}</label><input className="inp" value={profile[f.k]||""} onChange={e=>setProfile(p=>({...p,[f.k]:e.target.value}))}/></div>
            ))}
            <div className="div"/>
            <div className="g2">
              {[{l:"Basic (₹)",k:"basicSalary"},{l:"HRA (₹)",k:"hra"},{l:"DA (₹)",k:"da"},{l:"TA (₹)",k:"ta"},{l:"PF (₹)",k:"pf"},{l:"TDS (₹)",k:"tds"},{l:"Prof. Tax (₹)",k:"professional"}].map(f=>(
                <div key={f.k} className="fld"><label>{f.l}</label><input className="inp" type="number" value={profile[f.k]||""} onChange={e=>setProfile(p=>({...p,[f.k]:+e.target.value}))}/></div>
              ))}
            </div>
            <button className="btn bp" style={{width:"100%"}} onClick={closeM}>Save Profile</button>
          </Overlay>
        )}
      </div>
    </>
  );
}
