/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CoupleUser = string;

export interface WorkShift {
  id: string;
  user: CoupleUser;
  date: string; // YYYY-MM-DD
  type: 'mañana' | 'tarde' | 'noche' | 'partido' | 'vacaciones' | 'festivos' | 'libranzas' | string;
  note?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  user: CoupleUser | 'compartido';
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  reminderMinutes?: number; // e.g., 15, 30, 60, 1440 (1 day), 0 for at time of event, -1 for none
}

export interface ShoppingItem {
  id: string;
  name: string;
  section: string;
  purchased: boolean;
  quantity: string;
  notes: string;
  frequencyCount: number;
  addedBy: CoupleUser;
  updatedAt?: number;
}

export interface Expense {
  id: string;
  type: 'gasto' | 'ingreso';
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category: 'Alimentación' | 'Transporte' | 'Vivienda' | 'Ocio' | 'Salud' | 'Mascotas' | 'Facturas' | 'Suscripciones' | 'Otras' | string;
  paidBy: CoupleUser;
  ticketPhoto?: string; // base64 or URL
}

export interface Reminder {
  id: string;
  description: string;
  user: CoupleUser | 'compartido';
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  repetition: 'diaria' | 'semanal' | 'mensual' | 'personalizada' | 'ninguna';
  completed: boolean;
  completedBy?: CoupleUser | null;
}

export interface AppData {
  shifts: WorkShift[];
  events: CalendarEvent[];
  shoppingList: ShoppingItem[];
  shoppingSections: string[];
  expenses: Expense[];
  reminders: Reminder[];
  userNames?: string[];
}
