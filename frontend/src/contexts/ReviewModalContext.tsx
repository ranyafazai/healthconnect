import React, { createContext, useContext } from 'react';
import { useReviewModal } from '../hooks/useReviewModal';

interface ReviewModalContextType {
  openReviewModal: (doctorId: number, doctorName: string, appointmentId?: number) => void;
  closeReviewModal: () => void;
  modalState: {
    isOpen: boolean;
    doctorId: number | null;
    doctorName: string;
    appointmentId: number | null;
  };
}

const ReviewModalContext = createContext<ReviewModalContextType | undefined>(undefined);

interface ReviewModalProviderProps {
  children: React.ReactNode;
}

export const ReviewModalProvider: React.FC<ReviewModalProviderProps> = ({ children }) => {
  const { modalState, openReviewModal, closeReviewModal } = useReviewModal();

  return (
    <ReviewModalContext.Provider
      value={{
        openReviewModal,
        closeReviewModal,
        modalState
      }}
    >
      {children}
    </ReviewModalContext.Provider>
  );
};

export const useReviewModalContext = () => {
  const context = useContext(ReviewModalContext);
  if (context === undefined) {
    throw new Error('useReviewModalContext must be used within a ReviewModalProvider');
  }
  return context;
};
