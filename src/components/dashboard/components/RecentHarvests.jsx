const RecentHarvests = ({ harvests, formatNumber }) => {
  return (
    <div className="p-6 bg-white border border-gray-100 shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800">Recent Harvests</h4>
        <a
          href="/inventory"
          className="text-sm font-medium text-[#6A9C89] hover:underline"
        >
          View All Records →
        </a>
      </div>

      {harvests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase rounded-tl-lg bg-gray-50"
                >
                  Farmer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                >
                  Yield
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                >
                  Area (ha)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase bg-gray-50"
                >
                  Yield/ha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase rounded-tr-lg bg-gray-50"
                >
                  Harvest Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {harvests.map((harvest, index) => (
                <tr
                  key={harvest.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-[#E6F5E4] text-[#6A9C89] rounded-full flex items-center justify-center">
                        {harvest.farmer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {harvest.farmer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {harvest.barangay}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        harvest.type === "Raiser"
                          ? "bg-purple-100 text-purple-700"
                          : harvest.type === "Operator"
                          ? "bg-cyan-100 text-cyan-700"
                          : "bg-[#E6F5E4] text-[#6A9C89]"
                      } font-medium`}
                    >
                      {harvest.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-[#E6F5E4] text-[#6A9C89] font-medium">
                      {harvest.crop_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {harvest.yield_amount.toFixed(2)}
                    {harvest.type === "Raiser" ? " heads" : " tons"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {harvest.area.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        harvest.yield_per_hectare !== "N/A" &&
                        Number(harvest.yield_per_hectare) > 5
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {harvest.yield_per_hectare}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {harvest.harvest_date.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg
            className="w-16 h-16 mb-4 text-gray-300"
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
          <p className="text-lg font-medium">No recent harvests</p>
          <p className="mt-2 text-sm text-gray-400">
            Add harvest data to see recent activity
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentHarvests;
