import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { Student } from "../types";

interface Props {
  student: Student;
  onClose: () => void;
}

export default function LoginModal({ student, onClose }: Props) {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      await login(student.id, password);
      window.location.href = `/students/${student.id}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-avatar">{student.first_name[0]}{student.last_name[0]}</div>
        <h2>{student.last_name} {student.first_name}</h2>
        <p className="modal-sub">{student.email}</p>

        <div className="form-group">
          <label>Parol</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Parolni kiriting"
            autoFocus
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !password}
        >
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>
      </div>
    </div>
  );
}
