import type { Timestamp } from "firebase/firestore";

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  age: number | null;
  checkedIn: boolean;
  checkedInAt: Timestamp | null;
  createdAt: Timestamp | null;
}

export const ATTENDEES_COLLECTION = "attendees";
