import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

/* ═══════════════════════════════════════════════════════ STYLES */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#070d1a;--bg2:#0c1322;--bg3:#111a2e;
  --s1:#172038;--s2:#1e2d4a;--b1:#253c5e;--b2:#2f4e7a;
  --t1:#dceeff;--t2:#7ba3c8;--t3:#436282;
  --acc:#4fa3ff;--acc2:#7c6bff;--acc3:#ff6fa8;
  --green:#2edc8a;--orange:#ffaa3d;--red:#ff5c6e;
  --r:12px;--r2:7px;
}
html,body,#root{height:100%;background:var(--bg);color:var(--t1);font-family:'Syne',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:10px}
.app{display:flex;height:100vh}

/* sidebar */
.sidebar{width:216px;min-width:216px;background:var(--bg2);border-right:1px solid var(--b1);display:flex;flex-direction:column;padding:18px 0}
.logo{padding:0 16px 22px;display:flex;align-items:center;gap:10px}
.logo-ic{width:33px;height:33px;border-radius:8px;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;box-shadow:0 4px 12px rgba(79,163,255,.35)}
.logo-name{font-size:17px;font-weight:800;letter-spacing:-.5px}
.logo-name span{color:var(--acc)}
.nav-g{padding:0 9px;flex:1}
.nav-lbl{font-size:9px;font-weight:700;letter-spacing:1.8px;color:var(--t3);text-transform:uppercase;padding:6px 8px 4px}
.ni{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:var(--r2);cursor:pointer;transition:.12s;color:var(--t2);font-size:13px;font-weight:500;border:1px solid transparent;user-select:none}
.ni:hover{background:var(--s1);color:var(--t1)}
.ni.on{background:linear-gradient(135deg,rgba(79,163,255,.14),rgba(124,107,255,.1));color:var(--acc);border-color:rgba(79,163,255,.22)}
.ndot{width:6px;height:6px;border-radius:50%;background:var(--green);margin-left:auto;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.sb-bot{padding:9px}
.streak{padding:11px;border-radius:var(--r);background:linear-gradient(135deg,rgba(255,111,168,.1),rgba(255,170,61,.07));border:1px solid rgba(255,111,168,.2)}
.sbar{margin-top:7px;height:4px;background:var(--s2);border-radius:10px;overflow:hidden}
.sfill{height:100%;width:71%;background:linear-gradient(90deg,var(--acc3),var(--orange));border-radius:10px}

/* main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{padding:13px 22px;background:var(--bg2);border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0}
.pt{font-size:17px;font-weight:700;letter-spacing:-.3px;white-space:nowrap}
.tr{display:flex;gap:7px;align-items:center}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:var(--r2);border:none;cursor:pointer;font-size:12px;font-family:'Syne',sans-serif;font-weight:600;transition:.12s;white-space:nowrap;user-select:none}
.bp{background:var(--acc);color:#05101f}.bp:hover{background:#6cb5ff;transform:translateY(-1px)}
.bg{background:var(--s1);color:var(--t2);border:1px solid var(--b1)}.bg:hover{background:var(--s2);color:var(--t1)}
.bd{background:rgba(255,92,110,.1);color:var(--red);border:1px solid rgba(255,92,110,.22)}.bd:hover{background:rgba(255,92,110,.2)}
.bgreen{background:rgba(46,220,138,.1);color:var(--green);border:1px solid rgba(46,220,138,.22)}
.bsm{padding:4px 9px;font-size:11px}.bic{padding:5px}

/* content */
.cnt{flex:1;overflow-y:auto;padding:20px 22px}
.card{background:var(--bg3);border:1px solid var(--b1);border-radius:var(--r);padding:15px;transition:.15s}
.card:hover{border-color:var(--b2)}
.clbl{font-size:9.5px;font-weight:700;color:var(--t3);letter-spacing:1.2px;text-transform:uppercase;margin-bottom:5px}
.cval{font-size:26px;font-weight:800;letter-spacing:-1px;line-height:1}
.csub{font-size:11px;color:var(--t3);margin-top:3px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:14px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:14px}
.pbar{height:4px;background:var(--s2);border-radius:10px;overflow:hidden;margin-top:7px}
.pf{height:100%;border-radius:10px;transition:width .5s}
.sh{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:11px;display:flex;align-items:center;justify-content:space-between}
.ti{display:flex;align-items:center;gap:9px;padding:9px 11px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r2);margin-bottom:5px;transition:.12s}
.ti:hover{background:var(--s2);border-color:var(--b2)}.ti.dn{opacity:.45}
.chk{width:19px;height:19px;border-radius:50%;border:2px solid var(--b2);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;transition:.15s;font-size:10px}
.chk.on{background:var(--green);border-color:var(--green);color:#05101f}
.sug{display:flex;gap:9px;padding:9px 12px;background:rgba(79,163,255,.07);border:1px solid rgba(79,163,255,.17);border-radius:var(--r2);margin-bottom:7px;font-size:12px;color:var(--t2)}

/* calendar */
.cwrap{display:flex;flex-direction:column;height:calc(100vh - 57px);overflow:hidden}
.chead{display:flex;align-items:center;gap:7px;padding:9px 14px;border-bottom:1px solid var(--b1);background:var(--bg2);flex-shrink:0;flex-wrap:wrap}
.cnav{width:27px;height:27px;border-radius:6px;border:1px solid var(--b1);background:var(--s1);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);font-size:13px;transition:.12s}
.cnav:hover{background:var(--s2);color:var(--t1)}
.ctabs{display:flex;gap:2px;margin-left:auto}
.ctab{padding:4px 10px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;color:var(--t2);transition:.12s;border:1px solid transparent;user-select:none}
.ctab.on{background:var(--s2);color:var(--acc);border-color:var(--b2)}
.ctab:hover:not(.on){color:var(--t1);background:var(--s1)}

