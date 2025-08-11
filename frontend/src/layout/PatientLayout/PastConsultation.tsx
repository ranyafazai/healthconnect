import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { Calendar, Clock, User, FileText, Star, MessageSquare } from 'lucide-react';

interface PastConsultation {
  id: number;
  doctorName: string;
  doctorSpecialization: string;
  consultationDate: string;
  consultationType: 'TEXT' | 'VIDEO';
  status: 'COMPLETED' | 'CANCELLED';
  notes?: string;
  prescription?: string;
  rating?: number;
  review?: string;
  duration: number; // in minutes
}

export default function PastConsultation() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [consultations, setConsultations] = useState<PastConsultation[]>([
    {
      id: 1,
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialization: 'Internal Medicine',
      consultationDate: '2025-01-15',
      consultationType: 'VIDEO',
      status: 'COMPLETED',
      notes: 'Patient reported improved blood pressure control. Continue current medication regimen.',
      prescription: 'Lisinopril 10mg daily, Amlodipine 5mg daily',
      rating: 5,
      review: 'Excellent consultation. Doctor was very thorough and explained everything clearly.',
      duration: 30
    },
    {
      id: 2,
      doctorName: 'Dr. Michael Chen',
      doctorSpecialization: 'Cardiology',
      consultationDate: '2025-01-08',
      consultationType: 'TEXT',
      status: 'COMPLETED',
      notes: 'Follow-up consultation for heart health. Patient doing well with current treatment.',
      prescription: 'Continue current medications',
      rating: 4,
      review: 'Good follow-up consultation. Quick response to my questions.',
      duration: 15
    },
    {
      id: 3,
      doctorName: 'Dr. Emily Rodriguez',
      doctorSpecialization: 'Dermatology',
      consultationDate: '2024-12-20',
      consultationType: 'VIDEO',
      status: 'COMPLETED',
      notes: 'Skin condition has improved significantly. Continue with prescribed cream.',
      prescription: 'Continue using Triamcinolone cream twice daily',
      rating: 5,
      review: 'Very satisfied with the treatment and follow-up care.',
      duration: 25
    }
  ]);

  const [selectedConsultation, setSelectedConsultation] = useState<PastConsultation | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');

  const filteredConsultations = consultations.filter(consultation => 
    filterStatus === 'ALL' || consultation.status === filterStatus
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'VIDEO' ? '📹' : '💬';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Past Consultations</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Consultations</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultations List */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                onClick={() => setSelectedConsultation(consultation)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedConsultation?.id === consultation.id
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(consultation.consultationType)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {consultation.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(consultation.consultationDate)}</div>
                    <div className="text-xs text-gray-400">{consultation.duration} min</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{consultation.doctorName}</h3>
                <p className="text-sm text-gray-600 mb-2">{consultation.doctorSpecialization}</p>
                
                {consultation.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < consultation.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">({consultation.rating})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Details */}
        <div className="lg:col-span-2">
          {selectedConsultation ? (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedConsultation.doctorName}</h3>
                  <p className="text-gray-600">{selectedConsultation.doctorSpecialization}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Consultation Date</div>
                  <div className="font-semibold">{formatDate(selectedConsultation.consultationDate)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(selectedConsultation.consultationDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedConsultation.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{selectedConsultation.consultationType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedConsultation.status)}`}>
                    {selectedConsultation.status}
                  </span>
                </div>
              </div>

              {selectedConsultation.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    Consultation Notes
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedConsultation.notes}</p>
                </div>
              )}

              {selectedConsultation.prescription && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    Prescription
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    {selectedConsultation.prescription}
                  </p>
                </div>
              )}

              {selectedConsultation.review && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                    Your Review
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedConsultation.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600">({selectedConsultation.rating}/5)</span>
                    </div>
                    <p className="text-gray-700">{selectedConsultation.review}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors">
                  Book Follow-up
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                  Download Report
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Consultation</h3>
              <p className="text-gray-500">Choose a consultation from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}