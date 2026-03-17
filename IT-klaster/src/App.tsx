import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import StudentListPage from "./pages/StudentListPage";
import StudentDetailPage from "./pages/StudentDetailPage";
// import "./styles.css";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<StudentListPage />} />
        <Route path="/students/:pk" element={<StudentDetailPage />} />
      </Routes>
    </AuthProvider>
  );
}