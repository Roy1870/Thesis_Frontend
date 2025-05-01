"use client";

import { Calendar, RefreshCw } from "lucide-react";

export default function DashboardHeader({
  formattedDate,
  isRefreshing,
  lastRefresh,
  onRefresh,
}) {
  return (
    <div className="relative mb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            Agricultural Production Dashboard
          </h2>
          <p className="text-[#64748B] mt-2 text-base">
            Overview of all farmer types and production as of {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {/* Background refresh indicator - animated and more visible */}
          {isRefreshing && (
            <div className="inline-flex items-center p-2 text-xs font-medium border rounded-md shadow-sm text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              <span>Updating data...</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                isRefreshing ? "animate-spin text-emerald-600" : "text-gray-500"
              }`}
            />
            Refresh Data
          </button>

          <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 mr-2 text-[#6A9C89]" />
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="inline-flex items-center p-2 mt-3 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md">
        <span>
          Last updated:{" "}
          {lastRefresh.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
