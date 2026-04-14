import { useState, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:8000/api/students";

/* ─── DESIGN TOKENS (exact match to original index.html) ─── */
const T = {
  bg:          "#F5F3EE",
  surface:     "#FFFFFF",
  surface2:    "#F0EDE6",
  border:      "rgba(0,0,0,0.08)",
  borderMd:    "rgba(0,0,0,0.14)",
  text:        "#1A1814",
  text2:       "#6B6559",
  text3:       "#9E9890",
  blue:        "#1A3FDB",
  blueLight:   "#EEF1FD",
  blueMid:     "#C4CCFA",
  green:       "#157A4A",
  greenLight:  "#EBF7F1",
  amber:       "#B85C00",
  amberLight:  "#FFF0E0",
  red:         "#C0271A",
  redLight:    "#FEECEB",
  purple:      "#5B3FDB",
  purpleLight: "#F0EFFE",
  radius:      "12px",
  radiusSm:    "8px",
  radiusXs:    "5px",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:    "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
};

/* ─── UTILS ─── */
const initials = (s) => ((s?.first_name || "?")[0] + (s?.last_name || "?")[0]).toUpperCase();
const getAge   = (y) => y ? new Date().getFullYear() - parseInt(y) : null;
const fmtDate  = (d) => { try { return new Date(d).toLocaleDateString("uz-Latn-UZ", { day:"2-digit", month:"short", year:"numeric" }); } catch { return d || ""; } };
const scoreClass = (v) => v >= 85 ? "high" : v >= 70 ? "mid" : "low";

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return Array.isArray(d) ? d : d.results ?? d.data ?? d;
}

/* ─── ICONS ─── */
const ArrowLeft  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SearchIco  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const MailIco    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8"/></svg>;
const PhoneIco   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.97 9.81 19.79 19.79 0 01.9 1.18 2 2 0 012.88 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.66a16 16 0 006.29 6.29l1.02-1.04a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8"/></svg>;
const CalIco     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const SchoolIco  = ({ color }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M22 10v6M2 10l10-7 10 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 10v7a2 2 0 002 2h8a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></svg>;
const GhIco      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>;
const LiIco      = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
const DlIco      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const UsersIco   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M21 21v-2c0-1.657-1.343-3-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
const ImgIco     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
const ClipIco    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>;
const FileIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const LangIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h7M7 2v3M22 22l-5-10-5 10M14 18h6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const CodeIco    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
const ContractIco= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>;

/* ─── AVATAR ─── */
function Avatar({ student, size = "md" }) {
  const [err, setErr] = useState(false);
  const ini = initials(student);
  const cfg = { sm:{w:30,h:30,fs:11,bw:"1.5px"}, md:{w:50,h:50,fs:16,bw:"2px"}, lg:{w:80,h:80,fs:26,bw:"3px"} }[size];
  return (
    <div style={{ width:cfg.w, height:cfg.h, borderRadius:"50%", background:T.blueLight, color:T.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:cfg.fs, fontWeight:600, flexShrink:0, overflow:"hidden", border:`${cfg.bw} solid ${T.blueMid}` }}>
      {student?.prof_pic && !err
        ? <img src={student.prof_pic} alt={ini} onError={()=>setErr(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        : ini}
    </div>
  );
}

/* ─── BADGE ─── */
function Badge({ color="blue", children, href, onClick }) {
  const pal = {
    blue:   {bg:T.blueLight,   text:T.blue,   border:T.blueMid},
    green:  {bg:T.greenLight,  text:T.green,  border:"rgba(21,122,74,0.3)"},
    amber:  {bg:T.amberLight,  text:T.amber,  border:"rgba(184,92,0,0.3)"},
    red:    {bg:T.redLight,    text:T.red,    border:"rgba(192,39,26,0.3)"},
    gray:   {bg:T.surface2,    text:T.text2,  border:T.border},
    purple: {bg:T.purpleLight, text:T.purple, border:"rgba(91,63,219,0.3)"},
  };
  const c = pal[color] || pal.blue;
  const s = { display:"inline-flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:100, fontSize:12, fontWeight:500, textDecoration:"none", background:c.bg, color:c.text, border:`1px solid ${c.border}`, cursor:"pointer", whiteSpace:"nowrap", transition:"opacity 0.12s", fontFamily:"inherit" };
  if (href) return <a style={s} href={href} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}>{children}</a>;
  return <span style={s} onClick={onClick}>{children}</span>;
}

/* ─── BACK BTN ─── */
function BackBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"7px 14px", borderRadius:100, border:`1px solid ${T.borderMd}`, background:hov?T.surface2:T.surface, fontSize:13, fontWeight:500, cursor:"pointer", color:hov?T.text:T.text2, marginBottom:"1.5rem", transition:"all 0.15s", boxShadow:T.shadowSm, fontFamily:"inherit" }}>
      <ArrowLeft/> Orqaga
    </button>
  );
}

