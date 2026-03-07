import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

/* ═══════════════════════════════════════════════════════ STYLES */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060c18;--bg2:#0a1120;--bg3:#0f1828;
  --s1:#141f35;--s2:#1a2840;--b1:#1f3352;--b2:#2a4568;
  --t1:#e8f4ff;--t2:#7ba3c8;--t3:#3d5a7a;
  --acc:#4f9eff;--acc2:#7c6bff;--acc3:#ff6fa8;
  --green:#2edc8a;--orange:#ffaa3d;--red:#ff5c6e;
  --r:clamp(8px,1vw,14px);--r2:clamp(5px,.6vw,8px);
  --fs-xs:clamp(9px,.65vw,11px);
  --fs-sm:clamp(10px,.75vw,13px);
  --fs-md:clamp(12px,.9vw,15px);
  --fs-lg:clamp(14px,1.1vw,19px);
  --fs-xl:clamp(18px,1.6vw,28px);
  --sp-xs:clamp(4px,.4vw,7px);
  --sp-sm:clamp(7px,.6vw,11px);
  --sp-md:clamp(11px,.9vw,18px);
  --sp-lg:clamp(16px,1.4vw,26px);
}
html,body,#root{height:100%;background:var(--bg);color:var(--t1);font-family:'Syne',sans-serif;overflow:hidden}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:10px}
.app{display:flex;height:100vh;background:var(--bg)}

