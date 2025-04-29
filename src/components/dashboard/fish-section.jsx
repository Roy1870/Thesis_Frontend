import { Fish } from "lucide-react";

export default function FishSection({ fishData }) {
  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="p-6 transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Aquaculture Production
        </h3>
        <div className="p-2 rounded-lg bg-cyan-50">
          <Fish className="w-5 h-5 text-cyan-600" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {formatNumber(fishData.total.toFixed(2))}
      </p>
      <p className="mt-2 mb-4 text-sm text-gray-500">
        Metric tons of fish and seafood
      </p>

      {/* All fish types */}
      <div className="mt-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">
          Breakdown by Species
        </h4>
        <div className="pr-2 space-y-2 overflow-y-auto max-h-60">
          {fishData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.name}</span>
              <span className="text-sm font-medium text-gray-800">
                {formatNumber(item.value.toFixed(2))} tons
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
