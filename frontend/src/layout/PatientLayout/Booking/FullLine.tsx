// No React default import required

interface FullLineProps {
  currentStep: number;
}

const FullLine: React.FC<FullLineProps> = ({ currentStep }) => {
  const isStepActive = (step: number) => step <= currentStep;
  const isStepCompleted = (step: number) => step < currentStep;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      {/* Step 1 - Date & Time */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          backgroundColor: isStepActive(1) ? '#008CBA' : '#E0E0E0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: isStepActive(1) ? '#FFFFFF' : '#6C757D',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isStepCompleted(1) ? '✓' : '1'}
        </div>
        <span style={{ 
          color: isStepActive(1) ? '#008CBA' : '#6C757D', 
          fontWeight: 'bold', 
          marginLeft: '8px',
          fontSize: '14px'
        }}>
          Date & Time
        </span>
      </div>

      {/* Connecting Line */}
      <div style={{ 
        width: '40px', 
        height: '2px', 
        backgroundColor: isStepActive(2) ? '#008CBA' : '#D3D3D3' 
      }}></div>

      {/* Step 2 - Consultation Type */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          backgroundColor: isStepActive(2) ? '#008CBA' : '#E0E0E0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: isStepActive(2) ? '#FFFFFF' : '#6C757D',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isStepCompleted(2) ? '✓' : '2'}
        </div>
        <span style={{ 
          color: isStepActive(2) ? '#008CBA' : '#6C757D', 
          fontWeight: 'bold', 
          marginLeft: '8px',
          fontSize: '14px'
        }}>
          Consultation Type
        </span>
      </div>

      {/* Connecting Line */}
      <div style={{ 
        width: '40px', 
        height: '2px', 
        backgroundColor: isStepActive(3) ? '#008CBA' : '#D3D3D3' 
      }}></div>

      {/* Step 3 - Patient Info */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          backgroundColor: isStepActive(3) ? '#008CBA' : '#E0E0E0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: isStepActive(3) ? '#FFFFFF' : '#6C757D',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isStepCompleted(3) ? '✓' : '3'}
        </div>
        <span style={{ 
          color: isStepActive(3) ? '#008CBA' : '#6C757D', 
          fontWeight: 'bold', 
          marginLeft: '8px',
          fontSize: '14px'
        }}>
          Patient Info
        </span>
      </div>

      {/* Connecting Line */}
      <div style={{ 
        width: '40px', 
        height: '2px', 
        backgroundColor: isStepActive(4) ? '#008CBA' : '#D3D3D3' 
      }}></div>

      {/* Step 4 - Confirmation */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          width: '30px', 
          height: '30px', 
          borderRadius: '50%', 
          backgroundColor: isStepActive(4) ? '#008CBA' : '#E0E0E0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: isStepActive(4) ? '#FFFFFF' : '#6C757D',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {isStepCompleted(4) ? '✓' : '4'}
        </div>
        <span style={{ 
          color: isStepActive(4) ? '#008CBA' : '#6C757D', 
          fontWeight: 'bold', 
          marginLeft: '8px',
          fontSize: '14px'
        }}>
          Confirmation
        </span>
      </div>
    </div>
  );
}

export default FullLine;