import { useState } from "react";
import AnimalDataTable from "./AnimalDataTable";
import FarmerDetails from "./FarmerDetails";
import BarangayData from "./BarangayData";

export default function Inventory() {
  const [currentComponent, setCurrentComponent] = useState("farmerDetails");

  // Handle component selection
  const handleComponentChange = (value) => {
    setCurrentComponent(value);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Conditionally render components based on currentComponent */}
      <div style={{ flex: 1 }}>
        {currentComponent === "farmerDetails" ? (
          <FarmerDetails
            currentComponent={currentComponent}
            setCurrentComponent={setCurrentComponent}
          />
        ) : currentComponent === "animalDataTable" ? (
          <AnimalDataTable
            currentComponent={currentComponent}
            setCurrentComponent={setCurrentComponent}
          />
        ) : currentComponent === "barangayData" ? (
          <BarangayData
            currentComponent={currentComponent}
            setCurrentComponent={setCurrentComponent}
          />
        ) : null}
      </div>
    </div>
  );
}