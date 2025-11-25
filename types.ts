export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  INSTITUTION_ADMIN = 'INSTITUTION_ADMIN',
  TEACHER = 'TEACHER',
  GUEST = 'GUEST'
}

export interface User {
  email: string;
  name: string;
  picture: string;
  role: UserRole;
  tenantId?: string; // ID of the institution they belong to
}

export interface Tenant {
  tenantId: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  adminEmail: string;
  createdAt: string;
  isActive: boolean;
}

export interface Class {
  classId: string;
  name: string;
  schedule: string;
}

export interface Student {
  studentId: string;
  name: string;
  rollNo: string;
  classId: string;
  parentContact: string;
}

export interface Teacher {
  teacherId: string;
  name: string;
  email: string;
  classes: string[]; // Array of Class IDs
}

export enum AttendanceStatus {
  PRESENT = 'P',
  ABSENT = 'A',
  LATE = 'L',
  EXCUSED = 'E'
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNo: string;
  status: AttendanceStatus;
  note: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AnalyticsData {
  totalStudents: number;
  totalClasses: number;
  averageAttendance: number;
  dates: string[];
  attendanceRates: number[];
}