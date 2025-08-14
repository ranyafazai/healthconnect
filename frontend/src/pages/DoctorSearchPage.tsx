import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import type { RootState } from '../Redux/store';
import { searchDoctors, setFilters, setSortBy, clearFilters } from '../Redux/doctorSlice/doctorSlice';
import { Navbar } from '../components/NavBar/NavBar';
import DoctorSearch from '../components/ui/DoctorSearch';
import { 
  Calendar, 
  MapPin, 
  Star, 
  Clock, 
  Sparkles, 
  ChevronDown
} from 'lucide-react';
import type { DoctorProfile } from '../types/data/doctor';
import { getUploadedFileUrl } from '../utils/fileUrl';

export default function DoctorSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { searchResults, searchLoading, filters, sortBy } = useAppSelector((state: RootState) => state.doctor);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  
  // const [showFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const query = searchParams.get('q') || '';

  // Specialty options
  const specialties = [
    'All Specialties',
    'Cardiology',
    'Family Medicine',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Oncology',
    'Psychiatry',
    'Orthopedics',
    'Endocrinology',
    'Gastroenterology',
    'Ophthalmology',
    'Urology',
    'Gynecology',
    'Pulmonology',
    'Rheumatology'
  ];

  // City options
  const cities = [
    'All Cities',
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose'
  ];

  // Rating options
  const ratingOptions = [
    'Any Rating',
    '4.5+ Stars',
    '4.0+ Stars',
    '3.5+ Stars',
    '3.0+ Stars'
  ];

  // Availability options
  const availabilityOptions = [
    'Any Availability',
    'Available Now',
    'Available Today',
    'Available Tomorrow',
    'Available This Week',
    'Available Next Week'
  ];

  // Sort options
  const sortOptions = [
    'Name A-Z',
    'Name Z-A',
    'Rating High to Low',
    'Rating Low to High',
    'Experience High to Low',
    'Experience Low to High',
    'Price High to Low',
    'Price Low to High'
  ];

  // Initialize search on component mount
  useEffect(() => {
    const searchParams = { 
      query,
      specialty: filters.specialty,
      city: filters.city,
      minRating: filters.minRating,
      availability: filters.availability,
      sortBy
    };
    

    
    dispatch(searchDoctors(searchParams));
  }, [query, filters, sortBy, dispatch]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleSortChange = (value: string) => {
    dispatch(setSortBy(value));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setLocalFilters(filters);
  };

  const handleDoctorClick = (doctor: DoctorProfile) => {
    navigate(`/doctor-detail/${doctor.id}`);
  };

  const getDoctorInitials = (doctor: DoctorProfile) => {
    return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
  };

  // Helpers to normalize availability shapes (array of "HH:MM-HH:MM", { slots: [{start,end}] }, or { available, hours })
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return -1;
    return h * 60 + m;
  };
  const normalizeDaySlots = (availability: any, dayKey: string): Array<{ startMin: number; endMin: number }> => {
    if (!availability) return [];
    const dayVal = availability[dayKey];
    if (!dayVal) return [];
    const slots: Array<{ startMin: number; endMin: number }> = [];
    // Case 1: array of strings like "08:00-12:00"
    if (Array.isArray(dayVal)) {
      dayVal.forEach((range) => {
        if (typeof range === 'string' && range.includes('-')) {
          const [start, end] = range.split('-');
          const startMin = toMinutes(start);
          const endMin = toMinutes(end);
          if (startMin >= 0 && endMin >= 0 && endMin > startMin) slots.push({ startMin, endMin });
        }
      });
      return slots;
    }
    // Case 2: object with slots: [{ start, end }]
    if (typeof dayVal === 'object' && dayVal?.slots && Array.isArray(dayVal.slots)) {
      dayVal.slots.forEach((slot: any) => {
        if (slot?.start && slot?.end) {
          const startMin = toMinutes(String(slot.start));
          const endMin = toMinutes(String(slot.end));
          if (startMin >= 0 && endMin >= 0 && endMin > startMin) slots.push({ startMin, endMin });
        }
      });
      return slots;
    }
    // Case 3: object with available/hours
    if (typeof dayVal === 'object' && dayVal?.available && Array.isArray(dayVal.hours)) {
      dayVal.hours.forEach((range: any) => {
        if (typeof range === 'string' && range.includes('-')) {
          const [start, end] = range.split('-');
          const startMin = toMinutes(start);
          const endMin = toMinutes(end);
          if (startMin >= 0 && endMin >= 0 && endMin > startMin) slots.push({ startMin, endMin });
        }
      });
      return slots;
    }
    return [];
  };

  const getAvailabilityText = (availability: any) => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayKey = dayKeys[currentDay];

    const todaySlots = normalizeDaySlots(availability, todayKey);
    if (todaySlots.length > 0) {
      const isNow = todaySlots.some((s) => currentTime >= s.startMin && currentTime <= s.endMin);
      if (isNow) return 'Available Now';
      const hasLater = todaySlots.some((s) => currentTime < s.startMin);
      if (hasLater) return 'Available Later Today';
      return 'Closed for Today';
    }

    const tomorrowKey = dayKeys[(currentDay + 1) % 7];
    if (normalizeDaySlots(availability, tomorrowKey).length > 0) return 'Available Tomorrow';

    for (let i = 2; i < 7; i++) {
      const key = dayKeys[(currentDay + i) % 7];
      if (normalizeDaySlots(availability, key).length > 0) {
        return `Available ${key.charAt(0).toUpperCase() + key.slice(1)}`;
      }
    }
    return 'No Availability';
  };

  const getConsultationPrice = (doctor: DoctorProfile) => {
    // Mock pricing based on specialization and experience
    const basePrice = 120;
    const experienceMultiplier = Math.min(doctor.yearsExperience / 10, 1.5);
    const specializationMultiplier = doctor.specialization.toLowerCase().includes('surgeon') ? 1.8 : 1.2;
    
    return Math.round(basePrice * experienceMultiplier * specializationMultiplier);
  };

  // Get filtered results based on availability
  const getFilteredResults = () => {
    if (filters.availability === 'Any Availability') {
      return searchResults;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayKey = dayKeys[currentDay];
    
    return searchResults.filter(doctor => {
      if (!doctor.availability) return false;
      const slotsToday = normalizeDaySlots(doctor.availability, todayKey);
      if (filters.availability === 'Available Now') {
        if (slotsToday.length === 0) return false;
        return slotsToday.some((s) => currentTime >= s.startMin && currentTime <= s.endMin);
      }
      if (filters.availability === 'Available Today') {
        return slotsToday.length > 0;
      }
      if (filters.availability === 'Available Tomorrow') {
        const tomorrowKey = dayKeys[(currentDay + 1) % 7];
        return normalizeDaySlots(doctor.availability, tomorrowKey).length > 0;
      }
      if (filters.availability === 'Available This Week') {
        for (let i = 0; i < 7; i++) {
          const key = dayKeys[(currentDay + i) % 7];
          if (normalizeDaySlots(doctor.availability, key).length > 0) return true;
        }
        return false;
      }
      if (filters.availability === 'Available Next Week') {
        for (let i = 7; i < 14; i++) {
          const key = dayKeys[(currentDay + i) % 7];
          if (normalizeDaySlots(doctor.availability, key).length > 0) return true;
        }
        return false;
      }
      return true;
    });
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Search for specialists by location and specialty
            </h1>
            <p className="text-gray-600">
              Find the perfect healthcare provider for your needs
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <DoctorSearch 
            placeholder="Search by doctor name or specialty"
            className="max-w-2xl"
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-4">
                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={localFilters.specialty}
                    onChange={(e) => handleFilterChange('specialty', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={localFilters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={localFilters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ratingOptions.map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={localFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availabilityOptions.map((availability) => (
                      <option key={availability} value={availability}>
                        {availability}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Available Doctors</h2>
                <span className="text-sm text-gray-500">
                  {searchLoading ? 'Searching...' : `${filteredResults.length} doctors found`}
                </span>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      Sort By: {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Results Grid */}
            {searchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResults.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDoctorClick(doctor)}
                  >
                    <div className="flex items-start gap-4">
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
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
                        
                        {/* Rating */}
                        {doctor.avgReview && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{doctor.avgReview.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getAvailabilityText(doctor.availability)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>{doctor.yearsExperience} years</span>
                          </div>
                          {doctor.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{doctor.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-lg font-semibold text-gray-900">
                            ${getConsultationPrice(doctor)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button className="text-sm text-gray-500 hover:text-gray-700 p-1">
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/doctor-detail/${doctor.id}`);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
