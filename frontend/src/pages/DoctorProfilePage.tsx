import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import type { RootState } from '../Redux/store';
import { getDoctorById } from '../Redux/doctorSlice/doctorSlice';
import { useAppSelector as useAuthSelector } from '../Redux/hooks';
import { Navbar } from '../components/NavBar/NavBar';
import { 
  Star, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Award,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import type { DoctorProfile } from '../types/data/doctor';

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
  const { currentDoctor, loading, error } = useAppSelector((state: RootState) => state.doctor);
  
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'availability'>('about');
  
  // Check if current user is the doctor being viewed
  const isCurrentUserDoctor = isAuthenticated && user?.role === 'DOCTOR' && user?.id === currentDoctor?.userId;

  useEffect(() => {
    if (id) {
      dispatch(getDoctorById(parseInt(id)));
    }
  }, [id, dispatch]);

  

  const getDoctorInitials = (doctor: DoctorProfile) => {
    return `${doctor.firstName.charAt(0)}${doctor.lastName.charAt(0)}`.toUpperCase();
  };

  const getAvailabilityText = (availability: any) => {
    if (!availability || typeof availability !== 'object') {
      return 'No Availability';
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes for easier comparison
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[currentDay];
    
    // Check if doctor has availability for today
    if (availability[todayKey] && Array.isArray(availability[todayKey])) {
      const todayAvailability = availability[todayKey];
      
      // Check if there are available time slots
      if (todayAvailability.length > 0) {
        // Check if current time is within any available slot
        const isCurrentlyAvailable = todayAvailability.some((timeSlot: string) => {
          const [startTime, endTime] = timeSlot.split('-');
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          const startTimeMinutes = startHour * 60 + startMinute;
          const endTimeMinutes = endHour * 60 + endMinute;
          
          // Check if current time is within this slot
          return currentTime >= startTimeMinutes && currentTime <= endTimeMinutes;
        });
        
        if (isCurrentlyAvailable) {
          return 'Available Now';
        } else {
          // Check if there are future slots today
          const hasFutureSlots = todayAvailability.some((timeSlot: string) => {
            const [startTime] = timeSlot.split('-');
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const startTimeMinutes = startHour * 60 + startMinute;
            return currentTime < startTimeMinutes;
          });
          
          if (hasFutureSlots) {
            return 'Available Later Today';
          } else {
            return 'Closed for Today';
          }
        }
      }
    }
    
    // Check for tomorrow
    const tomorrow = (currentDay + 1) % 7;
    const tomorrowKey = days[tomorrow];
    
    if (availability[tomorrowKey] && Array.isArray(availability[tomorrowKey]) && availability[tomorrowKey].length > 0) {
      return 'Available Tomorrow';
    }
    
    // Check for this week
    for (let i = 2; i < 7; i++) {
      const dayIndex = (currentDay + i) % 7;
      const dayKey = days[dayIndex];
      if (availability[dayKey] && Array.isArray(availability[dayKey]) && availability[dayKey].length > 0) {
        return `Available ${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}`;
      }
    }
    
    return 'No Availability';
  };

  const getConsultationPrice = (doctor: DoctorProfile) => {
    const basePrice = 120;
    const experienceMultiplier = Math.min(doctor.yearsExperience / 10, 1.5);
    const specializationMultiplier = doctor.specialization.toLowerCase().includes('surgeon') ? 1.8 : 1.2;
    
    return Math.round(basePrice * experienceMultiplier * specializationMultiplier);
  };

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      navigate('/how-to-book');
      return;
    }
    navigate(`/patient/booking?doctorId=${id}`);
  };

  const handleGoToDashboard = () => {
    navigate('/doctor/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentDoctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={isAuthenticated} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Doctor Not Found</h2>
            <p className="text-gray-500 mb-4">The doctor you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/search')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Search for Doctors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={isAuthenticated} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Search
            </button>
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Search</span>
              <span>→</span>
              <span className="text-gray-900 font-medium">Dr. {currentDoctor?.lastName}</span>
            </div>
          </div>
          
                      {/* Action Buttons */}
            {isCurrentUserDoctor ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Viewing your profile</p>
                  <p className="text-sm font-medium text-gray-900">Dr. {currentDoctor.firstName} {currentDoctor.lastName}</p>
                </div>
                <button
                  onClick={handleGoToDashboard}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/search')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Search More Doctors
              </button>
            )}
        </div>

        {/* Doctor Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Doctor Avatar */}
            <div className="flex-shrink-0">
                              {currentDoctor.photo ? (
                  <img
                    src={currentDoctor.photo.url}
                    alt={`${currentDoctor.firstName} ${currentDoctor.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {getDoctorInitials(currentDoctor)}
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dr. {currentDoctor.firstName} {currentDoctor.lastName}
              </h1>
              <p className="text-lg text-blue-600 mb-3">{currentDoctor.specialization}</p>
              
              {/* Rating */}
              {currentDoctor.avgReview && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(currentDoctor.avgReview!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{currentDoctor.avgReview.toFixed(1)}</span>
                  <span className="text-gray-500">(127 reviews)</span>
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>{currentDoctor.yearsExperience} years experience</span>
                </div>
                {currentDoctor.city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{currentDoctor.city}, {currentDoctor.state}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{getAvailabilityText(currentDoctor.availability)}</span>
                </div>
              </div>

              {/* Contact Info */}
              {currentDoctor.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>{currentDoctor.phoneNumber}</span>
                </div>
              )}
              {currentDoctor.user?.email && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{currentDoctor.user.email}</span>
                </div>
              )}
            </div>

            {/* Booking Section */}
            <div className="flex-shrink-0 text-right">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-2xl font-bold text-blue-600">
                  ${getConsultationPrice(currentDoctor)}
                </div>
                <div className="text-sm text-gray-500">per consultation</div>
              </div>
              
              {/* Dashboard Button for Current Doctor */}
              {isCurrentUserDoctor && (
                <button
                  onClick={handleGoToDashboard}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold w-full mb-3"
                >
                  Go to Dashboard
                </button>
              )}
              
              <button
                onClick={handleBookAppointment}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold w-full"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'about', label: 'About' },
                { key: 'reviews', label: 'Reviews' },
                { key: 'availability', label: 'Availability' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'about' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Dr. {currentDoctor.lastName}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {currentDoctor.professionalBio || `Dr. ${currentDoctor.firstName} ${currentDoctor.lastName} is a highly experienced ${currentDoctor.specialization} with ${currentDoctor.yearsExperience} years of practice. Dr. ${currentDoctor.lastName} is committed to providing exceptional patient care and staying up-to-date with the latest medical advancements in ${currentDoctor.specialization.toLowerCase()}.`}
                </p>
                
                {currentDoctor.medicalLicense && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Medical License</h4>
                    <p className="text-gray-600">{currentDoctor.medicalLicense}</p>
                  </div>
                )}
                
                {/* Patient Information */}
                {!isCurrentUserDoctor && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Ready to Book?</h4>
                    <p className="text-blue-700 mb-3">
                      You can book an appointment with Dr. {currentDoctor.lastName} by clicking the "Book Appointment" button above. 
                      Choose between text consultation or video call based on your preference.
                    </p>
                    <div className="text-sm text-blue-600">
                      <p>• Text consultations are great for quick questions and follow-ups</p>
                      <p>• Video calls provide face-to-face interaction for comprehensive care</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Reviews</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(currentDoctor.avgReview || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{currentDoctor.avgReview?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500">({currentDoctor.reviews?.length || 0} total reviews)</span>
                  </div>
                </div>

                {/* Real Reviews from Backend */}
                {currentDoctor.reviews && currentDoctor.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {currentDoctor.reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.patient?.firstName?.charAt(0) || 'P'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.patient?.firstName} {review.patient?.lastName}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Star className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to leave a review!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'availability' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
                
                {/* Current Availability Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Current Status</h4>
                  <p className="text-gray-600">
                    {getAvailabilityText(currentDoctor.availability)}
                  </p>
                </div>
                
                {/* Real Availability from Backend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayKey = day.toLowerCase();
                    const dayAvailability = currentDoctor.availability?.[dayKey];
                    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
                    
                    return (
                      <div key={day} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{dayName}</h4>
                        <div className="text-gray-600">
                          {dayAvailability ? (
                            <div className="space-y-1">
                              {Array.isArray(dayAvailability) ? (
                                dayAvailability.map((timeSlot, index) => (
                                  <div key={index} className="text-sm">
                                    {timeSlot}
                                  </div>
                                ))
                              ) : (
                                <span>{dayAvailability}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-red-500">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Booking Information */}
                {!isCurrentUserDoctor && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">How to Book</h4>
                    <p className="text-blue-700 mb-3">
                      To schedule an appointment with Dr. {currentDoctor.lastName}, click the "Book Appointment" button above. 
                      You'll be able to choose your preferred date, time, and consultation type.
                    </p>
                    <div className="text-sm text-blue-600">
                      <p>• Available slots are shown in real-time</p>
                      <p>• You can book up to 2 weeks in advance</p>
                      <p>• Cancellations can be made up to 24 hours before your appointment</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
