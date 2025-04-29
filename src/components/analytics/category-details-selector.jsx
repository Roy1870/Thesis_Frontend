"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import CategoryDetailsContent from "./category-details-content";

export default function CategoryDetailsSelector({
  loading,
  categoryData,
  className = "",
}) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Define categories
  const categories = [
    { id: "livestock", name: "Livestock & Poultry", icon: "🐄", unit: "heads" },
    { id: "rice", name: "Rice", icon: "🌾", unit: "tons" },
    { id: "banana", name: "Banana", icon: "🍌", unit: "tons" },
    { id: "legumes", name: "Legumes", icon: "🌱", unit: "tons" },
    { id: "spices", name: "Spices", icon: "🌶️", unit: "tons" },
    { id: "fish", name: "Fish", icon: "🐟", unit: "tons" },
    { id: "vegetables", name: "Vegetables", icon: "🥕", unit: "tons" },
    {
      id: "highValueCrops",
      name: "High Value Crops",
      icon: "🌿",
      unit: "tons",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownOpen
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle category selection
  const handleCategorySelect = (index) => {
    setCurrentCategory(index);
    setDropdownOpen(false);
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="relative mb-4">
        <button
          ref={buttonRef}
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full px-5 py-4 text-left transition-all bg-white rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <div className="flex items-center">
            <span className="flex items-center justify-center w-10 h-10 mr-3 text-xl text-green-600 rounded-full bg-green-50">
              {categories[currentCategory].icon}
            </span>
            <span className="font-medium text-gray-800">
              {categories[currentCategory].name}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg"
          >
            <ul className="py-1">
              {categories.map((category, index) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(index)}
                    className={`flex items-center w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors ${
                      currentCategory === index
                        ? "bg-green-50/50 text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="flex items-center justify-center w-8 h-8 mr-3 text-lg text-green-600 rounded-full bg-green-50">
                      {category.icon}
                    </span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-6 overflow-y-auto bg-white rounded-lg shadow-sm h-[400px]">
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 mb-4 border-4 border-gray-200 rounded-full border-t-green-500 animate-spin"></div>
            <p className="text-lg font-medium">Loading category data...</p>
          </div>
        </div>
      ) : (
        <CategoryDetailsContent
          categoryData={categoryData[categories[currentCategory].id]}
          categoryName={categories[currentCategory].name}
          unit={categories[currentCategory].unit}
        />
      )}
    </div>
  );
}
