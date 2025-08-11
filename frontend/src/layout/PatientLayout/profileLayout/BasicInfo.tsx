import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { fetchUserProfile } from "../../../Redux/userSlice/userSlice";
import { updatePatientProfile } from "../../../Redux/patientSlice/patientSlice";
import { uploadProfilePhoto } from "../../../Redux/userSlice/userSlice";
import type { RootState } from "../../../Redux/store";
import { FileType } from "../../../types/data/file";

export default function BasicInfo() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state: RootState) => state.user);
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.patientProfile?.firstName || "");
      setLastName(profile.patientProfile?.lastName || "");
      setBio(profile.patientProfile?.medicalHistory || "");
      if (profile.files && profile.files.length > 0) {
        const photoFile = profile.files.find(file => file.type === FileType.PROFILE_PICTURE);
        if (photoFile) {
          setPhoto(photoFile.path);
        }
      }
    }
  }, [profile]);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await dispatch(uploadProfilePhoto(file)).unwrap();
        if (result) {
          setPhoto(result);
        }
      } catch (error) {
        console.error('Failed to upload photo:', error);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.patientProfile?.id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        firstName,
        lastName,
        medicalHistory: bio,
      };
      
      await dispatch(updatePatientProfile({ 
        id: profile.patientProfile.id, 
        data: updateData 
      })).unwrap();
      // Refresh profile data
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto"
    >
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Photo upload section */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="rounded-full w-24 h-24 object-cover"
              />
            ) : (
              <span>{firstName ? firstName.charAt(0) : lastName ? lastName.charAt(0) : 'P'}</span>
            )}
          </div>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <span className="cursor-pointer inline-block bg-cyan-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-cyan-700">
              Upload Photo
            </span>
          </label>
        </div>

        {/* Name + Bio */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Medical History
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your medical history, conditions, or any relevant information"
            />
            <p className="text-xs text-gray-500 mt-1">
              This information will be shared with your healthcare providers
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
