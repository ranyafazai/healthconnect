import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { getCurrentPosition, reverseGeocode, extractCity, extractState, extractZip, buildStreetAddress } from '../../lib/geolocation';
import { updatePatientProfile } from '../../Redux/patientSlice/patientSlice';
import { checkAuthStatus } from '../../Redux/authSlice/authSlice';
import { updateDoctorProfileThunk } from './thunks';

/**
 * Background component that, after authentication, asks for browser GPS permission
 * and updates the user's city/state/zip and address on their profile.
 *
 * It runs at most once per session to avoid spamming prompts.
 */
export default function LocationUpdater() {
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const hasAttemptedRef = useRef(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const profileId = user?.role === 'PATIENT' ? user.patientProfile?.id : user?.role === 'DOCTOR' ? user.doctorProfile?.id : undefined;
    if (!isAuthenticated || !user || !profileId || hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    (async () => {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const geo = await reverseGeocode(latitude, longitude);
        if (!geo) return;

        const address = geo.address;
        const city = extractCity(address);
        const state = extractState(address);
        const zipCode = extractZip(address);
        const street = buildStreetAddress(address);

        // Only proceed if we got at least a city/state
        if (!city && !state && !zipCode && !street) return;

        if (user.role === 'PATIENT' && user.patientProfile?.id) {
          await dispatch(updatePatientProfile({ id: user.patientProfile.id, data: {
            address: street,
            city,
            state,
            zipCode,
          }}));
          // Refresh auth user snapshot with latest profile
          dispatch(checkAuthStatus());
        } else if (user.role === 'DOCTOR' && user.doctorProfile?.id) {
          await dispatch(updateDoctorProfileThunk({ id: user.doctorProfile.id, data: {
            officeAddress: street,
            city,
            state,
            zipCode,
          }}));
          // Refresh auth user snapshot with latest profile
          dispatch(checkAuthStatus());
        }
      } catch {
        // Silently ignore permission denials or failures
      }
    })();
  }, [isAuthenticated, user, dispatch]);

  return null;
}