/* month */
.month-out{flex:1;overflow:auto}
.mgrid{display:grid;grid-template-columns:repeat(7,1fr)}
.mhdr{padding:7px;text-align:center;font-size:10px;font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid var(--b1);border-right:1px solid var(--b1);background:var(--bg2);position:sticky;top:0;z-index:5}
.mcell{border-right:1px solid var(--b1);border-bottom:1px solid var(--b1);padding:5px;min-height:88px;cursor:default;transition:.1s}
.mcell.dov{background:rgba(79,163,255,.1)!important;outline:1px dashed var(--acc)}
.mcell.tod{background:rgba(79,163,255,.05)}
.mcell.om{opacity:.3}
.mdn{font-size:12px;font-weight:700;color:var(--t2);width:21px;height:21px;display:flex;align-items:center;justify-content:center;border-radius:50%;margin-bottom:3px}
.mdn.td{background:var(--acc);color:#05101f}
.chip{font-size:11px;padding:2px 6px;border-radius:4px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:grab;user-select:none;border:1px solid transparent;transition:.1s}
.chip:active{cursor:grabbing;opacity:.5}
.chip.cdone{text-decoration:line-through;opacity:.45}

/* week */
.wout{display:flex;flex:1;overflow:hidden}
.wtimecol{width:48px;flex-shrink:0;border-right:1px solid var(--b1);background:var(--bg2);overflow:hidden}
.wthdr{height:46px;border-bottom:1px solid var(--b1)}
.wts{height:60px;display:flex;align-items:flex-start;justify-content:flex-end;padding:3px 5px 0;font-size:10px;color:var(--t3);font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(37,60,94,.3)}
.wscroll{flex:1;overflow:auto}
.winner{display:grid;grid-template-columns:repeat(7,1fr);min-width:560px}
.wdhrow{display:grid;grid-template-columns:repeat(7,1fr);grid-column:1/-1;position:sticky;top:0;background:var(--bg2);border-bottom:1px solid var(--b1);z-index:10}
.wdh{padding:7px 4px;text-align:center;border-right:1px solid var(--b1)}
.wdn{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase}
.wdd{font-size:15px;font-weight:800;color:var(--t2);margin-top:1px}
.wdd.td{background:var(--acc);color:#05101f;width:25px;height:25px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:1px auto 0}
.wdcol{border-right:1px solid var(--b1);position:relative;grid-row:2}
.whour{height:60px;border-bottom:1px solid rgba(37,60,94,.3);transition:.1s}
.whour.dov{background:rgba(79,163,255,.1)}
.wblock{position:absolute;left:3px;right:3px;border-radius:5px;padding:3px 6px;cursor:grab;font-size:11px;font-weight:600;overflow:hidden;z-index:5;user-select:none;border-left:3px solid transparent}
.wblock:hover{filter:brightness(1.2);z-index:10}
.wblock:active{cursor:grabbing;opacity:.5}

/* notes */
.nwrap{display:flex;height:calc(100vh - 57px);overflow:hidden}
.fp{width:190px;min-width:190px;border-right:1px solid var(--b1);overflow-y:auto;padding:9px;flex-shrink:0}
.nlp{width:190px;min-width:190px;border-right:1px solid var(--b1);overflow-y:auto;padding:9px;flex-shrink:0}
.ep{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.fi{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:var(--r2);cursor:pointer;font-size:12px;color:var(--t2);transition:.1s;user-select:none}
.fi:hover{background:var(--s1);color:var(--t1)}.fi.on{background:rgba(79,163,255,.1);color:var(--acc)}
.nc{padding:8px 10px;border-radius:var(--r2);cursor:pointer;margin-bottom:4px;border:1px solid transparent;transition:.1s}
.nc:hover{background:var(--s1);border-color:var(--b1)}.nc.on{background:rgba(79,163,255,.09);border-color:rgba(79,163,255,.24)}
.ehead{padding:12px 17px;border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:9px;flex-shrink:0}
.ebody{flex:1;overflow-y:auto;padding:17px}
.ep-md h1{font-size:20px;color:var(--t1);margin-bottom:9px}
.ep-md h2{font-size:15px;color:var(--t1);margin:11px 0 5px}
.ep-md p{font-size:13px;color:var(--t2);margin-bottom:7px;line-height:1.8}
.ep-md ul{padding-left:15px;margin-bottom:7px}
.ep-md li{font-size:13px;color:var(--t2);margin-bottom:3px;line-height:1.7}
.ep-md code{background:var(--s2);padding:2px 5px;border-radius:4px;color:var(--acc);font-size:12px;font-family:'JetBrains Mono',monospace}
.nlink{color:var(--acc);text-decoration:underline;cursor:pointer}
.tag{display:inline-flex;padding:2px 6px;background:var(--s2);border:1px solid var(--b1);border-radius:20px;font-size:10px;color:var(--t2);margin:2px}
.etxt{width:100%;height:100%;min-height:360px;background:transparent;border:none;outline:none;color:var(--t1);font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.8;resize:none}

/* timer */
.twrap{display:flex;flex-direction:column;align-items:center;padding:26px 20px;max-width:440px;margin:0 auto}
.tring{position:relative;width:200px;height:200px;margin-bottom:20px}
.tsvg{position:absolute;top:0;left:0;transform:rotate(-90deg)}
.tinner{position:absolute;top:16px;left:16px;width:168px;height:168px;border-radius:50%;background:var(--bg3);display:flex;flex-direction:column;align-items:center;justify-content:center}
.ttime{font-size:40px;font-weight:800;font-family:'JetBrains Mono',monospace;letter-spacing:-2px;line-height:1}
.pdots{display:flex;gap:7px;margin-bottom:20px}
.pdot{width:9px;height:9px;border-radius:50%;background:var(--s2);transition:.3s}
.pdot.on{background:var(--acc)}
.tctrl{display:flex;align-items:center;gap:13px;margin-bottom:20px}
.tbig{width:58px;height:58px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 20px rgba(79,163,255,.35);transition:.12s;font-size:22px}
.tbig:hover{transform:scale(1.07)}
.tsml{width:40px;height:40px;border-radius:50%;border:1px solid var(--b2);background:var(--s1);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);transition:.12s;font-size:16px}
.tsml:hover{background:var(--s2);color:var(--t1)}
.qn{width:100%;max-width:320px;padding:9px 12px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);color:var(--t1);font-family:'JetBrains Mono',monospace;font-size:12px;resize:none;outline:none;transition:.12s}
.qn:focus{border-color:var(--acc)}

/* stats */
.tabs{display:flex;gap:2px;padding:3px;background:var(--s1);border-radius:var(--r2);margin-bottom:13px;width:fit-content}
.stab{padding:5px 13px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;color:var(--t2);transition:.12s;user-select:none}
.stab.on{background:var(--bg3);color:var(--acc);box-shadow:0 1px 4px rgba(0,0,0,.4)}
.hmap{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.hcell{aspect-ratio:1;border-radius:3px;transition:.12s;cursor:default}
.hcell:hover{transform:scale(1.3)}

/* goals */
.bgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.bitem{background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:12px 9px;text-align:center;transition:.15s}
.bitem.ok{border-color:rgba(79,163,255,.3);background:rgba(79,163,255,.06)}
.bitem.lock{opacity:.35;filter:grayscale(1)}

/* modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(5px)}
.mdl{background:var(--bg3);border:1px solid var(--b2);border-radius:var(--r);padding:22px;width:390px;max-width:92vw;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:mIn .16s ease}
@keyframes mIn{from{opacity:0;transform:scale(.95) translateY(7px)}to{opacity:1;transform:none}}
.mt{font-size:14px;font-weight:700;margin-bottom:16px}
.fg{margin-bottom:11px}
.fl{font-size:11px;font-weight:600;color:var(--t2);margin-bottom:4px;display:block}
.fi2{width:100%;padding:8px 10px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r2);outline:none;color:var(--t1);font-size:13px;font-family:'Syne',sans-serif;transition:.12s}
.fi2:focus{border-color:var(--acc)}
select.fi2 option{background:var(--bg3)}
@keyframes fu{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
.fade{animation:fu .2s ease}
.empty{text-align:center;padding:38px;color:var(--t3)}
`

/* ═══════════════════════════════════════════════════════ HELPERS */
const t0 = new Date(); t0.setHours(0,0,0,0)
const dk  = d => { const x=new Date(d); x.setHours(0,0,0,0); return x.toISOString().slice(0,10) }
const add = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
const uid = () => Date.now()+Math.floor(Math.random()*9999)
const timeToMins = t => { const [h,m]=(t||"0:0").split(":").map(Number); return h*60+m }
const getStartMins = t => t.startTime ? timeToMins(t.startTime) : (t.hour||9)*60
const getEndMins   = t => t.endTime   ? timeToMins(t.endTime)   : ((t.hour||9)+(t.dur||1))*60
const PC = {high:"#ff5c6e",medium:"#ffaa3d",low:"#2edc8a"}
const PL = {high:"🔴 Yüksek",medium:"🟡 Orta",low:"🟢 Düşük"}
const NOTE_TPLS = {
  blank:  {name:"Boş",       body:""},
  lecture:{name:"Ders Notu", body:"**Tarih:** \n**Hoca:** \n\n## Konu\n\n## Önemli Noktalar\n- \n\n## Sorular\n- \n\n## Özet\n"},
  meeting:{name:"Toplantı",  body:"**Tarih:** \n**Katılımcılar:** \n\n## Gündem\n\n## Notlar\n\n## Eylem Maddeleri\n- \n"},
  problem:{name:"Problem",   body:"## Tanım\n\n## Yaklaşım\n1. \n\n## Çözüm\n\n## Sonuç\n"},
}
const COLORS = ["#4fa3ff","#7c6bff","#ff6fa8","#2edc8a","#ffaa3d","#ff5c6e","#a78bfa"]
const DNS = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"]
const HRS = Array.from({length:17},(_,i)=>i+7)

function renderInline(text, onLink) {
  return text.split(/(\[\[.+?\]\]|`[^`]+`|\*\*[^*]+\*\*)/g).map((p,j)=>{
    if (p.startsWith("[[")&&p.endsWith("]]")){ const t=p.slice(2,-2); return <span key={j} className="nlink" onClick={()=>onLink?.(t)}>{t}</span> }
    if (p.startsWith("`")&&p.endsWith("`")) return <code key={j}>{p.slice(1,-1)}</code>
    if (p.startsWith("**")&&p.endsWith("**")) return <strong key={j}>{p.slice(2,-2)}</strong>
    return p
  })
}
function renderMd(text, onLink) {
  if (!text) return null
  const lines = text.split("\n"); const out = []; let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith("|") && line.includes("|",1)) {
      const tls=[]; while(i<lines.length&&lines[i].trim().startsWith("|")){tls.push(lines[i]);i++}
      const isDiv=l=>/^\s*\|[\s\-:|]+\|\s*$/.test(l)
      const cells=l=>l.split("|").slice(1,-1).map(c=>c.trim())
      const hdr=tls.find(l=>!isDiv(l)); const rows=tls.filter(l=>!isDiv(l)&&l!==hdr)
      out.push(<div key={`t${i}`} style={{overflowX:"auto",marginBottom:10}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13}}>
          {hdr&&<thead><tr>{cells(hdr).map((c,ci)=><th key={ci} style={{padding:"6px 12px",background:"var(--s2)",border:"1px solid var(--b1)",color:"var(--t1)",fontWeight:700,textAlign:"left"}}>{c}</th>)}</tr></thead>}
          <tbody>{rows.map((r,ri)=><tr key={ri}>{cells(r).map((c,ci)=><td key={ci} style={{padding:"5px 12px",border:"1px solid var(--b1)",color:"var(--t2)"}}>{c}</td>)}</tr>)}</tbody>
        </table></div>); continue
    }
    if (line.startsWith("# "))  { out.push(<h1 key={i}>{renderInline(line.slice(2),onLink)}</h1>); i++; continue }
    if (line.startsWith("## ")) { out.push(<h2 key={i}>{renderInline(line.slice(3),onLink)}</h2>); i++; continue }
    if (line.startsWith("### ")){ out.push(<h3 key={i} style={{fontSize:13,color:"var(--t1)",margin:"8px 0 4px"}}>{renderInline(line.slice(4),onLink)}</h3>); i++; continue }
    if (line.startsWith("> "))  { out.push(<blockquote key={i} style={{borderLeft:"3px solid var(--acc)",paddingLeft:12,color:"var(--t2)",fontSize:13,margin:"6px 0"}}>{line.slice(2)}</blockquote>); i++; continue }
    if (line.startsWith("- ")||line.startsWith("* ")){ out.push(<ul key={i}><li style={{color:"var(--t2)",fontSize:13,lineHeight:1.7}}>{renderInline(line.slice(2),onLink)}</li></ul>); i++; continue }
    if (/^\d+\. /.test(line)){ out.push(<ol key={i} style={{paddingLeft:16,marginBottom:4}}><li style={{color:"var(--t2)",fontSize:13,lineHeight:1.7}}>{renderInline(line.replace(/^\d+\. /,""),onLink)}</li></ol>); i++; continue }
    if (!line.trim()){ out.push(<br key={i}/>); i++; continue }
    out.push(<p key={i}>{renderInline(line,onLink)}</p>); i++
  }
  return out
}

const SV = (d,p) => d.reduce((s,k)=>({ ...s,[k]:null }),{})
const I={
  home:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  notes:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  cal:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  timer:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chart:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  tgt:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  plus:"M12 4v16m8-8H4",trash:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  edit:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  x:"M6 18L18 6M6 6l12 12",cl:"M15 19l-7-7 7-7",cr:"M9 5l7 7-7 7"
}
const Ic = ({n,sz=15,col})=>(
  <svg width={sz} height={sz} fill="none" viewBox="0 0 24 24" stroke={col||"currentColor"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d={I[n]}/>
  </svg>
)

/* ═══════════════════════════════════════════════════════ LOCAL STORAGE */
function useLS(key, init) {
  const [val,set] = useState(()=>{ try{ const s=localStorage.getItem(key); return s?JSON.parse(s):init }catch{ return init }})
  useEffect(()=>{ try{ localStorage.setItem(key,JSON.stringify(val)) }catch{} },[key,val])
  return [val,set]
}

/* ═══════════════════════════════════════════════════════ INIT DATA */
const I_FOLD=[
  {id:1,name:"CENG Dersler",pid:null},{id:2,name:"Veri Yapıları",pid:1},
  {id:3,name:"OOP",pid:1},{id:4,name:"Veritabanı",pid:1},
]
const I_NOTES=[
  {id:1,fid:2,title:"Binary Tree",tags:["tree","algoritma"],ts:7200,upd:"24 Şub",
   body:"# Binary Tree\n\nBinary tree, her düğümün en fazla `iki çocuğu` olan bir ağaç yapısıdır.\n\n## Özellikler\n- Sol alt ağaç küçük değerleri\n- Sağ alt ağaç büyük değerleri\n\nBu konu [[Graph Algoritmaları]] ile bağlantılıdır."},
  {id:2,fid:2,title:"Graph Algoritmaları",tags:["graph","bfs"],ts:5400,upd:"25 Şub",
   body:"# Graph Algoritmaları\n\n## BFS\nQueue kullanır, level by level gezinir.\n\n## DFS\nStack kullanır, bir dalı sonuna kadar iner."},
  {id:3,fid:3,title:"OOP Temelleri",tags:["oop"],ts:3600,upd:"23 Şub",
   body:"# OOP Temelleri\n\n## Encapsulation\nVerileri sınıf içinde saklamak.\n\n## Inheritance\nBir sınıfın başka sınıftan özellik alması."},
]
const I_TASKS=[
  {id:1,title:"Binary Tree çalış",date:dk(t0),hour:9,dur:2,done:false,color:"#4fa3ff"},
  {id:2,title:"Graph BFS/DFS",date:dk(t0),hour:11,dur:1,done:false,color:"#7c6bff"},
  {id:3,title:"OOP ödev",date:dk(add(t0,1)),hour:14,dur:1,done:false,color:"#ff6fa8"},
  {id:4,title:"Veritabanı okuma",date:dk(add(t0,2)),hour:10,dur:2,done:false,color:"#2edc8a"},
  {id:5,title:"Algoritma tekrar",date:dk(add(t0,-1)),hour:16,dur:1,done:true,color:"#ffaa3d"},
]
const I_GOALS=[
  {id:1,title:"Haftalık 25 Saat",target:25,cur:18.3,color:"#4fa3ff"},
  {id:2,title:"7 Günlük Streak",target:7,cur:5,color:"#ff6fa8"},
  {id:3,title:"30 Not Al",target:30,cur:3,color:"#2edc8a"},
]

/* ═══════════════════════════════════════════════════════ CONTEXT */
const Ctx = createContext(null)

/* ═══════════════════════════════════════════════════════ GlobalSearch */

function GlobalSearch() {
  const {notes,tasks,setPage,setSelNote,setSelFolder,setEditTxt,setEditTitle,setEditMode,setModal} = useContext(Ctx)
  const [open,setOpen] = useState(false)
  const [q,setQ]       = useState("")
  const ref            = useRef(null)

  useEffect(()=>{
    const h = e => {
      if (e.ctrlKey && e.key==="f") { e.preventDefault(); setOpen(true); setQ(""); setTimeout(()=>ref.current?.focus(),50) }
      if (e.key==="Escape") setOpen(false)
    }
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h)
  },[])

  if (!open) return null
  const nRes = q ? notes.filter(n=>n.title.toLowerCase().includes(q.toLowerCase())||n.body.toLowerCase().includes(q.toLowerCase())).slice(0,6) : []
  const tRes = q ? tasks.filter(t=>t.title.toLowerCase().includes(q.toLowerCase())).slice(0,6) : []

  return (
    <div className="ov" style={{zIndex:500}} onClick={()=>setOpen(false)}>
      <div style={{width:520,maxWidth:"92vw",background:"var(--bg3)",border:"1px solid var(--b2)",borderRadius:12,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.7)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid var(--b1)"}}>
          <span style={{fontSize:15}}>🔍</span>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Not veya görev ara..." style={{flex:1,background:"transparent",border:"none",outline:"none",color:"var(--t1)",fontSize:14,fontFamily:"Syne"}}/>
          <kbd style={{fontSize:11,color:"var(--t3)",background:"var(--s2)",padding:"2px 6px",borderRadius:4}}>ESC</kbd>
        </div>
        {q ? (
          <div style={{maxHeight:400,overflowY:"auto",padding:8}}>
            {nRes.length>0&&<>
              <div style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase",padding:"6px 10px 3px"}}>Notlar</div>
              {nRes.map(n=>(
                <div key={n.id} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer"}} onMouseOver={e=>e.currentTarget.style.background="var(--s1)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>{setPage("notes");setSelFolder(n.fid);setSelNote(n);setEditTxt(n.body);setEditTitle(n.title);setEditMode(false);setOpen(false)}}>
                  <div style={{fontSize:13,fontWeight:600}}>📄 {n.title}</div>
                  <div style={{fontSize:11,color:"var(--t3)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.body.slice(0,80)}</div>
                </div>
              ))}
            </>}
            {tRes.length>0&&<>
              <div style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase",padding:"6px 10px 3px"}}>Görevler</div>
              {tRes.map(t=>(
                <div key={t.id} style={{padding:"8px 10px",borderRadius:7,cursor:"pointer",display:"flex",alignItems:"center",gap:8}} onMouseOver={e=>e.currentTarget.style.background="var(--s1)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}
                  onClick={()=>{setPage("calendar");setOpen(false)}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                  <div style={{fontSize:13,fontWeight:600,flex:1}}>{t.title}</div>
                  {t.priority&&<span style={{fontSize:11}}>{PL[t.priority]}</span>}
                  <div style={{fontSize:11,color:"var(--t3)"}}>{t.date}</div>
                </div>
              ))}
            </>}
            {nRes.length===0&&tRes.length===0&&<div style={{textAlign:"center",padding:"24px",color:"var(--t3)"}}>Sonuç bulunamadı</div>}
          </div>
        ):(
          <div style={{padding:"18px 22px"}}>
            <div style={{fontSize:11,color:"var(--t3)",marginBottom:12,fontWeight:700,letterSpacing:1}}>KLAVYE KISAYOLLARI</div>
            {[["Ctrl+N","Yeni Not"],["Ctrl+T","Yeni Görev"],["Ctrl+F","Arama Aç"],["Ctrl+P","Zamanlayıcı"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid var(--b1)"}}>
                <kbd style={{background:"var(--s2)",padding:"2px 9px",borderRadius:4,fontSize:12,color:"var(--t1)"}}>{k}</kbd>
                <span style={{fontSize:12,color:"var(--t2)"}}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ MODAL (own state) */
function Modal() {
  const {modal,setModal,modalTask,folders,notes,setNotes,setTasks,setGoals,setFolders,selFolder,setSelFolder,setSelNote,setEditMode,setEditTxt,setEditTitle} = useContext(Ctx)
  const [f,setF]     = useState({})
  const [tpl,setTpl] = useState("blank")
  useEffect(()=>{ setF({}); setTpl("blank") },[modal])
  if (!modal) return null
  const upd = (k,v) => setF(x=>({...x,[k]:v}))

  /* ── GÖREV DETAY ── */
  if (modal==="td" && modalTask) {
    const t = modalTask
    const st = t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`
    const et = t.endTime||`${String((t.hour||9)+(t.dur||1)).padStart(2,"0")}:00`
    return (
      <div className="ov" onClick={e=>e.target.className==="ov"&&setModal(null)}>
        <div className="mdl">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:t.color}}/>
              <span style={{fontSize:14,fontWeight:700}}>{t.title}</span>
            </div>
            <button className="btn bg bic bsm" onClick={()=>setModal(null)}><Ic n="x" sz={13}/></button>
          </div>
          <div style={{color:"var(--t2)",fontSize:13,lineHeight:2.1,background:"var(--s1)",borderRadius:8,padding:"10px 14px",marginBottom:12}}>
            <div>📅 {t.date}</div>
            <div>⏰ {st} — {et}</div>
            {t.priority&&<div>{PL[t.priority]}</div>}
            {t.recurring&&t.recurring!=="none"&&<div>🔁 {t.recurring==="daily"?"Her gün":t.recurring==="weekly"?"Her hafta":"Her ay"}</div>}
            {t.desc&&<div style={{marginTop:6,paddingTop:6,borderTop:"1px solid var(--b1)",color:"var(--t3)"}}>{t.desc}</div>}
          </div>
          <div style={{display:"flex",gap:7}}>
            <button className="btn bg bsm" style={{flex:1}} onClick={()=>setModal("editTask")}>✏️ Düzenle</button>
            <button className="btn bgreen" style={{flex:1}} onClick={()=>{setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x));setModal(null)}}>
              {t.done?"⬜ Geri Al":"✅ Tamamla"}
            </button>
            <button className="btn bd" onClick={()=>{setTasks(ts=>ts.filter(x=>x.id!==t.id));setModal(null)}}><Ic n="trash" sz={13}/></button>
          </div>
        </div>
      </div>
    )
  }

  /* ── FORM MODALLER ── */
  const CFGS = {
    task:{ title:"Görev Ekle", sub:()=>{
      const st=f.startTime||"09:00", et=f.endTime||"10:00"
      const base={id:uid(),title:f.title||"Görev",date:f.date||dk(t0),startTime:st,endTime:et,
        hour:parseInt(st.split(":")[0]),dur:Math.max(1,Math.round((timeToMins(et)-timeToMins(st))/60)),
        done:false,color:f.color||"#4fa3ff",desc:f.desc||"",priority:f.priority||"medium",recurring:f.recurring||"none"}
      const arr=[], bd=new Date(f.date||dk(t0))
      if(base.recurring==="none") arr.push({...base,id:uid()})
      else if(base.recurring==="daily")   for(let i=0;i<30;i++) arr.push({...base,id:uid(),date:dk(add(bd,i))})
      else if(base.recurring==="weekly")  for(let i=0;i<8;i++)  arr.push({...base,id:uid(),date:dk(add(bd,i*7))})
      else if(base.recurring==="monthly") for(let i=0;i<6;i++){const d=new Date(bd);d.setMonth(d.getMonth()+i);arr.push({...base,id:uid(),date:dk(d)})}
      setTasks(ts=>[...ts,...arr])
    }},
    editTask:{ title:"Görevi Düzenle", sub:()=>{
      setTasks(ts=>ts.map(t=>{
        if(t.id!==modalTask?.id) return t
        const st=f.startTime||t.startTime||"09:00"
        const et=f.endTime||t.endTime||"10:00"
        return {...t,
          title:f.title||t.title,
          date:f.date||t.date,
          startTime:st, endTime:et,
          hour:parseInt(st.split(":")[0]),
          dur:Math.max(1,Math.round((timeToMins(et)-timeToMins(st))/60)),
          desc:f.desc!==undefined?f.desc:t.desc,
          priority:f.priority||t.priority,
          color:f.color||t.color,
        }
      }))
    }},
    note:{ title:"Yeni Not", sub:()=>{
      const id=uid(), fid=parseInt(f.fid)||selFolder
      const body=`# ${f.title||"Yeni Not"}\n\n${NOTE_TPLS[tpl]?.body||""}`
      const n={id,fid,title:f.title||"Yeni Not",tags:(f.tags||"").split(",").map(t=>t.trim()).filter(Boolean),ts:0,upd:"Bugün",body}
      setNotes(ns=>[...ns,n]); setSelFolder(fid); setSelNote(n); setEditTxt(n.body); setEditTitle(n.title); setEditMode(true)
    }},
    folder:{ title:"Yeni Klasör", sub:()=>{
      setFolders(fs=>[...fs,{id:uid(),name:f.name||"Klasör",pid:f.pid?Number(f.pid):null}])
    }},
    goal:{ title:"Yeni Hedef", sub:()=>{
      setGoals(gs=>[...gs,{id:uid(),title:f.title||"Hedef",target:parseFloat(f.target)||10,cur:0,color:f.color||"#4fa3ff"}])
    }},
  }
  const cfg = CFGS[modal]; if(!cfg) return null
  const submit = ()=>{ cfg.sub(); setModal(null) }

  return (
    <div className="ov" onClick={e=>e.target.className==="ov"&&setModal(null)}>
      <div className="mdl" onClick={e=>e.stopPropagation()}>
        <div className="mt">{cfg.title}</div>

        {/* GÖREV EKLE */}
        {modal==="task"&&<>
          <div className="fg"><label className="fl">Görev Adı</label>
            <input className="fi2" placeholder="Veri Yapıları çalış..." value={f.title||""} onChange={e=>upd("title",e.target.value)}/></div>
          <div className="fg"><label className="fl">Tarih</label>
            <input className="fi2" type="date" value={f.date||dk(t0)} onChange={e=>upd("date",e.target.value)}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="fg"><label className="fl">Başlangıç</label>
              <input className="fi2" type="time" value={f.startTime||"09:00"} onChange={e=>upd("startTime",e.target.value)}/></div>
            <div className="fg"><label className="fl">Bitiş</label>
              <input className="fi2" type="time" value={f.endTime||"10:00"} onChange={e=>upd("endTime",e.target.value)}/></div>
          </div>
          <div className="fg"><label className="fl">Açıklama</label>
            <textarea className="fi2" rows={2} placeholder="Görev açıklaması..." value={f.desc||""} onChange={e=>upd("desc",e.target.value)} style={{resize:"none"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="fg"><label className="fl">Öncelik</label>
              <select className="fi2" value={f.priority||"medium"} onChange={e=>upd("priority",e.target.value)}>
                <option value="high">🔴 Yüksek</option>
                <option value="medium">🟡 Orta</option>
                <option value="low">🟢 Düşük</option>
              </select></div>
            <div className="fg"><label className="fl">Tekrar</label>
              <select className="fi2" value={f.recurring||"none"} onChange={e=>upd("recurring",e.target.value)}>
                <option value="none">Yok</option>
                <option value="daily">Her Gün</option>
                <option value="weekly">Her Hafta</option>
                <option value="monthly">Her Ay</option>
              </select></div>
          </div>
          <div className="fg"><label className="fl">Renk</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
              {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",outline:f.color===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
            </div></div>
        </>}

        {/* GÖREV DÜZENLE */}
        {modal==="editTask"&&modalTask&&(()=>{
          const t=modalTask
          return <>
            <div className="fg"><label className="fl">Görev Adı</label>
              <input className="fi2" defaultValue={t.title} onChange={e=>upd("title",e.target.value)}/></div>
            <div className="fg"><label className="fl">Tarih</label>
              <input className="fi2" type="date" defaultValue={t.date} onChange={e=>upd("date",e.target.value)}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div className="fg"><label className="fl">Başlangıç</label>
                <input className="fi2" type="time" defaultValue={t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`} onChange={e=>upd("startTime",e.target.value)}/></div>
              <div className="fg"><label className="fl">Bitiş</label>
                <input className="fi2" type="time" defaultValue={t.endTime||`${String((t.hour||9)+(t.dur||1)).padStart(2,"0")}:00`} onChange={e=>upd("endTime",e.target.value)}/></div>
            </div>
            <div className="fg"><label className="fl">Açıklama</label>
              <textarea className="fi2" rows={2} defaultValue={t.desc||""} onChange={e=>upd("desc",e.target.value)} style={{resize:"none"}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div className="fg"><label className="fl">Öncelik</label>
                <select className="fi2" defaultValue={t.priority||"medium"} onChange={e=>upd("priority",e.target.value)}>
                  <option value="high">🔴 Yüksek</option>
                  <option value="medium">🟡 Orta</option>
                  <option value="low">🟢 Düşük</option>
                </select></div>
            </div>
            <div className="fg"><label className="fl">Renk</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
                {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",outline:(f.color||t.color)===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
              </div></div>
          </>
        })()}

        {/* YENİ NOT */}
        {modal==="note"&&<>
          <div className="fg"><label className="fl">Şablon</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
              {Object.entries(NOTE_TPLS).map(([k,v])=>(
                <div key={k} onClick={()=>setTpl(k)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${tpl===k?"var(--acc)":"var(--b1)"}`,background:tpl===k?"rgba(79,163,255,.1)":"var(--s1)",cursor:"pointer",fontSize:12,color:tpl===k?"var(--acc)":"var(--t2)",transition:".1s"}}>{v.name}</div>
              ))}
            </div></div>
          <div className="fg"><label className="fl">Not Başlığı</label>
            <input className="fi2" placeholder="Binary Tree..." value={f.title||""} onChange={e=>upd("title",e.target.value)}/></div>
          <div className="fg"><label className="fl">Klasör</label>
            <select className="fi2" value={f.fid||selFolder} onChange={e=>upd("fid",e.target.value)}>
              {folders.map(fl=><option key={fl.id} value={fl.id}>{fl.name}</option>)}
            </select></div>
          <div className="fg"><label className="fl">Etiketler (virgülle ayır)</label>
            <input className="fi2" placeholder="tree, algoritma" value={f.tags||""} onChange={e=>upd("tags",e.target.value)}/></div>
        </>}

        {/* YENİ KLASÖR */}
        {modal==="folder"&&<>
          <div className="fg"><label className="fl">Klasör Adı</label>
            <input className="fi2" placeholder="Algoritma..." value={f.name||""} onChange={e=>upd("name",e.target.value)}/></div>
          <div className="fg"><label className="fl">Üst Klasör</label>
            <select className="fi2" value={f.pid||""} onChange={e=>upd("pid",e.target.value)}>
              <option value="">— Yok —</option>
              {folders.map(fl=><option key={fl.id} value={fl.id}>{fl.name}</option>)}
            </select></div>
        </>}

        {/* YENİ HEDEF */}
        {modal==="goal"&&<>
          <div className="fg"><label className="fl">Hedef Adı</label>
            <input className="fi2" placeholder="Haftalık 25 saat..." value={f.title||""} onChange={e=>upd("title",e.target.value)}/></div>
          <div className="fg"><label className="fl">Hedef Değer</label>
            <input className="fi2" type="number" placeholder="25" value={f.target||""} onChange={e=>upd("target",e.target.value)}/></div>
          <div className="fg"><label className="fl">Renk</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
              {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,cursor:"pointer",outline:f.color===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
            </div></div>
        </>}

        <div style={{display:"flex",gap:8,marginTop:6}}>
          <button className="btn bp" style={{flex:1}} onClick={submit}>
            {modal==="editTask"?"Kaydet":"Ekle"}
          </button>
          <button className="btn bg" onClick={()=>setModal(null)}>İptal</button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ TIMER PAGE (own state - no re-render leak) */
function TimerPage() {
  const {notes,setNotes,selNote,
    tRunning:running,setTRunning:setRunning,
    tMode:mode,setTMode:setMode,
    tSecs:secs,setTSecs:setSecs,
    tPomos:pomos,setTPomos:setPomos,
    tWorkMin,setTWorkMin,tBreakMin,setTBreakMin,
    tDnd,setTDnd,tRef:ref
  } = useContext(Ctx)

  const [qn,setQn] = useState("")
  const WORK=tWorkMin*60, BRK=tBreakMin*60

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`
  const tot=mode==="work"?WORK:BRK
  const circ=2*Math.PI*100
  const dash=circ-((tot-secs)/tot)*circ
  const mc=mode==="work"?"var(--acc)":"var(--green)"

  const addToNote=()=>{
    if(!selNote||!qn.trim())return
    const upd={...selNote,body:selNote.body+"\n\n> 💡 "+qn}
    setNotes(ns=>ns.map(n=>n.id===selNote.id?upd:n))
    setQn("")
  }

  return (
    <div className="cnt">
      <div className="twrap fade">
        <div style={{marginBottom:15,textAlign:"center"}}>
          <div style={{fontSize:10,color:"var(--t3)",marginBottom:7,fontWeight:700,letterSpacing:1}}>ÇALIŞILAN KONU</div>
          <select className="fi2" style={{width:220,textAlign:"center"}}>
            <option>— Not seç —</option>
            {notes.map(n=><option key={n.id}>{n.title}</option>)}
          </select>
        </div>

        {/* Süre ayarları */}
        <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"flex-end"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:4,fontWeight:700}}>ÇALIŞMA (dk)</div>
            <input type="number" min="1" max="90" value={tWorkMin}
              onChange={e=>{
                const v=Number(e.target.value)
                setTWorkMin(v)
                if(!running&&mode==="work") setSecs(v*60)
              }}
              style={{width:60,textAlign:"center",background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:6,color:"var(--t1)",padding:"5px",fontSize:14,fontFamily:"JetBrains Mono",outline:"none"}}/>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,color:"var(--t3)",marginBottom:4,fontWeight:700}}>MOLA (dk)</div>
            <input type="number" min="1" max="30" value={tBreakMin}
              onChange={e=>{
                const v=Number(e.target.value)
                setTBreakMin(v)
                if(!running&&mode==="break") setSecs(v*60)
              }}
              style={{width:60,textAlign:"center",background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:6,color:"var(--t1)",padding:"5px",fontSize:14,fontFamily:"JetBrains Mono",outline:"none"}}/>
          </div>
          <button
            onClick={()=>setTDnd(d=>!d)}
            style={{padding:"6px 12px",borderRadius:6,border:`1px solid ${tDnd?"var(--orange)":"var(--b1)"}`,background:tDnd?"rgba(255,170,61,.15)":"var(--s1)",color:tDnd?"var(--orange)":"var(--t2)",cursor:"pointer",fontSize:12,fontFamily:"Syne",fontWeight:600,whiteSpace:"nowrap"}}>
            {tDnd?"🔕 Rahatsız Etme Açık":"🔔 Rahatsız Etme Kapalı"}
          </button>
        </div>

        <div className="tring">
          <svg className="tsvg" width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="100" fill="none" stroke="var(--s2)" strokeWidth="9"/>
            <circle cx="100" cy="100" r="100" fill="none" stroke={mc} strokeWidth="9"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
              style={{transition:"stroke-dashoffset .5s"}}/>
          </svg>
          <div className="tinner">
            <div style={{fontSize:9,fontWeight:700,letterSpacing:2,color:mc,textTransform:"uppercase",marginBottom:3}}>
              {mode==="work"?"⚡ ÇALIŞMA":"☕ MOLA"}
            </div>
            <div className="ttime" style={{color:mode==="work"?"var(--t1)":"var(--green)"}}>{fmt(secs)}</div>
          </div>
        </div>

        <div className="pdots">
          {[0,1,2,3].map(i=><div key={i} className={`pdot${i<pomos?" on":""}`}/>)}
        </div>

        <div className="tctrl">
          <button className="tsml" onClick={()=>{ clearInterval(ref.current); setRunning(false); setMode("work"); setSecs(WORK); setPomos(0) }}>⏹</button>
          <button className="tbig" onClick={()=>setRunning(r=>!r)}>{running?"⏸":"▶"}</button>
          <button className="tsml" onClick={()=>{ const n=mode==="work"?"break":"work"; setMode(n); setSecs(n==="work"?WORK:BRK) }}>
            {mode==="work"?"☕":"⚡"}
          </button>
        </div>

        <div style={{width:"100%",maxWidth:320}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--t3)",letterSpacing:1,marginBottom:7}}>HIZLI NOT</div>
          <textarea className="qn" rows={4} placeholder="Aklınıza gelen notları buraya yazın..." value={qn} onChange={e=>setQn(e.target.value)}/>
          {qn.trim()&&selNote&&(
            <button className="btn bg bsm" style={{marginTop:7}} onClick={addToNote}>
              <Ic n="notes" sz={12}/> Notuma Ekle
            </button>
          )}
        </div>

        {running&&(
          <div style={{marginTop:13,padding:"8px 15px",background:"rgba(79,163,255,.09)",borderRadius:7,fontSize:12,color:"var(--t2)",textAlign:"center"}}>
            ⚡ Aktif seans — {fmt(secs)} kaldı {tDnd&&"· 🔕 Rahatsız Etme Açık"}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ STATS PAGE */
function StatsPage() {
  const {tasks} = useContext(Ctx)
  const [tab,setTab] = useState("weekly")

  const wData = useMemo(()=>{
    const ws=new Date(t0); ws.setDate(t0.getDate()-((t0.getDay()+6)%7))
    return DNS.map((d,i)=>{
      const day=add(ws,i), key=dk(day)
      const dayAll=tasks.filter(t=>t.date===key)
      const dayDone=dayAll.filter(t=>t.done)
      const h=dayDone.reduce((s,t)=>{
        const sm=getStartMins(t),em=getEndMins(t); return s+(em-sm)/60
      },0)
      return {day:d, h:Math.round(h*10)/10, total:dayAll.length, done:dayDone.length}
    })
  },[tasks])

  const sData = useMemo(()=>{
    const map={}
    tasks.filter(t=>t.done).forEach(t=>{
      const h=(getEndMins(t)-getStartMins(t))/60
      if(!map[t.color]) map[t.color]={h:0,color:t.color,count:0}
      map[t.color].h+=h; map[t.color].count++
    })
    return Object.values(map).sort((a,b)=>b.h-a.h).slice(0,6)
  },[tasks])

  const totalDone = tasks.filter(t=>t.done).length
  const totalH = tasks.filter(t=>t.done).reduce((s,t)=>(s+(getEndMins(t)-getStartMins(t))/60),0)
  const heat = useMemo(()=>{
    return Array.from({length:35},(_,i)=>{
      const day=add(new Date(t0.getTime()-35*86400000),i), key=dk(day)
      const done=tasks.filter(t=>t.date===key&&t.done).length
      const op=done===0?.05:Math.min(.15+done*.15,.95)
      return {op,done}
    })
  },[tasks])

  return (
    <div className="cnt fade">
      <div className="tabs">
        {[["weekly","Haftalık"],["subjects","Görevler"],["heatmap","Takvim"]].map(([v,l])=>(
          <div key={v} className={`stab${tab===v?" on":""}`} onClick={()=>setTab(v)}>{l}</div>
        ))}
      </div>

      {tab==="weekly"&&(
        <>
          <div className="g4" style={{marginBottom:14}}>
            {[
              {l:"Bu Hafta",v:`${wData.reduce((s,d)=>s+d.h,0).toFixed(1)}s`,c:"#4fa3ff"},
              {l:"Tamamlanan",v:`${wData.reduce((s,d)=>s+d.done,0)} görev`,c:"#2edc8a"},
              {l:"Toplam Saat",v:`${totalH.toFixed(1)}s`,c:"#ffaa3d"},
              {l:"Tamamlanan",v:`${totalDone} görev`,c:"#ff6fa8"},
            ].map((x,i)=>(
              <div key={i} className="card" style={{textAlign:"center",padding:12}}>
                <div style={{fontSize:20,fontWeight:800,color:x.c}}>{x.v}</div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:3}}>{x.l}</div>
              </div>
            ))}
          </div>
          <div className="g2">
            <div className="card">
              <div className="sh">Günlük Çalışma (Saat)</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={wData} barSize={22}>
                  <XAxis dataKey="day" tick={{fill:"var(--t3)",fontSize:11,fontFamily:"Syne"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--t3)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,fontSize:12}} formatter={(v,n)=>[n==="h"?`${v.toFixed(1)} saat`:`${v} görev`,n==="h"?"Süre":"Tamamlanan"]}/>
                  <Bar dataKey="h" name="h" radius={[4,4,0,0]}>
                    {wData.map((_,i)=><Cell key={i} fill={dk(add(new Date(t0.getTime()-((t0.getDay()+6)%7)*86400000),i))===dk(t0)?"var(--acc)":"var(--s2)"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <div className="sh">Tamamlanan Görev</div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={wData} barSize={22}>
                  <XAxis dataKey="day" tick={{fill:"var(--t3)",fontSize:11,fontFamily:"Syne"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:"var(--t3)",fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,fontSize:12}} formatter={v=>[`${v} görev`]}/>
                  <Bar dataKey="done" radius={[4,4,0,0]} fill="var(--green)"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab==="subjects"&&(
        <div className="card">
          <div className="sh">Renk Bazlı Görev Dağılımı</div>
          {sData.length===0&&<div style={{color:"var(--t3)",fontSize:13,padding:"12px 0"}}>Henüz tamamlanan görev yok</div>}
          {sData.map((s,i)=>(
            <div key={i} style={{marginBottom:15}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:s.color}}/>
                  <span style={{fontSize:13,fontWeight:600}}>{s.count} görev</span>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:s.color,fontFamily:"JetBrains Mono"}}>{s.h.toFixed(1)}s</span>
              </div>
              <div className="pbar"><div className="pf" style={{width:`${Math.min((s.h/Math.max(totalH,1))*100,100)}%`,background:s.color}}/></div>
            </div>
          ))}
        </div>
      )}

      {tab==="heatmap"&&(
        <div className="card">
          <div className="sh">Tamamlanan Görev Takvimi (Son 35 Gün)</div>
          <div className="hmap">
            {heat.map((c,i)=>(
              <div key={i} className="hcell" style={{background:`rgba(79,163,255,${c.op})`}} title={c.done>0?`${c.done} görev tamamlandı`:"Tamamlanan görev yok"}/>
            ))}
          </div>
          <div className="g4" style={{marginTop:13}}>
            {[
              {l:"Bu Hafta",v:`${wData.reduce((s,d)=>s+d.done,0)}`,c:"#4fa3ff"},
              {l:"Toplam Süre",v:`${totalH.toFixed(1)}s`,c:"#ffaa3d"},
              {l:"Tamamlanan",v:`${totalDone}`,c:"#2edc8a"},
              {l:"Bekleyen",v:`${tasks.filter(t=>!t.done).length}`,c:"#ff6fa8"},
            ].map((x,i)=>(
              <div key={i} className="card" style={{textAlign:"center",padding:11}}>
                <div style={{fontSize:18,fontWeight:800,color:x.c}}>{x.v}</div>
                <div style={{fontSize:10,color:"var(--t3)",marginTop:3}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ CALENDAR PAGE */
function CalendarPage() {
  const {tasks,setTasks,setModal,setModalTask,modalTask} = useContext(Ctx)
  const [view,setView]     = useState("week")
  const [cal,setCal]       = useState(new Date(t0))

  // Drag state
  const dragInfo   = useRef(null) // {id, offsetMins}
  const [ghostPos, setGhostPos] = useState(null) // {col, topPx, height}
  const [dropKey,  setDropKey]  = useState(null)

  const SNAP = 15 // dakika snap
  const PX_PER_MIN = 1 // 60px/saat → 1px/min

  const ws = useMemo(()=>{ const d=new Date(cal); d.setDate(cal.getDate()-((cal.getDay()+6)%7)); d.setHours(0,0,0,0); return d },[cal])
  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=>add(ws,i)),[ws])
  const ms  = new Date(cal.getFullYear(),cal.getMonth(),1)
  const gs  = useMemo(()=>{ const d=new Date(ms); d.setDate(1-((ms.getDay()+6)%7)); return d },[ms])
  const mcs = useMemo(()=>Array.from({length:42},(_,i)=>add(gs,i)),[gs])

  const prev=()=>setCal(d=>{ const r=new Date(d); view==="week"?r.setDate(r.getDate()-7):r.setMonth(r.getMonth()-1); return r })
  const next=()=>setCal(d=>{ const r=new Date(d); view==="week"?r.setDate(r.getDate()+7):r.setMonth(r.getMonth()+1); return r })
  const title = view==="week"
    ? `${weekDays[0].toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} – ${weekDays[6].toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}`
    : cal.toLocaleDateString("tr-TR",{month:"long",year:"numeric"})

  const HDR_H = 46   // header px
  const START_H = 7  // 07:00

  const minsToTop = mins => HDR_H + (mins - START_H*60) * PX_PER_MIN
  const topToMins = (top, colEl) => {
    const rect = colEl.getBoundingClientRect()
    const relY  = top - rect.top
    const mins  = START_H*60 + relY / PX_PER_MIN
    return Math.round(mins / SNAP) * SNAP
  }

  const fmtTime = m => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`

  /* ── WEEK DRAG handlers ── */
  const onBlockMouseDown = (e, task) => {
    e.preventDefault(); e.stopPropagation()
    const blockTop = minsToTop(getStartMins(task))
    const clickY   = e.clientY
    const colEl    = e.currentTarget.closest(".wdcol")
    const rect     = colEl?.getBoundingClientRect()
    const relY     = rect ? clickY - rect.top : 0
    const clickMins = START_H*60 + relY / PX_PER_MIN
    const offsetMins = clickMins - getStartMins(task)
    dragInfo.current = { id:task.id, offsetMins, task }

    const onMove = ev => {
      const col = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".wdcol")
      if (!col) return
      const rect2 = col.getBoundingClientRect()
      const relY2 = ev.clientY - rect2.top
      let newStartMins = START_H*60 + relY2/PX_PER_MIN - offsetMins
      newStartMins = Math.round(newStartMins/SNAP)*SNAP
      newStartMins = Math.max(START_H*60, Math.min(23*60, newStartMins))
      const dur = getEndMins(task) - getStartMins(task)
      const colIdx = parseInt(col.dataset.colidx||"0")
      setGhostPos({ colIdx, topPx: minsToTop(newStartMins), height: dur*PX_PER_MIN, startMins: newStartMins, dur })
      setDropKey(`col-${colIdx}-${newStartMins}`)
    }

    const onUp = ev => {
      if (ghostPos || dropKey) {
        const col = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".wdcol")
        if (col) {
          const rect2 = col.getBoundingClientRect()
          const relY2 = ev.clientY - rect2.top
          let newSm = START_H*60 + relY2/PX_PER_MIN - offsetMins
          newSm = Math.round(newSm/SNAP)*SNAP
          newSm = Math.max(START_H*60, Math.min(23*60-15, newSm))
          const dur2 = getEndMins(task)-getStartMins(task)
          const newEm = newSm+dur2
          const dayIdx = parseInt(col.dataset.colidx||"0")
          const newDate = dk(weekDays[dayIdx])
          setTasks(ts=>ts.map(t=>t.id===task.id?{
            ...t, date:newDate,
            startTime:fmtTime(newSm), endTime:fmtTime(newEm),
            hour:Math.floor(newSm/60), dur:Math.ceil(dur2/60)
          }:t))
        }
      }
      setGhostPos(null); setDropKey(null); dragInfo.current=null
      window.removeEventListener("mousemove",onMove)
      window.removeEventListener("mouseup",onUp)
    }

    window.addEventListener("mousemove",onMove)
    window.addEventListener("mouseup",onUp)
  }

  /* ── MONTH drag (HTML5) ── */
  const onDS=(e,id)=>{ dragInfo.current={id}; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("id",String(id)) }
  const onDE=()=>{ dragInfo.current=null; setDropKey(null) }
  const dropMonth=(e,date)=>{
    e.preventDefault()
    const id=Number(e.dataTransfer.getData("id"))
    if(id) setTasks(ts=>ts.map(t=>t.id===id?{...t,date:dk(date)}:t))
    onDE()
  }

  const ghostTask = ghostPos && dragInfo.current ? tasks.find(t=>t.id===dragInfo.current.id) : null

  return (
    <div className="cwrap">
      <div className="chead">
        <button className="cnav" onClick={prev}><Ic n="cl" sz={13}/></button>
        <span style={{fontSize:14,fontWeight:700,minWidth:160}}>{title}</span>
        <button className="cnav" onClick={next}><Ic n="cr" sz={13}/></button>
        <button className="btn bg bsm" onClick={()=>setCal(new Date(t0))}>Bugün</button>
        <button className="btn bp bsm" onClick={()=>setModal("task")}><Ic n="plus" sz={12}/> Görev Ekle</button>
        <div className="ctabs">
          {[["week","Haftalık"],["month","Aylık"]].map(([v,l])=>(
            <div key={v} className={`ctab${view===v?" on":""}`} onClick={()=>setView(v)}>{l}</div>
          ))}
        </div>
      </div>

      {/* ── MONTH ── */}
      {view==="month"&&(
        <div className="month-out">
          <div className="mgrid">
            {DNS.map(d=><div key={d} className="mhdr">{d}</div>)}
            {mcs.map((cell,i)=>{
              const key=dk(cell), isT=key===dk(t0), isO=cell.getMonth()!==cal.getMonth()
              const ct=tasks.filter(t=>t.date===key)
              return (
                <div key={i} className={`mcell${isT?" tod":""}${isO?" om":""}${dropKey===key?" dov":""}`}
                  onDragOver={e=>{e.preventDefault();setDropKey(key)}}
                  onDragLeave={()=>setDropKey(null)}
                  onDrop={e=>dropMonth(e,cell)}
                  onDoubleClick={()=>setModal("task")}
                >
                  <div className={`mdn${isT?" td":""}`}>{cell.getDate()}</div>
                  {ct.slice(0,3).map(t=>{
                    const st=t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`
                    return (
                      <div key={t.id} className={`chip${t.done?" cdone":""}`}
                        style={{background:t.color+"25",color:t.color,borderColor:t.color+"40",
                          borderLeft:`3px solid ${t.priority?PC[t.priority]:t.color}`}}
                        draggable onDragStart={e=>onDS(e,t.id)} onDragEnd={onDE}
                        onClick={e=>{e.stopPropagation();setModalTask(t);setModal("td")}}
                      >{st} {t.title}{t.recurring&&t.recurring!=="none"?" 🔁":""}</div>
                    )
                  })}
                  {ct.length>3&&<div style={{fontSize:10,color:"var(--t3)",padding:"1px 5px"}}>+{ct.length-3}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── WEEK ── */}
      {view==="week"&&(
        <div className="wout">
          {/* Time col */}
          <div className="wtimecol">
            <div className="wthdr"/>
            {HRS.map(h=><div key={h} className="wts">{String(h).padStart(2,"0")}:00</div>)}
          </div>
          {/* Day cols */}
          <div className="wscroll">
            <div className="winner">
              {/* Headers */}
              <div className="wdhrow">
                {weekDays.map((day,di)=>{
                  const isT=dk(day)===dk(t0)
                  return (
                    <div key={di} className="wdh">
                      <div className="wdn">{DNS[di]}</div>
                      <div className={`wdd${isT?" td":""}`}>{day.getDate()}</div>
                    </div>
                  )
                })}
              </div>
              {/* Columns */}
              {weekDays.map((day,di)=>{
                const key=dk(day), dt=tasks.filter(t=>t.date===key)
                return (
                  <div key={di} className="wdcol" data-colidx={di} style={{gridColumn:di+1,gridRow:2}}>
                    {/* Hour lines */}
                    {HRS.map(h=>(
                      <div key={h} className="whour"
                        onDoubleClick={()=>{
                          setModalTask(null)
                          setModal("task")
                        }}
                      >
                        {/* 15 min snap lines */}
                        {[15,30,45].map(m=>(
                          <div key={m} style={{position:"absolute",left:0,right:0,top:m,borderBottom:"1px dashed rgba(37,60,94,.2)",pointerEvents:"none"}}/>
                        ))}
                      </div>
                    ))}

                    {/* Ghost block while dragging */}
                    {ghostPos && ghostPos.colIdx===di && ghostTask&&(
                      <div style={{
                        position:"absolute",left:3,right:3,
                        top:ghostPos.topPx, height:Math.max(ghostPos.height-3,20),
                        background:ghostTask.color+"40",
                        border:`2px dashed ${ghostTask.color}`,
                        borderRadius:5, pointerEvents:"none", zIndex:20,
                        display:"flex",alignItems:"center",padding:"0 6px"
                      }}>
                        <span style={{fontSize:11,fontWeight:700,color:ghostTask.color}}>
                          {fmtTime(ghostPos.startMins)} – {fmtTime(ghostPos.startMins+ghostPos.dur)}
                        </span>
                      </div>
                    )}

                    {/* Task blocks */}
                    {dt.map(t=>{
                      const sm=getStartMins(t), em=getEndMins(t)
                      const topPx=minsToTop(sm)
                      const height=Math.max((em-sm)*PX_PER_MIN-3, 22)
                      const st=t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`
                      const et=t.endTime||`${String((t.hour||9)+(t.dur||1)).padStart(2,"0")}:00`
                      const isGhost = dragInfo.current?.id===t.id && ghostPos
                      return (
                        <div key={t.id}
                          style={{
                            position:"absolute",left:3,right:3,
                            top:topPx, height,
                            background: isGhost ? "transparent" : t.color+"22",
                            color:t.color,
                            borderLeft:`3px solid ${t.priority?PC[t.priority]:t.color}`,
                            borderRadius:5, padding:"3px 6px",
                            cursor:"grab", fontSize:11, fontWeight:600,
                            overflow:"hidden", zIndex:5,
                            opacity: isGhost ? 0.3 : 1,
                            userSelect:"none", transition:"opacity .1s",
                            boxShadow: isGhost ? "none" : "0 1px 4px rgba(0,0,0,.2)"
                          }}
                          onMouseDown={e=>onBlockMouseDown(e,t)}
                          onClick={e=>{ if(!dragInfo.current?.moved){ setModalTask(t); setModal("td") } }}
                        >
                          <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}{t.recurring&&t.recurring!=="none"?" 🔁":""}</div>
                          {height>36&&<div style={{fontSize:10,opacity:.7}}>{st}–{et}</div>}
                          {height>52&&t.desc&&<div style={{fontSize:10,opacity:.55,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ NOTES PAGE */
function NotesPage() {
  const {folders,setFolders,notes,setNotes,selFolder,setSelFolder,selNote,setSelNote,editMode,setEditMode,editTxt,setEditTxt,editTitle,setEditTitle,setModal,folderFiles,setFolderFiles} = useContext(Ctx)
  const [search,setSearch] = useState("")
  const [previewFile,setPreviewFile] = useState(null)
  const noteFileRef = useRef(null)
  const folderFileRef = useRef(null)

  const filtered = search
    ? notes.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())||n.body.toLowerCase().includes(search.toLowerCase()))
    : notes.filter(n=>n.fid===selFolder)

  const backlinks = useMemo(()=>
    selNote ? notes.filter(n=>n.id!==selNote.id && n.body?.includes(`[[${selNote.title}]]`)) : []
  ,[notes,selNote])

  const openNote = n => { setSelNote(n); setEditTxt(n.body); setEditTitle(n.title); setEditMode(false) }

  const save = () => {
    const upd={...selNote,title:editTitle,body:editTxt,upd:new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
    setNotes(ns=>ns.map(n=>n.id===selNote.id?upd:n)); setSelNote(upd); setEditMode(false)
  }

  const del = id => { setNotes(ns=>ns.filter(n=>n.id!==id)); if(selNote?.id===id) setSelNote(null) }

  const exportMd = () => {
    if(!selNote)return
    const blob=new Blob([selNote.body],{type:"text/markdown"})
    const url=URL.createObjectURL(blob)
    const a=document.createElement("a"); a.href=url; a.download=`${selNote.title}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    if(!selNote)return
    const w=window.open("","_blank")
    w.document.write(`<html><head><title>${selNote.title}</title><style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto}h1{font-size:24px}h2{font-size:18px}code{background:#f0f0f0;padding:2px 5px;border-radius:3px}pre{white-space:pre-wrap}</style></head><body><h1>${selNote.title}</h1><pre>${selNote.body}</pre></body></html>`)
    w.document.close(); w.print()
  }

  const handleNoteFile = (e) => {
    const file = e.target.files[0]
    if (!file || !selNote) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const att = {id:uid(),name:file.name,type:file.type,size:file.size,data:ev.target.result}
      const upd = {...selNote, attachments:[...(selNote.attachments||[]),att]}
      setNotes(ns=>ns.map(n=>n.id===selNote.id?upd:n)); setSelNote(upd)
    }
    reader.readAsDataURL(file); e.target.value=""
  }

  const handleFolderFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const f={id:uid(),name:file.name,type:file.type,size:file.size,data:ev.target.result,folderId:selFolder,added:new Date().toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
      setFolderFiles(fs=>[...fs,f])
    }
    reader.readAsDataURL(file); e.target.value=""
  }

  const delNoteAtt = (attId) => {
    const upd = {...selNote,attachments:(selNote.attachments||[]).filter(a=>a.id!==attId)}
    setNotes(ns=>ns.map(n=>n.id===selNote.id?upd:n)); setSelNote(upd)
  }

  const delFolderFile = (fid) => setFolderFiles(fs=>fs.filter(f=>f.id!==fid))

  const fmtSize = b => b>1024*1024?`${(b/1024/1024).toFixed(1)}MB`:`${(b/1024).toFixed(0)}KB`

  const currentFolderFiles = folderFiles.filter(f=>f.folderId===selFolder)

  return (
    <div className="nwrap">

      {/* FOLDERS */}
      <div className="fp">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <span style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Klasörler</span>
          <button className="btn bg bsm bic" onClick={()=>setModal("folder")}><Ic n="plus" sz={12}/></button>
        </div>
        {folders.filter(f=>!f.pid).map(f=>(
          <div key={f.id}>
            <div className={`fi${!search&&selFolder===f.id?" on":""}`} onClick={()=>{setSelFolder(f.id);setSearch("");setSelNote(null)}}>
              <span>📁</span><span style={{flex:1}}>{f.name}</span>
              <span style={{fontSize:10,color:"var(--t3)"}}>{notes.filter(n=>n.fid===f.id).length}</span>
            </div>
            {folders.filter(c=>c.pid===f.id).map(c=>(
              <div key={c.id} className={`fi${!search&&selFolder===c.id?" on":""}`} style={{paddingLeft:18}} onClick={()=>{setSelFolder(c.id);setSearch("");setSelNote(null)}}>
                <span>📄</span><span style={{flex:1}}>{c.name}</span>
                <span style={{fontSize:10,color:"var(--t3)"}}>{notes.filter(n=>n.fid===c.id).length}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* NOTE LIST + FOLDER FILES */}
      <div className="nlp">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
          <span style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Notlar</span>
          <button className="btn bg bsm bic" onClick={()=>setModal("note")}><Ic n="plus" sz={12}/></button>
        </div>
        <input className="fi2" placeholder="🔍 Ara..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:9,padding:"6px 9px",fontSize:12,width:"100%"}}/>
        {filtered.length===0&&<div style={{color:"var(--t3)",fontSize:12,padding:"8px 0"}}>Not bulunamadı</div>}
        {filtered.map(n=>(
          <div key={n.id} className={`nc${selNote?.id===n.id?" on":""}`} onClick={()=>openNote(n)}>
            <div style={{fontSize:13,fontWeight:600}}>{n.title}</div>
            <div style={{fontSize:11,color:"var(--t3)",marginTop:2,display:"flex",gap:8}}>
              <span>{(n.ts/3600).toFixed(1)}s · {n.upd}</span>
              {(n.attachments||[]).length>0&&<span>📎{(n.attachments||[]).length}</span>}
            </div>
          </div>
        ))}

        {/* KLASÖR DOSYALARI */}
        {!search&&(
          <div style={{marginTop:14,borderTop:"1px solid var(--b1)",paddingTop:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Klasör Dosyaları</span>
              <button className="btn bg bsm bic" title="Dosya / Resim Ekle" onClick={()=>folderFileRef.current?.click()}>📎</button>
              <input ref={folderFileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleFolderFile}/>
            </div>
            {currentFolderFiles.length===0&&(
              <div style={{color:"var(--t3)",fontSize:11,padding:"6px 0",fontStyle:"italic"}}>Dosya yok — 📎 ile ekle</div>
            )}
            {currentFolderFiles.map(f=>(
              <div key={f.id}
                style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:6,marginBottom:5,cursor:"pointer",transition:".1s"}}
                onClick={()=>setPreviewFile(f)}
              >
                <span style={{fontSize:16,flexShrink:0}}>{f.type.startsWith("image/")?"🖼️":"📄"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</div>
                  <div style={{fontSize:10,color:"var(--t3)"}}>{fmtSize(f.size)} · {f.added}</div>
                </div>
                <button className="btn bd bsm bic" onClick={e=>{e.stopPropagation();delFolderFile(f.id)}}><Ic n="trash" sz={10}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDITOR */}
      <div className="ep">
        {selNote?(
          <>
            <div className="ehead">
              {editMode
                ? <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:17,fontWeight:700,color:"var(--t1)",fontFamily:"Syne"}}/>
                : <span style={{fontSize:17,fontWeight:700,flex:1}}>{selNote.title}</span>}
              <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                {selNote.tags?.map(t=><span key={t} className="tag">{t}</span>)}
                <button className="btn bg bsm" title="Nota Dosya Ekle" onClick={()=>noteFileRef.current?.click()}>📎</button>
                <input ref={noteFileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleNoteFile}/>
                {editMode?(
                  <>
                    <button className="btn bp bsm" onClick={save}>Kaydet</button>
                    <button className="btn bg bsm" onClick={()=>setEditMode(false)}>İptal</button>
                  </>
                ):(
                  <>
                    <button className="btn bg bsm" onClick={()=>setEditMode(true)}><Ic n="edit" sz={12}/></button>
                    <button className="btn bg bsm" title=".md indir" onClick={exportMd}>⬇ md</button>
                    <button className="btn bg bsm" title="PDF yazdır" onClick={exportPdf}>⬇ pdf</button>
                    <button className="btn bd bsm bic" onClick={()=>del(selNote.id)}><Ic n="trash" sz={12}/></button>
                  </>
                )}
              </div>
            </div>

            <div style={{padding:"5px 17px",borderBottom:"1px solid var(--b1)",fontSize:11,color:"var(--t3)",display:"flex",gap:12,flexShrink:0}}>
              <span>{(selNote.ts/3600).toFixed(1)}s çalışıldı</span>
              <span>{selNote.upd}</span>
              {(selNote.attachments||[]).length>0&&<span>📎 {(selNote.attachments||[]).length} ek</span>}
              {backlinks.length>0&&<span>⬅ {backlinks.length} bağlantı</span>}
            </div>

            <div className="ebody">
              {editMode
                ? <textarea className="etxt" value={editTxt} onChange={e=>setEditTxt(e.target.value)}/>
                : <div className="ep-md">{renderMd(selNote.body, title=>{ const n=notes.find(x=>x.title===title); if(n) openNote(n) })}</div>
              }

              {/* EKLER */}
              {(selNote.attachments||[]).length>0&&(
                <div style={{marginTop:20,borderTop:"1px solid var(--b1)",paddingTop:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",letterSpacing:1,marginBottom:12}}>EKLER</div>
                  {(selNote.attachments||[]).map(att=>(
                    <div key={att.id} style={{marginBottom:12}}>
                      {att.type.startsWith("image/")&&(
                        <div>
                          <img src={att.data} alt={att.name} style={{maxWidth:"100%",maxHeight:340,borderRadius:8,border:"1px solid var(--b1)",display:"block",cursor:"pointer"}} onClick={()=>setPreviewFile(att)}/>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:5}}>
                            <span style={{fontSize:11,color:"var(--t3)"}}>{att.name} · {fmtSize(att.size)}</span>
                            <button className="btn bd bsm bic" onClick={()=>delNoteAtt(att.id)}><Ic n="trash" sz={11}/></button>
                          </div>
                        </div>
                      )}
                      {att.type==="application/pdf"&&(
                        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:8}}>
                          <span style={{fontSize:20}}>📄</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600}}>{att.name}</div>
                            <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>{fmtSize(att.size)}</div>
                          </div>
                          <a href={att.data} download={att.name} style={{padding:"5px 10px",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:6,fontSize:12,color:"var(--acc)",textDecoration:"none",fontWeight:600}}>⬇ İndir</a>
                          <button className="btn bd bsm bic" onClick={()=>delNoteAtt(att.id)}><Ic n="trash" sz={11}/></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* BACKLINKLER */}
              {backlinks.length>0&&(
                <div style={{marginTop:20,borderTop:"1px solid var(--b1)",paddingTop:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--t3)",letterSpacing:1,marginBottom:10}}>⬅ BURAYA BAĞLANAN NOTLAR</div>
                  {backlinks.map(n=>(
                    <div key={n.id} onClick={()=>openNote(n)}
                      style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:"var(--s1)",border:"1px solid var(--b1)",borderRadius:6,marginBottom:5,cursor:"pointer",transition:".1s"}}
                      onMouseOver={e=>e.currentTarget.style.borderColor="var(--acc)"}
                      onMouseOut={e=>e.currentTarget.style.borderColor="var(--b1)"}
                    >
                      <span>📄</span>
                      <span style={{fontSize:13,fontWeight:600}}>{n.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ):(
          <div className="empty"><div style={{fontSize:34,marginBottom:9}}>📄</div><div>Bir not seçin</div></div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewFile&&(
        <div className="ov" onClick={()=>setPreviewFile(null)} style={{zIndex:400}}>
          <div style={{maxWidth:"90vw",maxHeight:"90vh",position:"relative"}} onClick={e=>e.stopPropagation()}>
            <button className="btn bd" style={{position:"absolute",top:-36,right:0}} onClick={()=>setPreviewFile(null)}>✕ Kapat</button>
            {previewFile.type.startsWith("image/")&&(
              <img src={previewFile.data} alt={previewFile.name} style={{maxWidth:"90vw",maxHeight:"85vh",borderRadius:10,border:"1px solid var(--b1)",display:"block"}}/>
            )}
            {previewFile.type==="application/pdf"&&(
              <iframe src={previewFile.data} title={previewFile.name} style={{width:"80vw",height:"85vh",border:"none",borderRadius:10}}/>
            )}
            <div style={{textAlign:"center",marginTop:8,fontSize:12,color:"var(--t3)"}}>{previewFile.name} · {fmtSize(previewFile.size)}</div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ═══════════════════════════════════════════════════════ GOALS PAGE */
function GoalsPage() {
  const {goals,setGoals,notes,setModal} = useContext(Ctx)
  return (
    <div className="cnt fade">
      <div className="g2">
        <div className="card">
          <div className="sh">Aktif Hedefler <button className="btn bg bsm" onClick={()=>setModal("goal")}><Ic n="plus" sz={11}/> Ekle</button></div>
          {goals.length===0&&<div style={{color:"var(--t3)",fontSize:13}}>Henüz hedef yok</div>}
          {goals.map(g=>{
            const p=Math.min(Math.round((g.cur/g.target)*100),100)
            return (
              <div key={g.id} style={{marginBottom:15}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{g.title}</div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>{g.cur} / {g.target}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{fontSize:12,fontWeight:700,fontFamily:"JetBrains Mono",color:g.color}}>{p}%</span>
                    <button className="btn bd bsm bic" onClick={()=>setGoals(gs=>gs.filter(x=>x.id!==g.id))}><Ic n="trash" sz={11}/></button>
                  </div>
                </div>
                <div className="pbar"><div className="pf" style={{width:`${p}%`,background:g.color}}/></div>
              </div>
            )
          })}
        </div>
        <div className="card">
          <div className="sh">Rozetler</div>
          <div className="bgrid">
            {[
              {ic:"📝",name:"İlk Adım",desc:"İlk notunu aldın",ok:notes.length>0},
              {ic:"🔥",name:"5 Gün Streak",desc:"5 gün üst üste",ok:true},
              {ic:"⏰",name:"10 Saat",desc:"Toplam 10 saat",ok:true},
              {ic:"🚀",name:"7 Gün Streak",desc:"7 gün üst üste",ok:false},
              {ic:"🎯",name:"Haftalık Hedef",desc:"Hedefini tamamla",ok:false},
              {ic:"🌐",name:"Graf Ustası",desc:"10 not al",ok:notes.length>=10},
            ].map((b,i)=>(
              <div key={i} className={`bitem${b.ok?" ok":" lock"}`}>
                <div style={{fontSize:24,marginBottom:5}}>{b.ic}</div>
                <div style={{fontSize:11,fontWeight:700,marginBottom:2}}>{b.name}</div>
                <div style={{fontSize:10,color:"var(--t3)"}}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ DASHBOARD */
function Dashboard() {
  const {tasks,setTasks,setModal} = useContext(Ctx)
  const tt=tasks.filter(t=>t.date===dk(t0))
  const done=tt.filter(t=>t.done).length
  const wData=useMemo(()=>DNS.map((d,i)=>({day:d,h:[2.1,3.4,4.1,2.8,3.9,1.2,0.8][i]})),[])
  return (
    <div className="cnt fade">
      <div className="g4">
        {[
          {l:"Bu Hafta",v:"18.3s",s:"/25 hedef",c:"#4fa3ff",p:73},
          {l:"Bugün",v:`${done}/${tt.length}`,s:"görev tamamlandı",c:"#ffaa3d",p:tt.length?Math.round(done/tt.length*100):0},
          {l:"Streak",v:"🔥 5",s:"gün üst üste",c:"#ff6fa8",p:71},
          {l:"Çalışma",v:"18.3s",s:"bu hafta toplam",c:"#2edc8a",p:73},
        ].map((c,i)=>(
          <div key={i} className="card">
            <div className="clbl">{c.l}</div>
            <div className="cval" style={{color:c.c}}>{c.v}</div>
            <div className="csub">{c.s}</div>
            <div className="pbar"><div className="pf" style={{width:`${c.p}%`,background:c.c}}/></div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="sh">Bugünkü Plan
            <button className="btn bg bsm" onClick={()=>setModal("task")}><Ic n="plus" sz={11}/> Ekle</button>
          </div>
          {tt.length===0&&<div style={{color:"var(--t3)",fontSize:13,padding:"8px 0"}}>Bugün görev yok</div>}
          {tt.map(t=>(
            <div key={t.id} className={`ti${t.done?" dn":""}`}>
              <div className={`chk${t.done?" on":""}`} style={{borderColor:t.color}} onClick={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>
                {t.done?"✓":""}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600}}>{t.title}</div>
                <div style={{fontSize:11,color:"var(--t3)"}}>{t.hour}:00 · {t.dur}s</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0}}/>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="sh">Haftalık Çalışma</div>
          <ResponsiveContainer width="100%" height={145}>
            <BarChart data={wData} barSize={19}>
              <XAxis dataKey="day" tick={{fill:"var(--t3)",fontSize:11,fontFamily:"Syne"}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={{background:"var(--bg3)",border:"1px solid var(--b1)",borderRadius:6,fontSize:12}} formatter={v=>[`${v.toFixed(1)}s`]}/>
              <Bar dataKey="h" radius={[4,4,0,0]}>
                {wData.map((_,i)=><Cell key={i} fill={i===4?"var(--acc)":"var(--s2)"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <div className="sh">💡 Akıllı Öneriler</div>
        {["🔔 Veritabanı dersinde 3 gündür çalışmadınız.","🚀 Streak 5 gün! Yarın da çalışırsan rozet kazanırsın.","📌 Binary Tree notunu geçen hafta bıraktınız, bugün bitirin."]
          .map((s,i)=><div key={i} className="sug">{s}</div>)}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ APP */
export default function App() {
  useEffect(()=>{ const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s); return ()=>document.head.removeChild(s) },[])
  useEffect(()=>{
    const h = e => {
      if(e.ctrlKey && e.key==="n"){ e.preventDefault(); setModal("note") }
      if(e.ctrlKey && e.key==="t"){ e.preventDefault(); setModal("task") }
      if(e.ctrlKey && e.key==="p"){ e.preventDefault(); setPage("timer") }
    }
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h)
  },[])


  const [page,setPage]         = useState("dashboard")
  const [folders,setFolders]   = useLS("sf_fold", I_FOLD)
  const [notes,setNotes]       = useLS("sf_notes",I_NOTES)
  const [tasks,setTasks]       = useLS("sf_tasks",I_TASKS)
  const [goals,setGoals]       = useLS("sf_goals",I_GOALS)
  const [folderFiles, setFolderFiles] = useLS("sf_ffiles", [])
  const [selFolder,setSelFolder]= useState(2)
  const [selNote,setSelNote]   = useState(null)
  const [editMode,setEditMode] = useState(false)
  const [editTxt,setEditTxt]   = useState("")
  const [editTitle,setEditTitle]= useState("")
  const [modal,setModal]       = useState(null)
  const [tRunning, setTRunning]     = useState(false)
const [tMode, setTMode]           = useState("work")
const [tSecs, setTSecs]           = useState(25*60)
const [tPomos, setTPomos]         = useState(0)
const [tWorkMin, setTWorkMin]     = useState(25)
const [tBreakMin, setTBreakMin]   = useState(5)
const [tDnd, setTDnd]             = useState(false)
const tRef                         = useRef(null)

useEffect(()=>{
  if(tRunning){
    tRef.current=setInterval(()=>{
      setTSecs(s=>{
        const WORK=tWorkMin*60, BRK=tBreakMin*60
        if(s<=1){
          if(tMode==="work"){ setTPomos(p=>p+1); setTMode("break"); return BRK }
          setTMode("work"); return WORK
        }
        return s-1
      })
    },1000)
  } else clearInterval(tRef.current)
  return ()=>clearInterval(tRef.current)
},[tRunning,tMode,tWorkMin,tBreakMin])
  const [modalTask,setModalTask]= useState(null)

  const ctx = {
    tRunning,setTRunning,tMode,setTMode,tSecs,setTSecs,
    tPomos,setTPomos,tWorkMin,setTWorkMin,tBreakMin,setTBreakMin,
    tDnd,setTDnd,tRef,
    page,setPage,folders,setFolders,notes,setNotes,tasks,setTasks,goals,setGoals,
    selFolder,setSelFolder,selNote,setSelNote,
    editMode,setEditMode,editTxt,setEditTxt,editTitle,setEditTitle,
    modal,setModal,modalTask,setModalTask,
    folderFiles, setFolderFiles,
  }

  const NAV=[
    {id:"dashboard",l:"Dashboard",ic:"home"},
    {id:"calendar",l:"Takvim",ic:"cal"},
    {id:"notes",l:"Notlar",ic:"notes"},
    {id:"timer",l:"Zamanlayıcı",ic:"timer"},
    {id:"stats",l:"İstatistikler",ic:"chart"},
    {id:"goals",l:"Hedefler",ic:"tgt"},
  ]
  const TITLES={dashboard:"Dashboard",calendar:"Takvim & Planlayıcı",notes:"Notlar",timer:"Pomodoro Timer",stats:"İstatistikler",goals:"Hedefler & Rozetler"}
  const PAGES={dashboard:Dashboard,calendar:CalendarPage,notes:NotesPage,timer:TimerPage,stats:StatsPage,goals:GoalsPage}
  const P=PAGES[page]||Dashboard

  return (
    <Ctx.Provider value={ctx}>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-ic">S</div>
            <div className="logo-name">Study<span>Flow</span></div>
          </div>
          <div className="nav-g">
            <div className="nav-lbl">Menü</div>
            {NAV.map(item=>(
              <div key={item.id} className={`ni${page===item.id?" on":""}`} onClick={()=>setPage(item.id)}>
                <Ic n={item.ic} sz={14}/>{item.l}
              </div>
            ))}
          </div>
          <div className="sb-bot">
            <div className="streak">
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{fontSize:22,fontWeight:800,color:"var(--acc3)",lineHeight:1}}>🔥5</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700}}>Günlük Streak</div>
                  <div style={{fontSize:11,color:"var(--t3)"}}>Yarın da çalış!</div>
                </div>
              </div>
              <div className="sbar"><div className="sfill"/></div>
            </div>
          </div>
        </aside>
        <main className="main">
          <div className="topbar">
            <div className="pt">{TITLES[page]}</div>
            <div className="tr">
              <button className="btn bg bsm" onClick={()=>setModal("task")}><Ic n="plus" sz={11}/> Görev</button>
              <button className="btn bg bsm" onClick={()=>setModal("note")}><Ic n="plus" sz={11}/> Not</button>
              <button className="btn bp bsm" onClick={()=>setPage("timer")}>▶ Çalışmaya Başla</button>
            </div>
          </div>
          <P/>
        </main>
        <Modal/>
        <GlobalSearch/>
      </div>
    </Ctx.Provider>
  )
}
