export interface DashboardState {
  upcomingAppointments: number;
  completedAppointments: number;
  unreadMessages: number;
  reviewsCount?: number;
  loading: boolean;
}
