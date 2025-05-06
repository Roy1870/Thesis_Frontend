"use client";

const FarmerInformation = ({
  formData,
  handleInputChange,
  handleFarmerTypeChange,
  barangayOptions,
}) => {
  return (
    <div className="mb-6 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
      <div className="p-3 font-medium text-white bg-emerald-700">
        Farmer Information
      </div>
      <div className="p-4 bg-emerald-50 hide-scrollbar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-emerald-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                placeholder="Enter contact number"
                className="w-full py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Facebook/Email
            </label>
            <input
              type="text"
              name="facebook_email"
              value={formData.facebook_email}
              onChange={handleInputChange}
              placeholder="Enter Facebook or Email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Barangay <span className="text-red-500">*</span>
            </label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a Barangay</option>
              {barangayOptions.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Home Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="home_address"
              value={formData.home_address}
              onChange={handleInputChange}
              placeholder="Enter home address"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Farmer Type <span className="text-red-500">*</span>
            </label>
            <select
              name="farmer_type"
              value={formData.farmer_type}
              onChange={(e) => handleFarmerTypeChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select Farmer Type</option>
              <option value="Raiser">Raiser</option>
              <option value="Operator">Operator</option>
              <option value="Grower">Grower</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerInformation;
