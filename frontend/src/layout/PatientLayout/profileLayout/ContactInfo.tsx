import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface ContactInfoForm {
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  emergencyContact: string;
}

export default function ContactInfo() {
  const [formData, setFormData] = useState<ContactInfoForm>({
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    emergencyContact: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Submitting contact info:", formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow max-w-4xl mx-auto"
    >
      <h2 className="text-lg font-semibold mb-4">Contact Information</h2>

      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
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
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-1">Office Address</label>
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

      {/* Emergency contact */}
      <div className="mb-6">
        <label className="block text-sm text-gray-700 mb-1">
          Emergency Contact
        </label>
        <input
          type="text"
          name="emergencyContact"
          className="w-full border border-gray-300 rounded-md p-2"
          placeholder="Emergency contact number"
          value={formData.emergencyContact}
          onChange={handleChange}
        />
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
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
