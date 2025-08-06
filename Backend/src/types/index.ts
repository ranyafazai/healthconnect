import { User, Doctor, Patient, Appointment, ChatMessage, Rating, Availability } from '@prisma/client'

// Extend Prisma types with any additional fields or methods you need
export interface IUser extends User {
  doctor?: Doctor | null
  patient?: Patient | null
}

export interface IDoctor extends Doctor {
  user: User
  availability: Availability[]
  appointments: Appointment[]
  ratings: Rating[]
}

export interface IPatient extends Patient {
  user: User
  appointments: Appointment[]
}

export interface IAppointment extends Appointment {
  patient: Patient & { user: User }
  doctor: Doctor & { user: User }
  chatMessages: ChatMessage[]
}

// Add other interfaces as needed