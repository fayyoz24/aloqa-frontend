import { useState, useEffect, useCallback } from "react";

const API = "http://127.0.0.1:8000/api/students";

// ─── UTILS ────────────────────────────────────────────────────────────────
const initials = (s) =>
  ((s?.first_name || "?")[0] + (s?.last_name || "?")[0]).toUpperCase();
const getAge = (y) => (y ? new Date().getFullYear() - parseInt(y) : null);
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("uz-Latn-UZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d || "";
  }
};
const scoreClass = (v) => (v >= 85 ? "high" : v >= 70 ? "mid" : "low");

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const d = await res.json();
  return Array.isArray(d) ? d : d.results ?? d.data ?? d;
}

// ─── ICONS ───────────────────────────────────────────────────────────────
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.97 9.81 19.79 19.79 0 01.9 1.18 2 2 0 012.88 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.66a16 16 0 006.29 6.29l1.02-1.04a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const SchoolIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22 10v6M2 10l10-7 10 7" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10v7a2 2 0 002 2h8a2 2 0 002-2v-7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const GithubIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3M21 21v-2c0-1.657-1.343-3-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" strokeLinecap="round" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const LangIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 8l6 6M4 14l6-6 2-3M2 5h7M7 2v3M22 22l-5-10-5 10M14 18h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CodeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const ContractIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
  </svg>
);

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────
function Avatar({ student, size = "md" }) {
  const [err, setErr] = useState(false);
  const ini = initials(student);
  const dims = { sm: 30, md: 50, lg: 80 };
  const fontSize = { sm: 11, md: 16, lg: 26 };
  const border = { sm: "1.5px", md: "2px", lg: "3px" };
  const d = dims[size];
  const f = fontSize[size];
  const b = border[size];
  return (
    <div style={{ width: d, height: d, borderRadius: "50%", background: "var(--color-background-info)", color: "var(--color-text-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: f, fontWeight: 500, flexShrink: 0, overflow: "hidden", border: `${b} solid var(--color-border-info)` }}>
      {student?.prof_pic && !err
        ? <img src={student.prof_pic} alt={ini} onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : ini}
    </div>
  );
}

function Badge({ color = "blue", children, href, onClick, style }) {
  const colors = {
    blue: { bg: "var(--color-background-info)", text: "var(--color-text-info)", border: "var(--color-border-info)" },
    green: { bg: "var(--color-background-success)", text: "var(--color-text-success)", border: "var(--color-border-success)" },
    amber: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)", border: "var(--color-border-warning)" },
    red: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)", border: "var(--color-border-danger)" },
    gray: { bg: "var(--color-background-secondary)", text: "var(--color-text-secondary)", border: "var(--color-border-tertiary)" },
  };
  const c = colors[color] || colors.blue;
  const base = { display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 100, fontSize: 12, fontWeight: 500, textDecoration: "none", background: c.bg, color: c.text, border: `0.5px solid ${c.border}`, cursor: "pointer", whiteSpace: "nowrap", ...style };
  if (href) return <a style={base} href={href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>{children}</a>;
  return <span style={base} onClick={onClick}>{children}</span>;
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 100, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--color-text-secondary)", marginBottom: "1.5rem", transition: "all 0.15s" }}>
      <ArrowLeft /> Orqaga
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-tertiary)", fontSize: 14 }}>
      <div style={{ width: 28, height: 28, border: "2px solid var(--color-border-tertiary)", borderTopColor: "var(--color-text-info)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 0.75rem" }} />
      Yuklanmoqda...
    </div>
  );
}

function EmptyState({ msg = "Ma'lumot topilmadi" }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 14, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)" }}>
      {msg}
    </div>
  );
}

