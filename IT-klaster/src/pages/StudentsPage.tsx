// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";

// interface Student {
//   id: number;
//   first_name: string;
//   last_name: string;
// }

// export default function StudentsPage() {
//   const [students, setStudents] = useState<Student[]>([]);
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     API.get("/")
//       .then(res => setStudents(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   const handleLogin = async () => {
//     try {
//       const res = await API.post(`/${selectedId}/login/`, { password });
//       localStorage.setItem("token", res.data.access);
//       navigate(`/student/${selectedId}`);
//     } catch {
//       setError("Parol noto‘g‘ri ❌");
//     }
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h1>🎓 Bitiruvchilar</h1>

//       {students.map(student => (
//         <div
//           key={student.id}
//           style={{
//             padding: "10px",
//             margin: "10px 0",
//             background: "#f4f4f4",
//             cursor: "pointer",
//           }}
//           onClick={() => {
//             setSelectedId(student.id);
//             setError("");
//           }}
//         >
//           {student.first_name} {student.last_name}
//         </div>
//       ))}

//       {selectedId && (
//         <div style={{ marginTop: "20px" }}>
//           <input
//             type="password"
//             placeholder="Parol"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//           />
//           <button onClick={handleLogin}>Kirish</button>
//           {error && <p style={{ color: "red" }}>{error}</p>}
//         </div>
//       )}
//     </div>
//   );
// }




// src/pages/StudentsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/")
      .then(res => setStudents(res.data as Student[])) // type assertion fixes Vercel TS build
      .catch(err => console.error(err));
  }, []);

  const handleLogin = async () => {
    try {
      const res = await API.post<{ access: string }>(`/${selectedId}/login/`, { password });
      localStorage.setItem("token", res.data.access);
      navigate(`/student/${selectedId}`);
    } catch {
      setError("Parol noto‘g‘ri ❌");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>🎓 Bitiruvchilar</h1>

      {students.map(student => (
        <div
          key={student.id}
          style={{
            padding: "10px",
            margin: "10px 0",
            background: "#f4f4f4",
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedId(student.id);
            setError("");
          }}
        >
          {student.first_name} {student.last_name}
        </div>
      ))}

      {selectedId && (
        <div style={{ marginTop: "20px" }}>
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Kirish</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}