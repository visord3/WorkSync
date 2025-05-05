// services/shifts/shifts.model.ts
import { Timestamp } from 'firebase/firestore';

// Define shift status enum
export enum ShiftStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Define shift interface
export interface Shift {
  id?: string;
  employeeId: string;
  start: Timestamp;
  end: Timestamp;
  status: ShiftStatus;
  department?: string;
  notes?: string;
  clockIn?: Timestamp;
  clockOut?: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
}

// Define shift summary (for calendar and list views)
export interface ShiftSummary {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  employeeName: string;
  startTime: string; // Formatted time string
  endTime: string; // Formatted time string
  status: ShiftStatus;
  department?: string;
}