function ErrorState({ msg }) {
  return (
    <div style={{ padding: "2rem", background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-lg)", color: "var(--color-text-danger)", fontSize: 14 }}>
      Xatolik: {msg}
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--color-text-primary)" }}>{children}</span>
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────
function Navbar({ state, onNav }) {
  const { stage, section, student } = state;
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 200, height: 60, background: "rgba(var(--color-background-primary-rgb, 255,255,255), 0.92)", backdropFilter: "blur(12px)", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => onNav("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "0.5px solid #003399", background: "#003399", color: "#fff", cursor: "pointer", letterSpacing: "-0.01em" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M2 10h20M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Aloqabank
        </button>
        <div style={{ width: 1, height: 22, background: "var(--color-border-secondary)" }} />
        <button onClick={() => onNav("home")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 500, border: "0.5px solid var(--color-border-info)", background: "var(--color-background-info)", color: "var(--color-text-info)", cursor: "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          IT Klaster
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-text-tertiary)", flexWrap: "wrap", minWidth: 0 }}>
        {stage && <>
          <span style={{ color: "var(--color-text-info)", cursor: "pointer" }} onClick={() => onNav("home")}>Bosh sahifa</span>
          <span>/</span>
          <span style={{ color: section ? "var(--color-text-info)" : "var(--color-text-secondary)", cursor: section ? "pointer" : "default" }} onClick={() => section && onNav("stage")}>{stage}-bosqich</span>
        </>}
        {section && <>
          <span>/</span>
          {student
            ? <><span style={{ color: "var(--color-text-info)", cursor: "pointer" }} onClick={() => onNav("students")}>Talabalar</span><span>/</span><span style={{ color: "var(--color-text-secondary)" }}>{student.first_name} {student.last_name}</span></>
            : <span style={{ color: "var(--color-text-secondary)" }}>{{ students: "Talabalar ro'yxati", highlights: "Dars lavhalari", marks: "Baholar" }[section]}</span>
          }
        </>}
      </div>
    </nav>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────
function HomeView({ onSelectStage }) {
  const cards = [
    { num: "1", color: "#1A3FDB", accent: "#EEF1FD", numBg: "#1A3FDB", label: "1-bosqich bitiruvchi talabalari", desc: "Birinchi o'quv bosqichini muvaffaqiyatli yakunlagan talabalar" },
    { num: "2", color: "#157A4A", accent: "#EBF7F1", numBg: "#157A4A", label: "2-bosqich talabalari", desc: "Ikkinchi o'quv bosqichida tahsil olayotgan talabalar" },
  ];
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ textAlign: "center", padding: "3rem 0 2.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "var(--color-background-info)", color: "var(--color-text-info)", borderRadius: 100, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
          Aloqabank × IT Klaster
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "0.75rem" }}>Talabalar portali</h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", fontWeight: 300 }}>O'quv bosqichini tanlang va talabalar bilan tanishing</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", maxWidth: 720, margin: "0 auto" }}>
        {cards.map(({ num, color, accent, numBg, label, desc }) => (
          <StageCard key={num} num={num} color={color} accent={accent} numBg={numBg} label={label} desc={desc} onClick={() => onSelectStage(num)} />
        ))}
      </div>
    </div>
  );
}

function StageCard({ num, color, accent, numBg, label, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "2rem 1.75rem 1.75rem", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.08)" : "none", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${accent} 0%, transparent 60%)`, opacity: hov ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none" }} />
      <div style={{ width: 52, height: 52, borderRadius: "var(--border-radius-md)", background: accent, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", position: "relative" }}>
        <span style={{ background: numBg, color: "#fff", fontFamily: "monospace", fontSize: 11, fontWeight: 500, padding: "3px 7px", borderRadius: 100, position: "absolute", top: -6, right: -6 }}>0{num}</span>
        <SchoolIcon color={color} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em" }}>{label}</div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "1.25rem" }}>{desc}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color }}>Ko'rish <ArrowRight /></div>
    </div>
  );
}

