import { ConsultationType } from "../data/appointment";

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  status: string;
  type: ConsultationType;
  notes?: string;
  reason?: string;
}

export interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment?: Appointment | null;
  loading: boolean;
  error: string | null;
}
