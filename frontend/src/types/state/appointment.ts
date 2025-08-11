import { ConsultationType } from "../data/appointment";
import type { DoctorProfile } from "../data/doctor";
import type { PatientProfile } from "../data/patient";

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  status: string;
  type: ConsultationType;
  notes?: string;
  reason?: string;
  // Enriched data from backend includes
  patient?: PatientProfile & {
    user: {
      id: number;
      email: string;
    };
  };
  doctor?: DoctorProfile & {
    user: {
      id: number;
      email: string;
    };
  };
  createdAt?: string;
}

export interface AppointmentState {
  appointments: Appointment[];
  selectedAppointment?: Appointment | null;
  loading: boolean;
  error: string | null;
}
