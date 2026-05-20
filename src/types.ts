export type Role = 'Admin' | 'Manager' | 'Crew';
export type Permission = 'Dashboard' | 'Schedule' | 'Inventory' | 'Cancel' | 'Fraud' | 'History' | 'Admin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  locationId: string;
  permissions?: Permission[];
}

export interface LocationItem {
  id: string;
  name: string;
  lowInventoryThreshold?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  locationId: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'Shift' | 'Daily Chore' | 'Extra Chore';
  assignedTo: string;
  locationId: string;
  done: boolean;
}

export interface NotificationItem {
  id: string;
  relatedId?: string;
  message: string;
  type: 'Shift' | 'Schedule' | 'Fraud' | 'General';
  timestamp: string;
  locationId: string;
  read?: boolean;
}

export interface CancelRequest {
  id: string;
  customerName: string;
  licensePlate: string;
  reason: string;
  done: boolean;
  createdAt: string;
  locationId: string;
}

export interface FraudCheck {
  id: string;
  customerName: string;
  licensePlate: string;
  location: string;
  note: string;
  membership?: string;
  active?: boolean;
  done: boolean;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  label: string;
  details: string;
  timestamp: string;
  locationId: string;
}

export interface AppData {
  users: User[];
  locations: LocationItem[];
  inventory: InventoryItem[];
  schedules: ScheduleItem[];
  cancelRequests: CancelRequest[];
  fraudChecks: FraudCheck[];
  history: HistoryEntry[];
  notifications: NotificationItem[];
}