/* ── SIDEBAR ── */
.sidebar{
  width:clamp(170px,14vw,230px);min-width:clamp(170px,14vw,230px);
  background:linear-gradient(180deg,rgba(10,17,32,.98) 0%,rgba(6,12,24,.98) 100%);
  border-right:1px solid rgba(31,51,82,.6);
  display:flex;flex-direction:column;padding:clamp(12px,1.2vw,18px) 0;
  box-shadow:4px 0 24px rgba(0,0,0,.3);
}
.logo{padding:0 clamp(10px,1vw,16px) clamp(14px,1.4vw,22px);display:flex;align-items:center;gap:clamp(6px,.6vw,10px)}
.logo-ic{
  width:clamp(26px,2.2vw,34px);height:clamp(26px,2.2vw,34px);border-radius:9px;
  background:linear-gradient(135deg,var(--acc),var(--acc2));
  display:flex;align-items:center;justify-content:center;
  font-size:clamp(11px,.9vw,15px);font-weight:900;color:#fff;
  box-shadow:0 4px 16px rgba(79,158,255,.4);flex-shrink:0;
}
.logo-name{font-size:var(--fs-lg);font-weight:800;letter-spacing:-.5px}
.logo-name span{
  background:linear-gradient(135deg,var(--acc),var(--acc2));
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
}
.nav-g{padding:0 clamp(6px,.6vw,9px);flex:1}
.nav-lbl{font-size:var(--fs-xs);font-weight:700;letter-spacing:1.8px;color:var(--t3);text-transform:uppercase;padding:clamp(5px,.5vw,8px) clamp(6px,.6vw,8px) 4px}
.ni{
  display:flex;align-items:center;gap:clamp(6px,.6vw,9px);
  padding:clamp(6px,.55vw,9px) clamp(8px,.8vw,11px);
  border-radius:var(--r2);cursor:pointer;transition:all .18s ease;
  color:var(--t2);font-size:var(--fs-sm);font-weight:500;
  border:1px solid transparent;user-select:none;position:relative;
}
.ni:hover{background:rgba(79,158,255,.08);color:var(--t1);transform:translateX(2px)}
.ni.on{
  background:linear-gradient(135deg,rgba(79,158,255,.15),rgba(124,107,255,.1));
  color:var(--acc);border-color:rgba(79,158,255,.25);
  box-shadow:0 2px 12px rgba(79,158,255,.1);
}
.ni.on::before{
  content:"";position:absolute;left:-9px;top:50%;transform:translateY(-50%);
  width:3px;height:60%;background:linear-gradient(180deg,var(--acc),var(--acc2));
  border-radius:0 3px 3px 0;
}
.ndot{width:6px;height:6px;border-radius:50%;background:var(--green);margin-left:auto;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.sb-bot{padding:clamp(6px,.6vw,9px)}
.streak{
  padding:clamp(9px,.9vw,13px);border-radius:var(--r);
  background:linear-gradient(135deg,rgba(255,111,168,.08),rgba(255,170,61,.05));
  border:1px solid rgba(255,111,168,.18);
  position:relative;overflow:hidden;
}
.streak::before{
  content:"";position:absolute;top:-20px;right:-20px;width:80px;height:80px;
  background:radial-gradient(circle,rgba(255,111,168,.12),transparent 70%);
}
.sbar{margin-top:8px;height:3px;background:rgba(255,255,255,.06);border-radius:10px;overflow:hidden}
.sfill{height:100%;width:71%;background:linear-gradient(90deg,var(--acc3),var(--orange));border-radius:10px}

/* ── MAIN ── */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{
  padding:clamp(8px,.7vw,13px) clamp(14px,1.4vw,22px);
  background:rgba(10,17,32,.8);
  border-bottom:1px solid rgba(31,51,82,.5);
  display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0;
  backdrop-filter:blur(12px);
}
.pt{font-size:var(--fs-lg);font-weight:700;letter-spacing:-.3px;white-space:nowrap}
.tr{display:flex;gap:clamp(4px,.4vw,7px);align-items:center}

/* ── BUTTONS ── */
.btn{
  display:inline-flex;align-items:center;gap:clamp(3px,.3vw,5px);
  padding:clamp(5px,.45vw,7px) clamp(9px,.9vw,14px);
  border-radius:var(--r2);border:none;cursor:pointer;
  font-size:var(--fs-xs);font-family:'Syne',sans-serif;font-weight:600;
  transition:all .15s ease;white-space:nowrap;user-select:none;
}
.bp{
  background:linear-gradient(135deg,var(--acc),#3d8ef0);color:#041020;
  box-shadow:0 2px 12px rgba(79,158,255,.3);
}
.bp:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(79,158,255,.4);filter:brightness(1.1)}
.bp:active{transform:translateY(0)}
.bg{background:rgba(20,31,53,.8);color:var(--t2);border:1px solid rgba(31,51,82,.8)}
.bg:hover{background:var(--s2);color:var(--t1);border-color:var(--b2)}
.bd{background:rgba(255,92,110,.08);color:var(--red);border:1px solid rgba(255,92,110,.2)}
.bd:hover{background:rgba(255,92,110,.16)}
.bgreen{background:rgba(46,220,138,.08);color:var(--green);border:1px solid rgba(46,220,138,.2)}
.bgreen:hover{background:rgba(46,220,138,.16)}
.bsm{padding:clamp(3px,.3vw,4px) clamp(7px,.7vw,10px);font-size:var(--fs-xs)}.bic{padding:5px}

/* ── CONTENT ── */
.cnt{flex:1;overflow-y:auto;padding:clamp(12px,1.2vw,20px) clamp(14px,1.4vw,22px)}

/* ── CARDS ── */
.card{
  background:rgba(15,24,40,.7);
  border:1px solid rgba(31,51,82,.6);
  border-radius:var(--r);padding:clamp(11px,.9vw,16px);
  transition:all .2s ease;
  backdrop-filter:blur(8px);
}
.card:hover{border-color:rgba(42,69,104,.9);box-shadow:0 4px 24px rgba(0,0,0,.2)}
.clbl{font-size:var(--fs-xs);font-weight:700;color:var(--t3);letter-spacing:1.3px;text-transform:uppercase;margin-bottom:6px}
.cval{font-size:var(--fs-xl);font-weight:800;letter-spacing:-1px;line-height:1}
.csub{font-size:var(--fs-xs);color:var(--t3);margin-top:3px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(8px,.7vw,12px);margin-bottom:clamp(9px,.9vw,14px)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:clamp(9px,.8vw,14px);margin-bottom:clamp(9px,.9vw,14px)}
.pbar{height:3px;background:rgba(255,255,255,.05);border-radius:10px;overflow:hidden;margin-top:8px}
.pf{height:100%;border-radius:10px;transition:width .6s cubic-bezier(.4,0,.2,1)}
.sh{font-size:var(--fs-sm);font-weight:700;color:var(--t2);margin-bottom:clamp(8px,.8vw,12px);display:flex;align-items:center;justify-content:space-between}

/* ── TASK ITEMS ── */
.ti{
  display:flex;align-items:center;gap:clamp(6px,.6vw,9px);
  padding:clamp(6px,.55vw,9px) clamp(8px,.8vw,12px);
  background:rgba(20,31,53,.6);border:1px solid rgba(31,51,82,.5);
  border-radius:var(--r2);margin-bottom:5px;transition:all .15s ease;
}
.ti:hover{background:var(--s2);border-color:var(--b2);transform:translateX(2px)}
.ti.dn{opacity:.4}
.chk{
  width:clamp(14px,1.2vw,18px);height:clamp(14px,1.2vw,18px);border-radius:50%;border:1.5px solid var(--b2);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;cursor:pointer;transition:all .2s ease;font-size:10px;
}
.chk.on{background:var(--green);border-color:var(--green);color:#041020;box-shadow:0 0 8px rgba(46,220,138,.4)}
.sug{
  display:flex;gap:9px;padding:clamp(7px,.7vw,10px) clamp(9px,.9vw,13px);
  background:rgba(79,158,255,.05);border:1px solid rgba(79,158,255,.14);
  border-radius:var(--r2);margin-bottom:7px;font-size:var(--fs-sm);color:var(--t2);
  transition:.15s;
}
.sug:hover{background:rgba(79,158,255,.08);border-color:rgba(79,158,255,.22)}

/* ── CALENDAR ── */
.cwrap{display:flex;flex-direction:column;height:calc(100vh - 57px);overflow:hidden}
.chead{
  display:flex;align-items:center;gap:clamp(4px,.5vw,7px);
  padding:clamp(6px,.6vw,9px) clamp(9px,.9vw,14px);
  border-bottom:1px solid rgba(31,51,82,.5);
  background:rgba(10,17,32,.7);flex-shrink:0;flex-wrap:wrap;
  backdrop-filter:blur(10px);
}
.cnav{
  width:clamp(22px,1.8vw,27px);height:clamp(22px,1.8vw,27px);border-radius:6px;
  border:1px solid rgba(31,51,82,.7);background:rgba(20,31,53,.6);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:var(--t2);font-size:var(--fs-sm);transition:all .15s;
}
.cnav:hover{background:var(--s2);color:var(--t1)}
.ctabs{display:flex;gap:2px;margin-left:auto;background:rgba(20,31,53,.6);padding:3px;border-radius:8px;border:1px solid rgba(31,51,82,.5)}
.ctab{padding:clamp(3px,.3vw,4px) clamp(8px,.8vw,12px);border-radius:6px;cursor:pointer;font-size:var(--fs-xs);font-weight:600;color:var(--t2);transition:all .15s;border:1px solid transparent;user-select:none}
.ctab.on{background:linear-gradient(135deg,rgba(79,158,255,.2),rgba(124,107,255,.15));color:var(--acc);border-color:rgba(79,158,255,.3)}
.ctab:hover:not(.on){color:var(--t1)}

/* MONTH */
.month-out{flex:1;overflow:auto}
.mgrid{display:grid;grid-template-columns:repeat(7,1fr)}
.mhdr{
  padding:clamp(4px,.5vw,7px);text-align:center;font-size:var(--fs-xs);font-weight:700;
  color:var(--t3);letter-spacing:1px;text-transform:uppercase;
  border-bottom:1px solid rgba(31,51,82,.5);border-right:1px solid rgba(31,51,82,.3);
  background:rgba(10,17,32,.8);position:sticky;top:0;z-index:5;
}
.mcell{
  border-right:1px solid rgba(31,51,82,.3);border-bottom:1px solid rgba(31,51,82,.3);
  padding:clamp(3px,.4vw,5px);min-height:clamp(60px,7vw,88px);cursor:default;transition:.1s;
}
.mcell:hover{background:rgba(79,158,255,.03)}
.mcell.dov{background:rgba(79,158,255,.08)!important;outline:1px dashed rgba(79,158,255,.5)}
.mcell.tod{background:rgba(79,158,255,.05)}
.mcell.om{opacity:.28}
.mdn{
  font-size:var(--fs-sm);font-weight:700;color:var(--t2);
  width:clamp(18px,1.6vw,22px);height:clamp(18px,1.6vw,22px);
  display:flex;align-items:center;justify-content:center;
  border-radius:50%;margin-bottom:3px;transition:.15s;
}
.mdn.td{background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;box-shadow:0 2px 8px rgba(79,158,255,.4)}
.chip{
  font-size:var(--fs-xs);padding:2px clamp(4px,.5vw,7px);border-radius:5px;margin-bottom:2px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  cursor:grab;user-select:none;border:1px solid transparent;transition:.1s;
}
.chip:active{cursor:grabbing;opacity:.5}
.chip.cdone{text-decoration:line-through;opacity:.4}

/* WEEK */
.wout{display:flex;flex:1;overflow:hidden}
.wtimecol{width:clamp(36px,3.5vw,48px);flex-shrink:0;border-right:1px solid rgba(31,51,82,.4);background:rgba(10,17,32,.5);overflow:hidden}
.wthdr{height:46px;border-bottom:1px solid rgba(31,51,82,.4)}
.wts{
  height:clamp(44px,4vw,60px);display:flex;align-items:flex-start;justify-content:flex-end;
  padding:3px clamp(3px,.4vw,6px) 0;font-size:var(--fs-xs);color:var(--t3);
  font-family:'JetBrains Mono',monospace;border-bottom:1px solid rgba(31,51,82,.2);
}
.wscroll{flex:1;overflow:auto}
.winner{display:grid;grid-template-columns:repeat(7,1fr);min-width:560px}
.wdhrow{display:grid;grid-template-columns:repeat(7,1fr);grid-column:1/-1;position:sticky;top:0;background:rgba(10,17,32,.9);border-bottom:1px solid rgba(31,51,82,.4);z-index:10;backdrop-filter:blur(10px)}
.wdh{padding:clamp(4px,.5vw,7px) 4px;text-align:center;border-right:1px solid rgba(31,51,82,.3)}
.wdn{font-size:var(--fs-xs);font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase}
.wdd{font-size:var(--fs-md);font-weight:800;color:var(--t2);margin-top:1px;transition:.15s}
.wdd.td{
  background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;
  width:clamp(20px,1.8vw,26px);height:clamp(20px,1.8vw,26px);border-radius:50%;
  display:flex;align-items:center;justify-content:center;margin:1px auto 0;
  box-shadow:0 2px 10px rgba(79,158,255,.4);
}
.wdcol{border-right:1px solid rgba(31,51,82,.25);position:relative;grid-row:2}
.whour{height:clamp(44px,4vw,60px);border-bottom:1px solid rgba(31,51,82,.2);transition:.1s;position:relative}
.whour.dov{background:rgba(79,158,255,.06)}
.wblock{
  position:absolute;left:3px;right:3px;border-radius:6px;padding:3px clamp(4px,.5vw,7px);
  cursor:grab;font-size:var(--fs-xs);font-weight:600;overflow:hidden;z-index:5;
  user-select:none;border-left:3px solid transparent;
  box-shadow:0 2px 8px rgba(0,0,0,.25);transition:filter .1s,opacity .1s;
}
.wblock:hover{filter:brightness(1.2);z-index:10;box-shadow:0 4px 16px rgba(0,0,0,.35)}
.wblock:active{cursor:grabbing}

/* ── NOTES ── */
.nwrap{display:flex;height:calc(100vh - 57px);overflow:hidden}
.fp{width:clamp(140px,13vw,190px);min-width:clamp(140px,13vw,190px);border-right:1px solid rgba(31,51,82,.4);overflow-y:auto;padding:clamp(6px,.7vw,9px);flex-shrink:0;background:rgba(8,14,26,.4)}
.nlp{width:clamp(140px,13vw,190px);min-width:clamp(140px,13vw,190px);border-right:1px solid rgba(31,51,82,.4);overflow-y:auto;padding:clamp(6px,.7vw,9px);flex-shrink:0}
.ep{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.fi{display:flex;align-items:center;gap:6px;padding:clamp(5px,.5vw,7px) clamp(6px,.6vw,8px);border-radius:var(--r2);cursor:pointer;font-size:var(--fs-sm);color:var(--t2);transition:all .12s;user-select:none}
.fi:hover{background:rgba(79,158,255,.07);color:var(--t1)}
.fi.on{background:rgba(79,158,255,.12);color:var(--acc);font-weight:600}
.nc{padding:clamp(6px,.7vw,9px) clamp(8px,.8vw,11px);border-radius:var(--r2);cursor:pointer;margin-bottom:4px;border:1px solid transparent;transition:all .12s}
.nc:hover{background:rgba(20,31,53,.7);border-color:rgba(31,51,82,.5)}
.nc.on{background:rgba(79,158,255,.08);border-color:rgba(79,158,255,.25);box-shadow:0 2px 10px rgba(79,158,255,.08)}
.ehead{
  padding:clamp(8px,.8vw,12px) clamp(12px,1.2vw,17px);border-bottom:1px solid rgba(31,51,82,.4);
  display:flex;align-items:center;gap:9px;flex-shrink:0;
  background:rgba(10,17,32,.5);backdrop-filter:blur(8px);
}
.ebody{flex:1;overflow-y:auto;padding:clamp(12px,1.2vw,18px) clamp(14px,1.4vw,20px)}
.ep-md h1{font-size:clamp(16px,1.6vw,21px);color:var(--t1);margin-bottom:10px;font-weight:800;letter-spacing:-.5px}
.ep-md h2{font-size:clamp(13px,1.2vw,16px);color:var(--t1);margin:14px 0 6px;font-weight:700}
.ep-md h3{font-size:clamp(11px,1vw,14px);color:var(--t1);margin:10px 0 4px;font-weight:600}
.ep-md p{font-size:var(--fs-sm);color:var(--t2);margin-bottom:8px;line-height:1.85}
.ep-md ul,.ep-md ol{padding-left:17px;margin-bottom:8px}
.ep-md li{font-size:var(--fs-sm);color:var(--t2);margin-bottom:4px;line-height:1.75}
.ep-md code{background:rgba(79,158,255,.1);padding:2px 6px;border-radius:4px;color:var(--acc);font-size:var(--fs-xs);font-family:'JetBrains Mono',monospace;border:1px solid rgba(79,158,255,.2)}
.ep-md blockquote{border-left:3px solid var(--acc);padding-left:13px;color:var(--t2);font-size:var(--fs-sm);margin:7px 0;font-style:italic}
.ep-md strong{color:var(--t1);font-weight:700}
.nlink{color:var(--acc);text-decoration:none;border-bottom:1px dashed rgba(79,158,255,.4);cursor:pointer;transition:.1s}
.nlink:hover{border-bottom-color:var(--acc)}
.tag{display:inline-flex;padding:2px 7px;background:rgba(79,158,255,.08);border:1px solid rgba(79,158,255,.2);border-radius:20px;font-size:var(--fs-xs);color:var(--acc);margin:2px}
.etxt{width:100%;height:100%;min-height:360px;background:transparent;border:none;outline:none;color:var(--t1);font-family:'JetBrains Mono',monospace;font-size:var(--fs-sm);line-height:1.85;resize:none}

/* ── TIMER ── */
.twrap{display:flex;flex-direction:column;align-items:center;padding:clamp(16px,1.8vw,26px) clamp(14px,1.4vw,20px);max-width:clamp(320px,35vw,440px);margin:0 auto}
.tring{position:relative;width:clamp(140px,14vw,200px);height:clamp(140px,14vw,200px);margin-bottom:clamp(12px,1.4vw,20px)}
.tsvg{position:absolute;top:0;left:0;transform:rotate(-90deg)}
.tinner{
  position:absolute;top:11%;left:11%;width:78%;height:78%;border-radius:50%;
  background:radial-gradient(circle at center,rgba(15,24,40,.95),rgba(10,17,32,.95));
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  box-shadow:inset 0 2px 20px rgba(0,0,0,.4);
}
.ttime{font-size:clamp(26px,3vw,40px);font-weight:800;font-family:'JetBrains Mono',monospace;letter-spacing:-2px;line-height:1}
.pdots{display:flex;gap:clamp(5px,.6vw,8px);margin-bottom:clamp(12px,1.4vw,20px)}
.pdot{width:clamp(6px,.7vw,9px);height:clamp(6px,.7vw,9px);border-radius:50%;background:rgba(255,255,255,.07);transition:all .4s cubic-bezier(.4,0,.2,1)}
.pdot.on{background:var(--acc);box-shadow:0 0 10px rgba(79,158,255,.5)}
.tctrl{display:flex;align-items:center;gap:clamp(9px,1vw,14px);margin-bottom:clamp(12px,1.4vw,20px)}
.tbig{
  width:clamp(44px,4.5vw,58px);height:clamp(44px,4.5vw,58px);border-radius:50%;border:none;cursor:pointer;
  background:linear-gradient(135deg,var(--acc),var(--acc2));
  display:flex;align-items:center;justify-content:center;color:#fff;
  box-shadow:0 4px 24px rgba(79,158,255,.4);transition:all .15s ease;
  font-size:clamp(16px,1.8vw,22px);
}
.tbig:hover{transform:scale(1.08);box-shadow:0 6px 30px rgba(79,158,255,.5)}
.tbig:active{transform:scale(.97)}
.tsml{
  width:clamp(30px,3vw,40px);height:clamp(30px,3vw,40px);border-radius:50%;
  border:1px solid rgba(42,69,104,.8);background:rgba(20,31,53,.7);
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  color:var(--t2);transition:all .15s;font-size:clamp(12px,1.3vw,16px);
}
.tsml:hover{background:var(--s2);color:var(--t1);transform:scale(1.05)}
.qn{
  width:100%;max-width:clamp(240px,28vw,320px);padding:clamp(7px,.8vw,10px) clamp(9px,1vw,13px);
  background:rgba(20,31,53,.6);border:1px solid rgba(31,51,82,.7);
  border-radius:var(--r);color:var(--t1);font-family:'JetBrains Mono',monospace;
  font-size:var(--fs-sm);resize:none;outline:none;transition:.15s;
}
.qn:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(79,158,255,.1)}

/* ── STATS ── */
.tabs{display:flex;gap:2px;padding:3px;background:rgba(20,31,53,.6);border-radius:9px;margin-bottom:clamp(9px,.9vw,14px);width:fit-content;border:1px solid rgba(31,51,82,.5)}
.stab{padding:clamp(4px,.4vw,5px) clamp(10px,1vw,14px);border-radius:7px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;color:var(--t2);transition:all .15s;user-select:none}
.stab.on{background:linear-gradient(135deg,rgba(79,158,255,.2),rgba(124,107,255,.15));color:var(--acc);box-shadow:0 2px 10px rgba(79,158,255,.15)}
.hmap{display:grid;grid-template-columns:repeat(7,1fr);gap:clamp(2px,.3vw,4px)}
.hcell{aspect-ratio:1;border-radius:3px;transition:all .15s;cursor:default}
.hcell:hover{transform:scale(1.4);z-index:1;position:relative}

/* ── GOALS ── */
.bgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(6px,.7vw,10px)}
.bitem{
  background:rgba(20,31,53,.5);border:1px solid rgba(31,51,82,.5);
  border-radius:var(--r);padding:clamp(10px,1vw,14px) clamp(7px,.8vw,10px);text-align:center;transition:all .2s;
}
.bitem:hover{transform:translateY(-2px)}
.bitem.ok{border-color:rgba(79,158,255,.3);background:rgba(79,158,255,.06);box-shadow:0 4px 16px rgba(79,158,255,.08)}
.bitem.lock{opacity:.3;filter:grayscale(1)}

/* ── MODAL ── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:fadeOv .15s ease}
@keyframes fadeOv{from{opacity:0}to{opacity:1}}
.mdl{
  background:linear-gradient(145deg,rgba(15,24,40,.98),rgba(10,17,32,.98));
  border:1px solid rgba(42,69,104,.7);border-radius:var(--r);
  padding:clamp(14px,1.4vw,22px);
  width:clamp(300px,28vw,390px);max-width:92vw;
  box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(79,158,255,.05);
  animation:mIn .18s cubic-bezier(.34,1.56,.64,1);
}
@keyframes mIn{from{opacity:0;transform:scale(.93) translateY(10px)}to{opacity:1;transform:none}}
.mt{font-size:var(--fs-md);font-weight:700;margin-bottom:clamp(10px,1vw,16px);color:var(--t1)}
.fg{margin-bottom:clamp(7px,.8vw,11px)}
.fl{font-size:var(--fs-xs);font-weight:600;color:var(--t3);margin-bottom:4px;display:block;letter-spacing:.3px}
.fi2{
  width:100%;padding:clamp(6px,.6vw,8px) clamp(8px,.8vw,11px);
  background:rgba(20,31,53,.7);border:1px solid rgba(31,51,82,.7);
  border-radius:var(--r2);outline:none;color:var(--t1);
  font-size:var(--fs-sm);font-family:'Syne',sans-serif;transition:.15s;
}
.fi2:focus{border-color:var(--acc);box-shadow:0 0 0 3px rgba(79,158,255,.1);background:rgba(20,31,53,.9)}
select.fi2 option{background:#0f1828}

@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.fade{animation:fu .22s cubic-bezier(.4,0,.2,1)}
.empty{text-align:center;padding:40px;color:var(--t3)}

.calsb{width:clamp(150px,13vw,195px);min-width:clamp(150px,13vw,195px);border-right:1px solid rgba(31,51,82,.4);background:rgba(8,14,26,.5);overflow-y:auto;padding:clamp(7px,.8vw,11px) clamp(6px,.7vw,9px);flex-shrink:0}
.cwrap-body{display:flex;flex:1;overflow:hidden}
.agitem{display:flex;align-items:flex-start;gap:clamp(8px,.9vw,12px);padding:clamp(8px,.9vw,11px) clamp(10px,1vw,14px);border-radius:9px;background:rgba(15,24,40,.6);border:1px solid rgba(31,51,82,.4);margin-bottom:7px;transition:.15s;cursor:pointer}
.agitem:hover{background:rgba(20,31,53,.8);border-color:rgba(42,69,104,.7);transform:translateX(2px)}
.agdate{font-size:var(--fs-xs);font-weight:700;color:var(--t3);letter-spacing:1px;text-transform:uppercase;padding:8px 0 6px;border-bottom:1px solid rgba(31,51,82,.3);margin-bottom:8px}
.calcat{display:flex;align-items:center;gap:8px;padding:clamp(4px,.5vw,6px) clamp(6px,.6vw,8px);border-radius:6px;cursor:pointer;transition:.1s;font-size:var(--fs-sm);color:var(--t2);user-select:none}
.calcat:hover{background:rgba(79,158,255,.06);color:var(--t1)}
.resize-handle{position:absolute;bottom:0;left:0;right:0;height:6px;cursor:ns-resize;border-radius:0 0 6px 6px;background:rgba(255,255,255,.05);transition:.1s}
.resize-handle:hover{background:rgba(255,255,255,.15)}
.create-ghost{position:absolute;left:3px;right:3px;border-radius:6px;border:2px dashed var(--acc);background:rgba(79,158,255,.1);pointer-events:none;z-index:15;display:flex;align-items:flex-start;padding:4px 7px}
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

const I_HABITS = [
  {id:1,name:"2.5 Litre Su İç",icon:"💧",color:"#4f9eff",completions:[]},
  {id:2,name:"30 Dk Spor",icon:"🏃",color:"#2edc8a",completions:[]},
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
/* ═══════════════════════════════════════════════════════ MiniCalendar */
function MiniCalendar({selected,onSelect}) {
  const {tasks} = useContext(Ctx)
  const [mc,setMc] = useState(new Date(t0))
  const ms = new Date(mc.getFullYear(),mc.getMonth(),1)
  const gs = new Date(ms); gs.setDate(1-((ms.getDay()+6)%7))
  const cells = Array.from({length:42},(_,i)=>add(gs,i))
  const DAYS = ["P","S","Ç","P","C","C","P"]

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
        <button onClick={()=>setMc(d=>{const r=new Date(d);r.setMonth(r.getMonth()-1);return r})}
          style={{background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:15,padding:"0 4px",lineHeight:1}}>‹</button>
        <span style={{fontSize:11,fontWeight:700,color:"var(--t1)"}}>{mc.toLocaleDateString("tr-TR",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setMc(d=>{const r=new Date(d);r.setMonth(r.getMonth()+1);return r})}
          style={{background:"none",border:"none",color:"var(--t2)",cursor:"pointer",fontSize:15,padding:"0 4px",lineHeight:1}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:3}}>
        {["P","S","Ç","P","C","C","P"].map((d,i)=>(
          <div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:"var(--t3)",padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
        {cells.map((cell,i)=>{
          const key=dk(cell)
          const isToday=key===dk(t0)
          const isSel=key===selected
          const isOther=cell.getMonth()!==mc.getMonth()
          const hasTasks=tasks.some(t=>t.date===key)
          return (
            <div key={i} onClick={()=>onSelect(key,cell)}
              style={{
                textAlign:"center",fontSize:11,padding:"4px 2px",borderRadius:5,
                cursor:"pointer",position:"relative",
                background:isSel?"var(--acc)":isToday?"rgba(79,158,255,.18)":"transparent",
                color:isSel?"#fff":isToday?"var(--acc)":isOther?"rgba(61,90,122,.6)":"var(--t2)",
                fontWeight:isSel||isToday?700:400,transition:".1s",
              }}
              onMouseOver={e=>{if(!isSel&&!isToday)e.currentTarget.style.background="rgba(79,158,255,.1)"}}
              onMouseOut={e=>{if(!isSel&&!isToday)e.currentTarget.style.background="transparent"}}
            >
              {cell.getDate()}
              {hasTasks&&!isSel&&(
                <div style={{width:3,height:3,borderRadius:"50%",background:isToday?"var(--acc)":"var(--t3)",margin:"1px auto 0"}}/>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
/* ═══════════════════════════════════════════════════════ MODAL (own state) */
function Modal() {
  const {modal,setModal,modalTask,folders,notes,setNotes,setTasks,setGoals,setFolders,selFolder,setSelFolder,setSelNote,setEditMode,setEditTxt,setEditTitle,calendars} = useContext(Ctx)
  const [f,setF]     = useState({})
  const [tpl,setTpl] = useState("blank")
  useEffect(()=>{
    if(modalTask?.prefill) setF(modalTask.prefill)
    else setF({})
    setTpl("blank")
  },[modal])
  if(!modal) return null
  const upd=(k,v)=>setF(x=>({...x,[k]:v}))

  if(modal==="td"&&modalTask&&!modalTask.prefill){
    const t=modalTask
    const st=t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`
    const et=t.endTime||`${String((t.hour||9)+(t.dur||1)).padStart(2,"0")}:00`
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
            {t.location&&<div>📍 {t.location}</div>}
            {t.priority&&<div>{PL[t.priority]}</div>}
            {t.reminder&&<div>🔔 {t.reminder} dk önce hatırlat</div>}
            {t.taskType==="focus"&&<div>🎯 Odak Zamanı</div>}
            {t.recurring&&t.recurring!=="none"&&<div>🔁 {t.recurring==="daily"?"Her gün":t.recurring==="weekly"?"Her hafta":"Her ay"}{t.recurCount?` · ${t.recurCount} kez`:""}</div>}
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

  const taskFields=()=>(
    <>
      {/* Tip */}
      <div className="fg">
        <label className="fl">Tür</label>
        <div style={{display:"flex",gap:6,marginTop:4}}>
          {[["task","📋 Görev"],["focus","🎯 Odak"],["event","📅 Etkinlik"]].map(([v,l])=>(
            <div key={v} onClick={()=>upd("taskType",v)}
              style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${(f.taskType||"task")===v?"var(--acc)":"var(--b1)"}`,background:(f.taskType||"task")===v?"rgba(79,158,255,.12)":"var(--s1)",cursor:"pointer",fontSize:12,color:(f.taskType||"task")===v?"var(--acc)":"var(--t2)",transition:".1s"}}
            >{l}</div>
          ))}
        </div>
      </div>
      <div className="fg"><label className="fl">Görev Adı</label>
        <input className="fi2" placeholder={f.taskType==="focus"?"Odak seansı...":"Veri Yapıları çalış..."} value={f.title||""} onChange={e=>upd("title",e.target.value)}/></div>
      <div className="fg"><label className="fl">Tarih</label>
        <input className="fi2" type="date" value={f.date||dk(t0)} onChange={e=>upd("date",e.target.value)}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div className="fg"><label className="fl">Başlangıç</label>
          <input className="fi2" type="time" value={f.startTime||"09:00"} onChange={e=>upd("startTime",e.target.value)}/></div>
        <div className="fg"><label className="fl">Bitiş</label>
          <input className="fi2" type="time" value={f.endTime||"10:00"} onChange={e=>upd("endTime",e.target.value)}/></div>
      </div>
      <div className="fg"><label className="fl">Konum (isteğe bağlı)</label>
        <input className="fi2" placeholder="Kütüphane, D-101..." value={f.location||""} onChange={e=>upd("location",e.target.value)}/></div>
      <div className="fg"><label className="fl">Açıklama</label>
        <textarea className="fi2" rows={2} placeholder="Notlar..." value={f.desc||""} onChange={e=>upd("desc",e.target.value)} style={{resize:"none"}}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div className="fg"><label className="fl">Öncelik</label>
          <select className="fi2" value={f.priority||"medium"} onChange={e=>upd("priority",e.target.value)}>
            <option value="high">🔴 Yüksek</option>
            <option value="medium">🟡 Orta</option>
            <option value="low">🟢 Düşük</option>
          </select></div>
        <div className="fg"><label className="fl">Hatırlatıcı</label>
          <select className="fi2" value={f.reminder||""} onChange={e=>upd("reminder",e.target.value?Number(e.target.value):"")}>
            <option value="">Yok</option>
            <option value="5">5 dk önce</option>
            <option value="10">10 dk önce</option>
            <option value="15">15 dk önce</option>
            <option value="30">30 dk önce</option>
            <option value="60">1 saat önce</option>
          </select></div>
      </div>
      {/* Tekrarlama */}
      <div className="fg"><label className="fl">Tekrarlama</label>
        <select className="fi2" value={f.recurring||"none"} onChange={e=>upd("recurring",e.target.value)}>
          <option value="none">Yok</option>
          <option value="daily">Her gün</option>
          <option value="weekly">Her hafta</option>
          <option value="monthly">Her ay</option>
        </select>
      </div>
      {f.recurring&&f.recurring!=="none"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="fg"><label className="fl">Kaç kez tekrar</label>
            <input className="fi2" type="number" min="1" max="52" placeholder="Sonsuz" value={f.recurCount||""} onChange={e=>upd("recurCount",e.target.value?Number(e.target.value):"")}/></div>
          <div className="fg"><label className="fl">Bitiş tarihi</label>
            <input className="fi2" type="date" value={f.recurEnd||""} onChange={e=>upd("recurEnd",e.target.value)}/></div>
        </div>
      )}
      <div className="fg"><label className="fl">Renk</label>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:4}}>
          {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:f.color===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
        </div></div>
    </>
  )

  const CFGS={
    task:{ title:"Görev Ekle", sub:()=>{
      const st=f.startTime||"09:00", et=f.endTime||"10:00"
      const base={id:uid(),title:f.title||(f.taskType==="focus"?"Odak Zamanı":"Görev"),date:f.date||dk(t0),
        startTime:st,endTime:et,hour:parseInt(st.split(":")[0]),
        dur:Math.max(1,Math.round((timeToMins(et)-timeToMins(st))/60)),
        done:false,color:f.color||"#4fa3ff",desc:f.desc||"",location:f.location||"",
        priority:f.priority||"medium",recurring:f.recurring||"none",
        recurCount:f.recurCount||null,recurEnd:f.recurEnd||null,
        reminder:f.reminder||null,taskType:f.taskType||"task",calendarId:f.calendarId||null}
      const arr=[], bd=new Date(f.date||dk(t0))
      const maxCount=base.recurCount||999
      const endDate=base.recurEnd?new Date(base.recurEnd):null
      const addTask=(d,i)=>{
        if(i>=maxCount)return false
        if(endDate&&d>endDate)return false
        arr.push({...base,id:uid(),date:dk(d)}); return true
      }
      if(base.recurring==="none") arr.push({...base,id:uid()})
      else if(base.recurring==="daily")  for(let i=0;i<365;i++){if(!addTask(add(bd,i),i))break}
      else if(base.recurring==="weekly") for(let i=0;i<52;i++) {if(!addTask(add(bd,i*7),i))break}
      else if(base.recurring==="monthly")for(let i=0;i<24;i++) {const d=new Date(bd);d.setMonth(d.getMonth()+i);if(!addTask(d,i))break}
      setTasks(ts=>[...ts,...arr])
    }},
    editTask:{ title:"Görevi Düzenle", sub:()=>{
      setTasks(ts=>ts.map(t=>{
        if(t.id!==modalTask?.id)return t
        const st=f.startTime||t.startTime||"09:00"
        const et=f.endTime||t.endTime||"10:00"
        return {...t,title:f.title||t.title,date:f.date||t.date,startTime:st,endTime:et,
          hour:parseInt(st.split(":")[0]),dur:Math.max(1,Math.round((timeToMins(et)-timeToMins(st))/60)),
          desc:f.desc!==undefined?f.desc:t.desc,location:f.location!==undefined?f.location:t.location,
          priority:f.priority||t.priority,color:f.color||t.color,reminder:f.reminder!==undefined?f.reminder:t.reminder}
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
  const cfg=CFGS[modal]; if(!cfg)return null
  const submit=()=>{ cfg.sub(); setModal(null) }

  return (
    <div className="ov" onClick={e=>e.target.className==="ov"&&setModal(null)}>
      <div className="mdl" onClick={e=>e.stopPropagation()} style={{maxHeight:"85vh",overflowY:"auto"}}>
        <div className="mt">{cfg.title}</div>

        {(modal==="task"||modal==="editTask")&&(
          modal==="editTask"&&modalTask&&!modalTask.prefill
            ? (() => {
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
                  <div className="fg"><label className="fl">Konum</label>
                    <input className="fi2" defaultValue={t.location||""} onChange={e=>upd("location",e.target.value)}/></div>
                  <div className="fg"><label className="fl">Açıklama</label>
                    <textarea className="fi2" rows={2} defaultValue={t.desc||""} onChange={e=>upd("desc",e.target.value)} style={{resize:"none"}}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div className="fg"><label className="fl">Öncelik</label>
                      <select className="fi2" defaultValue={t.priority||"medium"} onChange={e=>upd("priority",e.target.value)}>
                        <option value="high">🔴 Yüksek</option><option value="medium">🟡 Orta</option><option value="low">🟢 Düşük</option>
                      </select></div>
                    <div className="fg"><label className="fl">Hatırlatıcı</label>
                      <select className="fi2" defaultValue={t.reminder||""} onChange={e=>upd("reminder",e.target.value?Number(e.target.value):"")}>
                        <option value="">Yok</option><option value="5">5 dk</option><option value="15">15 dk</option><option value="30">30 dk</option><option value="60">1 saat</option>
                      </select></div>
                  </div>
                  <div className="fg"><label className="fl">Renk</label>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:4}}>
                      {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:(f.color||t.color)===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
                    </div></div>
                </>
              })()
            : taskFields()
        )}

        {modal==="note"&&<>
          <div className="fg"><label className="fl">Şablon</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
              {Object.entries(NOTE_TPLS).map(([k,v])=>(
                <div key={k} onClick={()=>setTpl(k)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${tpl===k?"var(--acc)":"var(--b1)"}`,background:tpl===k?"rgba(79,158,255,.1)":"var(--s1)",cursor:"pointer",fontSize:12,color:tpl===k?"var(--acc)":"var(--t2)",transition:".1s"}}>{v.name}</div>
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

        {modal==="folder"&&<>
          <div className="fg"><label className="fl">Klasör Adı</label>
            <input className="fi2" placeholder="Algoritma..." value={f.name||""} onChange={e=>upd("name",e.target.value)}/></div>
          <div className="fg"><label className="fl">Üst Klasör</label>
            <select className="fi2" value={f.pid||""} onChange={e=>upd("pid",e.target.value)}>
              <option value="">— Yok —</option>
              {folders.map(fl=><option key={fl.id} value={fl.id}>{fl.name}</option>)}
            </select></div>
        </>}

        {modal==="goal"&&<>
          <div className="fg"><label className="fl">Hedef Adı</label>
            <input className="fi2" placeholder="Haftalık 25 saat..." value={f.title||""} onChange={e=>upd("title",e.target.value)}/></div>
          <div className="fg"><label className="fl">Hedef Değer</label>
            <input className="fi2" type="number" placeholder="25" value={f.target||""} onChange={e=>upd("target",e.target.value)}/></div>
          <div className="fg"><label className="fl">Renk</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:4}}>
              {COLORS.map(c=><div key={c} onClick={()=>upd("color",c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:f.color===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>)}
            </div></div>
        </>}

        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button className="btn bp" style={{flex:1}} onClick={submit}>{modal==="editTask"?"Kaydet":"Ekle"}</button>
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
              {l:"Bu Hafta",v:wData.reduce((s,d)=>s+d.h,0).toFixed(1)+" saat",c:"#4f9eff"},
              {l:"Tamamlanan",v:wData.reduce((s,d)=>s+d.done,0)+" görev",c:"#2edc8a"},
              {l:"Toplam Saat",v:totalH.toFixed(1)+" saat",c:"#ffaa3d"},
              {l:"Tamamlanan",v:totalDone+" görev",c:"#ff6fa8"},
            ].map((x,i)=>(
              <div key={i} className="card" style={{textAlign:"center",padding:14}}>
                <div style={{fontSize:9,fontWeight:700,color:x.c,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,opacity:.8}}>{x.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--t1)",fontFamily:"Syne"}}>{x.v}</div>
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
  const {tasks,setTasks,setModal,setModalTask,calendars,setCalendars,calSearchQ,setCalSearchQ} = useContext(Ctx)
  const [view,setView]   = useState("week")
  const [cal,setCal]     = useState(new Date(t0))
  const [selDay,setSelDay] = useState(dk(t0))

  const dragInfo    = useRef(null)
  const ghostPosRef = useRef(null)
  const createRef   = useRef(null)
  const resizeRef   = useRef(null)
  const [ghostPos,setGhostPos]     = useState(null)
  const [createGhost,setCreateGhost] = useState(null)
  const [dropKey,setDropKey]       = useState(null)

  const SNAP=15, PX_PER_MIN=1, HDR_H=46, START_H=7
  const minsToTop = m => HDR_H+(m-START_H*60)*PX_PER_MIN
  const fmtTime   = m => `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`

  const ws = useMemo(()=>{ const d=new Date(cal); d.setDate(cal.getDate()-((cal.getDay()+6)%7)); d.setHours(0,0,0,0); return d },[cal])
  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=>add(ws,i)),[ws])
  const ms2  = new Date(cal.getFullYear(),cal.getMonth(),1)
  const gs2  = useMemo(()=>{ const d=new Date(ms2); d.setDate(1-((ms2.getDay()+6)%7)); return d },[ms2])
  const mcs  = useMemo(()=>Array.from({length:42},(_,i)=>add(gs2,i)),[gs2])

  const visibleCals = useMemo(()=>new Set(calendars.filter(c=>c.visible).map(c=>c.id)),[calendars])
  const filteredTasks = useMemo(()=>{
    let ts=tasks
    if(calSearchQ) ts=ts.filter(t=>t.title.toLowerCase().includes(calSearchQ.toLowerCase()))
    return ts
  },[tasks,calSearchQ])

  const prev=()=>setCal(d=>{ const r=new Date(d); if(view==="week")r.setDate(r.getDate()-7); else if(view==="month")r.setMonth(r.getMonth()-1); else r.setDate(r.getDate()-1); return r })
  const next=()=>setCal(d=>{ const r=new Date(d); if(view==="week")r.setDate(r.getDate()+7); else if(view==="month")r.setMonth(r.getMonth()+1); else r.setDate(r.getDate()+1); return r })

  const title = view==="week"
    ? `${weekDays[0].toLocaleDateString("tr-TR",{day:"numeric",month:"short"})} – ${weekDays[6].toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric"})}`
    : view==="month" ? cal.toLocaleDateString("tr-TR",{month:"long",year:"numeric"})
    : cal.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})

  const exportICS=()=>{
    const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//StudyFlow//TR"]
    tasks.forEach(t=>{
      const d=t.date.replace(/-/g,"")
      const st=(t.startTime||`${String(t.hour||9).padStart(2,"0")}:00`).replace(":","")
      const et=(t.endTime||`${String((t.hour||9)+(t.dur||1)).padStart(2,"0")}:00`).replace(":","")
      lines.push("BEGIN:VEVENT",`DTSTART:${d}T${st}00`,`DTEND:${d}T${et}00`,`SUMMARY:${t.title}`,t.location?`LOCATION:${t.location}`:"","END:VEVENT")
    })
    lines.push("END:VCALENDAR")
    const blob=new Blob([lines.filter(Boolean).join("\r\n")],{type:"text/calendar"})
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="studyflow.ics"; a.click(); URL.revokeObjectURL(url)
  }

  /* ── MOVE DRAG ── */
  const onBlockMouseDown=(e,task)=>{
    if(e.target.classList.contains("resize-handle"))return
    e.preventDefault(); e.stopPropagation()
    const colEl=e.currentTarget.closest(".wdcol")
    const rect=colEl?.getBoundingClientRect()
    const relY=rect?e.clientY-rect.top:0
    const clickMins=START_H*60+relY/PX_PER_MIN
    const offsetMins=clickMins-getStartMins(task)
    dragInfo.current={id:task.id,offsetMins,task}

    const onMove=ev=>{
      const col=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(".wdcol")
      if(!col)return
      const r2=col.getBoundingClientRect()
      let newSm=START_H*60+(ev.clientY-r2.top)/PX_PER_MIN-offsetMins
      newSm=Math.round(newSm/SNAP)*SNAP; newSm=Math.max(START_H*60,Math.min(23*60,newSm))
      const dur=getEndMins(task)-getStartMins(task)
      const colIdx=parseInt(col.dataset.colidx||"0")
      const gp={colIdx,topPx:minsToTop(newSm),height:dur*PX_PER_MIN,startMins:newSm,dur}
      ghostPosRef.current=gp; setGhostPos(gp); setDropKey(`m-${colIdx}-${newSm}`)
    }
    const onUp=ev=>{
      const gp=ghostPosRef.current
      if(gp){
        const col=document.elementFromPoint(ev.clientX,ev.clientY)?.closest(".wdcol")
        const colIdx=col?parseInt(col.dataset.colidx||"0"):gp.colIdx
        const days=view==="day"?[cal]:weekDays
        const newDate=dk(days[Math.min(colIdx,days.length-1)])
        const newEm=gp.startMins+gp.dur
        setTasks(ts=>ts.map(t=>t.id===task.id?{...t,date:newDate,startTime:fmtTime(gp.startMins),endTime:fmtTime(newEm),hour:Math.floor(gp.startMins/60),dur:Math.ceil(gp.dur/60)}:t))
      }
      ghostPosRef.current=null; setGhostPos(null); setDropKey(null); dragInfo.current=null
      window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp)
    }
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp)
  }

  /* ── RESIZE DRAG ── */
  const onResizeMouseDown=(e,task)=>{
    e.preventDefault(); e.stopPropagation()
    resizeRef.current={task}
    const onMove=ev=>{
      const col=ev.target.closest(".wdcol")||document.elementFromPoint(ev.clientX,ev.clientY)?.closest(".wdcol")
      if(!col)return
      const r=col.getBoundingClientRect()
      let endM=START_H*60+(ev.clientY-r.top)/PX_PER_MIN
      endM=Math.round(endM/SNAP)*SNAP; endM=Math.max(getStartMins(task)+15,Math.min(24*60,endM))
      setTasks(ts=>ts.map(t=>t.id===task.id?{...t,endTime:fmtTime(endM),dur:Math.ceil((endM-getStartMins(task))/60)}:t))
    }
    const onUp=()=>{ resizeRef.current=null; window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp) }
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp)
  }

  /* ── CREATE DRAG ── */
  const onColMouseDown=(e,dayIdx)=>{
    if(e.target.closest(".wblock")||e.target.classList.contains("resize-handle"))return
    e.preventDefault()
    const col=e.currentTarget
    const r=col.getBoundingClientRect()
    let startM=START_H*60+(e.clientY-r.top)/PX_PER_MIN
    startM=Math.round(startM/SNAP)*SNAP
    createRef.current={dayIdx,startMins:startM,endMins:startM+60}
    setCreateGhost({colIdx:dayIdx,topPx:minsToTop(startM),height:60,startMins:startM,endMins:startM+60})

    const onMove=ev=>{
      const r2=col.getBoundingClientRect()
      let endM=START_H*60+(ev.clientY-r2.top)/PX_PER_MIN
      endM=Math.round(endM/SNAP)*SNAP; endM=Math.max(startM+15,Math.min(24*60,endM))
      createRef.current.endMins=endM
      setCreateGhost({colIdx:dayIdx,topPx:minsToTop(startM),height:(endM-startM)*PX_PER_MIN,startMins:startM,endMins:endM})
    }
    const onUp=()=>{
      const cr=createRef.current
      if(cr){
        const days=view==="day"?[cal]:weekDays
        const d=days[Math.min(cr.dayIdx,days.length-1)]
        setModalTask({prefill:{date:dk(d),startTime:fmtTime(cr.startMins),endTime:fmtTime(cr.endMins)}})
        setModal("task")
      }
      createRef.current=null; setCreateGhost(null)
      window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp)
    }
    window.addEventListener("mousemove",onMove); window.addEventListener("mouseup",onUp)
  }

  /* ── MONTH DRAG ── */
  const onDS=(e,id)=>{ dragInfo.current={id}; e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("id",String(id)) }
  const onDE=()=>{ dragInfo.current=null; setDropKey(null) }
  const dropMonth=(e,date)=>{ e.preventDefault(); const id=Number(e.dataTransfer.getData("id")); if(id)setTasks(ts=>ts.map(t=>t.id===id?{...t,date:dk(date)}:t)); onDE() }

  /* ── DAY/WEEK COLUMN RENDERER ── */
  const renderDayCol=(day,di,colCount=7)=>{
    const key=dk(day), dt=filteredTasks.filter(t=>t.date===key)
    return (
      <div key={di} className="wdcol" data-colidx={di} style={{gridColumn:di+1,gridRow:2,minWidth:colCount===1?"100%":"auto"}}
        onMouseDown={e=>onColMouseDown(e,di)}
      >
        {HRS.map(h=>(
          <div key={h} className={`whour${dropKey===`${key}-${h}`?" dov":""}`}>
            {[15,30,45].map(m=>(
              <div key={m} style={{position:"absolute",left:0,right:0,top:m,borderBottom:"1px dashed rgba(37,60,94,.18)",pointerEvents:"none"}}/>
            ))}
          </div>
        ))}
        {createGhost&&createGhost.colIdx===di&&(
          <div className="create-ghost" style={{top:createGhost.topPx,height:Math.max(createGhost.height,20)}}>
            <span style={{fontSize:10,color:"var(--acc)",fontWeight:700}}>{fmtTime(createGhost.startMins)} – {fmtTime(createGhost.endMins)}</span>
          </div>
        )}
        {ghostPos&&ghostPos.colIdx===di&&dragInfo.current&&(()=>{
          const gt=tasks.find(t=>t.id===dragInfo.current.id)
          return gt?(
            <div style={{position:"absolute",left:3,right:3,top:ghostPos.topPx,height:Math.max(ghostPos.height-3,20),background:gt.color+"35",border:`2px dashed ${gt.color}`,borderRadius:6,pointerEvents:"none",zIndex:20,display:"flex",alignItems:"center",padding:"0 7px"}}>
              <span style={{fontSize:10,color:gt.color,fontWeight:700}}>{fmtTime(ghostPos.startMins)} – {fmtTime(ghostPos.startMins+ghostPos.dur)}</span>
            </div>
          ):null
        })()}
        {dt.map(t=>{
          const sm=getStartMins(t), em=getEndMins(t)
          const topPx=minsToTop(sm), height=Math.max((em-sm)*PX_PER_MIN-3,22)
          const isGhost=dragInfo.current?.id===t.id&&ghostPos
          const cal2=calendars.find(c=>c.id===t.calendarId)
          return (
            <div key={t.id} style={{
              position:"absolute",left:3,right:3,top:topPx,height,
              background:isGhost?"transparent":t.color+"20",color:t.color,
              borderLeft:`3px solid ${t.priority?PC[t.priority]:t.color}`,
              borderRadius:6,padding:"3px 7px",cursor:"grab",fontSize:11,fontWeight:600,
              overflow:"hidden",zIndex:5,opacity:isGhost?.25:1,userSelect:"none",
              boxShadow:isGhost?"none":"0 2px 8px rgba(0,0,0,.2)",transition:"opacity .1s",
            }}
              onMouseDown={e=>onBlockMouseDown(e,t)}
              onClick={e=>{if(!ghostPos){setModalTask(t);setModal("td")}}}
            >
              <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}{t.taskType==="focus"?" 🎯":""}{t.recurring&&t.recurring!=="none"?" 🔁":""}</div>
              {height>36&&<div style={{fontSize:10,opacity:.65}}>{t.startTime||`${t.hour}:00`}–{t.endTime}</div>}
              {height>52&&t.location&&<div style={{fontSize:10,opacity:.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📍{t.location}</div>}
              <div className="resize-handle" onMouseDown={e=>onResizeMouseDown(e,t)}/>
            </div>
          )
        })}
      </div>
    )
  }

  /* ── AGENDA VIEW ── */
  const agendaDays = useMemo(()=>{
    const result=[]
    for(let i=-1;i<60;i++){
      const d=add(t0,i), key=dk(d)
      const dt=filteredTasks.filter(t=>t.date===key).sort((a,b)=>getStartMins(a)-getStartMins(b))
      if(dt.length>0) result.push({date:d,key,tasks:dt})
    }
    return result
  },[filteredTasks])

  return (
    <div className="cwrap">
      {/* ── HEADER ── */}
      <div className="chead">
        <button className="cnav" onClick={prev}><Ic n="cl" sz={13}/></button>
        <span style={{fontSize:13,fontWeight:700,minWidth:150}}>{title}</span>
        <button className="cnav" onClick={next}><Ic n="cr" sz={13}/></button>
        <button className="btn bg bsm" onClick={()=>{setCal(new Date(t0));setSelDay(dk(t0))}}>Bugün</button>
        <button className="btn bp bsm" onClick={()=>setModal("task")}><Ic n="plus" sz={12}/> Görev Ekle</button>
        <div style={{flex:1,maxWidth:200,position:"relative"}}>
          <input value={calSearchQ} onChange={e=>setCalSearchQ(e.target.value)}
            placeholder="🔍 Görev ara..." className="fi2"
            style={{padding:"5px 10px",fontSize:12,width:"100%"}}/>
        </div>
        <button className="btn bg bsm" onClick={exportICS} title=".ics olarak dışa aktar">⬇ iCal</button>
        <div className="ctabs">
          {[["day","Gün"],["week","Hafta"],["month","Ay"],["agenda","Ajanda"]].map(([v,l])=>(
            <div key={v} className={`ctab${view===v?" on":""}`} onClick={()=>setView(v)}>{l}</div>
          ))}
        </div>
      </div>

      <div className="cwrap-body">
        {/* ── SOL PANEL ── */}
        <div className="calsb">
          {/* Mini Takvim */}
          <MiniCalendar selected={selDay} onSelect={(key,cell)=>{
            setSelDay(key); setCal(new Date(cell))
            if(view==="month"||view==="agenda") setView("day")
          }}/>

          {/* Kategoriler */}
          <div style={{marginTop:16,borderTop:"1px solid rgba(31,51,82,.4)",paddingTop:12}}>
            <div style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Takvimler</div>
            {calendars.map(c=>(
              <div key={c.id} className="calcat" onClick={()=>setCalendars(cs=>cs.map(x=>x.id===c.id?{...x,visible:!x.visible}:x))}>
                <div style={{width:12,height:12,borderRadius:3,background:c.visible?c.color:"transparent",border:`2px solid ${c.color}`,flexShrink:0,transition:".15s"}}/>
                <span style={{flex:1,fontSize:12}}>{c.name}</span>
                <span style={{fontSize:10,color:"var(--t3)"}}>{tasks.filter(t=>t.calendarId===c.id).length}</span>
              </div>
            ))}
          </div>

          {/* Bugünkü özet */}
          <div style={{marginTop:16,borderTop:"1px solid rgba(31,51,82,.4)",paddingTop:12}}>
            <div style={{fontSize:9,fontWeight:700,color:"var(--t3)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Bugün</div>
            {tasks.filter(t=>t.date===dk(t0)).length===0
              ? <div style={{fontSize:11,color:"var(--t3)",fontStyle:"italic"}}>Görev yok</div>
              : tasks.filter(t=>t.date===dk(t0)).slice(0,4).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid rgba(31,51,82,.2)"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:t.color,flexShrink:0}}/>
                  <span style={{fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:t.done?"var(--t3)":"var(--t2)",textDecoration:t.done?"line-through":"none"}}>{t.title}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── MAIN CALENDAR AREA ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

          {/* MONTH */}
          {view==="month"&&(
            <div className="month-out">
              <div className="mgrid">
                {DNS.map(d=><div key={d} className="mhdr">{d}</div>)}
                {mcs.map((cell,i)=>{
                  const key=dk(cell), isT=key===dk(t0), isO=cell.getMonth()!==cal.getMonth()
                  const ct=filteredTasks.filter(t=>t.date===key)
                  return (
                    <div key={i} className={`mcell${isT?" tod":""}${isO?" om":""}${dropKey===key?" dov":""}`}
                      onDragOver={e=>{e.preventDefault();setDropKey(key)}}
                      onDragLeave={()=>setDropKey(null)}
                      onDrop={e=>dropMonth(e,cell)}
                      onDoubleClick={()=>{setModalTask({prefill:{date:key}});setModal("task")}}
                    >
                      <div className={`mdn${isT?" td":""}`} onClick={()=>{setCal(new Date(cell));setSelDay(key);setView("day")}}>{cell.getDate()}</div>
                      {ct.slice(0,3).map(t=>(
                        <div key={t.id} className={`chip${t.done?" cdone":""}`}
                          style={{background:t.color+"22",color:t.color,borderColor:t.color+"35",borderLeft:`3px solid ${t.priority?PC[t.priority]:t.color}`}}
                          draggable onDragStart={e=>onDS(e,t.id)} onDragEnd={onDE}
                          onClick={e=>{e.stopPropagation();setModalTask(t);setModal("td")}}
                        >{t.startTime||`${t.hour||9}:00`} {t.title}</div>
                      ))}
                      {ct.length>3&&<div style={{fontSize:10,color:"var(--t3)",padding:"1px 5px"}}>+{ct.length-3} daha</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* WEEK */}
          {view==="week"&&(
            <div className="wout">
              <div className="wtimecol">
                <div className="wthdr"/>
                {HRS.map(h=><div key={h} className="wts">{String(h).padStart(2,"0")}:00</div>)}
              </div>
              <div className="wscroll">
                <div className="winner">
                  <div className="wdhrow">
                    {weekDays.map((day,di)=>{
                      const isT=dk(day)===dk(t0)
                      const cnt=filteredTasks.filter(t=>t.date===dk(day)).length
                      return (
                        <div key={di} className="wdh" style={{cursor:"pointer"}} onClick={()=>{setCal(new Date(day));setSelDay(dk(day));setView("day")}}>
                          <div className="wdn">{DNS[di]}</div>
                          <div className={`wdd${isT?" td":""}`}>{day.getDate()}</div>
                          {cnt>0&&<div style={{fontSize:9,color:"var(--t3)",marginTop:1}}>{cnt} görev</div>}
                        </div>
                      )
                    })}
                  </div>
                  {weekDays.map((day,di)=>renderDayCol(day,di,7))}
                </div>
              </div>
            </div>
          )}

          {/* DAY */}
          {view==="day"&&(
            <div className="wout">
              <div className="wtimecol">
                <div className="wthdr"/>
                {HRS.map(h=><div key={h} className="wts">{String(h).padStart(2,"0")}:00</div>)}
              </div>
              <div className="wscroll" style={{flex:1}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr",minWidth:"100%"}}>
                  <div className="wdhrow" style={{gridTemplateColumns:"1fr"}}>
                    <div className="wdh" style={{textAlign:"center"}}>
                      <div className="wdn">{cal.toLocaleDateString("tr-TR",{weekday:"long"}).toUpperCase()}</div>
                      <div className={`wdd${dk(cal)===dk(t0)?" td":""}`}>{cal.getDate()}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr",position:"relative"}}>
                    {renderDayCol(cal,0,1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AGENDA */}
          {view==="agenda"&&(
            <div style={{flex:1,overflowY:"auto",padding:"14px 18px"}}>
              {agendaDays.length===0&&(
                <div style={{textAlign:"center",padding:"40px",color:"var(--t3)"}}>
                  <div style={{fontSize:32,marginBottom:10}}>📭</div>
                  <div>{calSearchQ?"Sonuç bulunamadı":"Yakında görev yok"}</div>
                </div>
              )}
              {agendaDays.map(({date,key,tasks:dt})=>(
                <div key={key}>
                  <div className="agdate">
                    {key===dk(t0)?"Bugün — ":key===dk(add(t0,1))?"Yarın — ":""}
                    {date.toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                  {dt.map(t=>(
                    <div key={t.id} className="agitem" onClick={()=>{setModalTask(t);setModal("td")}}>
                      <div style={{width:4,alignSelf:"stretch",borderRadius:4,background:t.priority?PC[t.priority]:t.color,flexShrink:0}}/>
                      <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:80}}>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--t2)",fontFamily:"JetBrains Mono"}}>{t.startTime||`${t.hour||9}:00`}</div>
                        <div style={{fontSize:10,color:"var(--t3)"}}>{t.endTime}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:t.done?"var(--t3)":"var(--t1)",textDecoration:t.done?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {t.taskType==="focus"?"🎯 ":""}{t.title}{t.recurring&&t.recurring!=="none"?" 🔁":""}
                        </div>
                        {t.location&&<div style={{fontSize:11,color:"var(--t3)",marginTop:2}}>📍 {t.location}</div>}
                        {t.desc&&<div style={{fontSize:11,color:"var(--t3)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.desc}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        {t.priority&&<span style={{fontSize:10,color:PC[t.priority]}}>{PL[t.priority].split(" ")[0]}</span>}
                        {t.done&&<span style={{fontSize:10,color:"var(--green)"}}>✅</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

/* ═══════════════════════════════════════════════════════ Habit PAGE */


function HabitPage() {
  const {habits,setHabits} = useContext(Ctx)
  const [showAdd,setShowAdd] = useState(false)
  const [nf,setNf] = useState({name:"",icon:"💧",color:"#4f9eff"})
  const todayKey = dk(t0)

  const getStreak = habit => {
    let streak=0, d=new Date(t0)
    while(true){
      const k=dk(d)
      if(habit.completions.includes(k)){ streak++; d.setDate(d.getDate()-1) }
      else break
    }
    return streak
  }

  const getLongest = habit => {
    if(!habit.completions.length) return 0
    const sorted=[...habit.completions].sort()
    let max=1,cur=1
    for(let i=1;i<sorted.length;i++){
      const prev=new Date(sorted[i-1]), curr=new Date(sorted[i])
      const diff=(curr-prev)/(1000*60*60*24)
      if(diff===1){cur++;max=Math.max(max,cur)}else cur=1
    }
    return max
  }

  const toggle = (habit) => {
    const has=habit.completions.includes(todayKey)
    setHabits(hs=>hs.map(h=>h.id===habit.id?{...h,completions:has?h.completions.filter(c=>c!==todayKey):[...h.completions,todayKey]}:h))
  }

  const ICONS=["💧","🏃","📚","🧘","🥗","😴","🏋️","✍️","🎯","💊","🚫","🌿"]
  const LAST14 = Array.from({length:14},(_,i)=>add(t0,i-13))

  const motivate = streak => {
    if(streak===0) return {msg:"Bugün başla! 💪",c:"var(--t3)"}
    if(streak<3)   return {msg:`${streak} gün! Devam et! 🔥`,c:"var(--orange)"}
    if(streak<7)   return {msg:`${streak} günlük seri! Harika gidiyorsun! ⚡`,c:"var(--acc)"}
    if(streak<14)  return {msg:`${streak} GÜN! Alışkanlık oluşuyor! 🚀`,c:"var(--green)"}
    return {msg:`${streak} GÜN SERİ! Efsane! 🏆`,c:"#ffaa3d"}
  }

  return (
    <div className="cnt fade">
      {/* HEADER */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"var(--sp-md)"}}>
        <div>
          <div style={{fontSize:"var(--fs-lg)",fontWeight:800}}>Alışkanlık Takibi</div>
          <div style={{fontSize:"var(--fs-xs)",color:"var(--t3)",marginTop:3}}>Küçük adımlar, büyük değişimler yaratır.</div>
        </div>
        <button className="btn bp" onClick={()=>setShowAdd(s=>!s)}>
          + Alışkanlık Ekle
        </button>
      </div>

      {/* ADD FORM */}
      {showAdd&&(
        <div className="card" style={{marginBottom:"var(--sp-md)",border:"1px solid rgba(79,158,255,.3)"}}>
          <div style={{fontSize:"var(--fs-sm)",fontWeight:700,marginBottom:12}}>Yeni Alışkanlık</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:10}}>
            <input className="fi2" placeholder="Alışkanlık adı..." value={nf.name} onChange={e=>setNf(x=>({...x,name:e.target.value}))}/>
            <input className="fi2" style={{width:60,textAlign:"center",fontSize:20}} value={nf.icon} onChange={e=>setNf(x=>({...x,icon:e.target.value}))}/>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {ICONS.map(ic=>(
              <div key={ic} onClick={()=>setNf(x=>({...x,icon:ic}))}
                style={{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",background:nf.icon===ic?"rgba(79,158,255,.2)":"var(--s1)",border:`1px solid ${nf.icon===ic?"var(--acc)":"var(--b1)"}`,transition:".1s"}}>
                {ic}
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {COLORS.map(c=>(
              <div key={c} onClick={()=>setNf(x=>({...x,color:c}))}
                style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",outline:nf.color===c?"3px solid white":"3px solid transparent",transition:".1s"}}/>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bp" style={{flex:1}} onClick={()=>{
              if(!nf.name.trim())return
              setHabits(hs=>[...hs,{id:uid(),name:nf.name,icon:nf.icon,color:nf.color,completions:[]}])
              setNf({name:"",icon:"💧",color:"#4f9eff"}); setShowAdd(false)
            }}>Ekle</button>
            <button className="btn bg" onClick={()=>setShowAdd(false)}>İptal</button>
          </div>
        </div>
      )}

      {habits.length===0&&(
        <div style={{textAlign:"center",padding:"60px 20px",color:"var(--t3)"}}>
          <div style={{fontSize:48,marginBottom:12}}>🌱</div>
          <div style={{fontSize:"var(--fs-md)",fontWeight:700,marginBottom:6}}>Henüz alışkanlık yok</div>
          <div style={{fontSize:"var(--fs-sm)"}}>İlk alışkanlığını ekleyerek başla!</div>
        </div>
      )}

      {/* HABIT CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(260px,28vw,360px),1fr))",gap:"var(--sp-md)"}}>
        {habits.map(habit=>{
          const streak=getStreak(habit)
          const longest=getLongest(habit)
          const doneToday=habit.completions.includes(todayKey)
          const total=habit.completions.length
          const mot=motivate(streak)

          return (
            <div key={habit.id} style={{
              background:`linear-gradient(145deg,${habit.color}10,rgba(12,20,34,.97))`,
              border:`1px solid ${habit.color}30`,borderRadius:"var(--r)",
              padding:"var(--sp-md)",transition:"all .2s",
              boxShadow:doneToday?`0 4px 24px ${habit.color}20`:"none"
            }}>
              {/* HEADER */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${habit.color}20`,border:`1px solid ${habit.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                    {habit.icon}
                  </div>
                  <div>
                    <div style={{fontSize:"var(--fs-sm)",fontWeight:700}}>{habit.name}</div>
                    <div style={{fontSize:"var(--fs-xs)",color:mot.c,marginTop:2,fontWeight:600}}>{mot.msg}</div>
                  </div>
                </div>
                <button onClick={()=>setHabits(hs=>hs.filter(h=>h.id!==habit.id))}
                  style={{background:"none",border:"none",color:"var(--t3)",cursor:"pointer",fontSize:14,padding:4,lineHeight:1}}>✕</button>
              </div>

              {/* STATS ROW */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
                {[
                  {l:"Güncel Seri",v:streak,ic:"🔥"},
                  {l:"En Uzun",v:longest,ic:"🏆"},
                  {l:"Toplam",v:total,ic:"✅"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(0,0,0,.2)",borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                    <div style={{fontSize:16,marginBottom:2}}>{s.ic}</div>
                    <div style={{fontSize:"var(--fs-md)",fontWeight:800,color:"var(--t1)",lineHeight:1}}>{s.v}</div>
                    <div style={{fontSize:"var(--fs-xs)",color:"var(--t3)",marginTop:2}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* 14 GÜN GRID */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:"var(--fs-xs)",color:"var(--t3)",marginBottom:5,fontWeight:600}}>Son 14 Gün</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(14,1fr)",gap:3}}>
                  {LAST14.map((d,i)=>{
                    const k=dk(d), done=habit.completions.includes(k), isToday=k===todayKey
                    return (
                      <div key={i} title={k} style={{
                        aspectRatio:"1",borderRadius:4,
                        background:done?habit.color:"rgba(255,255,255,.05)",
                        border:isToday?`2px solid ${habit.color}`:"2px solid transparent",
                        transition:"all .15s",cursor:"default",
                        boxShadow:done?`0 0 6px ${habit.color}50`:"none",
                      }}/>
                    )
                  })}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                  <span style={{fontSize:"var(--fs-xs)",color:"var(--t3)"}}>14 gün önce</span>
                  <span style={{fontSize:"var(--fs-xs)",color:"var(--t3)"}}>bugün</span>
                </div>
              </div>

              {/* BUGÜN BUTONU */}
              <button onClick={()=>toggle(habit)} style={{
                width:"100%",padding:"10px",borderRadius:8,border:"none",cursor:"pointer",
                background:doneToday?`${habit.color}25`:"rgba(255,255,255,.04)",
                color:doneToday?habit.color:"var(--t2)",
                fontFamily:"Syne",fontWeight:700,fontSize:"var(--fs-sm)",
                border:`1px solid ${doneToday?habit.color+"50":"rgba(255,255,255,.07)"}`,
                transition:"all .2s",
                boxShadow:doneToday?`0 2px 14px ${habit.color}30`:"none",
              }}>
                {doneToday?`✅ Bugün Tamamlandı!`:`○ Bugün Tamamla`}
              </button>
            </div>
          )
        })}
      </div>

      {/* GENEL İSTATİSTİK */}
      {habits.length>0&&(
        <div className="card" style={{marginTop:"var(--sp-md)"}}>
          <div className="sh">📊 Genel Alışkanlık İstatistikleri</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
            {habits.map(h=>{
              const s=getStreak(h)
              const pct=Math.min(Math.round(h.completions.length/30*100),100)
              return (
                <div key={h.id} style={{padding:"10px 12px",background:"rgba(20,31,53,.5)",borderRadius:9,border:`1px solid ${h.color}20`}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                    <span style={{fontSize:14}}>{h.icon}</span>
                    <span style={{fontSize:"var(--fs-xs)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{h.name}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:6}}>
                    <span style={{fontSize:"var(--fs-xl)",fontWeight:800,color:h.color,lineHeight:1}}>{s}</span>
                    <span style={{fontSize:"var(--fs-xs)",color:"var(--t3)"}}>gün seri 🔥</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:h.color,borderRadius:10,transition:"width .6s ease"}}/>
                  </div>
                  <div style={{fontSize:"var(--fs-xs)",color:"var(--t3)",marginTop:3}}>{h.completions.length} / 30 gün</div>
                </div>
              )
            })}
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
  const {tasks,setTasks,setModal,notes,goals} = useContext(Ctx)
  const tt   = tasks.filter(t=>t.date===dk(t0))
  const done = tt.filter(t=>t.done).length
  const wData = useMemo(()=>DNS.map((d,i)=>({day:d,h:[2.1,3.4,4.1,2.8,3.9,1.2,0.8][i]})),[])

  const statCards = [
    {l:"Bu Hafta",v:"18.3",u:"saat",s:"/25 hedef",c:"#4f9eff",g:"rgba(79,158,255,.12)",pct:73,ic:"📚"},
    {l:"Bugün",v:`${done}/${tt.length}`,u:"",s:"görev tamamlandı",c:"#ffaa3d",g:"rgba(255,170,61,.1)",pct:tt.length?Math.round(done/tt.length*100):0,ic:"✅"},
    {l:"Streak",v:"5",u:"gün",s:"üst üste",c:"#ff6fa8",g:"rgba(255,111,168,.1)",pct:71,ic:"🔥"},
    {l:"Notlar",v:`${notes.length}`,u:"",s:"toplam not",c:"#2edc8a",g:"rgba(46,220,138,.1)",pct:Math.min(notes.length*3,100),ic:"📝"},
  ]

  return (
    <div className="cnt fade">
      {/* STAT CARDS */}
      <div className="g4">
        {statCards.map((c,i)=>(
          <div key={i} style={{
            background:`linear-gradient(145deg,${c.g},rgba(12,20,34,.95))`,
            border:`1px solid ${c.c}22`,borderRadius:14,padding:"15px 16px",
            transition:"all .2s ease",cursor:"default",position:"relative",overflow:"hidden",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 28px ${c.c}18`}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}
          >
            <div style={{fontSize:9,fontWeight:700,color:c.c,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,opacity:.8}}>{c.l}</div>
            <div style={{fontSize:22,fontWeight:700,color:"var(--t1)",marginBottom:3,fontFamily:"Syne"}}>
              {c.v}{c.u?" "+c.u:""}
            </div>
            <div style={{fontSize:11,color:"var(--t3)",fontWeight:400}}>{c.s}</div>
            <div style={{height:2,background:"rgba(255,255,255,.04)",borderRadius:10,overflow:"hidden",marginTop:10}}>
              <div style={{height:"100%",width:`${c.pct}%`,background:c.c,borderRadius:10,transition:"width .7s ease"}}/>
            </div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* BUGÜNKÜ PLAN */}
        <div className="card">
          <div className="sh">
            <span style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--acc)",display:"inline-block",boxShadow:"0 0 6px var(--acc)"}}/>
              Bugünkü Plan
            </span>
            <button className="btn bg bsm" onClick={()=>setModal("task")} style={{gap:4}}>
              <Ic n="plus" sz={11}/> Ekle
            </button>
          </div>
          {tt.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--t3)"}}>
              <div style={{fontSize:28,marginBottom:6}}>🎯</div>
              <div style={{fontSize:12}}>Bugün görev yok</div>
            </div>
          )}
          {tt.map(t=>(
            <div key={t.id} className={`ti${t.done?" dn":""}`}>
              <div className={`chk${t.done?" on":""}`} style={{borderColor:t.done?"var(--green)":t.color}} onClick={()=>setTasks(ts=>ts.map(x=>x.id===t.id?{...x,done:!x.done}:x))}>
                {t.done?"✓":""}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>
                  {t.startTime||`${t.hour||9}:00`} · {t.priority&&<span style={{color:PC[t.priority]}}>{PL[t.priority].split(" ")[0]}</span>}
                </div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:t.color,flexShrink:0,boxShadow:`0 0 6px ${t.color}80`}}/>
            </div>
          ))}
        </div>

        {/* CHART */}
        <div className="card">
          <div className="sh">
            <span style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--acc2)",display:"inline-block",boxShadow:"0 0 6px var(--acc2)"}}/>
              Haftalık Çalışma
            </span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={wData} barSize={20} barGap={4}>
              <XAxis dataKey="day" tick={{fill:"var(--t3)",fontSize:11,fontFamily:"Syne"}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip
                contentStyle={{background:"rgba(15,24,40,.95)",border:"1px solid rgba(31,51,82,.7)",borderRadius:8,fontSize:12,boxShadow:"0 8px 24px rgba(0,0,0,.4)"}}
                formatter={v=>[`${v.toFixed(1)} saat`,"Çalışma"]}
                cursor={{fill:"rgba(79,158,255,.05)"}}
              />
              <Bar dataKey="h" radius={[5,5,0,0]}>
                {wData.map((_,i)=>(
                  <Cell key={i} fill={i===4?"url(#barGrad)":"rgba(31,51,82,.7)"}/>
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--acc)"/>
                  <stop offset="100%" stopColor="var(--acc2)"/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HEDEFLER */}
      {goals.length>0&&(
        <div className="card" style={{marginBottom:14}}>
          <div className="sh">
            <span style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"var(--orange)",display:"inline-block",boxShadow:"0 0 6px var(--orange)"}}/>
              Aktif Hedefler
            </span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {goals.slice(0,3).map(g=>{
              const p=Math.min(Math.round((g.cur/g.target)*100),100)
              return (
                <div key={g.id} style={{padding:"10px 13px",background:"rgba(20,31,53,.5)",borderRadius:10,border:"1px solid rgba(31,51,82,.5)"}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.title}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:11,color:"var(--t3)"}}>{g.cur}/{g.target}</span>
                    <span style={{fontSize:12,fontWeight:700,color:g.color,fontFamily:"JetBrains Mono"}}>{p}%</span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,.05)",borderRadius:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${p}%`,background:g.color,borderRadius:10,transition:"width .6s ease"}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ÖNERİLER */}
      <div className="card">
        <div className="sh">
          <span style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"var(--green)",display:"inline-block",boxShadow:"0 0 6px var(--green)"}}/>
            Akıllı Öneriler
          </span>
        </div>
        {[
          {ic:"🔔",t:"Veritabanı dersinde 3 gündür çalışmadınız.",c:"rgba(255,170,61,.08)",b:"rgba(255,170,61,.2)"},
          {ic:"🚀",t:"Streak 5 gün! Yarın da çalışırsan rozet kazanırsın.",c:"rgba(79,158,255,.06)",b:"rgba(79,158,255,.18)"},
          {ic:"📌",t:"Binary Tree notunu geçen hafta bıraktınız, bugün bitirin.",c:"rgba(46,220,138,.06)",b:"rgba(46,220,138,.18)"},
        ].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"10px 13px",background:s.c,border:`1px solid ${s.b}`,borderRadius:9,marginBottom:7,fontSize:12,color:"var(--t2)",transition:".15s",cursor:"default"}}
            onMouseOver={e=>{e.currentTarget.style.transform="translateX(3px)"}}
            onMouseOut={e=>{e.currentTarget.style.transform=""}}
          >
            <span style={{fontSize:16,flexShrink:0}}>{s.ic}</span>{s.t}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ APP */
export default function App() {
  useEffect(()=>{ const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s); return ()=>document.head.removeChild(s) },[])

  const [page,setPage]         = useState("dashboard")
  const [folders,setFolders]   = useLS("sf_fold", I_FOLD)
  const [notes,setNotes]       = useLS("sf_notes",I_NOTES)
  const [tasks,setTasks]       = useLS("sf_tasks",I_TASKS)
  const [goals,setGoals]       = useLS("sf_goals",I_GOALS)
  const [folderFiles,setFolderFiles] = useLS("sf_ffiles",[])
  const [habits,setHabits] = useLS("sf_habits", I_HABITS)
  const [selFolder,setSelFolder]= useState(2)
  const [selNote,setSelNote]   = useState(null)
  const [editMode,setEditMode] = useState(false)
  const [editTxt,setEditTxt]   = useState("")
  const [editTitle,setEditTitle]= useState("")
  const [modal,setModal]       = useState(null)
  const [modalTask,setModalTask]= useState(null)
  const [calendars,setCalendars] = useLS("sf_cals",[
    {id:1,name:"Dersler",color:"#4f9eff",visible:true},
    {id:2,name:"Kişisel",color:"#2edc8a",visible:true},
    {id:3,name:"Sınavlar",color:"#ff5c6e",visible:true},
  ])
  const [calSearchQ,setCalSearchQ] = useState("")
  const [tRunning,setTRunning] = useState(false)
  const [tMode,setTMode]       = useState("work")
  const [tSecs,setTSecs]       = useState(25*60)
  const [tPomos,setTPomos]     = useState(0)
  const [tWorkMin,setTWorkMin] = useState(25)
  const [tBreakMin,setTBreakMin] = useState(5)
  const [tDnd,setTDnd]         = useState(false)
  const tRef                   = useRef(null)

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

  useEffect(()=>{
    const h = e => {
      if(e.ctrlKey && e.key==="n"){ e.preventDefault(); setModal("note") }
      if(e.ctrlKey && e.key==="t"){ e.preventDefault(); setModal("task") }
      if(e.ctrlKey && e.key==="p"){ e.preventDefault(); setPage("timer") }
    }
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h)
  },[])

  useEffect(()=>{
    if(typeof Notification!=="undefined" && Notification.permission==="default") Notification.requestPermission()
    const iv=setInterval(()=>{
      const now=new Date(), nowKey=dk(now), nowM=now.getHours()*60+now.getMinutes()
      tasks.forEach(t=>{
        if(t.date===nowKey&&!t.done&&t.reminder){
          const notifyAt=getStartMins(t)-(t.reminder||15)
          if(nowM===notifyAt && Notification.permission==="granted"){
            new Notification(`⏰ ${t.title}`,{body:`${t.reminder} dakika içinde başlıyor — ${t.startTime||""}`})
          }
        }
      })
    },60000)
    return ()=>clearInterval(iv)
  },[tasks])

  const ctx = {
    tRunning,setTRunning,tMode,setTMode,tSecs,setTSecs,
    tPomos,setTPomos,tWorkMin,setTWorkMin,tBreakMin,setTBreakMin,
    tDnd,setTDnd,tRef,
    page,setPage,folders,setFolders,notes,setNotes,tasks,setTasks,goals,setGoals,
    selFolder,setSelFolder,selNote,setSelNote,
    editMode,setEditMode,editTxt,setEditTxt,editTitle,setEditTitle,
    modal,setModal,modalTask,setModalTask,
    folderFiles,setFolderFiles,
    calendars,setCalendars,calSearchQ,setCalSearchQ,
    habits,setHabits,
  }

  const NAV=[
    {id:"dashboard",l:"Dashboard",ic:"home"},
    {id:"calendar",l:"Takvim",ic:"cal"},
    {id:"notes",l:"Notlar",ic:"notes"},
    {id:"timer",l:"Zamanlayıcı",ic:"timer"},
    {id:"stats",l:"İstatistikler",ic:"chart"},
    {id:"goals",l:"Hedefler",ic:"tgt"},
    {id:"habits",l:"Alışkanlıklar",ic:"tgt"},
  ]
  const TITLES={dashboard:"Dashboard",calendar:"Takvim & Planlayıcı",notes:"Notlar",timer:"Pomodoro Timer",stats:"İstatistikler",goals:"Hedefler & Rozetler",habits:"Alışkanlık Takibi"}
  const PAGES={dashboard:Dashboard,calendar:CalendarPage,notes:NotesPage,timer:TimerPage,stats:StatsPage,goals:GoalsPage,habits:HabitPage,}
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