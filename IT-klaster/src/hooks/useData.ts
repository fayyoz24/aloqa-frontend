import { useState, useEffect } from "react";
import { fetchStudents, fetchStudentDetail, fetchDocuments } from "../api/students";
import type { Student, StudentDetail, DocumentListItem } from "../types";

// Generic async hook
function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fn()
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

export function useStudents() {
  return useAsync<Student[]>(fetchStudents, []);
}

export function useStudentDetail(pk: number) {
  return useAsync<StudentDetail>(() => fetchStudentDetail(pk), [pk]);
}

export function useDocuments(pk: number) {
  return useAsync<DocumentListItem[]>(() => fetchDocuments(pk), [pk]);
}