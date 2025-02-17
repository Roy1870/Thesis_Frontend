import { useState } from "react";
import { Button } from "antd";
import AnimalDataTable from "./AnimalDataTable";
import FarmerDetails from "./FarmerDetails";
import BarangayData from "./BarangayData";

export default function Inventory() {
  const [currentComponent, setCurrentComponent] = useState("farmerDetails");

  // Function to toggle between components
  const goToNextComponent = () => {
    if (currentComponent === "farmerDetails") {
      setCurrentComponent("animalDataTable");
    } else if (currentComponent === "animalDataTable") {
      setCurrentComponent("barangayData");
    } else {
      setCurrentComponent("farmerDetails");
    }
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
      {/* Conditionally render components based on state */}
      <div style={{ flex: 1 }}>
        {currentComponent === "farmerDetails" ? (
          <FarmerDetails />
        ) : currentComponent === "animalDataTable" ? (
          <AnimalDataTable />
        ) : (
          <BarangayData />
        )}
      </div>

      {/* Button to toggle components */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          onClick={goToNextComponent}
          style={{
            backgroundColor: "#6A9C89",
            borderColor: "#6A9C89",
            padding: "10px 10px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#fff",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#588A77")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#6A9C89")}
        >
          {currentComponent === "farmerDetails"
            ? "Go to Animal Data"
            : currentComponent === "animalDataTable"
            ? "Go to Barangay Data"
            : "Go to Farmer Details"}
        </Button>
      </div>
    </div>
  );
}