/* ─── STATES ─── */
function Spinner() {
  return (
    <div style={{ padding:"3rem 2rem", textAlign:"center", color:T.text3, fontSize:14, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius }}>
      <div style={{ width:28, height:28, border:`2px solid ${T.border}`, borderTopColor:T.blue, borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 0.75rem" }}/>
      Yuklanmoqda...
    </div>
  );
}
function EmptyState({ msg="Ma'lumot topilmadi" }) {
  return <div style={{ padding:"3rem 2rem", textAlign:"center", color:T.text3, fontSize:14, background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius }}>{msg}</div>;
}
function ErrorState({ msg }) {
  return <div style={{ padding:"1.5rem", background:T.redLight, border:`1px solid rgba(192,39,26,0.2)`, borderRadius:T.radius, color:T.red, fontSize:14 }}>Xatolik: {msg}</div>;
}
function InfoRow({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:14 }}>
      <span style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.06em", color:T.text3 }}>{label}</span>
      <span style={{ fontSize:14, color:T.text }}>{children}</span>
    </div>
  );
}
function Card({ children }) {
  return <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"1.25rem" }}>{children}</div>;
}
function CardTitle({ icon, iconBg, iconColor, children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:600, letterSpacing:"-0.01em", marginBottom:"1rem", color:T.text }}>
      <div style={{ width:28, height:28, borderRadius:T.radiusXs, background:iconBg, color:iconColor, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      {children}
    </div>
  );
}

/* ─── NAVBAR ─── */
function Navbar({ state, onNav }) {
  const { stage, section, student } = state;
  return (
    <nav style={{ position:"sticky", top:0, zIndex:200, height:60, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem", gap:"1rem" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>onNav("home")} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:100, fontSize:13, fontWeight:500, border:"1px solid #003399", background:"#003399", color:"#fff", cursor:"pointer", letterSpacing:"-0.01em", fontFamily:"inherit" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span>Aloqabank</span>
        </button>
        <div style={{ width:1, height:22, background:T.borderMd }}/>
        <button onClick={()=>onNav("home")} style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 14px", borderRadius:100, fontSize:13, fontWeight:500, border:`1px solid ${T.blueMid}`, background:T.blueLight, color:T.blue, cursor:"pointer", fontFamily:"inherit" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span>IT Klaster</span>
        </button>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, color:T.text3, flexWrap:"wrap", minWidth:0 }}>
        {stage && <>
          <span style={{ color:T.blue, cursor:"pointer" }} onClick={()=>onNav("home")}>Bosh sahifa</span>
          <span>/</span>
          <span style={{ color:section?T.blue:T.text2, cursor:section?"pointer":"default" }} onClick={()=>section&&onNav("stage")}>{stage}-bosqich</span>
        </>}
        {section && <>
          <span>/</span>
          {student
            ? <><span style={{ color:T.blue, cursor:"pointer" }} onClick={()=>onNav("students")}>Talabalar</span><span>/</span><span style={{ color:T.text2 }}>{student.first_name} {student.last_name}</span></>
            : <span style={{ color:T.text2 }}>{{ students:"Talabalar ro'yxati", highlights:"Dars lavhalari", marks:"Baholar" }[section]}</span>
          }
        </>}
      </div>
    </nav>
  );
}

