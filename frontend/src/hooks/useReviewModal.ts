import { useState, useCallback } from 'react';

interface ReviewModalState {
  isOpen: boolean;
  doctorId: number | null;
  doctorName: string;
  appointmentId: number | null;
}

export const useReviewModal = () => {
  const [modalState, setModalState] = useState<ReviewModalState>({
    isOpen: false,
    doctorId: null,
    doctorName: '',
    appointmentId: null
  });

  const openReviewModal = useCallback((
    doctorId: number,
    doctorName: string,
    appointmentId?: number
  ) => {
    setModalState({
      isOpen: true,
      doctorId,
      doctorName,
      appointmentId: appointmentId || null
    });
  }, []);

  const closeReviewModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    // Reserved for future: refresh reviews list, show success toast, update appointment status
  }, []);

  return {
    modalState,
    openReviewModal,
    closeReviewModal,
    handleReviewSubmitted
  };
};
