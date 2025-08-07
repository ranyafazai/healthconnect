export interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  role: 'DOCTOR' | 'PATIENT' | null;
  loading: boolean;
  error: string | null;
}
