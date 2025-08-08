import { useState, type ChangeEvent, type FormEvent } from "react";

export default function BasicInfo() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ firstName, lastName, bio, photo });
  };

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
              <span>Photo</span>
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Professional Bio
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-md p-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be displayed on your public profile
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
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
