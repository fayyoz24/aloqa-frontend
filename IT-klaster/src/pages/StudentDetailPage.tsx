
import { useParams, useNavigate } from "react-router-dom";
import { useStudentDetail } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import type { Project, Document, Language } from "../types/index";

export default function StudentDetailPage() {
  const { pk } = useParams<{ pk: string }>();
  const id = Number(pk);
  const navigate = useNavigate();
  const { logout, isLoggedIn, studentId } = useAuth();

  const { data: student, loading, error } = useStudentDetail(id);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingCert, setDownloadingCert] = useState<string | null>(null);

  if (!isLoggedIn || studentId !== id) {
    return (
      <div className="page">
        <div className="status-msg error">
          Bu sahifaga kirish uchun avval login qiling.
          <button onClick={() => navigate("/")} className="btn-link">← Orqaga</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="status-msg">Yuklanmoqda...</div>;
  if (error) return <div className="status-msg error">Xato: {error}</div>;
  if (!student) return null;

  const baseUrl = 'https://aloqabankstudents.pythonanywhere.com';
  const token = localStorage.getItem("access_token");
  const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

  const downloadBlob = async (res: Response, fileName: string) => {
    const blob = await res.blob();
    const contentType = res.headers.get('content-type');
    let ext = 'pdf';
    if (contentType?.includes('image/jpeg')) ext = 'jpg';
    else if (contentType?.includes('image/png')) ext = 'png';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileName}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ✅ Uses the proper backend download endpoint
  const handleDownload = async (docId: number, fileName: string) => {
    setDownloadingId(docId);
    try {
      const res = await fetch(`${baseUrl}/api/students/${id}/documents/${docId}/download/`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Server javobi: ${res.status}`);
      await downloadBlob(res, fileName);
    } catch (e: any) {
      console.error('Download error:', e);
      alert(`Yuklashda xato: ${e.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // ✅ Uses raw file URL from serializer (no dedicated endpoint in backend)
  const handleCertDownload = async (url: string, langName: string, langId: number) => {
    setDownloadingCert(`${langId}`);
    try {
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      const res = await fetch(fullUrl, {headers: authHeaders });
      if (!res.ok) throw new Error(`Server javobi: ${res.status}`);
      await downloadBlob(res, `${langName}_sertifikat`);
    } catch (e: any) {
      console.error('Certificate download error:', e);
      alert(`Sertifikatni yuklashda xato: ${e.message}`);
    } finally {
      setDownloadingCert(null);
    }
  };

  const projects = Array.isArray(student.projects) ? student.projects : [];
  const documents = Array.isArray(student.documents) ? student.documents : [];
  const languages = Array.isArray(student.languages) ? student.languages : [];

  return (
    <div className="page">
      <header className="page-header">
        <button onClick={() => navigate("/")} className="btn-back">← Orqaga</button>
        <button onClick={logout} className="btn-logout">Chiqish</button>
      </header>

      {/* Profile */}
      <section className="profile-section">
        {student.prof_pic ? (
          <img
            src={`${baseUrl}${student.prof_pic}`}
            alt={`${student.first_name} ${student.last_name}`}
            className="avatar large img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="avatar large">
            {student.first_name?.[0] || ''}{student.last_name?.[0] || ''}
          </div>
        )}
        <div>
          <h1>{student.last_name} {student.first_name} {student.middle_name}</h1>
          <p>{student.email} · {student.phone_number}</p>
          <div className="links">
            {student.github_link && (
              <a href={student.github_link} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {student.linkedin_link && (
              <a href={student.linkedin_link} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects.length > 0 && (
        <section className="detail-section">
          <h2>Loyihalar</h2>
          <div className="projects-grid">
            {projects.map((project: Project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer" className="project-link">
                    Loyihani ko'rish →
                  </a>
                )}
                <small className="project-date">
                  {new Date(project.created_at).toLocaleDateString('uz-UZ')}
                </small>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="detail-section">
          <h2>Tillar</h2>
          <div className="lang-grid">
            {languages.map((lang: Language) => (
              <div key={lang.id} className="lang-card">
                <strong>{lang.name}</strong>
                <span className="badge">{lang.level}</span>
                {lang.certificate && (
                  <button
                    className="btn-cert"
                    onClick={() => handleCertDownload(lang.certificate, lang.name, lang.id)}
                    disabled={downloadingCert === `${lang.id}`}
                  >
                    {downloadingCert === `${lang.id}` ? "⏳" : "⬇ Sertifikat"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      <section className="detail-section">
        <h2>Hujjatlar</h2>
        {documents.length > 0 ? (
          <ul className="doc-list">
            {documents.map((doc: Document) => (
              <li key={doc.id} className="doc-item">
                <div>
                  <span className="doc-name">{doc.name}</span>
                  <span className="doc-type">{doc.doc_type}</span>
                </div>
                {/* ✅ Now passes doc.id instead of doc.file */}
                <button
                  className="btn-download"
                  disabled={downloadingId === doc.id}
                  onClick={() => handleDownload(doc.id, doc.name)}
                >
                  {downloadingId === doc.id ? "⏳" : "⬇ Yuklab olish"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Hujjat mavjud emas</p>
        )}
      </section>
    </div>
  );
}