import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { searchDoctors, setSearchQuery, clearSearchResults } from '../../Redux/doctorSlice/doctorSlice';
import { Search, MapPin, Star, Clock, User } from 'lucide-react';
import type { DoctorProfile } from '../../types/data/doctor';
import { getUploadedFileUrl } from '../../utils/fileUrl';

interface DoctorSearchProps {
  className?: string;
  placeholder?: string;
}

export default function DoctorSearch({ 
  className = '', 
  placeholder = 'Search by doctor name or specialty' 
}: DoctorSearchProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { searchResults, searchLoading, searchQuery } = useAppSelector((state: RootState) => state.doctor);
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim()) {
        dispatch(setSearchQuery(inputValue));
        dispatch(searchDoctors({ query: inputValue }));
      } else {
        dispatch(clearSearchResults());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleDoctorClick = (doctor: DoctorProfile) => {
    setIsOpen(false);
    setInputValue('');
    dispatch(clearSearchResults());
    // Navigate to public doctor detail page with new path
    navigate(`/doctor-detail/${doctor.id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsOpen(false);
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(inputValue)}`);
    }
  };

  const getDoctorInitials = (doctor: DoctorProfile) => {
    return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvailabilityText = (availability: any) => {
    // Simple availability check - you might want to implement more sophisticated logic
    const today = new Date().getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[today];
    
    if (availability[todayKey]?.slots?.length > 0) {
      return 'Available Today';
    }
    return 'Available Tomorrow';
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (inputValue.trim() || searchLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Searching doctors...</p>
            </div>
          ) : searchResults.length === 0 && inputValue.trim() ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No doctors found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => handleDoctorClick(doctor)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  {/* Doctor Avatar */}
                  <div className="flex-shrink-0">
                    {doctor.photo ? (
                      <img
                        src={getUploadedFileUrl(doctor.photo)}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {getDoctorInitials(doctor)}
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h4>
                      {doctor.avgReview && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-600">{doctor.avgReview.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      {doctor.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{doctor.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{getAvailabilityText(doctor.availability)}</span>
                      </div>
                      <span>{doctor.yearsExperience} years exp.</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* View All Results */}
              {searchResults.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate(`/search?q=${encodeURIComponent(inputValue)}`);
                    }}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 text-center font-medium"
                  >
                    View all {searchResults.length} results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
