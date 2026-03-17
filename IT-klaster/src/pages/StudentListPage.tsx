import { useState } from "react";
import { useStudents } from "../hooks/useData";
import LoginModal from "../components/LoginModal";
import type { Student } from "../types";
import { useAuth } from "../context/AuthContext";
import './styles.css'
export default function StudentListPage() {
  const { data: students, loading, error } = useStudents();
  const { isLoggedIn, studentId } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleCardClick = (student: Student) => {
    if (isLoggedIn && studentId === student.id) {
      window.location.href = `/students/${student.id}`;
    } else {
      setSelectedStudent(student);
    }
  };

  if (loading) return <div className="status-msg">Yuklanmoqda...</div>;
  if (error) return <div className="status-msg error">Xato: {error}</div>;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <img 
              src='https://cdn.brandfetch.io/domain/aloqabank.uz/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed' // IT Klaster logo yo'li
              alt="IT Klaster"  
              className="navbar-logo"
            />
          </div>
          
          <div className="navbar-center">
            <div className="navbar-title">
              Aloqabank tomonidan tashkil etilgan <span>“Dasturchi boʻl”</span> Granti stipendiantlari
            </div>
          </div>
          
          <div className="navbar-right">
            <img 
              src='https://bilgi.uz/upload/resize_cache/iblock/353/5fcs0c8povkyb8vdhe887hrxpii4tb9d/168_320_1/1x1.png' 
              alt="Aloqabank" 
              className="navbar-logo"
            />
          </div>
        </div>
      </nav>
      <div className="navs">
         <div className="logos">
         <div>
             <img 
              src='https://cdn.brandfetch.io/domain/aloqabank.uz/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed' // IT Klaster logo yo'li
              alt="IT Klaster"  
              className="navbar-logos"
            />
         </div>
           <p>AloqaBank IT Klaster </p>
           <div>
                <img 
              src='https://bilgi.uz/upload/resize_cache/iblock/353/5fcs0c8povkyb8vdhe887hrxpii4tb9d/168_320_1/1x1.png' 
              alt="Aloqabank" 
              className="navbar-logos"
            />
           </div>
         </div>
      </div>

       <div className="navbar-cent">
            <div className="navbar-titles">
              Aloqabank tomonidan tashkil etilgan <br /> <span>“Dasturchi boʻl”</span> Granti stipendiantlari
            </div>
          </div>  
               <div className="page">
        <header className="page-header">
          <h1>Talabalar</h1>
          <span className="count">{students?.length ?? 0} ta</span>
        </header>

        <div className="student-grid">
          {students?.map((s) => (
            <div
              key={s.id}
              className={`student-card ${isLoggedIn && studentId === s.id ? "active" : ""}`}
              onClick={() => handleCardClick(s)}
            >
              <div className="avatar">{s.first_name[0]}{s.last_name[0]}</div>
              <div className="info">
                <h3>{s.last_name} {s.first_name} {s.middle_name}</h3>
                <p>{s.email}</p>
                <p>{s.phone_number}</p>
              </div>
              <div className="arrow">→</div>
            </div>
          ))}
        </div>

        {selectedStudent && (
          <LoginModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </>
  );
}