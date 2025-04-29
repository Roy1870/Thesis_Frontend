"use client";

import { Calendar, RefreshCw } from "lucide-react";

export default function DashboardHeader({
  formattedDate,
  isRefreshing,
  lastRefresh,
  onRefresh,
}) {
  return (
    <div className="mb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#333333]">
            Agricultural Production Dashboard
          </h2>
          <p className="text-[#666666] mt-1">
            Overview of all farmer types and production as of {formattedDate}
          </p>
        </div>

        {/* Background refresh indicator */}
        {isRefreshing && (
          <div className="inline-flex items-center p-2 mt-2 ml-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm">
            <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
            <span>Updating data...</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                isRefreshing ? "animate-spin text-green-600" : "text-gray-500"
              }`}
            />
            Refresh
          </button>
          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-[#6A9C89]" />
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>
      <div className="inline-flex items-center p-2 mt-2 ml-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
        <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
