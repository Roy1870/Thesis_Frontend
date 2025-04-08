"use client";

import { useState } from "react";

const Settings = () => {
  const [activeSection, setActiveSection] = useState("about");

  return (
    <div className="m-2.5">
      {/* Title and Buttons for Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Settings</h3>
        <div className="flex space-x-2.5">
          <button
            onClick={() => setActiveSection("about")}
            className={`px-4 py-2 font-bold rounded-md border transition-all ${
              activeSection === "about"
                ? "bg-[#6A9C89] text-white shadow-md"
                : "bg-white text-[#6A9C89] border-[#6A9C89]"
            }`}
          >
            About Us
          </button>
          <button
            onClick={() => setActiveSection("contacts")}
            className={`px-4 py-2 font-bold rounded-md border transition-all ${
              activeSection === "contacts"
                ? "bg-[#6A9C89] text-white shadow-md"
                : "bg-white text-[#6A9C89] border-[#6A9C89]"
            }`}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* Content based on active section */}
      <div className="mt-5 bg-[#f9f9f9] rounded-lg shadow-md p-5">
        <div className="flex flex-col space-y-4">
          {activeSection === "about" && (
            <>
              <p className="text-base">
                The{" "}
                <strong>
                  City Agriculture and Veterinary Department (CAVD) of Butuan
                  City
                </strong>{" "}
                is committed to supporting the agricultural and veterinary needs
                of our community. We are at the forefront of monitoring and
                analyzing livestock and poultry production across all barangays.
              </p>
              <p className="text-base">
                Our purpose is to <strong>list, tally, and analyze</strong> the
                total number of livestock and poultry products produced by
                farmers in each barangay. This data enables us to:
              </p>
              <ul className="pl-5 list-disc">
                <li>Track and improve agricultural productivity,</li>
                <li>
                  Support farmers in resource planning and development, and
                </li>
                <li>
                  Develop sustainable policies to ensure food security and
                  economic growth.
                </li>
              </ul>
              <hr className="my-2 border-gray-300" />
              <p className="font-bold text-center">
                Together, we cultivate success!
              </p>
            </>
          )}

          {activeSection === "contacts" && (
            <>
              <h4 className="text-lg font-bold">Contact Information</h4>
              <p>For any inquiries or assistance, feel free to contact us:</p>
              <ul className="pl-5 list-disc">
                <li>Email: cavd@butuan.gov.ph</li>
                <li>Phone: (085) 123-4567</li>
                <li>Address: City Hall, Butuan City, Philippines</li>
              </ul>
              <hr className="my-2 border-gray-300" />
              <p>You can also reach us through the form below:</p>
              <input
                placeholder="Enter your query..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A9C89] focus:border-transparent"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
