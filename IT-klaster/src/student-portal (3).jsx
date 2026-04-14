import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://aloqabankstudents.pythonanywhere.com/api/students";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const calcAge = (birthYear) => {
  if (!birthYear) return "—";
  return new Date().getFullYear() - birthYear;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  navy:    "#1E3A5F",
  navyMid: "#2C5282",
  blue:    "#1A56DB",
  blueSoft:"#3B82F6",
  gold:    "#F59E0B",
  goldSoft:"#FCD34D",
  surface: "#F8FAFC",
  white:   "#FFFFFF",
  muted:   "#64748B",
  border:  "#E2E8F0",
  danger:  "#EF4444",
  success: "#10B981",
};

const css = {
  // Page wrappers
  page: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, #2A4A7F 0%, #3B6CB7 50%, #4A7FCB 100%)`,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: COLORS.white,
  },
  // Navbar
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2.5rem",
    height: "68px",
    background: "rgba(30,58,95,0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid rgba(255,255,255,0.08)`,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  logoDivider: {
    width: 1,
    height: 32,
    background: "rgba(255,255,255,0.2)",
  },
  logoText: {
    fontFamily: "'Georgia', serif",
    fontWeight: "bold",
    fontSize: "15px",
    letterSpacing: "0.04em",
    color: COLORS.white,
  },
  logoSub: {
    fontSize: "10px",
    color: COLORS.goldSoft,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginTop: "1px",
  },
  // Cards
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "2rem",
    backdropFilter: "blur(8px)",
    transition: "all 0.25s ease",
    cursor: "pointer",
  },
  cardHover: {
    background: "rgba(255,255,255,0.08)",
    border: `1px solid rgba(245,158,11,0.4)`,
    transform: "translateY(-3px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  // Light card (for student list page)
  lightPage: {
    minHeight: "100vh",
    background: COLORS.surface,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: COLORS.navy,
  },
  lightCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "1.25rem 1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  lightCardHover: {
    boxShadow: "0 8px 24px rgba(10,22,40,0.12)",
    borderColor: COLORS.blue,
    transform: "translateY(-2px)",
  },
  // Buttons
  btn: {
    padding: "0.6rem 1.4rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
  btnPrimary: {
    background: COLORS.gold,
    color: COLORS.navy,
  },
  btnOutline: {
    background: "transparent",
    color: COLORS.white,
    border: "1px solid rgba(255,255,255,0.3)",
  },
  btnDanger: {
    background: COLORS.danger,
    color: COLORS.white,
  },
  // Inputs
  input: {
    width: "100%",
    padding: "0.65rem 1rem",
    borderRadius: "8px",
    border: `1.5px solid ${COLORS.border}`,
    fontSize: "14px",
    fontFamily: "'Georgia', serif",
    outline: "none",
    background: COLORS.white,
    color: COLORS.navy,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  // Badge
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "99px",
    fontSize: "11px",
    fontFamily: "sans-serif",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: 700,
  },
  // Section headers
  sectionTitle: {
    fontSize: "13px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: COLORS.goldSoft,
    fontFamily: "sans-serif",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  heroTitle: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: "bold",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 48 }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  if (src)
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.gold})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: COLORS.white, fontWeight: "bold", fontSize: size * 0.35,
        flexShrink: 0, fontFamily: "sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onHome, dark = true }) {
  return (
    <nav style={{ ...css.nav, background: dark ? "rgba(10,22,40,0.92)" : COLORS.white, borderBottom: dark ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${COLORS.border}` }}>
      <div style={css.logoGroup}>
        {/* Aloqabank Logo */}
        <div
          onClick={onHome}
          style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
        >
          <span style={{ ...css.logoText, color: dark ? COLORS.white : COLORS.navy, fontSize: "18px" }}>
            🏦 Aloqabank
          </span>
          <span style={{ ...css.logoSub, color: dark ? COLORS.goldSoft : COLORS.gold }}>
            Banking Excellence
          </span>
        </div>
        <div style={{ ...css.logoDivider, background: dark ? "rgba(255,255,255,0.2)" : COLORS.border }} />
        {/* IT Klaster Logo */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ ...css.logoText, color: dark ? COLORS.goldSoft : COLORS.blue, fontSize: "18px" }}>
            💻 IT Klaster
          </span>
          <span style={{ ...css.logoSub, color: dark ? "rgba(255,255,255,0.5)" : COLORS.muted }}>
            Innovation Hub
          </span>
        </div>
      </div>
      <button
        onClick={onHome}
        style={{ ...css.btn, ...(dark ? css.btnOutline : { background: COLORS.surface, color: COLORS.navy, border: `1px solid ${COLORS.border}` }), fontSize: "13px", padding: "0.45rem 1rem" }}
      >
        ← Bosh sahifa
      </button>
    </nav>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      background: type === "error" ? COLORS.danger : COLORS.success,
      color: COLORS.white, padding: "0.75rem 1.5rem", borderRadius: "10px",
      fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
      animation: "fadeIn 0.25s ease",
    }}>
      {msg}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Loader({ label = "Yuklanmoqda..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "4rem" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid rgba(255,255,255,0.15)`,
        borderTop: `3px solid ${COLORS.gold}`,
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", fontSize: "14px" }}>{label}</span>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onSelect }) {
  const [hovered, setHovered] = useState(null);

  const stages = [
    {
      id: 1,
      label: "1-bosqich",
      title: "Birinchi bosqich\nbitiruvchi talabalari",
      desc: "Birinchi bosqich talabalar ro'yxati, baholari va dars jarayoni",
      icon: "🎓",
      accent: COLORS.blue,
    },
    {
      id: 2,
      label: "2-bosqich",
      title: "Ikkinchi bosqich\nbitiruvchi talabalari",
      desc: "Ikkinchi bosqich talabalar ro'yxati, baholari va dars jarayoni",
      icon: "🏆",
      accent: COLORS.gold,
    },
  ];

  return (
    <div style={css.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        * { box-sizing: border-box; }
        a { color: inherit; }
      `}</style>
      <Navbar onHome={() => {}} dark />
      {/* Hero */}
      <div style={{ padding: "5rem 2.5rem 3rem", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <p style={css.sectionTitle}>Aloqabank · IT Klaster</p>
        <h1 style={{ ...css.heroTitle, color: COLORS.white }}>
          Talabalar <span style={{ color: COLORS.goldSoft }}>Portalı</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "16px", marginTop: "1rem", lineHeight: 1.8, fontFamily: "sans-serif", maxWidth: "520px", margin: "1rem auto 0" }}>
          Bitiruvchi talabalar ma'lumotlari, baholari va dars jarayoni lavralarini ko'rish
        </p>
      </div>

      {/* Stage cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        maxWidth: "800px",
        margin: "2rem auto 4rem",
        padding: "0 2rem",
      }}>
        {stages.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...css.card,
              ...(hovered === s.id ? css.cardHover : {}),
              borderTop: `3px solid ${s.accent}`,
              animation: `float ${3 + s.id * 0.7}s ease-in-out infinite`,
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "1rem", display: "block" }}>{s.icon}</div>
            <span style={{
              ...css.badge,
              background: `${s.accent}22`,
              color: s.accent,
              border: `1px solid ${s.accent}44`,
              marginBottom: "0.75rem",
            }}>
              {s.label}
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", lineHeight: 1.3, whiteSpace: "pre-line", margin: "0.5rem 0 0.75rem", color: COLORS.white }}>
              {s.title}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontFamily: "sans-serif", lineHeight: 1.6, margin: 0 }}>
              {s.desc}
            </p>
            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "6px", color: s.accent, fontSize: "13px", fontFamily: "sans-serif", fontWeight: 600 }}>
              Ko'rish →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STAGE PAGE (3 sections) ──────────────────────────────────────────────────
function StagePage({ stageId, onBack, onStudents, onLessons, onMarks }) {
  const [hovered, setHovered] = useState(null);

  const sections = [
    {
      key: "students",
      icon: "👩‍🎓",
      title: "Talabalar ro'yxati",
      desc: "Talabalar profil ma'lumotlari, GitHub, email va telefon raqamlari",
      action: onStudents,
      accent: COLORS.blue,
    },
    {
      key: "lessons",
      icon: "📸",
      title: "Dars jarayonidan lavhalar",
      desc: "Dars jarayonidagi muhim lahzalar, rasmlar va ta'riflar",
      action: onLessons,
      accent: "#8B5CF6",
    },
    {
      key: "marks",
      icon: "📊",
      title: "Studentlar baholari",
      desc: "Barcha talabalarning fanlar bo'yicha baholari",
      action: onMarks,
      accent: COLORS.gold,
    },
  ];

  return (
    <div style={css.page}>
      <Navbar onHome={onBack} dark />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={css.sectionTitle}>{stageId}-bosqich bitiruvchi talabalari</p>
          <h1 style={{ ...css.heroTitle, color: COLORS.white, fontSize: "32px" }}>
            Nima ko'rmoqchisiz?
          </h1>
        </div>
        <div style={{ display: "grid", gap: "1rem" }}>
          {sections.map((s) => (
            <div
              key={s.key}
              onClick={s.action}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
              style={{
                ...css.card,
                ...(hovered === s.key ? css.cardHover : {}),
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                padding: "1.5rem 2rem",
                borderLeft: `4px solid ${s.accent}`,
                borderRadius: "12px",
              }}
            >
              <span style={{ fontSize: "36px", flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: COLORS.white, fontWeight: "bold" }}>
                  {s.title}
                </h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: "14px", fontFamily: "sans-serif" }}>
                  {s.desc}
                </p>
              </div>
              <span style={{ color: s.accent, fontSize: "22px" }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT LIST PAGE ────────────────────────────────────────────────────────
function StudentListPage({ stageId, onBack, onSelect }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/?group=${stageId}`)
      .then((r) => r.json())
      .then((d) => { setStudents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [stageId]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={css.lightPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar onHome={onBack} dark={false} />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
            <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "bold", color: COLORS.navy }}>
              Talabalar ro'yxati
            </h1>
            {!loading && (
              <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: "14px", fontFamily: "sans-serif" }}>
                {students.length} ta talaba
              </p>
            )}
          </div>
          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...css.input, width: "220px" }}
          />
        </div>

        {loading ? (
          <div style={{ ...css.page, background: "transparent", color: COLORS.navy, padding: "3rem", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.blue}`, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Legend */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.25rem", fontFamily: "sans-serif", fontSize: "12px", color: COLORS.muted }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.blue, display: "inline-block" }} />
                Yuqori natija (Blue)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                Oddiy talaba (Yellow)
              </span>
            </div>
            {filtered.map((s) => {
              const isBlue = s.color === "blue";
              return (
                <div
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  onMouseEnter={() => setHovered(s.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...css.lightCard,
                    ...(hovered === s.id ? css.lightCardHover : {}),
                    borderLeft: isBlue ? `4px solid ${COLORS.blue}` : `4px solid #F59E0B`,
                    background: isBlue
                      ? (hovered === s.id ? "#EFF6FF" : "#F5F9FF")
                      : (hovered === s.id ? COLORS.white : COLORS.white),
                  }}
                >
                  {/* Avatar with color ring */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Avatar name={`${s.first_name} ${s.last_name}`} size={46} />
                    <span style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 14, height: 14, borderRadius: "50%",
                      background: isBlue ? COLORS.blue : "#F59E0B",
                      border: "2px solid white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "7px",
                    }}>
                      {isBlue ? "★" : ""}
                    </span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: "bold", fontSize: "15px", color: isBlue ? COLORS.blue : COLORS.navy }}>
                        {s.first_name} {s.last_name}
                      </span>
                      {isBlue && (
                        <span style={{
                          ...css.badge,
                          background: "#EFF6FF",
                          color: COLORS.blue,
                          border: `1px solid ${COLORS.blue}33`,
                          fontSize: "10px",
                          padding: "1px 8px",
                        }}>
                          ★ Top talaba
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "3px", flexWrap: "wrap" }}>
                      {s.email && (
                        <span style={{ color: COLORS.muted, fontSize: "13px", fontFamily: "sans-serif" }}>
                          ✉ {s.email}
                        </span>
                      )}
                      {s.phone_number && (
                        <span style={{ color: COLORS.muted, fontSize: "13px", fontFamily: "sans-serif" }}>
                          📞 {s.phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: isBlue ? COLORS.blue : COLORS.muted, fontSize: "18px" }}>→</span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: COLORS.muted, fontFamily: "sans-serif" }}>
                Talaba topilmadi
              </div>
            )}
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(30,58,95,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: COLORS.white, borderRadius: "16px", padding: "2rem",
        width: "100%", maxWidth: "380px", boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
      }}>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "20px", color: COLORS.navy, fontFamily: "Georgia, serif" }}>
          🔒 Kirish
        </h2>
        <p style={{ margin: "0 0 1.5rem", color: COLORS.muted, fontSize: "14px", fontFamily: "sans-serif" }}>
          Talaba ma'lumotlarini ko'rish uchun parol kiriting
        </p>
        <input
          type="password"
          placeholder="Parol..."
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onConfirm(pw)}
          style={{ ...css.input, marginBottom: "0.75rem" }}
          autoFocus
          disabled={loading}
        />
        {error && (
          <p style={{ color: COLORS.danger, fontSize: "13px", fontFamily: "sans-serif", margin: "0 0 0.75rem" }}>
            ❌ {error}
          </p>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => !loading && onConfirm(pw)}
            disabled={loading}
            style={{
              ...css.btn,
              background: loading ? COLORS.muted : COLORS.gold,
              color: loading ? COLORS.white : COLORS.navy,
              flex: 1, justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.85 : 1,
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Tekshirilmoqda...
              </>
            ) : "Kirish"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ ...css.btn, flex: 1, justifyContent: "center", color: COLORS.navy, border: `1px solid ${COLORS.border}`, background: "transparent", opacity: loading ? 0.5 : 1 }}
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT DETAIL PAGE ──────────────────────────────────────────────────────
function StudentDetailPage({ studentId, onBack }) {
  const [phase, setPhase] = useState("auth"); // auth | loading | detail
  const [pwError, setPwError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [docs, setDocs] = useState([]);
  const [toast, setToast] = useState(null);

  const [downloadState, setDownloadState] = useState({}); // { [docId]: 'idle'|'loading'|'done' }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (pw) => {
    setPwError(null);
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${studentId}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        const err = await res.json();
        setPwError(err.error || "Noto'g'ri parol");
        setLoginLoading(false);
        return;
      }
      const json = await res.json();
      const tok = json.access;
      setToken(tok);
      setPhase("loading");
      const [detRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/${studentId}/detail/`, { headers: authHeader(tok) }),
        fetch(`${API_BASE}/${studentId}/documents/`, { headers: authHeader(tok) }),
      ]);
      const detJson = await detRes.json();
      const docJson = await docRes.json();
      setData(detJson.data);
      setDocs(docJson);
      setPhase("detail");
    } catch {
      setPwError("Server bilan bog'liq muammo");
      setLoginLoading(false);
    }
  };

  const downloadDoc = async (docId, fileName) => {
    setDownloadState((prev) => ({ ...prev, [docId]: "loading" }));
    try {
      const res = await fetch(`${API_BASE}/${studentId}/documents/${docId}/download/`, {
        headers: authHeader(token),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = fileName || "document";
      a.click();
      URL.revokeObjectURL(url);
      setDownloadState((prev) => ({ ...prev, [docId]: "done" }));
      showToast("Fayl yuklab olindi ✓");
      setTimeout(() => setDownloadState((prev) => ({ ...prev, [docId]: "idle" })), 3000);
    } catch {
      setDownloadState((prev) => ({ ...prev, [docId]: "idle" }));
      showToast("Yuklab olishda xatolik", "error");
    }
  };

  if (phase === "loading") {
    return (
      <div style={css.page}>
        <Navbar onHome={onBack} dark />
        <Loader label="Ma'lumot yuklanmoqda..." />
      </div>
    );
  }

  if (phase === "detail" && data) {
    const fullName = `${data.first_name || ""} ${data.last_name || ""} ${data.middle_name || ""}`.trim();
    const isBlue = data.color === "blue";
    return (
      <div style={css.lightPage}>
        <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <Navbar onHome={onBack} dark={false} />
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          {/* Profile header */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap",
            padding: "1.5rem", borderRadius: "14px",
            background: isBlue ? "linear-gradient(135deg, #EFF6FF 0%, #F0F7FF 100%)" : COLORS.surface,
            border: isBlue ? `1.5px solid ${COLORS.blue}33` : `1px solid ${COLORS.border}`,
          }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Avatar src={data.prof_pic} name={fullName} size={80} />
              {isBlue && (
                <span style={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: "50%",
                  background: COLORS.blue, border: "2px solid white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", color: "white",
                }}>★</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "24px", color: isBlue ? COLORS.blue : COLORS.navy }}>{fullName}</h1>
                {isBlue ? (
                  <span style={{ ...css.badge, background: COLORS.blue, color: COLORS.white, fontSize: "11px", padding: "3px 12px" }}>
                    ★ Top talaba
                  </span>
                ) : (
                  <span style={{ ...css.badge, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D44", fontSize: "11px", padding: "3px 12px" }}>
                    Talaba
                  </span>
                )}
              </div>
              {data.faculty && <p style={{ margin: "4px 0 0", color: COLORS.muted, fontFamily: "sans-serif", fontSize: "14px" }}>{data.faculty}</p>}
              {data.university && <p style={{ margin: "4px 0 0", color: COLORS.blue, fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600 }}>{data.university.name}</p>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {data.github_link && (
                  <a href={data.github_link} target="_blank" rel="noreferrer" style={{ ...css.badge, background: COLORS.navy, color: COLORS.white, textDecoration: "none" }}>GitHub</a>
                )}
                {data.linkedin_link && (
                  <a href={data.linkedin_link} target="_blank" rel="noreferrer" style={{ ...css.badge, background: "#0077B5", color: COLORS.white, textDecoration: "none" }}>LinkedIn</a>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
            {[
              { label: "Email", val: data.email },
              { label: "Telefon", val: data.phone_number },
              { label: "Tug'ilgan yil", val: data.birth_year ? `${data.birth_year} (${calcAge(data.birth_year)} yosh)` : null },
            ].map((item) =>
              item.val ? (
                <div key={item.label} style={{ background: COLORS.surface, borderRadius: "10px", padding: "0.85rem 1rem", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: "11px", color: COLORS.muted, fontFamily: "sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                  <div style={{ marginTop: "4px", fontSize: "14px", color: COLORS.navy, fontFamily: "sans-serif" }}>{item.val}</div>
                </div>
              ) : null
            )}
          </div>

          {/* Projects */}
          {data.projects?.length > 0 && (
            <Section title="Loyihalar" icon="🚀">
              {data.projects.map((p) => (
                <div key={p.id} style={{ background: COLORS.surface, borderRadius: "10px", padding: "1rem", border: `1px solid ${COLORS.border}`, marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <strong style={{ fontSize: "14px", color: COLORS.navy }}>{p.title}</strong>
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: COLORS.blue, fontFamily: "sans-serif" }}>Ko'rish →</a>}
                  </div>
                  {p.description && <p style={{ margin: "4px 0 0", fontSize: "13px", color: COLORS.muted, fontFamily: "sans-serif" }}>{p.description}</p>}
                </div>
              ))}
            </Section>
          )}

          {/* Languages */}
          {data.languages?.length > 0 && (
            <Section title="Tillar" icon="🌐">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {data.languages.map((l) => (
                  <span key={l.id} style={{ ...css.badge, background: `${COLORS.blue}15`, color: COLORS.blue, border: `1px solid ${COLORS.blue}30`, padding: "5px 14px" }}>
                    {l.name} · {l.level}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Documents */}
          {docs.length > 0 && (
            <Section title="Hujjatlar" icon="📄">
              {docs.map((d) => {
                const dlState = downloadState[d.id] || "idle";
                const btnStyles = {
                  idle:    { background: COLORS.gold,    color: COLORS.navy,  label: "⬇ Yuklab olish",   cursor: "pointer"     },
                  loading: { background: COLORS.muted,   color: COLORS.white, label: "Yuklanmoqda...",    cursor: "not-allowed" },
                  done:    { background: COLORS.success,  color: COLORS.white, label: "✓ Yuklandi",        cursor: "default"     },
                }[dlState];
                return (
                  <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: COLORS.surface, borderRadius: "8px", border: `1px solid ${COLORS.border}`, marginBottom: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: COLORS.navy, fontFamily: "sans-serif" }}>{d.file_name || d.doc_type}</div>
                      <div style={{ fontSize: "12px", color: COLORS.muted, fontFamily: "sans-serif" }}>{d.doc_type}</div>
                    </div>
                    <button
                      onClick={() => dlState === "idle" && downloadDoc(d.id, d.file_name)}
                      disabled={dlState !== "idle"}
                      style={{
                        ...css.btn,
                        background: btnStyles.background,
                        color: btnStyles.color,
                        fontSize: "12px",
                        padding: "0.4rem 0.9rem",
                        cursor: btnStyles.cursor,
                        transition: "all 0.3s ease",
                        minWidth: "130px",
                        justifyContent: "center",
                        gap: dlState === "loading" ? "6px" : "4px",
                      }}
                    >
                      {dlState === "loading" && (
                        <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                      )}
                      {btnStyles.label}
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

  // Auth phase
  return (
    <div style={css.page}>
      <Navbar onHome={onBack} dark />
      <PasswordModal
        onConfirm={handleLogin}
        onCancel={onBack}
        error={pwError}
        loading={loginLoading}
      />
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: "15px", color: COLORS.navy, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

// ─── LESSON HIGHLIGHTS PAGE ───────────────────────────────────────────────────
function LessonsPage({ stageId, onBack }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/lessons/?group=${stageId}`)
      .then((r) => r.json())
      .then((d) => { setLessons(Array.isArray(d.results) ? d.results : d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [stageId]);

  if (selected) {
    return (
      <div style={css.lightPage}>
        <Navbar onHome={() => setSelected(null)} dark={false} />
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
          <button onClick={() => setSelected(null)} style={{ ...css.btn, background: COLORS.surface, color: COLORS.navy, border: `1px solid ${COLORS.border}`, marginBottom: "1.5rem" }}>
            ← Orqaga
          </button>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "22px", color: COLORS.navy }}>{selected.title}</h1>
          <p style={{ margin: "0 0 1.5rem", color: COLORS.muted, fontFamily: "sans-serif", fontSize: "14px" }}>
            {new Date(selected.created_at).toLocaleDateString("uz-UZ")}
          </p>
          <p style={{ lineHeight: 1.8, color: COLORS.navy, marginBottom: "2rem" }}>{selected.description}</p>
          {selected.images?.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {selected.images.map((img) => (
                <img
                  key={img.id}
                  src={img.image}
                  alt=""
                  style={{ width: "100%", borderRadius: "10px", objectFit: "cover", aspectRatio: "4/3" }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={css.lightPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar onHome={onBack} dark={false} />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
        <h1 style={{ margin: "0 0 2rem", fontSize: "26px", color: COLORS.navy }}>
          📸 Dars jarayonidan lavhalar
        </h1>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.blue}`, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
            {lessons.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelected(l)}
                style={{
                  background: COLORS.white, border: `1px solid ${COLORS.border}`,
                  borderRadius: "12px", overflow: "hidden", cursor: "pointer",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                {l.images?.[0] ? (
                  <img src={l.images[0].image} alt="" style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100px", background: `linear-gradient(135deg, ${COLORS.navyMid}, ${COLORS.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>📸</div>
                )}
                <div style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: "bold", fontSize: "15px", color: COLORS.navy, marginBottom: "4px" }}>{l.title}</div>
                  <div style={{ fontSize: "13px", color: COLORS.muted, fontFamily: "sans-serif", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {l.description}
                  </div>
                  {l.images?.length > 0 && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: COLORS.blue, fontFamily: "sans-serif" }}>
                      🖼 {l.images.length} ta rasm
                    </div>
                  )}
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <p style={{ color: COLORS.muted, fontFamily: "sans-serif", padding: "2rem 0" }}>Lavhalar topilmadi</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MARKS PAGE ───────────────────────────────────────────────────────────────
function MarksPage({ stageId, onBack }) {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [filterSubject, setFilterSubject] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/marks/${stageId}/`)
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : [];
        setMarks(arr); setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stageId]);

  const subjects = [...new Set(marks.map((m) => m.subject).filter(Boolean))];
  const filtered = marks.filter((m) => !filterSubject || m.subject === filterSubject);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "score") return (b.score || 0) - (a.score || 0);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const scoreColor = (s) => {
    if (s >= 85) return COLORS.success;
    if (s >= 70) return COLORS.gold;
    return COLORS.danger;
  };

  return (
    <div style={css.lightPage}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Navbar onHome={onBack} dark={false} />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <p style={{ ...css.sectionTitle, color: COLORS.blue }}>{stageId}-bosqich</p>
        <h1 style={{ margin: "0 0 1.5rem", fontSize: "26px", color: COLORS.navy }}>
          📊 Studentlar baholari
        </h1>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ ...css.input, width: "auto", minWidth: "180px" }}
          >
            <option value="">Barcha fanlar</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ ...css.input, width: "auto", minWidth: "160px" }}
          >
            <option value="created_at">Sanasi bo'yicha</option>
            <option value="score">Baho bo'yicha</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.blue}`, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: COLORS.navy }}>
                  {["Talaba", "Fan", "Baho", "Sana"].map((h) => (
                    <th key={h} style={{ padding: "0.85rem 1rem", textAlign: "left", color: COLORS.white, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, i) => (
                  <tr key={m.id} style={{ background: i % 2 === 0 ? COLORS.white : COLORS.surface }}>
                    <td style={{ padding: "0.75rem 1rem", color: COLORS.navy }}>
                      {m.student
                        ? `${m.student.first_name || ""} ${m.student.last_name || ""}`.trim() || "—"
                        : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: COLORS.muted }}>{m.subject || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{
                        display: "inline-block",
                        background: `${scoreColor(m.score)}18`,
                        color: scoreColor(m.score),
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: "99px",
                        border: `1px solid ${scoreColor(m.score)}44`,
                      }}>
                        {m.score ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: COLORS.muted, whiteSpace: "nowrap" }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString("uz-UZ") : "—"}
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: COLORS.muted }}>
                      Ma'lumot topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {!loading && sorted.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginTop: "1.5rem" }}>
            {[
              { label: "Jami baholar", val: sorted.length },
              { label: "O'rtacha baho", val: (sorted.reduce((a, m) => a + (m.score || 0), 0) / sorted.length).toFixed(1) },
              { label: "Eng yuqori", val: Math.max(...sorted.map((m) => m.score || 0)) },
            ].map((item) => (
              <div key={item.label} style={{ background: COLORS.surface, borderRadius: "10px", padding: "0.85rem 1rem", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: COLORS.muted, fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.label}</div>
                <div style={{ marginTop: "6px", fontSize: "22px", fontWeight: "bold", color: COLORS.navy, fontFamily: "Georgia, serif" }}>{item.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Route state: { page, stageId?, studentId? }
  const [route, setRoute] = useState({ page: "home" });

  const go = useCallback((page, extra = {}) => setRoute({ page, ...extra }), []);

  if (route.page === "home") return <HomePage onSelect={(id) => go("stage", { stageId: id })} />;
  if (route.page === "stage")
    return (
      <StagePage
        stageId={route.stageId}
        onBack={() => go("home")}
        onStudents={() => go("studentList", { stageId: route.stageId })}
        onLessons={() => go("lessons", { stageId: route.stageId })}
        onMarks={() => go("marks", { stageId: route.stageId })}
      />
    );
  if (route.page === "studentList")
    return (
      <StudentListPage
        stageId={route.stageId}
        onBack={() => go("stage", { stageId: route.stageId })}
        onSelect={(id) => go("studentDetail", { stageId: route.stageId, studentId: id })}
      />
    );
  if (route.page === "studentDetail")
    return (
      <StudentDetailPage
        studentId={route.studentId}
        onBack={() => go("studentList", { stageId: route.stageId })}
      />
    );
  if (route.page === "lessons")
    return <LessonsPage stageId={route.stageId} onBack={() => go("stage", { stageId: route.stageId })} />;
  if (route.page === "marks")
    return <MarksPage stageId={route.stageId} onBack={() => go("stage", { stageId: route.stageId })} />;

  return null;
}
