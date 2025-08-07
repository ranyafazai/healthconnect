export interface TimeSlot {
  start: string;  // Format: "HH:mm"
  end: string;    // Format: "HH:mm"
}

export interface DaySchedule {
  slots: TimeSlot[];
  bufferTime: number;        // in minutes
  consultingDuration: number; // in minutes
}

export type WeeklySchedule = {
  [key in DayOfWeek]: DaySchedule;
};

export const DayOfWeek = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY'
} as const;

export type DayOfWeek = typeof DayOfWeek[keyof typeof DayOfWeek];