// ─── STAGE ────────────────────────────────────────────────────────────────
function StageView({ stage, onNav }) {
  const label = stage === "1" ? "1-bosqich bitiruvchi talabalari" : "2-bosqich talabalari";
  const sections = [
    { key: "students", icon: <UsersIcon />, iconBg: "var(--color-background-info)", iconColor: "var(--color-text-info)", title: "Talabalar ro'yxati", desc: "Barcha talabalar profili, kontakt ma'lumotlari va loyihalari" },
    { key: "highlights", icon: <ImageIcon />, iconBg: "#F0EFFE", iconColor: "#5B3FDB", title: "Dars jarayonidan lavhalar", desc: "Dars davomidagi muhim lahzalar, rasmlar va tavsiflar" },
    { key: "marks", icon: <ClipboardIcon />, iconBg: "var(--color-background-success)", iconColor: "var(--color-text-success)", title: "Studentlar baholari", desc: "Barcha talabalar baholari, fanlar bo'yicha pivot jadval" },
  ];
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <BackBtn onClick={() => onNav("home")} />
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>{label}</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>Bo'limni tanlang</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {sections.map(({ key, icon, iconBg, iconColor, title, desc }) => (
          <SectionCard key={key} icon={icon} iconBg={iconBg} iconColor={iconColor} title={title} desc={desc} onClick={() => onNav(key)} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ icon, iconBg, iconColor, title, desc, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.08)" : "none", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 42, height: 42, borderRadius: "var(--border-radius-md)", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

