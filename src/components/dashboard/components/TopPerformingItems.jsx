const TopPerformingItems = ({ items, formatNumber, getCategoryName }) => {
  return (
    <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800">
          Top Performing Items
        </h4>
        <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
          By Production Volume
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 transition-all border border-gray-100 rounded-lg bg-gray-50 hover:shadow-md"
            >
              <div className="flex items-center mb-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700"
                      : index === 1
                      ? "bg-gray-200 text-gray-700"
                      : index === 2
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {index + 1}
                </div>
                <h5
                  className="font-medium text-gray-800 truncate"
                  title={item.name}
                >
                  {item.name}
                </h5>
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(item.value.toFixed(2))}
                </div>
                <div className="text-xs text-gray-500">
                  {item.category === "livestock" ? "heads" : "metric tons"}
                </div>
              </div>
              <div className="w-full h-2 mt-3 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-green-600 rounded-full"
                  style={{
                    width: `${(item.value / items[0].value) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
          <svg
            className="w-12 h-12 mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <p>No production data available</p>
        </div>
      )}
    </div>
  );
};

export default TopPerformingItems;
