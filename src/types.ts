export interface ClassItem {
  id: string;
  name: string;
  grade: string;
  created_at?: string;
  student_count?: number;
}

export interface StudentItem {
  id: string;
  nisn: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  class_id: string;
  class_name?: string;
  has_voted: boolean;
  voted_at?: string | null;
  created_at?: string;
}

export interface CandidateItem {
  id: string;
  order_number: number;
  chairperson_name: string;
  vice_chairperson_name: string;
  photo_url: string;
  slogan: string;
  vision: string;
  mission: string;
  created_at?: string;
}

export interface AppSettings {
  id: number;
  school_name: string;
  school_logo: string;
  election_period: string;
  is_active: boolean;
  welcome_message: string;
  updated_at?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  password_hash: string;
}

export interface VoteTally {
  candidate_id: string;
  order_number: number;
  chairperson_name: string;
  vice_chairperson_name: string;
  photo_url: string;
  votes_count: number;
  percentage: number;
}

export interface VotingStats {
  totalStudents: number;
  totalClasses: number;
  totalCandidates: number;
  votedStudents: number;
  unvotedStudents: number;
  participationRate: number;
}
