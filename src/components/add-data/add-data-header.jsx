"use client";

const AddDataHeader = () => {
  return (
    <div className="flex items-center p-4 border-b">
      <button
        onClick={() => (window.location.href = "/inventory")}
        className="flex items-center justify-center px-3 py-1 mr-3 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back
      </button>
      <h2 className="m-0 text-xl font-semibold">Add Farmer Data</h2>
    </div>
  );
};

export default AddDataHeader;
