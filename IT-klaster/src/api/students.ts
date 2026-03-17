import type { AuthTokens, Student, StudentDetail, DocumentListItem } from "../types";

const BASE_URL = "https://aloqabankstudents.pythonanywhere.com/api/students"; // <-- o'zgartir

// Token localStorage da saqlanadi
const getAccessToken = (): string | null => localStorage.getItem("access_token");

const authHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
});

// ─── Students ──────────────────────────────────────────────

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${BASE_URL}/`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────

export async function loginStudent(pk: number, password: string): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/${pk}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }

  return res.json();
}

// ─── Student Detail ────────────────────────────────────────

export async function fetchStudentDetail(pk: number): Promise<StudentDetail> {
  const res = await fetch(`${BASE_URL}/${pk}/detail/`, {
    headers: authHeaders(),
  });

  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to fetch student detail");

  const json = await res.json();
  return json.data;
}

// ─── Documents ─────────────────────────────────────────────

export async function fetchDocuments(pk: number): Promise<DocumentListItem[]> {
  const res = await fetch(`${BASE_URL}/${pk}/documents/`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export function getDocumentDownloadUrl(pk: number, docId: number): string {
  return `${BASE_URL}/${pk}/documents/${docId}/download/`;
}

export async function downloadDocument(pk: number, docId: number, fileName: string): Promise<void> {
  const res = await fetch(getDocumentDownloadUrl(pk, docId), {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}