/* ─── HOME ─── */
function HomeView({ onSelectStage }) {
  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <div style={{ textAlign:"center", padding:"3rem 0 2.5rem" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 14px", background:T.blueLight, color:T.blue, borderRadius:100, fontSize:12, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:"1.25rem" }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
          Aloqabank × IT Klaster
        </div>
        <h1 style={{ fontSize:36, fontWeight:600, letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:"0.75rem", color:T.text }}>Talabalar portali</h1>
        <p style={{ fontSize:15, color:T.text2, fontWeight:300 }}>O'quv bosqichini tanlang va talabalar bilan tanishing</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem", maxWidth:720, margin:"0 auto" }}>
        <StageCard num="1" iconColor={T.blue}  accentBg={T.blueLight}  numBg={T.blue}  ctaColor={T.blue}  label="1-bosqich bitiruvchi talabalari" desc="Birinchi o'quv bosqichini muvaffaqiyatli yakunlagan talabalar" onClick={()=>onSelectStage("1")}/>
        <StageCard num="2" iconColor={T.green} accentBg={T.greenLight} numBg={T.green} ctaColor={T.green} label="2-bosqich talabalari"              desc="Ikkinchi o'quv bosqichida tahsil olayotgan talabalar"       onClick={()=>onSelectStage("2")}/>
      </div>
    </div>
  );
}

function StageCard({ num, iconColor, accentBg, numBg, ctaColor, label, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:T.surface, border:`1px solid ${hov?T.borderMd:T.border}`, borderRadius:T.radius, padding:"2rem 1.75rem 1.75rem", cursor:"pointer", transition:"transform 0.18s, box-shadow 0.18s, border-color 0.18s", transform:hov?"translateY(-3px)":"none", boxShadow:hov?T.shadowMd:T.shadowSm, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, ${accentBg} 0%, transparent 60%)`, opacity:hov?1:0, transition:"opacity 0.2s", pointerEvents:"none" }}/>
      <div style={{ width:52, height:52, borderRadius:T.radiusSm, background:accentBg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem", position:"relative" }}>
        <span style={{ background:numBg, color:"#fff", fontFamily:"'DM Mono', monospace", fontSize:11, fontWeight:500, padding:"3px 7px", borderRadius:100, position:"absolute", top:-6, right:-6 }}>0{num}</span>
        <SchoolIco color={iconColor}/>
      </div>
      <div style={{ fontSize:16, fontWeight:600, marginBottom:6, letterSpacing:"-0.01em", color:T.text }}>{label}</div>
      <div style={{ fontSize:13, color:T.text2, lineHeight:1.5, marginBottom:"1.25rem" }}>{desc}</div>
      <div style={{ display:"inline-flex", alignItems:"center", gap:hov?8:5, fontSize:13, fontWeight:500, color:ctaColor, transition:"gap 0.15s" }}>Ko'rish <ArrowRight/></div>
    </div>
  );
}

/* ─── STAGE ─── */
function StageView({ stage, onNav }) {
  const label = stage === "1" ? "1-bosqich bitiruvchi talabalari" : "2-bosqich talabalari";
  const secs = [
    { key:"students",   icon:<UsersIco/>, bg:T.blueLight,   color:T.blue,   title:"Talabalar ro'yxati",       desc:"Barcha talabalar profili, kontakt ma'lumotlari va loyihalari" },
    { key:"highlights", icon:<ImgIco/>,   bg:T.purpleLight, color:T.purple, title:"Dars jarayonidan lavhalar", desc:"Dars davomidagi muhim lahzalar, rasmlar va tavsiflar" },
    { key:"marks",      icon:<ClipIco/>,  bg:T.greenLight,  color:T.green,  title:"Studentlar baholari",       desc:"Barcha talabalar baholari, fanlar bo'yicha pivot jadval" },
  ];
  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <BackBtn onClick={()=>onNav("home")}/>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.025em", marginBottom:4, color:T.text }}>{label}</h1>
        <p style={{ fontSize:14, color:T.text2, fontWeight:300 }}>Bo'limni tanlang</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
        {secs.map(({ key, icon, bg, color, title, desc }) => {
          return <SecCard key={key} icon={icon} bg={bg} color={color} title={title} desc={desc} onClick={()=>onNav(key)}/>;
        })}
      </div>
    </div>
  );
}

function SecCard({ icon, bg, color, title, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:T.surface, border:`1px solid ${hov?T.borderMd:T.border}`, borderRadius:T.radius, padding:"1.5rem", cursor:"pointer", transition:"transform 0.18s, box-shadow 0.18s, border-color 0.18s", transform:hov?"translateY(-3px)":"none", boxShadow:hov?T.shadowMd:"none", display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ width:42, height:42, borderRadius:T.radiusSm, background:bg, color, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</div>
      <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.01em", color:T.text }}>{title}</div>
      <div style={{ fontSize:12, color:T.text2, lineHeight:1.5 }}>{desc}</div>
    </div>
  );
}

/* ─── STUDENTS ─── */
function StudentsView({ stage, onNav, onStudent }) {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true); setError(null);
    apiFetch(`${API}/?group=${stage}`)
      .then(d => { setAll(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  const filtered = all.filter(s => {
    if (!query) return true;
    const name = `${s.first_name} ${s.last_name} ${s.middle_name||""}`.toLowerCase();
    return name.includes(query.toLowerCase()) || (s.email||"").toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <BackBtn onClick={()=>onNav("stage")}/>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.025em", marginBottom:4, color:T.text }}>Talabalar ro'yxati</h1>
        <p style={{ fontSize:14, color:T.text2, fontWeight:300 }}>{stage}-bosqich — barcha talabalar</p>
      </div>
      <div style={{ position:"relative", marginBottom:"1.5rem", maxWidth:380 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.text3, pointerEvents:"none" }}><SearchIco/></span>
        <input type="text" placeholder="Ism yoki email bo'yicha qidirish..." value={query} onChange={e=>setQuery(e.target.value)}
          style={{ width:"100%", padding:"9px 12px 9px 38px", borderRadius:100, border:`1px solid ${T.borderMd}`, background:T.surface, fontSize:14, color:T.text, outline:"none", fontFamily:"inherit", boxShadow:T.shadowSm }}
          onFocus={e=>{ e.target.style.borderColor=T.blue; e.target.style.boxShadow=`0 0 0 3px rgba(26,63,219,0.1)`; }}
          onBlur={e=>{ e.target.style.borderColor=T.borderMd; e.target.style.boxShadow=T.shadowSm; }}/>
      </div>
      {loading ? <Spinner/> : error ? <ErrorState msg={error}/> : filtered.length===0 ? <EmptyState msg="Talaba topilmadi"/> :
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:"1rem" }}>
          {filtered.map(s => <StudentCard key={s.id} student={s} onClick={()=>onStudent(s)}/>)}
        </div>
      }
    </div>
  );
}

function StudentCard({ student:s, onClick }) {
  const [hov, setHov] = useState(false);
  const a = getAge(s.birth_year);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:T.surface, border:`1px solid ${hov?T.borderMd:T.border}`, borderRadius:T.radius, padding:"1.25rem", cursor:"pointer", transition:"transform 0.18s, box-shadow 0.18s, border-color 0.18s", transform:hov?"translateY(-3px)":"none", boxShadow:hov?T.shadowMd:"none", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Avatar student={s} size="md"/>
        <div>
          <div style={{ fontSize:15, fontWeight:600, letterSpacing:"-0.01em", marginBottom:1, color:T.text }}>{s.first_name} {s.last_name}</div>
          {s.middle_name && <div style={{ fontSize:12, color:T.text3 }}>{s.middle_name}</div>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {s.email       && <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:T.text2 }}><MailIco/>{s.email}</div>}
        {s.phone_number && <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:T.text2 }}><PhoneIco/>{s.phone_number}</div>}
        {a             && <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:T.text2 }}><CalIco/>{a} yosh</div>}
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {s.github_link   && <Badge color="blue"  href={s.github_link}><GhIco/> GitHub</Badge>}
        {s.linkedin_link && <Badge color="green" href={s.linkedin_link}><LiIco/> LinkedIn</Badge>}
      </div>
    </div>
  );
}

/* ─── STUDENT DETAIL ─── */
function StudentDetailView({ student:s, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const a = getAge(s.birth_year);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API}/${s.id}/detail/`)
      .then(d => { setDetail(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [s.id]);

  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <BackBtn onClick={onBack}/>
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:"1.25rem", alignItems:"start" }}>

        {/* ── Sidebar ── */}
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:"1.5rem", position:"sticky", top:"calc(60px + 1rem)" }}>
          <div style={{ textAlign:"center", marginBottom:"1.25rem" }}><Avatar student={s} size="lg"/></div>
          <div style={{ fontSize:18, fontWeight:600, letterSpacing:"-0.02em", textAlign:"center", marginBottom:4, color:T.text }}>{s.first_name} {s.last_name}</div>
          {s.middle_name && <div style={{ fontSize:13, color:T.text3, textAlign:"center", marginBottom:"1.25rem" }}>{s.middle_name}</div>}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:"1.25rem" }}>
            {s.github_link   && <Badge color="blue"  href={s.github_link}><GhIco/> GitHub</Badge>}
            {s.linkedin_link && <Badge color="green" href={s.linkedin_link}><LiIco/> LinkedIn</Badge>}
          </div>
          <div style={{ height:1, background:T.border, marginBottom:"1.25rem" }}/>
          {s.email        && <InfoRow label="Email"><a href={`mailto:${s.email}`}       style={{ color:T.blue, textDecoration:"none" }}>{s.email}</a></InfoRow>}
          {s.phone_number && <InfoRow label="Telefon"><a href={`tel:${s.phone_number}`} style={{ color:T.blue, textDecoration:"none" }}>{s.phone_number}</a></InfoRow>}
          {a              && <InfoRow label="Yosh">{a} yosh ({s.birth_year})</InfoRow>}
          {detail?.faculty        && <InfoRow label="Fakultet">{detail.faculty}</InfoRow>}
          {detail?.university?.name && <InfoRow label="Universitet">{detail.university.name}</InfoRow>}
        </div>

        {/* ── Main ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {loading ? <Spinner/> : error ? <ErrorState msg={error}/> : <>
            {detail?.languages?.length > 0 && (
              <Card>
                <CardTitle icon={<LangIco/>} iconBg={T.purpleLight} iconColor={T.purple}>Tillar</CardTitle>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {detail.languages.map(l => <Badge key={l.id} color="blue">{l.name} — {l.level}{l.certificate?" ✓":""}</Badge>)}
                </div>
              </Card>
            )}
            {detail?.projects?.length > 0 && (
              <Card>
                <CardTitle icon={<CodeIco/>} iconBg={T.blueLight} iconColor={T.blue}>Loyihalar</CardTitle>
                {detail.projects.map(p => (
                  <div key={p.id} style={{ border:`1px solid ${T.border}`, borderRadius:T.radiusSm, padding:"12px", marginBottom:8 }}>
                    <div style={{ fontSize:14, fontWeight:500, marginBottom:5, color:T.text }}>{p.title}</div>
                    {p.description && <div style={{ fontSize:12, color:T.text2, marginBottom:8, lineHeight:1.5 }}>{p.description}</div>}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <Badge color="gray">{fmtDate(p.created_at)}</Badge>
                      {p.link && <Badge color="blue" href={p.link}>Ko'rish →</Badge>}
                    </div>
                  </div>
                ))}
              </Card>
            )}
            {detail?.documents?.length > 0 && (
              <Card>
                <CardTitle icon={<FileIco/>} iconBg={T.amberLight} iconColor={T.amber}>Hujjatlar</CardTitle>
                {detail.documents.map(doc => (
                  <a key={doc.id} href={`${API}/${s.id}/documents/${doc.id}/download/`} target="_blank" rel="noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, textDecoration:"none", color:T.text, marginBottom:6, fontSize:13, transition:"all 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.blue; e.currentTarget.style.background=T.blueLight; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.text; e.currentTarget.style.background="transparent"; }}>
                    <div style={{ width:32, height:32, background:T.surface2, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><FileIco/></div>
                    <span style={{ fontWeight:500, flex:1 }}>{doc.name}</span>
                    <span style={{ fontSize:11, color:T.text3, fontFamily:"'DM Mono',monospace" }}>{doc.doc_type}</span>
                    <DlIco/>
                  </a>
                ))}
              </Card>
            )}
            {(() => {
              const contracts = Array.isArray(detail?.contracts) ? detail.contracts : detail?.contracts ? [detail.contracts] : [];
              return contracts.length > 0 && (
                <Card>
                  <CardTitle icon={<ContractIco/>} iconBg={T.greenLight} iconColor={T.green}>Shartnomalar</CardTitle>
                  {contracts.map(c => (
                    <a key={c.id} href={c.file||"#"} target="_blank" rel="noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:`1px solid ${T.border}`, borderRadius:T.radiusSm, textDecoration:"none", color:T.text, marginBottom:6, fontSize:13 }}>
                      <div style={{ width:32, height:32, background:T.surface2, borderRadius:T.radiusXs, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><ContractIco/></div>
                      <span style={{ fontWeight:500, flex:1 }}>Shartnoma №{c.number}</span>
                      <span style={{ fontSize:11, color:T.text3, fontFamily:"'DM Mono',monospace" }}>{fmtDate(c.created_at)}</span>
                    </a>
                  ))}
                </Card>
              );
            })()}
            {!detail?.languages?.length && !detail?.projects?.length && !detail?.documents?.length && (
              <EmptyState msg="Qo'shimcha ma'lumot topilmadi"/>
            )}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ─── HIGHLIGHTS ─── */
function HighlightsView({ stage, onNav }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API}/lessons/?group=${stage}`)
      .then(d => { setItems(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <BackBtn onClick={()=>onNav("stage")}/>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.025em", marginBottom:4, color:T.text }}>Dars jarayonidan lavhalar</h1>
        <p style={{ fontSize:14, color:T.text2, fontWeight:300 }}>{stage}-bosqich — barcha lavhalar</p>
      </div>
      {loading ? <Spinner/> : error ? <ErrorState msg={error}/> : items.length===0 ? <EmptyState msg="Lavhalar topilmadi"/> :
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1.25rem" }}>
          {items.map(h => <HighlightCard key={h.id} h={h}/>)}
        </div>
      }
    </div>
  );
}

function HighlightCard({ h }) {
  const [hov, setHov] = useState(false);
  const mainImg = h.images?.[0]?.image;
  const extras  = h.images?.slice(1) || [];
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:"hidden", transition:"transform 0.18s, box-shadow 0.18s", transform:hov?"translateY(-3px)":"none", boxShadow:hov?T.shadowMd:"none" }}>
      <div style={{ height:200, background:T.surface2, overflow:"hidden", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {mainImg
          ? <img src={mainImg} alt={h.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.3s", transform:hov?"scale(1.04)":"none" }}/>
          : <div style={{ color:T.text3 }}><ImgIco/></div>
        }
        {extras.length > 0 && (
          <div style={{ display:"flex", gap:3, position:"absolute", bottom:8, right:8 }}>
            {extras.slice(0,2).map((img,i) => (
              <div key={i} style={{ width:36, height:36, borderRadius:5, overflow:"hidden", border:"2px solid rgba(255,255,255,0.8)" }}>
                <img src={img.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
            ))}
            {extras.length > 2 && <div style={{ width:36, height:36, borderRadius:5, background:"rgba(0,0,0,0.55)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:500, border:"2px solid rgba(255,255,255,0.8)" }}>+{extras.length-2}</div>}
          </div>
        )}
      </div>
      <div style={{ padding:"1.25rem" }}>
        <div style={{ fontSize:15, fontWeight:600, marginBottom:6, letterSpacing:"-0.01em", color:T.text }}>{h.title}</div>
        {h.description && <div style={{ fontSize:13, color:T.text2, marginBottom:12, lineHeight:1.55 }}>{h.description}</div>}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Badge color="blue">{h.group||""}</Badge>
          <span style={{ fontSize:12, color:T.text3, fontFamily:"'DM Mono',monospace" }}>{fmtDate(h.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── MARKS ─── */
function MarksView({ stage, onNav }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API}/marks/?group=${stage}`)
      .then(d => { setMarks(Array.isArray(d)?d:[]); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  const subjects = [...new Set(marks.map(m=>m.subject).filter(Boolean))];
  const studentMap = {};
  marks.forEach(m => {
    const st = m.student; if (!st) return;
    if (!studentMap[st.id]) studentMap[st.id] = { s:st, marks:{} };
    studentMap[st.id].marks[m.subject] = m.score;
  });
  const rows = Object.values(studentMap);

  const exportCSV = useCallback(() => {
    if (!marks.length) return;
    const header = ["#","Ism","Familiya",...subjects,"O'rtacha"];
    const lines = [header, ...rows.map((r,i) => {
      const scores = subjects.map(sub => r.marks[sub]??"");
      const valid = scores.filter(v=>v!=="");
      const avg = valid.length ? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length) : "";
      return [i+1, r.s.first_name, r.s.last_name, ...scores, avg];
    })];
    const csv = lines.map(row=>row.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${stage}-bosqich_baholar.csv`; a.click();
  }, [marks, rows, subjects, stage]);

  const ScorePill = ({ v }) => {
    if (v == null) return <span style={{ color:T.text3 }}>—</span>;
    const cfg = v>=85?{bg:T.greenLight,c:T.green}:v>=70?{bg:T.amberLight,c:T.amber}:{bg:T.redLight,c:T.red};
    return <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", minWidth:40, padding:"4px 8px", borderRadius:100, fontSize:12, fontWeight:600, fontFamily:"'DM Mono',monospace", background:cfg.bg, color:cfg.c }}>{v}</span>;
  };

  return (
    <div style={{ animation:"fadeUp 0.4s ease both" }}>
      <BackBtn onClick={()=>onNav("stage")}/>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.5rem", gap:"1rem", flexWrap:"wrap" }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:600, letterSpacing:"-0.025em", marginBottom:4, color:T.text }}>Studentlar baholari</h1>
          <p style={{ fontSize:14, color:T.text2, fontWeight:300 }}>{stage}-bosqich — fanlar bo'yicha pivot jadval</p>
        </div>
        <button onClick={exportCSV}
          style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:100, border:`1px solid ${T.green}`, background:T.greenLight, color:T.green, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", boxShadow:T.shadowSm, transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background=T.green; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background=T.greenLight; e.currentTarget.style.color=T.green; }}>
          <DlIco/> Excel (.csv) yuklash
        </button>
      </div>
      {loading ? <Spinner/> : error ? <ErrorState msg={error}/> : rows.length===0 ? <EmptyState msg="Baholar topilmadi"/> : <>
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, overflow:"hidden", boxShadow:T.shadowSm }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:600 }}>
              <thead>
                <tr>
                  {["#","Talaba",...subjects,"O'rtacha"].map((h,i) => (
                    <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.05em", color:T.text3, background:T.surface2, borderBottom:`1px solid ${T.border}`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r,i) => {
                  const scores = subjects.map(sub=>r.marks[sub]);
                  const valid  = scores.filter(v=>v!=null);
                  const avg    = valid.length ? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length) : null;
                  return (
                    <tr key={r.s.id} style={{ borderBottom:`1px solid ${T.border}`, transition:"background 0.1s" }}
                      onMouseEnter={e=>e.currentTarget.querySelectorAll("td").forEach(td=>td.style.background=T.surface2)}
                      onMouseLeave={e=>e.currentTarget.querySelectorAll("td").forEach(td=>td.style.background="")}>
                      <td style={{ padding:"10px 14px", color:T.text3, fontFamily:"'DM Mono',monospace", fontSize:12 }}>{i+1}</td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <Avatar student={r.s} size="sm"/>
                          <span style={{ fontWeight:500, color:T.text }}>{r.s.first_name} {r.s.last_name}</span>
                        </div>
                      </td>
                      {scores.map((v,j) => <td key={j} style={{ padding:"10px 14px" }}><ScorePill v={v}/></td>)}
                      <td style={{ padding:"10px 14px" }}><ScorePill v={avg}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", fontSize:12, color:T.text2, marginTop:"0.75rem", padding:"0 4px" }}>
          {[[T.green,"85 va undan yuqori — A'lo"],[T.amber,"70–84 — Yaxshi"],[T.red,"70 dan past — Qoniqarli"]].map(([color,label]) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }}/>
              {label}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ─── ROOT ─── */
export default function App() {
  const [state, setState] = useState({ view:"home", stage:null, section:null, student:null });

  const onNav = useCallback((view) => {
    setState(prev => {
      if (view==="home")       return { view:"home",       stage:prev.stage, section:null,         student:null };
      if (view==="stage")      return { view:"stage",      stage:prev.stage, section:null,         student:null };
      if (view==="students")   return { view:"students",   stage:prev.stage, section:"students",   student:null };
      if (view==="highlights") return { view:"highlights", stage:prev.stage, section:"highlights", student:null };
      if (view==="marks")      return { view:"marks",      stage:prev.stage, section:"marks",      student:null };
      return prev;
    });
  }, []);

  const onSelectStage = useCallback((num) => setState({ view:"stage", stage:num, section:null, student:null }), []);
  const onStudent     = useCallback((s)   => setState(prev => ({ ...prev, view:"student", section:"students", student:s })), []);

  const views = {
    home:       <HomeView onSelectStage={onSelectStage}/>,
    stage:      <StageView stage={state.stage} onNav={onNav}/>,
    students:   <StudentsView stage={state.stage} onNav={onNav} onStudent={onStudent}/>,
    student:    state.student && <StudentDetailView student={state.student} onBack={()=>onNav("students")}/>,
    highlights: <HighlightsView stage={state.stage} onNav={onNav}/>,
    marks:      <MarksView stage={state.stage} onNav={onNav}/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { font-family:'DM Sans',sans-serif; background:${T.bg}; color:${T.text}; min-height:100vh; font-size:15px; line-height:1.6; -webkit-font-smoothing:antialiased; }
        button, input, a { font-family:inherit; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${T.borderMd}; border-radius:3px; }
        @media(max-width:768px){
          .detail-grid{grid-template-columns:1fr!important}
          .stage-grid{grid-template-columns:1fr!important}
          .sec-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <Navbar state={state} onNav={onNav}/>
      <div style={{ padding:"2.5rem 2rem", maxWidth:1180, margin:"0 auto" }}>
        {views[state.view] || views.home}
      </div>
    </>
  );
}
