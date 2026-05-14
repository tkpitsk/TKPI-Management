export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  expiryDate: string;
  repeat: 'none' | 'hourly' | 'daily' | '3days' | 'weekly' | '15days' | 'monthly' | '6monthly' | 'yearly' | 'custom';
  customDays?: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}