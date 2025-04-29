export default function DashboardStats({ dashboardData }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-8 xs:grid-cols-2 lg:grid-cols-4">
      <div className="bg-gradient-to-br from-[#6A9C89] to-[#4A7C69] rounded-xl text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] duration-300 border border-[#8DB5A5]/20">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
              <line x1="8" y1="16" x2="8.01" y2="16" />
              <line x1="8" y1="20" x2="8.01" y2="20" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
              <line x1="12" y1="22" x2="12.01" y2="22" />
              <line x1="16" y1="16" x2="16.01" y2="16" />
              <line x1="16" y1="20" x2="16.01" y2="20" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Rice Production
            </p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatNumber(dashboardData.categoryData.rice.total.toFixed(2))}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Metric tons of rice across all varieties
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#4F6F7D] to-[#3A5A68] rounded-xl text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] duration-300 border border-[#6F8F9D]/20">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 0 0-9-9z" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Banana Production
            </p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatNumber(dashboardData.categoryData.banana.total.toFixed(2))}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Metric tons of banana across all varieties
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#388E3C] to-[#2E7D32] rounded-xl text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] duration-300 border border-[#4CAF50]/20">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Livestock Count
            </p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatNumber(dashboardData.categoryData.livestock.total)}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Total heads of livestock and poultry
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#0288D1] to-[#0277BD] rounded-xl text-white p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] duration-300 border border-[#29B6F6]/20">
        <div className="flex items-center mb-4">
          <div className="p-2 mr-4 bg-white rounded-lg bg-opacity-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 4-3 4-6.5-2.5 0-4 2.5-4 2.5m-8 4c1.26 0 2.5-1.06 4-1.06 3 0 4 3 4 6.5-2.5 0-4-2.5-4-2.5"></path>
              <path d="M12 11.94c1.5 0 2.75 1.06 4 1.06 3 0 4-3 4-6.5-2.5 0-4 2.5-4 2.5m-8 4c1.26 0 2.5-1.06 4-1.06 3 0 4 3 4 6.5-2.5 0-4-2.5-4-2.5"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white opacity-80">
              Fish Production
            </p>
            <p className="text-xl font-bold sm:text-2xl">
              {formatNumber(dashboardData.categoryData.fish.total.toFixed(2))}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-white opacity-80">
          Metric tons of fish and seafood
        </p>
      </div>
    </div>
  );
}
