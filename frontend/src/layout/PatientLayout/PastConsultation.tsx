import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppSelector } from '../../Redux/hooks';
import { Calendar, Clock, User, FileText, Star, MessageSquare, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { getPastConsultations } from '../../Api/appointment.api';
 
import { useReviewModalContext } from '../../contexts/ReviewModalContext';

type FilterStatus = 'ALL' | 'COMPLETED' | 'CANCELLED';

interface UIConsultation {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  consultationDate: string;
  consultationType: 'TEXT' | 'VIDEO';
  status: 'COMPLETED' | 'CANCELLED';
  notes?: string;
  reason?: string;
  prescription?: string;
  rating?: number;
  review?: string;
  duration?: number;
  doctorImage?: string;
  symptoms?: string;
  diagnosis?: string;
  followUpDate?: string;
  cost?: number;
  recordingUrl?: string;
  createdAt: string;
}

export default function PastConsultation() {
  const { openReviewModal } = useReviewModalContext();
  const { user } = useAppSelector((state) => state.auth);
  const [consultations, setConsultations] = useState<UIConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 25; // Increased from 20 to show more consultations per page

  const patientId = user?.patientProfile?.id;

  const fetchPastConsultations = useCallback(async (status: FilterStatus = 'ALL', reset: boolean = false) => {
    if (!patientId) return;

    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const response = await getPastConsultations(
        patientId, 
        status === 'ALL' ? undefined : status, 
        limit, 
        currentOffset
      );

      const newConsultations: UIConsultation[] = Array.isArray(response.data.data) ? response.data.data : [];
      
      if (reset) {
        setConsultations(newConsultations);
        setOffset(limit);
      } else {
        setConsultations(prev => [...prev, ...newConsultations]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(newConsultations.length === limit);
      setError(null);
    } catch (err) {
      console.error('Error fetching past consultations:', err);
      setError('Failed to load past consultations');
    } finally {
      setLoading(false);
    }
  }, [patientId, offset]);

  useEffect(() => {
    if (patientId) {
      fetchPastConsultations(filterStatus, true);
    }
  }, [patientId, filterStatus]);

  const handleFilterChange = (newStatus: FilterStatus) => {
    setFilterStatus(newStatus);
    setExpandedConsultation(null);
    setOffset(0);
    fetchPastConsultations(newStatus, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPastConsultations(filterStatus, false);
    }
  };

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) =>
      filterStatus === 'ALL' || consultation.status === filterStatus
    );
  }, [consultations, filterStatus]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'VIDEO' ? '📹' : '💬';
  };

  const toggleExpanded = (consultationId: number) => {
    setExpandedConsultation(expandedConsultation === consultationId ? null : consultationId);
  };

  const handleDownload = useCallback((consultation: UIConsultation) => {
    // Lazy import to reduce initial bundle size
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const x = 14;
      let y = 20;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Consultation Report', x, y);
      y += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const addLine = (label: string, value?: string | number) => {
        if (value === undefined || value === null) return;
        const text = `${label}: ${value}`;
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, x, y);
        y += lines.length * 7;
      };

      addLine('Doctor', consultation.doctorName);
      addLine('Specialization', consultation.doctorSpecialization);
      addLine('Date', formatDate(consultation.consultationDate));
      addLine('Time', formatTime(consultation.consultationDate));
      addLine('Type', consultation.consultationType);
      addLine('Status', consultation.status);
      if (consultation.duration) {
        addLine('Duration', consultation.duration);
        addLine('Duration Unit', 'minutes');
      }
      if (consultation.reason) {
        addLine('Reason', consultation.reason);
      }
      if (consultation.symptoms) {
        addLine('Symptoms', consultation.symptoms);
      }
      if (consultation.diagnosis) {
        addLine('Diagnosis', consultation.diagnosis);
      }
      if (consultation.notes) {
        addLine('Notes', consultation.notes);
      }
      if (consultation.prescription) {
        addLine('Prescription', consultation.prescription);
      }
      if (consultation.followUpDate) {
        addLine('Follow-up Date', consultation.followUpDate);
      }
      if (consultation.cost) {
        addLine('Cost', consultation.cost);
        addLine('Currency', 'USD');
      }
      if (consultation.rating) {
        addLine('Rating', consultation.rating);
        addLine('Rating Scale', '5');
      }
      if (consultation.review) {
        addLine('Review', consultation.review);
      }

      const fileName = `consultation_${consultation.id}.pdf`;
      doc.save(fileName);
    });
  }, []);

  const handleDownloadRecording = (consultation: UIConsultation) => {
    if (consultation.recordingUrl) {
      const link = document.createElement('a');
      link.href = consultation.recordingUrl;
      link.download = `consultation_recording_${consultation.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-6xl mx-auto">
        <div className="text-center text-red-500 py-8">
          <p className="text-lg font-medium mb-2">Error Loading Consultations</p>
          <p>{error}</p>
          <button 
            onClick={() => fetchPastConsultations(filterStatus, true)}
            className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Past Consultations</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value as FilterStatus)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Consultations</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Summary Section */}
      {consultations.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">{consultations.length}</div>
                <div className="text-sm text-gray-600">Total Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {consultations.filter(c => c.status === 'COMPLETED').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {consultations.filter(c => c.status === 'CANCELLED').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {consultations.filter(c => c.consultationType === 'VIDEO').length}
                </div>
                <div className="text-sm text-gray-600">Video Calls</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {consultations.filter(c => c.consultationType === 'TEXT').length}
                </div>
                <div className="text-sm text-gray-600">Text Consultations</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Showing {filteredConsultations.length} of {consultations.length}</div>
              {hasMore && (
                <div className="text-xs text-gray-400">More consultations available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && consultations.length === 0 && (
        <div className="text-center text-gray-500 py-8">Loading consultations...</div>
      )}

      {!loading && consultations.length === 0 && (
        <div className="border border-gray-200 rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Consultations</h3>
          <p className="text-gray-500">You don't have any past consultations yet</p>
        </div>
      )}

      {consultations.length > 0 && (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Consultation Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {consultation.doctorImage ? (
                      <img
                        src={consultation.doctorImage}
                        alt={consultation.doctorName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-cyan-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{consultation.doctorName}</h3>
                      <p className="text-sm text-gray-600">{consultation.doctorSpecialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(consultation.consultationDate)}</div>
                    <div className="text-xs text-gray-400">{formatTime(consultation.consultationDate)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(consultation.consultationType)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                    {consultation.duration && (
                      <span className="text-sm text-gray-500">{consultation.duration} min</span>
                    )}
                    {consultation.cost && (
                      <span className="text-sm text-gray-500">${consultation.cost}</span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleExpanded(consultation.id)}
                    className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                  >
                    {expandedConsultation === consultation.id ? (
                      <>
                        <span>Show Less</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Show More</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  {/* Test Review Button */}
                  <button 
                    onClick={() => {
                      const doctorName = consultation.doctorName || 'Unknown Doctor';
                      const doctorId = consultation.id || 0;
                      const appointmentId = consultation.id || 0;
                      openReviewModal(doctorId, doctorName, appointmentId);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    🧪 Test Review
                  </button>
                </div>

                {consultation.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < consultation.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">({consultation.rating})</span>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedConsultation === consultation.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(consultation.consultationDate)}</span>
                    </div>
                    {consultation.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{consultation.duration} minutes</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">{consultation.consultationType}</span>
                    </div>
                    {consultation.followUpDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">Follow-up: {consultation.followUpDate}</span>
                      </div>
                    )}
                  </div>

                  {consultation.reason && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Consultation Reason
                      </h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{consultation.reason}</p>
                    </div>
                  )}

                  {consultation.symptoms && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Symptoms
                      </h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{consultation.symptoms}</p>
                    </div>
                  )}

                  {consultation.diagnosis && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Diagnosis
                      </h4>
                      <p className="text-gray-700 bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                        {consultation.diagnosis}
                      </p>
                    </div>
                  )}

                  {consultation.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Consultation Notes
                      </h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{consultation.notes}</p>
                    </div>
                  )}

                  {consultation.prescription && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        Prescription
                      </h4>
                      <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        {consultation.prescription}
                      </p>
                    </div>
                  )}

                  {consultation.review && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        Your Review
                      </h4>
                      <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < (consultation.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          {consultation.rating && (
                            <span className="text-sm text-gray-600">({consultation.rating}/5)</span>
                          )}
                        </div>
                        <p className="text-gray-700">{consultation.review}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleDownload(consultation)} 
                      className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Download Report
                    </button>
                    
                    {consultation.recordingUrl && (
                      <button 
                        onClick={() => handleDownloadRecording(consultation)} 
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Recording
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-6">
              <div className="mb-3 text-sm text-gray-600">
                Showing {consultations.length} consultations • {hasMore ? 'More available' : 'All loaded'}
              </div>
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-cyan-600 text-white px-8 py-3 rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  `Load More Consultations (${limit} more)`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}