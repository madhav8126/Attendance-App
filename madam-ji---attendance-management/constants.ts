
import { Role, User, Student, AttendanceRecord } from './types';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Chief Administrator',
    role: Role.ADMIN
  },
  {
    id: 'teacher-1',
    username: 'priya_m',
    password: 'password123',
    name: 'Priya Mahajan',
    role: Role.TEACHER,
    assignedClasses: ['Class 10-A', 'Class 11-B']
  }
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', rollNo: '101', name: 'Aarav Sharma', className: 'Class 10-A' },
  { id: 's2', rollNo: '102', name: 'Ishita Kapoor', className: 'Class 10-A' },
  { id: 's3', rollNo: '103', name: 'Kabir Singh', className: 'Class 10-A' },
  { id: 's4', rollNo: '201', name: 'Sanya Malhotra', className: 'Class 11-B' }
];

export const CLASSES = [
  'Class 9-A', 'Class 9-B',
  'Class 10-A', 'Class 10-B',
  'Class 11-A', 'Class 11-B',
  'Class 12-A', 'Class 12-B'
];
