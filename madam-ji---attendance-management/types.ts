
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  assignedClasses?: string[];
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  className: string;
  email?: string;
  parentContact?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  className: string;
  date: string; // ISO format
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  markedBy: string; // User ID
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
}

export interface AppState {
  users: User[];
  students: Student[];
  attendance: AttendanceRecord[];
  logs: ActivityLog[];
  notifications: string[];
}
