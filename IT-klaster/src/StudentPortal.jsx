import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
const API_BASE = "https://aloqabankstudents.pythonanywhere.com/api/students";
const IMG_ROOT = "https://aloqabankstudents.pythonanywhere.com/media/";

function fixImg(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return IMG_ROOT + url.replace(/^\//, "");
}

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const calcAge = (birthYear) => {
  if (!birthYear) return null;
  return new Date().getFullYear() - birthYear;
};

const COLORS = {
  navy: "#1E3A5F", navyMid: "#2C5282", blue: "#1A56DB", blueSoft: "#3B82F6",
  gold: "#F59E0B", goldSoft: "#FCD34D", surface: "#F8FAFC", white: "#FFFFFF",
  muted: "#64748B", border: "#E2E8F0", danger: "#EF4444", success: "#10B981",
};

const css = {
  pageDark: { minHeight: "100vh", background: "linear-gradient(160deg,#2A4A7F 0%,#3B6CB7 50%,#4A7FCB 100%)", fontFamily: "'Georgia','Times New Roman',serif", color: "#fff" },
  pageLight: { minHeight: "100vh", background: COLORS.surface, fontFamily: "'Georgia','Times New Roman',serif", color: COLORS.navy },
  navDark: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", height: "60px", background: "rgba(10,22,40,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 100 },
  navLight: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", height: "60px", background: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100 },
  btn: { padding: "0.5rem 1.1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "'Georgia',serif", fontSize: "13px", fontWeight: "bold", transition: "all .2s", display: "inline-flex", alignItems: "center", gap: "5px" },
  badge: { display: "inline-block", padding: "2px 10px", borderRadius: "99px", fontSize: "10px", fontFamily: "sans-serif", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 700 },
  input: { width: "100%", padding: ".6rem .9rem", borderRadius: "8px", border: `1.5px solid ${COLORS.border}`, fontSize: "13px", fontFamily: "'Georgia',serif", outline: "none", background: COLORS.white, color: COLORS.navy, boxSizing: "border-box", transition: "border-color .2s" },
  sectionTitle: { fontSize: "11px", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 700, marginBottom: ".4rem" },
  card: { background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "1.5rem", cursor: "pointer", transition: "all .25s ease" },
  lightCard: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: ".85rem", transition: "all .2s ease", cursor: "pointer" },
};

// ─── Global style injection ───────────────────────────────────────────────────
const GLOBAL_CSS = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
*{box-sizing:border-box}
.stage-card:hover{background:rgba(255,255,255,.08)!important;border-color:rgba(245,158,11,.4)!important;transform:translateY(-3px);box-shadow:0 20px 40px rgba(0,0,0,.3)}
.section-row:hover{background:rgba(255,255,255,.08)!important;border-color:rgba(245,158,11,.4)!important;transform:translateY(-2px);box-shadow:0 12px 30px rgba(0,0,0,.25)}
.student-card:hover{box-shadow:0 8px 24px rgba(10,22,40,.12)!important;transform:translateY(-2px)}
.lesson-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.12)!important;transform:translateY(-3px)}
@media(max-width:600px){
  .nav-logo-text{font-size:13px!important}
  .nav-logo-sub{font-size:8px!important}
  .hero-pad{padding:2.5rem 1rem 1.5rem!important}
  .cards-wrap{padding:0 1rem!important;grid-template-columns:1fr!important}
  .section-pad{padding:1.75rem 1rem!important}
  .student-header{flex-direction:column;align-items:flex-start!important}
  .search-inp{width:100%!important}
  .summary-grid{grid-template-columns:repeat(2,1fr)!important}
  .marks-last{display:none}
  .info-grid{grid-template-columns:1fr 1fr!important}
}
@media(max-width:400px){
  .summary-grid{grid-template-columns:1fr!important}
  .info-grid{grid-template-columns:1fr!important}
}
`;

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 46 }) {
  const [imgErr, setImgErr] = useState(false);
  const inits = (name || "?").split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
  const fixedSrc = fixImg(src);
  if (fixedSrc && !imgErr) {
    return <img src={fixedSrc} alt={name} onError={() => setImgErr(true)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,${COLORS.blue},${COLORS.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: Math.round(size * .35), flexShrink: 0, fontFamily: "sans-serif" }}>
      {inits}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onHome, dark = true }) {
  return (
    <nav style={dark ? css.navDark : css.navLight}>
      <div
        onClick={onHome}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          cursor: "pointer",
        }}
      >
        {/* Aloqabank Logo */}
        <div
          style={{
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // White pill background so the logo is always visible on dark navbar
            background: dark ? "rgba(255,255,255,0.12)" : "transparent",
            borderRadius: "6px",
            padding: dark ? "3px 8px" : "0",
            transition: "background 0.2s",
          }}
        >
          <img
            src="/logos/aloqabank4.png"
            alt="Aloqabank"
            style={{
              height: "44px",
              width: "auto",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 30,
            background: dark ? "rgba(255,255,255,.2)" : COLORS.border,
            flexShrink: 0,
          }}
        />

        {/* IT Klaster Logo */}
        <img
          src="/logos/IT-klaster.svg"
          alt="IT Klaster"
          style={{
            height: "32px",
            width: "auto",
            objectFit: "contain",
            filter: dark ? "brightness(0) invert(1)" : "none",
            display: "block",
          }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={onHome}
        style={{
          ...css.btn,
          background: dark ? "transparent" : COLORS.surface,
          color: dark ? "#fff" : COLORS.navy,
          border: dark
            ? "1px solid rgba(255,255,255,.3)"
            : `1px solid ${COLORS.border}`,
          fontSize: "12px",
          padding: ".4rem .9rem",
        }}
      >
        ← Orqaga
      </button>
    </nav>
  );
}


// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, background: type === "error" ? COLORS.danger : COLORS.success, color: "#fff", padding: ".65rem 1.25rem", borderRadius: "10px", fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,.3)", animation: "fadeIn .25s ease" }}>
      {msg}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ dark = false }) {
  return <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${dark ? COLORS.border : "rgba(255,255,255,.15)"}`, borderTop: `3px solid ${dark ? COLORS.blue : COLORS.gold}`, animation: "spin .8s linear infinite" }} />;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ onSelect }) {
  const stages = [
    { id: 1, label: "1-bosqich", title: "Birinchi bosqich\nbitiruvchi talabalari", desc: "Talabalar ro'yxati, baholari va dars jarayoni", icon: "🎓", accent: COLORS.blue, anim: 0 },
    { id: 2, label: "2-bosqich", title: "Ikkinchi bosqich\nbitiruvchi talabalari", desc: "Talabalar ro'yxati, baholari va dars jarayoni", icon: "🏆", accent: COLORS.gold, anim: 1 },
  ];
  return (
    <div style={css.pageDark}>
      <Navbar onHome={() => {}} dark />
      <div className="hero-pad" style={{ padding: "3.5rem 1.5rem 2rem", maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
        <p style={{ ...css.sectionTitle, color: COLORS.goldSoft }}>Aloqabank · IT Klaster</p>
        <h1 style={{ fontSize: "clamp(24px,5vw,44px)", fontWeight: "bold", lineHeight: 1.15, letterSpacing: "-.02em" }}>
          Talabalar <span style={{ color: COLORS.goldSoft }}>Portalı</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: "15px", marginTop: ".75rem", lineHeight: 1.8, fontFamily: "sans-serif", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
          Bitiruvchi talabalar ma'lumotlari, baholari va dars jarayoni lavhalarini ko'rish
        </p>
      </div>
      <div className="cards-wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1.25rem", maxWidth: "760px", margin: "1.5rem auto 3rem", padding: "0 1.5rem" }}>
        {stages.map(s => (
          <div key={s.id} className="stage-card" onClick={() => onSelect(s.id)} style={{ ...css.card, borderTop: `3px solid ${s.accent}`, animation: `float${s.anim} ${3 + s.id * .7}s ease-in-out infinite` }}>
            <span style={{ fontSize: "34px", marginBottom: ".65rem", display: "block" }}>{s.icon}</span>
            <span style={{ ...css.badge, background: `${s.accent}22`, color: s.accent, border: `1px solid ${s.accent}44`, marginBottom: ".5rem" }}>{s.label}</span>
            <div style={{ fontSize: "17px", fontWeight: "bold", lineHeight: 1.3, whiteSpace: "pre-line", margin: ".35rem 0 .5rem", color: "#fff" }}>{s.title}</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: "13px", fontFamily: "sans-serif", lineHeight: 1.6 }}>{s.desc}</div>
            <div style={{ marginTop: "1.1rem", display: "flex", alignItems: "center", gap: "5px", color: s.accent, fontSize: "13px", fontFamily: "sans-serif", fontWeight: 600 }}>Ko'rish →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAGE ────────────────────────────────────────────────────────────────────
function StagePage({ stageId, onBack, onStudents, onLessons, onMarks }) {
  const sections = [
    { key: "students", icon: "👩‍🎓", title: "Talabalar ro'yxati", desc: "Talabalar profil ma'lumotlari, GitHub, email va telefon raqamlari", accent: COLORS.blue, action: onStudents },
    { key: "lessons", icon: "📸", title: "Dars jarayonidan lavhalar", desc: "Dars jarayonidagi muhim lahzalar, rasmlar va ta'riflar", accent: "#8B5CF6", action: onLessons },
    { key: "marks", icon: "📊", title: "Studentlar baholari", desc: "Barcha talabalarning fanlar bo'yicha baholari", accent: COLORS.gold, action: onMarks },
  ];
  return (
    <div style={css.pageDark}>
      <Navbar onHome={onBack} dark />
      <div className="section-pad" style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <p style={{ ...css.sectionTitle, color: COLORS.goldSoft }}>{stageId}-bosqich bitiruvchi talabalari</p>
        <h1 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: "bold", color: "#fff", marginBottom: "1.5rem" }}>Nima ko'rmoqchisiz?</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
          {sections.map(s => (
            <div key={s.key} className="section-row" onClick={s.action} style={{ background: "rgba(255,255,255,.04)", border: `1px solid rgba(255,255,255,.1)`, borderLeft: `4px solid ${s.accent}`, borderRadius: "12px", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1.25rem", cursor: "pointer", transition: "all .25s ease" }}>
              <span style={{ fontSize: "28px", flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", color: "#fff", fontWeight: "bold" }}>{s.title}</div>
                <div style={{ margin: "3px 0 0", color: "rgba(255,255,255,.5)", fontSize: "13px", fontFamily: "sans-serif" }}>{s.desc}</div>
              </div>
              <span style={{ color: s.accent, fontSize: "20px", flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT LIST ─────────────────────────────────────────────────────────────
function StudentListPage({ stageId, onBack, onSelect }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/?group=${stageId}`).then(r => r.json()).then(d => { setStudents(d); setLoading(false); }).catch(() => setLoading(false));
  }, [stageId]);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || (s.first_name || "").toLowerCase().includes(q) || (s.last_name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  return (
    <div style={css.pageLight}>
      <Navbar onHome={onBack} dark={false} />
      <div className="section-pad" style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div className="student-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: COLORS.navy, margin: 0 }}>Talabalar ro'yxati</h1>
            {!loading && <p style={{ margin: "3px 0 0", color: COLORS.muted, fontSize: "13px", fontFamily: "sans-serif" }}>{students.length} ta talaba</p>}
          </div>
          <input className="search-inp" type="text" placeholder="Qidirish..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...css.input, width: "200px" }} />
        </div>
        <div style={{ display: "flex", gap: ".75rem", marginBottom: ".75rem", fontFamily: "sans-serif", fontSize: "11px", color: COLORS.muted, flexWrap: "wrap" }}>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.blue, marginRight: 4 }} />Yuqori natija</span>
          <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.gold, marginRight: 4 }} />Oddiy talaba</span>
        </div>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Spinner dark /></div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: ".65rem" }}>
            {filtered.map(s => {
              const isBlue = s.color === "blue";
              const name = `${s.first_name || ""} ${s.last_name || ""}`.trim();
              return (
                <div key={s.id} className="student-card" onClick={() => onSelect(s.id)} style={{ ...css.lightCard, borderLeft: `4px solid ${isBlue ? COLORS.blue : COLORS.gold}`, background: isBlue ? "#F5F9FF" : COLORS.white }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={name} size={44} src={s.prof_pic} />
                    <span style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: isBlue ? COLORS.blue : COLORS.gold, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6px", color: "#fff" }}>{isBlue ? "★" : ""}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "bold", fontSize: "14px", color: isBlue ? COLORS.blue : COLORS.navy }}>{name}</span>
                      {isBlue && <span style={{ ...css.badge, background: "#EFF6FF", color: COLORS.blue, border: "1px solid rgba(26,86,219,.2)", fontSize: "9px", padding: "1px 8px" }}>★ Top</span>}
                    </div>
                    <div style={{ display: "flex", gap: ".65rem", marginTop: "3px", flexWrap: "wrap" }}>
                      {s.email && <span style={{ color: COLORS.muted, fontSize: "12px", fontFamily: "sans-serif" }}>✉ {s.email}</span>}
                      {s.phone_number && <span style={{ color: COLORS.muted, fontSize: "12px", fontFamily: "sans-serif" }}>📞 {s.phone_number}</span>}
                    </div>
                  </div>
                  <span style={{ color: isBlue ? COLORS.blue : COLORS.muted, fontSize: "16px" }}>→</span>
                </div>
              );
            })}
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: "2.5rem", color: COLORS.muted, fontFamily: "sans-serif" }}>Talaba topilmadi</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PASSWORD MODAL ───────────────────────────────────────────────────────────
function PasswordModal({ onConfirm, onCancel, error, loading }) {
  const [pw, setPw] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(30,58,95,.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: COLORS.white, borderRadius: "16px", padding: "1.75rem", width: "100%", maxWidth: "360px", boxShadow: "0 32px 80px rgba(0,0,0,.3)" }}>
        <h2 style={{ margin: "0 0 .4rem", fontSize: "18px", color: COLORS.navy, fontFamily: "Georgia,serif" }}>🔒 Kirish</h2>
        <p style={{ margin: "0 0 1.25rem", color: COLORS.muted, fontSize: "13px", fontFamily: "sans-serif" }}>Talaba ma'lumotlarini ko'rish uchun parol kiriting</p>
        <input type="password" placeholder="Parol..." value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && onConfirm(pw)} style={{ ...css.input, marginBottom: ".65rem" }} autoFocus disabled={loading} />
        {error && <p style={{ color: COLORS.danger, fontSize: "12px", fontFamily: "sans-serif", margin: "0 0 .5rem" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: ".65rem" }}>
          <button onClick={() => !loading && onConfirm(pw)} disabled={loading} style={{ ...css.btn, background: loading ? COLORS.muted : COLORS.gold, color: loading ? "#fff" : COLORS.navy, flex: 1, justifyContent: "center", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Tekshirilmoqda...</> : "Kirish"}
          </button>
          <button onClick={onCancel} disabled={loading} style={{ ...css.btn, flex: 1, justifyContent: "center", color: COLORS.navy, border: `1px solid ${COLORS.border}`, background: "transparent" }}>Bekor</button>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL ───────────────────────────────────────────────────────────
function StudentDetailPage({ studentId, onBack }) {
  const [phase, setPhase] = useState("auth");
  const [pwError, setPwError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [docs, setDocs] = useState([]);
  const [toast, setToast] = useState(null);
  const [dlState, setDlState] = useState({});

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleLogin = async (pw) => {
    setPwError(null); setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${studentId}/login/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      if (!res.ok) { const e = await res.json(); setPwError(e.error || "Noto'g'ri parol"); setLoginLoading(false); return; }
      const json = await res.json(); const tok = json.access;
      setToken(tok); setPhase("loading");
      const [detRes, docRes] = await Promise.all([fetch(`${API_BASE}/${studentId}/detail/`, { headers: authHeader(tok) }), fetch(`${API_BASE}/${studentId}/documents/`, { headers: authHeader(tok) })]);
      const detJson = await detRes.json(); const docJson = await docRes.json();
      setData(detJson.data); setDocs(docJson); setPhase("detail");
    } catch { setPwError("Server bilan bog'liq muammo"); setLoginLoading(false); }
  };

  const downloadDoc = async (docId, fileName) => {
    setDlState(p => ({ ...p, [docId]: "loading" }));
    try {
      const res = await fetch(`${API_BASE}/${studentId}/documents/${docId}/download/`, { headers: authHeader(token) });
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = fileName || "document"; a.click(); URL.revokeObjectURL(url);
      setDlState(p => ({ ...p, [docId]: "done" })); showToast("Fayl yuklab olindi ✓");
      setTimeout(() => setDlState(p => ({ ...p, [docId]: "idle" })), 3000);
    } catch { setDlState(p => ({ ...p, [docId]: "idle" })); showToast("Yuklab olishda xatolik", "error"); }
  };

  if (phase === "loading") return <div style={css.pageDark}><Navbar onHome={onBack} dark /><div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><Spinner /></div></div>;

  if (phase === "detail" && data) {
    const fullName = `${data.first_name || ""} ${data.last_name || ""} ${data.middle_name || ""}`.trim();
    const isBlue = data.color === "blue";
    const age = calcAge(data.birth_year);
    return (
      <div style={css.pageLight}>
        <Navbar onHome={onBack} dark={false} />
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div className="section-pad" style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1.5rem", animation: "fadeIn .3s ease" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem", marginBottom: "1.5rem", flexWrap: "wrap", padding: "1.25rem", borderRadius: "14px", background: isBlue ? "linear-gradient(135deg,#EFF6FF,#F0F7FF)" : COLORS.surface, border: isBlue ? `1.5px solid rgba(26,86,219,.2)` : `1px solid ${COLORS.border}` }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar src={data.prof_pic} name={fullName} size={70} />
              {isBlue && <span style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: COLORS.blue, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff" }}>★</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "20px", color: isBlue ? COLORS.blue : COLORS.navy, margin: 0 }}>{fullName}</h1>
                <span style={{ ...css.badge, ...(isBlue ? { background: COLORS.blue, color: "#fff" } : { background: "#FEF3C7", color: "#92400E", border: "1px solid rgba(252,211,77,.3)" }), fontSize: "10px", padding: "3px 10px" }}>{isBlue ? "★ Top talaba" : "Talaba"}</span>
              </div>
              {data.faculty && <p style={{ margin: "3px 0 0", color: COLORS.muted, fontFamily: "sans-serif", fontSize: "13px" }}>{data.faculty}</p>}
              {data.university && <p style={{ margin: "3px 0 0", color: COLORS.blue, fontFamily: "sans-serif", fontSize: "12px", fontWeight: 600 }}>{data.university.name}</p>}
              <div style={{ display: "flex", gap: ".4rem", marginTop: ".6rem", flexWrap: "wrap" }}>
                {data.github_link && <a href={data.github_link} target="_blank" rel="noreferrer" style={{ ...css.badge, background: COLORS.navy, color: "#fff", textDecoration: "none", padding: "4px 10px" }}>GitHub</a>}
                {data.linkedin_link && <a href={data.linkedin_link} target="_blank" rel="noreferrer" style={{ ...css.badge, background: "#0077B5", color: "#fff", textDecoration: "none", padding: "4px 10px" }}>LinkedIn</a>}
              </div>
            </div>
          </div>

          <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: ".65rem", marginBottom: "1.5rem" }}>
            {[{ label: "Email", val: data.email }, { label: "Telefon", val: data.phone_number }, { label: "Tug'ilgan yil", val: data.birth_year ? `${data.birth_year}${age ? ` (${age} yosh)` : ""}` : null }].map(item => item.val ? (
              <div key={item.label} style={{ background: COLORS.surface, borderRadius: "10px", padding: ".75rem .9rem", border: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: "10px", color: COLORS.muted, fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</div>
                <div style={{ marginTop: "3px", fontSize: "13px", color: COLORS.navy, fontFamily: "sans-serif" }}>{item.val}</div>
              </div>
            ) : null)}
          </div>

          {data.projects?.length > 0 && (
            <Section title="Loyihalar" icon="🚀">
              {data.projects.map(p => (
                <div key={p.id} style={{ background: COLORS.surface, borderRadius: "10px", padding: ".85rem", border: `1px solid ${COLORS.border}`, marginBottom: ".45rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: ".4rem" }}>
                    <strong style={{ fontSize: "13px", color: COLORS.navy }}>{p.title}</strong>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: COLORS.blue, fontFamily: "sans-serif" }}>Ko'rish →</a>}
                  </div>
                  {p.description && <p style={{ margin: "3px 0 0", fontSize: "12px", color: COLORS.muted, fontFamily: "sans-serif" }}>{p.description}</p>}
                </div>
              ))}
            </Section>
          )}

          {data.languages?.length > 0 && (
            <Section title="Tillar" icon="🌐">
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
                {data.languages.map(l => <span key={l.id} style={{ ...css.badge, background: "rgba(26,86,219,.08)", color: COLORS.blue, border: "1px solid rgba(26,86,219,.18)", padding: "5px 12px", fontSize: "11px" }}>{l.name} · {l.level}</span>)}
              </div>
            </Section>
          )}

          {docs.length > 0 && (
            <Section title="Hujjatlar" icon="📄">
              {docs.map(d => {
                const s = dlState[d.id] || "idle";
                const btnStyle = s === "idle" ? { bg: COLORS.gold, color: COLORS.navy, label: "⬇ Yuklab olish", cursor: "pointer" } : s === "loading" ? { bg: COLORS.muted, color: "#fff", label: "Yuklanmoqda...", cursor: "not-allowed" } : { bg: COLORS.success, color: "#fff", label: "✓ Yuklandi", cursor: "default" };
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".65rem .9rem", background: COLORS.surface, borderRadius: "8px", border: `1px solid ${COLORS.border}`, marginBottom: ".4rem", flexWrap: "wrap", gap: ".5rem" }}>
                    <div><div style={{ fontSize: "13px", color: COLORS.navy, fontFamily: "sans-serif" }}>{d.file_name || d.doc_type}</div><div style={{ fontSize: "11px", color: COLORS.muted, fontFamily: "sans-serif" }}>{d.doc_type}</div></div>
                    <button onClick={() => s === "idle" && downloadDoc(d.id, d.file_name)} disabled={s !== "idle"} style={{ ...css.btn, background: btnStyle.bg, color: btnStyle.color, fontSize: "11px", padding: ".35rem .8rem", cursor: btnStyle.cursor, minWidth: "120px", justifyContent: "center" }}>
                      {s === "loading" && <span style={{ width: 11, height: 11, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />}
                      {btnStyle.label}
                    </button>
                  </div>
                );
              })}
            </Section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={css.pageDark}>
      <Navbar onHome={onBack} dark />
      <PasswordModal onConfirm={handleLogin} onCancel={onBack} error={pwError} loading={loginLoading} />
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ margin: "0 0 .65rem", fontSize: "14px", color: COLORS.navy, display: "flex", alignItems: "center", gap: ".4rem" }}><span>{icon}</span>{title}</h3>
      {children}
    </div>
  );
}

// ─── LESSONS ──────────────────────────────────────────────────────────────────
function LessonsPage({ stageId, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/lessons/?group=${stageId}`)
      .then(r => r.json())
      .then(d => { setLessons(Array.isArray(d.results) ? d.results : d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [stageId]);

  return (
    <div style={css.pageLight}>
      <Navbar onHome={onBack} dark={false} />
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "bold", color: COLORS.navy }}>
            Dars jarayonidan lavhalar
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Spinner dark />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {lessons.map(l => <PostCard key={l.id} lesson={l} />)}
            {lessons.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: COLORS.muted, fontFamily: "sans-serif" }}>
                Lavhalar topilmadi
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ lesson }) {
  const [currentImg, setCurrentImg] = useState(0);
  const imgs = lesson.images || [];

  return (
    <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: "12px", overflow: "hidden" }}>

      {/* Image carousel */}
      {imgs.length > 0 ? (
        <div style={{ position: "relative", background: "#000" }}>
          <img
            src={fixImg(imgs[currentImg]?.image)}
            alt=""
            style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
          />

          {imgs.length > 1 && (
            <>
              {/* Invisible tap zones for prev/next */}
              {currentImg > 0 && (
                <div
                  onClick={() => setCurrentImg(i => i - 1)}
                  style={{ position: "absolute", left: 0, top: 0, width: "35%", height: "100%", cursor: "pointer" }}
                />
              )}
              {currentImg < imgs.length - 1 && (
                <div
                  onClick={() => setCurrentImg(i => i + 1)}
                  style={{ position: "absolute", right: 0, top: 0, width: "35%", height: "100%", cursor: "pointer" }}
                />
              )}

              {/* Dot indicators */}
              <div style={{
                position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: "5px", alignItems: "center",
              }}>
                {imgs.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    style={{
                      width: i === currentImg ? 18 : 6,
                      height: 6,
                      borderRadius: "99px",
                      background: i === currentImg ? "#fff" : "rgba(255,255,255,0.5)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", aspectRatio: "4/5", background: `linear-gradient(135deg,${COLORS.navyMid},${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px" }}>
          📸
        </div>
      )}

      {/* Caption */}
      <div style={{ padding: "12px 14px 16px" }}>
        <h2 style={{ margin: "0 0 5px", fontSize: "18px", fontFamily: "sans-serif", color: COLORS.navy, fontWeight: "bold", lineHeight: 1.4 }}>
          {lesson.lesson_number}-dars
        </h2>
        {/* <p style={{ margin: "0 0 5px", fontSize: "14px", fontFamily: "sans-serif", color: COLORS.navy, fontWeight: "bold", lineHeight: 1.4 }}>
          {lesson.lesson_name}
        </p> */}
        <p style={{ margin: "0 0 8px", fontSize: "13px", fontFamily: "sans-serif", color: COLORS.navy, lineHeight: 1.6 }}>
          {lesson.highlight_text}
        </p>
        <p style={{ margin: 0, fontSize: "11px", fontFamily: "sans-serif", color: COLORS.muted }}>
          {lesson.created_at
            ? new Date(lesson.created_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" })
            : ""}
        </p>
      </div>
    </div>
  );
}


// ─── MARKS ────────────────────────────────────────────────────────────────────
// function MarksPage({ stageId, onBack }) {
//   const [marks, setMarks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [sortBy, setSortBy] = useState("created_at");
//   const [filterSubject, setFilterSubject] = useState("");

//   useEffect(() => {
//     fetch(`${API_BASE}/marks/${stageId}/`).then(r => r.json()).then(d => { setMarks(Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
//   }, [stageId]);

//   const subjects = [...new Set(marks.map(m => m.subject).filter(Boolean))];
//   const filtered = marks.filter(m => !filterSubject || m.subject === filterSubject);
//   const sorted = [...filtered].sort((a, b) => sortBy === "score" ? (b.score || 0) - (a.score || 0) : new Date(b.created_at) - new Date(a.created_at));
//   const scoreColor = s => s >= 85 ? COLORS.success : s >= 70 ? COLORS.gold : COLORS.danger;

//   return (
//     <div style={css.pageLight}>
//       <Navbar onHome={onBack} dark={false} />
//       <div className="section-pad" style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
//         <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
//         <h1 style={{ margin: "0 0 1.25rem", fontSize: "24px", fontWeight: "bold", color: COLORS.navy }}>📊 Studentlar baholari</h1>
//         <div style={{ display: "flex", gap: ".65rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
//           <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ ...css.input, width: "auto", minWidth: "160px" }}>
//             <option value="">Barcha fanlar</option>
//             {subjects.map(s => <option key={s} value={s}>{s}</option>)}
//           </select>
//           <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...css.input, width: "auto", minWidth: "150px" }}>
//             <option value="created_at">Sanasi bo'yicha</option>
//             <option value="score">Baho bo'yicha</option>
//           </select>
//         </div>
//         {loading ? (
//           <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Spinner dark /></div>
//         ) : (
//           <>
//             <div style={{ overflowX: "auto" }}>
//               <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", fontSize: "13px" }}>
//                 <thead>
//                   <tr style={{ background: COLORS.navy }}>
//                     {["Talaba", "Fan", "Baho", "Sana"].map((h, i) => <th key={h} className={i === 3 ? "marks-last" : ""} style={{ padding: ".75rem .9rem", textAlign: "left", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>)}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sorted.map((m, i) => (
//                     <tr key={m.id} style={{ background: i % 2 === 0 ? COLORS.white : COLORS.surface }}>
//                       <td style={{ padding: ".65rem .9rem", color: COLORS.navy }}>{m.student ? `${m.student.first_name || ""} ${m.student.last_name || ""}`.trim() || "—" : "—"}</td>
//                       <td style={{ padding: ".65rem .9rem", color: COLORS.muted }}>{m.subject || "—"}</td>
//                       <td style={{ padding: ".65rem .9rem" }}><span style={{ display: "inline-block", padding: "2px 9px", borderRadius: "99px", fontWeight: 700, fontSize: "12px", background: `${scoreColor(m.score)}18`, color: scoreColor(m.score), border: `1px solid ${scoreColor(m.score)}44` }}>{m.score ?? "—"}</span></td>
//                       <td className="marks-last" style={{ padding: ".65rem .9rem", color: COLORS.muted, whiteSpace: "nowrap" }}>{m.created_at ? new Date(m.created_at).toLocaleDateString("uz-UZ") : "—"}</td>
//                     </tr>
//                   ))}
//                   {sorted.length === 0 && <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: COLORS.muted }}>Ma'lumot topilmadi</td></tr>}
//                 </tbody>
//               </table>
//             </div>
//             {sorted.length > 0 && (
//               <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".65rem", marginTop: "1.25rem" }}>
//                 {[{ label: "Jami baholar", val: sorted.length }, { label: "O'rtacha baho", val: (sorted.reduce((a, m) => a + (m.score || 0), 0) / sorted.length).toFixed(1) }, { label: "Eng yuqori", val: Math.max(...sorted.map(m => m.score || 0)) }].map(item => (
//                   <div key={item.label} style={{ background: COLORS.surface, borderRadius: "10px", padding: ".75rem", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
//                     <div style={{ fontSize: "10px", color: COLORS.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</div>
//                     <div style={{ marginTop: "5px", fontSize: "20px", fontWeight: "bold", color: COLORS.navy, fontFamily: "Georgia,serif" }}>{item.val}</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


function MarksPage({ stageId, onBack }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/marks/${stageId}/`)
      .then(r => r.json())
      .then(d => {
        setMarks(Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stageId]);

  const subjects = [...new Set(marks.map(m => m.subject).filter(Boolean))];
  const filtered = marks.filter(m => !filterSubject || m.subject === filterSubject);
  const sorted = [...filtered].sort((a, b) =>
    sortBy === "score"
      ? (b.score || 0) - (a.score || 0)
      : new Date(b.created_at) - new Date(a.created_at)
  );
  const scoreColor = s => s >= 85 ? COLORS.success : s >= 70 ? COLORS.gold : COLORS.danger;

  // ✅ Excel download using SheetJS (add to index.html: <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>)
  const downloadExcel = () => {
    const headers = ["Talaba", "Fan", "Mavzu", "Baho", "Sana"];
    const rows = sorted.map(m => ([
      m.student ? `${m.student.first_name || ""} ${m.student.last_name || ""}`.trim() || "—" : "—",
      m.subject || "—",
      m.theme || "—",          // ✅ new field
      m.score ?? "—",
      m.created_at ? new Date(m.created_at).toLocaleDateString("uz-UZ") : "—",
    ]));

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = [20, 16, 22, 8, 14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Baholar");
    XLSX.writeFile(wb, `${stageId}-bosqich_baholar.xlsx`);
  };

  return (
    <div style={css.pageLight}>
      <Navbar onHome={onBack} dark={false} />
      <div className="section-pad" style={{ maxWidth: "900px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
        <h1 style={{ margin: "0 0 1.25rem", fontSize: "24px", fontWeight: "bold", color: COLORS.navy }}>
          📊 Studentlar baholari
        </h1>

        <div style={{ display: "flex", gap: ".65rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{ ...css.input, width: "auto", minWidth: "160px" }}>
            <option value="">Barcha fanlar</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...css.input, width: "auto", minWidth: "150px" }}>
            <option value="created_at">Sanasi bo'yicha</option>
            <option value="score">Baho bo'yicha</option>
          </select>

          {/* ✅ Excel download button */}
          {sorted.length > 0 && (
            <button
              onClick={downloadExcel}
              style={{
                marginLeft: "auto",
                display: "flex", alignItems: "center", gap: ".4rem",
                background: COLORS.success, color: "#fff",
                border: "none", borderRadius: "8px",
                padding: ".45rem 1rem", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "sans-serif",
              }}
            >
              ⬇ Excel yuklab olish
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}><Spinner dark /></div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: COLORS.navy }}>
                    {/* ✅ Added "Mavzu" column */}
                    {["Talaba", "Fan", "Mavzu", "Baho", "Sana"].map((h, i) => (
                      <th key={h} style={{ padding: ".75rem .9rem", textAlign: "left", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m, i) => (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? COLORS.white : COLORS.surface }}>
                      <td style={{ padding: ".65rem .9rem", color: COLORS.navy }}>
                        {m.student ? `${m.student.first_name || ""} ${m.student.last_name || ""}`.trim() || "—" : "—"}
                      </td>
                      <td style={{ padding: ".65rem .9rem", color: COLORS.muted }}>{m.subject || "—"}</td>
                      {/* ✅ New theme cell */}
                      <td style={{ padding: ".65rem .9rem", color: COLORS.muted }}>{m.theme || "—"}</td>
                      <td style={{ padding: ".65rem .9rem" }}>
                        <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: "99px", fontWeight: 700, fontSize: "12px", background: `${scoreColor(m.score)}18`, color: scoreColor(m.score), border: `1px solid ${scoreColor(m.score)}44` }}>
                          {m.score ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: ".65rem .9rem", color: COLORS.muted, whiteSpace: "nowrap" }}>
                        {m.created_at ? new Date(m.created_at).toLocaleDateString("uz-UZ") : "—"}
                      </td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: COLORS.muted }}>Ma'lumot topilmadi</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {sorted.length > 0 && (
              <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".65rem", marginTop: "1.25rem" }}>
                {[
                  { label: "Jami baholar", val: sorted.length },
                  { label: "O'rtacha baho", val: (sorted.reduce((a, m) => a + (m.score || 0), 0) / sorted.length).toFixed(1) },
                  { label: "Eng yuqori", val: Math.max(...sorted.map(m => m.score || 0)) },
                ].map(item => (
                  <div key={item.label} style={{ background: COLORS.surface, borderRadius: "10px", padding: ".75rem", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: COLORS.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: ".08em" }}>{item.label}</div>
                    <div style={{ marginTop: "5px", fontSize: "20px", fontWeight: "bold", color: COLORS.navy, fontFamily: "Georgia,serif" }}>{item.val}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState({ page: "home" });
  const go = useCallback((page, extra = {}) => setRoute({ page, ...extra }), []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const { page, stageId, studentId } = route;
  if (page === "home") return <HomePage onSelect={id => go("stage", { stageId: id })} />;
  if (page === "stage") return <StagePage stageId={stageId} onBack={() => go("home")} onStudents={() => go("studentList", { stageId })} onLessons={() => go("lessons", { stageId })} onMarks={() => go("marks", { stageId })} />;
  if (page === "studentList") return <StudentListPage stageId={stageId} onBack={() => go("stage", { stageId })} onSelect={id => go("studentDetail", { stageId, studentId: id })} />;
  if (page === "studentDetail") return <StudentDetailPage studentId={studentId} onBack={() => go("studentList", { stageId })} />;
  if (page === "lessons") return <LessonsPage stageId={stageId} onBack={() => go("stage", { stageId })} />;
  if (page === "marks") return <MarksPage stageId={stageId} onBack={() => go("stage", { stageId })} />;
  return null;
}
