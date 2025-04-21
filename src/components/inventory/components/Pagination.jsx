"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const Pagination = ({
  currentPage,
  setCurrentPage,
  pageSize,
  totalRecords,
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Handle page change with functional state update to ensure we're using the latest state
  const handlePageChange = (page) => {
    console.log(`Changing page from ${currentPage} to ${page}`);
    setCurrentPage(page);
  };

  return (
    <nav
      className="inline-flex items-center rounded-md shadow-sm"
      aria-label="Pagination"
    >
      <button
        onClick={() => {
          console.log("Going to first page");
          setCurrentPage(1);
        }}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">First</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        onClick={() => {
          console.log("Going to previous page", currentPage - 1);
          setCurrentPage((prevPage) => Math.max(1, prevPage - 1));
        }}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium border-t border-b border-l border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="w-4 h-4" aria-hidden="true" />
      </button>

      <div className="hidden sm:flex">
        {(() => {
          const pageNumbers = [];

          // Logic to show current page, first, last, and pages around current
          for (let i = 1; i <= totalPages; i++) {
            if (
              i === 1 || // First page
              i === totalPages || // Last page
              (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
            ) {
              pageNumbers.push(
                <button
                  key={i}
                  onClick={() => {
                    console.log("Going to page", i);
                    setCurrentPage(i);
                  }}
                  aria-current={currentPage === i ? "page" : undefined}
                  className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium border ${
                    currentPage === i
                      ? "z-10 bg-[#6A9C89] text-white border-[#6A9C89]"
                      : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i}
                </button>
              );
            } else if (
              (i === 2 && currentPage > 3) || // Show ellipsis after first page
              (i === totalPages - 1 && currentPage < totalPages - 2) // Show ellipsis before last page
            ) {
              pageNumbers.push(
                <span
                  key={`ellipsis-${i}`}
                  className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300"
                >
                  ...
                </span>
              );
            }
          }

          return pageNumbers;
        })()}
      </div>

      {/* Mobile page indicator */}
      <span className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 sm:hidden">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => {
          console.log("Going to next page", currentPage + 1);
          setCurrentPage((prevPage) => Math.min(totalPages, prevPage + 1));
        }}
        disabled={currentPage >= totalPages}
        className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium border-t border-b border-r border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => {
          console.log("Going to last page", totalPages);
          setCurrentPage(totalPages);
        }}
        disabled={currentPage >= totalPages}
        className="relative inline-flex items-center px-2 py-1.5 text-xs font-medium rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Last</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;
