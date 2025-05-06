"use client";

import { Activity, ArrowUp, ArrowDown, RefreshCw } from "lucide-react";

export default function AnalyticsHeader({
  lastRefresh,
  productionTrend,
  isRefreshing,
  onRefresh,
}) {
  // Helper function to format a date to readable string
  const formatRefreshTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center">
        <div className="w-1.5 h-8 bg-green-600 rounded-full mr-3"></div>
        <h1 className="text-3xl font-bold text-gray-900">
          Agricultural Production Analytics
        </h1>
      </div>
      <p className="mt-2 ml-4 text-gray-600">
        Detailed analytics for each agricultural category
      </p>

      {/* Status indicator and refresh button */}
      <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
        {isRefreshing ? (
          <div className="flex items-center px-3 py-1 rounded-full text-amber-600 bg-amber-50">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            <span>Updating data...</span>
          </div>
        ) : (
          lastRefresh && (
            <div className="flex flex-wrap items-center justify-between w-full gap-2">
              <div className="px-3 py-1 text-gray-500 bg-white rounded-full shadow-sm">
                <span>Last updated: {formatRefreshTime(lastRefresh)}</span>
              </div>
              <button
                onClick={onRefresh}
                className="flex items-center px-3 py-1 text-green-600 transition-all bg-white rounded-full shadow-sm hover:text-green-800 hover:shadow"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                <span>Refresh Data</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
