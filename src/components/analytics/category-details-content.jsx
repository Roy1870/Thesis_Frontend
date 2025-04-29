"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { Search } from "lucide-react";

export default function CategoryDetailsContent({
  categoryData,
  categoryName,
  unit,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("value"); // 'value' or 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Filter and sort items
  const filteredItems = categoryData?.items
    ? categoryData.items
        .filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === "value") {
            return sortOrder === "asc" ? a.value - b.value : b.value - a.value;
          } else {
            return sortOrder === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
        })
    : [];

  // Toggle sort order
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Get color for chart bars
  const getBarColor = (index) => {
    const colors = [
      "#6A9C89", // primary
      "#4F6F7D", // accent
      "#388E3C", // success
      "#FFA000", // warning
      "#0288D1", // info
      "#8884d8", // purple
    ];
    return colors[index % colors.length];
  };

  // Calculate max value for percentage calculation
  const maxValue =
    filteredItems.length > 0
      ? Math.max(...filteredItems.map((item) => item.value))
      : 0;

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {categoryName} Analysis
          </h3>
          <div className="flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            Total:{" "}
            {formatNumber(
              categoryData?.total?.toFixed(unit === "heads" ? 0 : 2)
            )}{" "}
            {unit}
          </div>
        </div>
        <div className="relative mt-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${categoryName.toLowerCase()}...`}
            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chart visualization */}
            <div className="h-[400px] lg:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredItems.slice(0, 15)} // Show top 15 items
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `${formatNumber(
                        value.toFixed(unit === "heads" ? 0 : 2)
                      )} ${unit}`,
                      "Production",
                    ]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #E0E0E0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {filteredItems.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed list */}
            <div className="overflow-y-auto h-[400px] lg:h-[500px] pr-2">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th
                      className="px-4 py-3 text-left cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Name
                        {sortBy === "name" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-right cursor-pointer"
                      onClick={() => toggleSort("value")}
                    >
                      <div className="flex items-center justify-end text-xs font-medium tracking-wider text-gray-500 uppercase">
                        {sortBy === "value" && (
                          <span className="mr-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                        Production
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-gray-800">
                            {formatNumber(
                              item.value.toFixed(unit === "heads" ? 0 : 2)
                            )}{" "}
                            {unit}
                          </span>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 max-w-[120px]">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                backgroundColor: getBarColor(index % 6),
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <p>No items found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
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
            <p className="text-lg font-medium">
              No {categoryName.toLowerCase()} data available
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Add {categoryName.toLowerCase()} data to see analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
