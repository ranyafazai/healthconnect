import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { fetchUserProfile } from "../../../Redux/userSlice/userSlice";
import { updatePatientProfile } from "../../../Redux/patientSlice/patientSlice";
import type { RootState } from "../../../Redux/store";

interface ContactInfoForm {
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export default function ContactInfo() {
  const dispatch = useAppDispatch();
  const { profile, loading } = useAppSelector((state: RootState) => state.user);
  const { user } = useAppSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState<ContactInfoForm>({
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.patientProfile?.phoneNumber || "",
        address: profile.patientProfile?.address || "",
        city: profile.patientProfile?.city || "",
        state: profile.patientProfile?.state || "",
        zip: profile.patientProfile?.zipCode || "",
      });
    }
  }, [profile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile?.patientProfile?.id) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zip,
      };
      
      await dispatch(updatePatientProfile({ 
        id: profile.patientProfile.id, 
        data: updateData 
      })).unwrap();
      // Refresh profile data
      dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Failed to update contact info:', error);
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
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
      <h2 className="text-lg font-semibold mb-4">Contact Information</h2>

      {/* Phone Number */}
      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          className="w-full border border-gray-300 rounded-md p-2"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">Home Address</label>
        <input
          type="text"
          name="address"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Street address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      {/* City / State / Zip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">State</label>
          <input
            type="text"
            name="state"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.state}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">ZIP Code</label>
          <input
            type="text"
            name="zip"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.zip}
            onChange={handleChange}
          />
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
