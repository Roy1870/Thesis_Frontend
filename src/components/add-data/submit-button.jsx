const SubmitButton = ({ loading, isProcessingImage = false }) => {
  return (
    <button
      type="submit"
      disabled={loading || isProcessingImage}
      className="fixed bottom-0 left-0 right-0 z-10 p-4 text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed md:static md:w-auto md:rounded-md:px-6 md:py-2"
    >
      {loading ? (
        <>
          <svg
            className="inline-block w-5 h-5 mr-2 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Submitting...
        </>
      ) : isProcessingImage ? (
        "Processing Image..."
      ) : (
        "Submit"
      )}
    </button>
  );
};

export default SubmitButton;