// ─── STUDENTS VIEW ────────────────────────────────────────────────────────
function StudentsView({ stage, onNav, onStudent }) {
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiFetch(`${API}/?group=${stage}`)
      .then(data => { setAll(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  const filtered = all.filter(s => {
    if (!query) return true;
    const name = `${s.first_name} ${s.last_name} ${s.middle_name || ""}`.toLowerCase();
    return name.includes(query.toLowerCase()) || (s.email || "").toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <BackBtn onClick={() => onNav("stage")} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>Talabalar ro'yxati</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>{stage}-bosqich — barcha talabalar</p>
        </div>
      </div>
      <div style={{ position: "relative", marginBottom: "1.5rem", maxWidth: 380 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }}><SearchIcon /></span>
        <input type="text" placeholder="Ism yoki email bo'yicha qidirish..." value={query} onChange={e => setQuery(e.target.value)}
          style={{ width: "100%", padding: "9px 12px 9px 38px", borderRadius: 100, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", fontSize: 14, color: "var(--color-text-primary)", outline: "none", fontFamily: "inherit" }} />
      </div>
      {loading ? <Spinner /> : error ? <ErrorState msg={error} /> : filtered.length === 0 ? <EmptyState msg="Talaba topilmadi" /> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1rem" }}>
          {filtered.map(s => <StudentCard key={s.id} student={s} onClick={() => onStudent(s)} />)}
        </div>
      }
    </div>
  );
}

function StudentCard({ student: s, onClick }) {
  const [hov, setHov] = useState(false);
  const a = getAge(s.birth_year);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem", cursor: "pointer", transition: "transform 0.18s, box-shadow 0.18s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.08)" : "none", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar student={s} size="md" />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 1 }}>{s.first_name} {s.last_name}</div>
          {s.middle_name && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{s.middle_name}</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {s.email && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--color-text-secondary)" }}><MailIcon />{s.email}</div>}
        {s.phone_number && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--color-text-secondary)" }}><PhoneIcon />{s.phone_number}</div>}
        {a && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--color-text-secondary)" }}><CalIcon />{a} yosh</div>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {s.github_link && <Badge color="blue" href={s.github_link}><GithubIcon /> GitHub</Badge>}
        {s.linkedin_link && <Badge color="green" href={s.linkedin_link}><LinkedinIcon /> LinkedIn</Badge>}
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL ───────────────────────────────────────────────────────
function StudentDetailView({ student: s, onBack }) {
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

  const data = detail || s;

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <BackBtn onClick={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.25rem", alignItems: "start" }}>
        {/* Sidebar */}
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.5rem", position: "sticky", top: "calc(60px + 1rem)" }}>
          <div style={{ textAlign: "center", marginBottom: "1.25rem" }}><Avatar student={s} size="lg" /></div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", textAlign: "center", marginBottom: 4 }}>{s.first_name} {s.last_name}</div>
          {s.middle_name && <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center", marginBottom: "1.25rem" }}>{s.middle_name}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {s.github_link && <Badge color="blue" href={s.github_link}><GithubIcon /> GitHub</Badge>}
            {s.linkedin_link && <Badge color="green" href={s.linkedin_link}><LinkedinIcon /> LinkedIn</Badge>}
          </div>
          <div style={{ height: 1, background: "var(--color-border-tertiary)", marginBottom: "1.25rem" }} />
          {s.email && <InfoRow label="Email"><a href={`mailto:${s.email}`} style={{ color: "var(--color-text-info)", textDecoration: "none" }}>{s.email}</a></InfoRow>}
          {s.phone_number && <InfoRow label="Telefon"><a href={`tel:${s.phone_number}`} style={{ color: "var(--color-text-info)", textDecoration: "none" }}>{s.phone_number}</a></InfoRow>}
          {a && <InfoRow label="Yosh">{a} yosh ({s.birth_year})</InfoRow>}
          {data?.faculty && <InfoRow label="Fakultet">{data.faculty}</InfoRow>}
          {data?.university?.name && <InfoRow label="Universitet">{data.university.name}</InfoRow>}
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? <Spinner /> : error ? <ErrorState msg={error} /> : <>
            {detail?.languages?.length > 0 && (
              <DetailCard icon={<LangIcon />} iconBg="#F0EFFE" iconColor="#5B3FDB" title="Tillar">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {detail.languages.map(l => (
                    <Badge key={l.id} color="blue">{l.name} — {l.level}{l.certificate ? " ✓" : ""}</Badge>
                  ))}
                </div>
              </DetailCard>
            )}
            {detail?.projects?.length > 0 && (
              <DetailCard icon={<CodeIcon />} iconBg="var(--color-background-info)" iconColor="var(--color-text-info)" title="Loyihalar">
                {detail.projects.map(p => (
                  <div key={p.id} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 5 }}>{p.title}</div>
                    {p.description && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>{p.description}</div>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge color="gray">{fmtDate(p.created_at)}</Badge>
                      {p.link && <Badge color="blue" href={p.link}>Ko'rish →</Badge>}
                    </div>
                  </div>
                ))}
              </DetailCard>
            )}
            {detail?.documents?.length > 0 && (
              <DetailCard icon={<FileIcon />} iconBg="var(--color-background-warning)" iconColor="var(--color-text-warning)" title="Hujjatlar">
                {detail.documents.map(doc => (
                  <a key={doc.id} href={`${API}/${s.id}/documents/${doc.id}/download/`} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", textDecoration: "none", color: "var(--color-text-primary)", marginBottom: 6, fontSize: 13, transition: "all 0.15s" }}>
                    <div style={{ width: 32, height: 32, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileIcon /></div>
                    <span style={{ fontWeight: 500, flex: 1 }}>{doc.name}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "monospace" }}>{doc.doc_type}</span>
                    <DownloadIcon />
                  </a>
                ))}
              </DetailCard>
            )}
            {detail?.contracts && (Array.isArray(detail.contracts) ? detail.contracts : [detail.contracts]).filter(Boolean).length > 0 && (
              <DetailCard icon={<ContractIcon />} iconBg="var(--color-background-success)" iconColor="var(--color-text-success)" title="Shartnomalar">
                {(Array.isArray(detail.contracts) ? detail.contracts : [detail.contracts]).map(c => (
                  <a key={c.id} href={c.file || "#"} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", textDecoration: "none", color: "var(--color-text-primary)", marginBottom: 6, fontSize: 13 }}>
                    <div style={{ width: 32, height: 32, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ContractIcon /></div>
                    <span style={{ fontWeight: 500, flex: 1 }}>Shartnoma №{c.number}</span>
                    <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "monospace" }}>{fmtDate(c.created_at)}</span>
                  </a>
                ))}
              </DetailCard>
            )}
            {!detail?.languages?.length && !detail?.projects?.length && !detail?.documents?.length && (
              <EmptyState msg="Qo'shimcha ma'lumot topilmadi" />
            )}
          </>}
        </div>
      </div>
    </div>
  );
}

function DetailCard({ icon, iconBg, iconColor, title, children }) {
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: "1rem" }}>
        <div style={{ width: 28, height: 28, borderRadius: "var(--border-radius-md)", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── HIGHLIGHTS VIEW ──────────────────────────────────────────────────────
function HighlightsView({ stage, onNav }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    apiFetch(`${API}/lessons/?group=${stage}`)
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <BackBtn onClick={() => onNav("stage")} />
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>Dars jarayonidan lavhalar</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>{stage}-bosqich — barcha lavhalar</p>
      </div>
      {loading ? <Spinner /> : error ? <ErrorState msg={error} /> : items.length === 0 ? <EmptyState msg="Lavhalar topilmadi" /> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {items.map(h => <HighlightCard key={h.id} highlight={h} />)}
        </div>
      }
    </div>
  );
}

function HighlightCard({ highlight: h }) {
  const [hov, setHov] = useState(false);
  const mainImg = h.images?.[0]?.image;
  const extras = h.images?.slice(1) || [];
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden", transition: "transform 0.18s, box-shadow 0.18s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.08)" : "none" }}>
      <div style={{ height: 200, background: "var(--color-background-secondary)", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {mainImg
          ? <img src={mainImg} alt={h.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hov ? "scale(1.04)" : "none" }} />
          : <div style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}><ImageIcon /></div>
        }
        {extras.length > 0 && (
          <div style={{ display: "flex", gap: 3, position: "absolute", bottom: 8, right: 8 }}>
            {extras.slice(0, 2).map((img, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: 5, overflow: "hidden", border: "2px solid rgba(255,255,255,0.8)" }}>
                <img src={img.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
            {extras.length > 2 && (
              <div style={{ width: 36, height: 36, borderRadius: 5, background: "rgba(0,0,0,0.55)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, border: "2px solid rgba(255,255,255,0.8)" }}>
                +{extras.length - 2}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ padding: "1.25rem" }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em" }}>{h.title}</div>
        {h.description && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 12, lineHeight: 1.55 }}>{h.description}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Badge color="blue">{h.group || ""}</Badge>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "monospace" }}>{fmtDate(h.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MARKS VIEW ───────────────────────────────────────────────────────────
function MarksView({ stage, onNav }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Use group param consistent with backend: stage IS the group
    apiFetch(`${API}/marks/?group=${stage}`)
      .then(data => { setMarks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [stage]);

  const exportCSV = useCallback(() => {
    if (!marks.length) return;
    const subjects = [...new Set(marks.map(m => m.subject).filter(Boolean))];
    const studentMap = {};
    marks.forEach(m => {
      const st = m.student;
      if (!st) return;
      if (!studentMap[st.id]) studentMap[st.id] = { s: st, marks: {} };
      studentMap[st.id].marks[m.subject] = m.score;
    });
    const rows = Object.values(studentMap);
    const header = ["#", "Ism", "Familiya", ...subjects, "O'rtacha"];
    const lines = [header, ...rows.map((r, i) => {
      const scores = subjects.map(sub => r.marks[sub] ?? "");
      const valid = scores.filter(v => v !== "");
      const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : "";
      return [i + 1, r.s.first_name, r.s.last_name, ...scores, avg];
    })];
    const csv = lines.map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${stage}-bosqich_baholar.csv`;
    a.click();
  }, [marks, stage]);

  const subjects = [...new Set(marks.map(m => m.subject).filter(Boolean))];
  const studentMap = {};
  marks.forEach(m => {
    const st = m.student;
    if (!st) return;
    if (!studentMap[st.id]) studentMap[st.id] = { s: st, marks: {} };
    studentMap[st.id].marks[m.subject] = m.score;
  });
  const rows = Object.values(studentMap);

  const scoreColors = {
    high: { bg: "var(--color-background-success)", text: "var(--color-text-success)" },
    mid: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" },
    low: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" },
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <BackBtn onClick={() => onNav("stage")} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.025em", marginBottom: 4 }}>Studentlar baholari</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", fontWeight: 300 }}>{stage}-bosqich — fanlar bo'yicha pivot jadval</p>
        </div>
        <button onClick={exportCSV} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 100, border: "0.5px solid var(--color-border-success)", background: "var(--color-background-success)", color: "var(--color-text-success)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          <DownloadIcon /> Excel (.csv) yuklash
        </button>
      </div>
      {loading ? <Spinner /> : error ? <ErrorState msg={error} /> : rows.length === 0 ? <EmptyState msg="Baholar topilmadi" /> : <>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr>
                  {["#", "Talaba", ...subjects, "O'rtacha"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-tertiary)", background: "var(--color-background-secondary)", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const scores = subjects.map(sub => r.marks[sub]);
                  const valid = scores.filter(v => v != null);
                  const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null;
                  return (
                    <tr key={r.s.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                      <td style={{ padding: "10px 14px", color: "var(--color-text-tertiary)", fontFamily: "monospace", fontSize: 12 }}>{i + 1}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar student={r.s} size="sm" />
                          <span style={{ fontWeight: 500 }}>{r.s.first_name} {r.s.last_name}</span>
                        </div>
                      </td>
                      {scores.map((v, j) => (
                        <td key={j} style={{ padding: "10px 14px" }}>
                          {v != null
                            ? <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 40, padding: "4px 8px", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: "monospace", background: scoreColors[scoreClass(v)].bg, color: scoreColors[scoreClass(v)].text }}>{v}</span>
                            : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                          }
                        </td>
                      ))}
                      <td style={{ padding: "10px 14px" }}>
                        {avg != null
                          ? <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 40, padding: "4px 8px", borderRadius: 100, fontSize: 12, fontWeight: 600, fontFamily: "monospace", background: scoreColors[scoreClass(avg)].bg, color: scoreColors[scoreClass(avg)].text }}>{avg}</span>
                          : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: 12, color: "var(--color-text-secondary)", marginTop: "0.75rem", padding: "0 4px" }}>
          {[["success", "85+ — A'lo"], ["warning", "70–84 — Yaxshi"], ["danger", "70 dan past — Qoniqarli"]].map(([c, label]) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: `var(--color-text-${c})` }} />
              {label}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState({ view: "home", stage: null, section: null, student: null });

  const onNav = useCallback((view, extra = {}) => {
    setState(prev => {
      if (view === "home") return { view: "home", stage: null, section: null, student: null };
      if (view === "stage") return { ...prev, view: "stage", section: null, student: null };
      if (view === "students") return { ...prev, view: "students", section: "students", student: null };
      if (view === "highlights") return { ...prev, view: "highlights", section: "highlights", student: null };
      if (view === "marks") return { ...prev, view: "marks", section: "marks", student: null };
      return prev;
    });
  }, []);

  const onSelectStage = useCallback((num) => {
    setState({ view: "stage", stage: num, section: null, student: null });
  }, []);

  const onStudent = useCallback((s) => {
    setState(prev => ({ ...prev, view: "student", section: "students", student: s }));
  }, []);

  const views = {
    home: <HomeView onSelectStage={onSelectStage} />,
    stage: <StageView stage={state.stage} onNav={onNav} />,
    students: <StudentsView stage={state.stage} onNav={onNav} onStudent={onStudent} />,
    student: <StudentDetailView student={state.student} onBack={() => onNav("students")} />,
    highlights: <HighlightsView stage={state.stage} onNav={onNav} />,
    marks: <MarksView stage={state.stage} onNav={onNav} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        button { font-family: inherit; }
        a { font-family: inherit; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--color-border-secondary); border-radius: 3px; }
      `}</style>
      <Navbar state={state} onNav={onNav} />
      <div style={{ padding: "2.5rem 2rem", maxWidth: 1180, margin: "0 auto" }}>
        {views[state.view] || views.home}
      </div>
    </>
  );
}
