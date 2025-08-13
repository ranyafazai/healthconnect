import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/hooks';
import type { RootState } from '../../Redux/store';
import { fetchUserSettings, updateUserSettingsAsync } from '../../Redux/userSettingsSlice/userSettingsSlice';
import { changePassword, deleteAccount } from '../../Api/userSettings.api';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../../Redux/authSlice/authSlice';
import { fetchPatientProfile } from '../../Redux/patientSlice/patientSlice';
import { getAppointmentsByPatient } from '../../Api/appointment.api';
import jsPDF from 'jspdf';
import { 
  Bell, 
  Shield, 
  Eye, 
  Lock, 
  
  
  Globe, 
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Key
} from 'lucide-react';

export default function Settings() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: RootState) => state.auth);
  const { settings, loading, error, updating } = useAppSelector((state: RootState) => state.userSettings);
  const { patient } = useAppSelector((state: RootState) => state.patient);
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  
  // Account management states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Delete account form
  const [deletePassword, setDeletePassword] = useState('');
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    appointmentReminders: true,
    messageNotifications: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'DOCTORS_ONLY' as 'DOCTORS_ONLY' | 'ALL_USERS' | 'PRIVATE',
    shareMedicalHistory: true,
    allowDataAnalytics: false,
    shareForResearch: false
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true
  });

  // Load user settings and patient profile on component mount
  useEffect(() => {
    dispatch(fetchUserSettings());
    if (user?.id && !patient) {
      dispatch(fetchPatientProfile(user.id));
    }
  }, [dispatch, user?.id, patient]);

  // Update local state when settings are loaded from backend
  useEffect(() => {
    if (settings) {
      setNotificationSettings({
        pushNotifications: settings.pushNotifications,
        appointmentReminders: settings.appointmentReminders,
        messageNotifications: settings.messageNotifications
      });

      setPrivacySettings({
        profileVisibility: settings.profileVisibility,
        shareMedicalHistory: settings.shareMedicalHistory,
        allowDataAnalytics: settings.allowDataAnalytics,
        shareForResearch: settings.shareForResearch
      });

      setSecuritySettings({
        twoFactorAuth: settings.twoFactorAuth,
        sessionTimeout: settings.sessionTimeout,
        loginNotifications: settings.loginNotifications
      });
    }
  }, [settings]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecurityChange = (key: string, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    const allSettings = {
      ...notificationSettings,
      ...privacySettings,
      ...securitySettings
    };

    try {
      await dispatch(updateUserSettingsAsync(allSettings)).unwrap();
      setIsEditing(false);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error message
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  // Account management functions
  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('New password and confirmation do not match');
        return;
      }

      await changePassword(passwordForm);
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Fetch patient profile data if not already loaded
      if (!patient) {
        await dispatch(fetchPatientProfile(user?.id || 0));
      }
      
      // Fetch appointments if patient exists
      if (patient?.id) {
        try {
          const appointmentsResponse = await getAppointmentsByPatient(patient.id);
          setAppointments(appointmentsResponse.data?.data?.data || []);
        } catch (error) {
          // Error handling for appointments fetch
        }
      }
      
      // Generate PDF with patient data
      generatePatientPDF();
      
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 5000);
    } catch (error: any) {
      console.error('Failed to export data:', error);
      alert('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePatientPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = 20;

      // Add header
      doc.setFontSize(24);
      doc.setTextColor(6, 182, 212); // Cyan color
      doc.text('HealthConnect - Patient Profile', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99); // Gray color
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 30;

      // Personal Information Section
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39); // Dark gray
      doc.text('Personal Information', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81); // Medium gray

      const personalInfo = [
        ['Name', `${patient?.firstName || 'N/A'} ${patient?.lastName || 'N/A'}`],
        ['Email', user?.email || 'N/A'],
        ['Phone Number', patient?.phoneNumber || 'N/A'],
        ['Date of Birth', patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'],
        ['Address', patient?.address || 'N/A'],
        ['City', patient?.city || 'N/A'],
        ['State', patient?.state || 'N/A'],
        ['Zip Code', patient?.zipCode || 'N/A']
      ];

      personalInfo.forEach(([label, value]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${label}:`, margin, yPosition);
        doc.text(value, margin + 50, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Medical History Section
      if (patient?.medicalHistory) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text('Medical History', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        
        // Split medical history into lines that fit the page
        const medicalHistoryLines = doc.splitTextToSize(patient.medicalHistory, pageWidth - 2 * margin);
        medicalHistoryLines.forEach((line: string) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }

      // Settings Section
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39);
      doc.text('Account Settings', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);

      // Notification Settings
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text('Notification Preferences:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const notificationSettings = [
        ['Push Notifications', settings?.pushNotifications ? 'Enabled' : 'Disabled'],
        ['Appointment Reminders', settings?.appointmentReminders ? 'Enabled' : 'Disabled'],
        ['Message Notifications', settings?.messageNotifications ? 'Enabled' : 'Disabled']
      ];

      notificationSettings.forEach(([setting, status]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${setting}:`, margin, yPosition);
        doc.text(status, margin + 80, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Privacy Settings
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text('Privacy Settings:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const privacySettings = [
        ['Profile Visibility', settings?.profileVisibility || 'N/A'],
        ['Share Medical History', settings?.shareMedicalHistory ? 'Enabled' : 'Disabled'],
        ['Data Analytics', settings?.allowDataAnalytics ? 'Enabled' : 'Disabled'],
        ['Share for Research', settings?.shareForResearch ? 'Enabled' : 'Disabled']
      ];

      privacySettings.forEach(([setting, status]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${setting}:`, margin, yPosition);
        doc.text(status, margin + 80, yPosition);
        yPosition += 8;
      });

      yPosition += 10;

      // Security Settings
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text('Security Settings:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      const securitySettings = [
        ['Two-Factor Authentication', settings?.twoFactorAuth ? 'Enabled' : 'Disabled'],
        ['Session Timeout', `${settings?.sessionTimeout || 30} minutes`],
        ['Login Notifications', settings?.loginNotifications ? 'Enabled' : 'Disabled']
      ];

      securitySettings.forEach(([setting, status]) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${setting}:`, margin, yPosition);
        doc.text(status, margin + 80, yPosition);
        yPosition += 8;
      });

      // Appointment History Section
      if (appointments && appointments.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        yPosition += 10;
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text('Appointment History', margin, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);

        // Show last 10 appointments
        const recentAppointments = appointments.slice(0, 10);
        recentAppointments.forEach((appointment, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }

          const appointmentDate = new Date(appointment.date).toLocaleDateString();
          const doctorName = appointment.doctor?.firstName && appointment.doctor?.lastName 
            ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
            : 'N/A';
          const status = appointment.status || 'N/A';
          const type = appointment.type || 'N/A';

          doc.setFontSize(11);
          doc.setTextColor(17, 24, 39);
          doc.text(`Appointment ${index + 1}:`, margin, yPosition);
          yPosition += 8;

          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          doc.text(`Date: ${appointmentDate}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`Doctor: ${doctorName}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`Type: ${type}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`Status: ${status}`, margin + 10, yPosition);
          yPosition += 6;
          
          if (appointment.reason) {
            doc.text(`Reason: ${appointment.reason}`, margin + 10, yPosition);
            yPosition += 6;
          }
          
          yPosition += 5;
        });

        if (appointments.length > 10) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128);
          doc.text(`... and ${appointments.length - 10} more appointments`, margin, yPosition);
          yPosition += 10;
        }
      }

      // Footer
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      yPosition += 20;
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Light gray
      doc.text('This document contains your personal health information. Please keep it secure.', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      doc.text('Generated by HealthConnect - Your trusted healthcare platform', pageWidth / 2, yPosition, { align: 'center' });

      // Save the PDF
      const fileName = `patient-profile-${patient?.firstName || 'user'}-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        alert('Please enter your password to confirm account deletion');
        return;
      }

      setIsDeleting(true);
      await deleteAccount(deletePassword);
      
      // Clear auth state and redirect to login
      dispatch(clearAuth());
      navigate('/auth/login');
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Lock }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-medium">Error loading settings</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => dispatch(fetchUserSettings())}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
      {/* Success Notification */}
      {showSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Export Success Notification */}
      {showExportSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">PDF profile exported successfully!</span>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">Failed to save settings. Please try again.</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications in the app</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                      <p className="text-sm text-gray-500">Get reminded about upcoming appointments</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.appointmentReminders}
                      onChange={(e) => handleNotificationChange('appointmentReminders', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Message Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.messageNotifications}
                      onChange={(e) => handleNotificationChange('messageNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Data Sharing</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block mb-2">
                    <span className="font-medium text-gray-900">Profile Visibility</span>
                    <p className="text-sm text-gray-500">Control who can see your profile information</p>
                  </label>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="DOCTORS_ONLY">Doctors Only</option>
                    <option value="ALL_USERS">All Users</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Share Medical History</h4>
                      <p className="text-sm text-gray-500">Allow doctors to view your medical history</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareMedicalHistory}
                      onChange={(e) => handlePrivacyChange('shareMedicalHistory', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Data Analytics</h4>
                      <p className="text-sm text-gray-500">Help improve our services with anonymous data</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.allowDataAnalytics}
                      onChange={(e) => handlePrivacyChange('allowDataAnalytics', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Share for Research</h4>
                      <p className="text-sm text-gray-500">Allow your data to be used for medical research</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareForResearch}
                      onChange={(e) => handlePrivacyChange('shareForResearch', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <label className="block mb-2">
                    <span className="font-medium text-gray-900">Session Timeout</span>
                    <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">Login Notifications</h4>
                      <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Management</h3>
              <div className="space-y-4">
                                 <div className="p-4 border border-gray-200 rounded-lg">
                   <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                   <p className="text-sm text-gray-500 mb-3">Update your account password for security</p>
                   <button 
                     onClick={() => setShowChangePasswordModal(true)}
                     className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 flex items-center gap-2"
                   >
                     <Key className="w-4 h-4" />
                     Change Password
                   </button>
                 </div>

                 <div className="p-4 border border-gray-200 rounded-lg">
                   <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                   <p className="text-sm text-gray-500 mb-3">Download a copy of your personal data</p>
                   <button 
                     onClick={handleExportData}
                     disabled={isExporting}
                     className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isExporting ? (
                       <>
                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                         Generating PDF...
                       </>
                     ) : (
                       <>
                         <Download className="w-4 h-4" />
                         Export Profile PDF
                       </>
                     )}
                   </button>
                 </div>

                 <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                   <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                   <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
                   <button 
                     onClick={() => setShowDeleteAccountModal(true)}
                     className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                   >
                     <Trash2 className="w-4 h-4" />
                     Delete Account
                   </button>
                 </div>
              </div>
            </div>
          </div>
                 )}
       </div>

       {/* Change Password Modal */}
       {showChangePasswordModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Current Password
                 </label>
                 <input
                   type="password"
                   value={passwordForm.currentPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                   placeholder="Enter current password"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   New Password
                 </label>
                 <input
                   type="password"
                   value={passwordForm.newPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                   placeholder="Enter new password"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Confirm New Password
                 </label>
                 <input
                   type="password"
                   value={passwordForm.confirmPassword}
                   onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                   placeholder="Confirm new password"
                 />
               </div>
             </div>
             <div className="flex gap-2 mt-6">
               <button
                 onClick={() => {
                   setShowChangePasswordModal(false);
                   setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                 }}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleChangePassword}
                 className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
               >
                 Change Password
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Delete Account Modal */}
       {showDeleteAccountModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
             <p className="text-sm text-gray-600 mb-4">
               This action cannot be undone. All your data will be permanently deleted.
             </p>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Enter your password to confirm
               </label>
               <input
                 type="password"
                 value={deletePassword}
                 onChange={(e) => setDeletePassword(e.target.value)}
                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                 placeholder="Enter your password"
               />
             </div>
             <div className="flex gap-2 mt-6">
               <button
                 onClick={() => {
                   setShowDeleteAccountModal(false);
                   setDeletePassword('');
                 }}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 onClick={handleDeleteAccount}
                 disabled={isDeleting}
                 className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isDeleting ? 'Deleting...' : 'Delete Account'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }