"use client";

import { UserIcon, Wheat, Sprout, Users, Coffee } from "lucide-react";
import { useMemo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { MilkIcon } from "../utils/icons";

const DataTypeSelector = ({
  selectedDataType,
  setSelectedDataType,
  dropdownOpen,
  setDropdownOpen,
}) => {
  // Data type options - memoized to prevent recreating on each render
  const dataTypes = useMemo(
    () => [
      {
        id: "farmers",
        label: "Farmers",
        icon: <UserIcon className="w-4 h-4 mr-2" />,
      },
      { id: "crops", label: "Crops", icon: <Wheat className="w-4 h-4 mr-2" /> },
      { id: "rice", label: "Rice", icon: <Sprout className="w-4 h-4 mr-2" /> },
      {
        id: "livestock",
        label: "Livestock",
        icon: <MilkIcon className="w-4 h-4 mr-2" />,
      },
      {
        id: "operators",
        label: "Operators",
        icon: <Users className="w-4 h-4 mr-2" />,
      },
      {
        id: "highValueCrops",
        label: "High Value Crops",
        icon: <Coffee className="w-4 h-4 mr-2" />,
      },
    ],
    []
  );

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-[#5A8C79] rounded-md sm:w-[180px] hover:bg-opacity-90"
      >
        <div className="flex items-center">
          {dataTypes.find((type) => type.id === selectedDataType)?.icon}
          <span>
            {dataTypes.find((type) => type.id === selectedDataType)?.label ||
              "Select Type"}
          </span>
        </div>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {dataTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setSelectedDataType(type.id);
                setDropdownOpen(false);
              }}
              className={`flex items-center w-full px-2.5 py-1.5 text-xs sm:text-sm text-left hover:bg-gray-100 ${
                selectedDataType === type.id ? "bg-gray-100 font-medium" : ""
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataTypeSelector;
