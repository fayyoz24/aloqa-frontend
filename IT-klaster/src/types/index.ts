export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone_number: string;
}
export interface Project {
  id: number;
  title: string;
  description: string;
  link?: string | null;
  created_at: string;
}
export interface Document {
  id: number;
  name: string;
  doc_type: string;
  file: string;
  uploaded_at: string;
}

export interface Language {
  id: number;
  name: string;
  level: string;
  certificate: string;
}

export interface StudentDetail extends Student {
  prof_pic: string | null;
  github_link: string;
  linkedin_link: string;
  projects: Project[];
  documents: Document[];
  languages: Language[];
}

export interface DocumentListItem {
  id: number;
  doc_type: string;
  file_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}