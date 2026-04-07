export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  expiryDate: string;
  createdAt?: string;
  updatedAt?: string;
}