import { useEffect, useState } from "react";
import { Table, Spin, Alert, Input, Space, Button, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import FilterSelect from "./FilterSelect"; // Import the FilterSelect component
import DataEntry from "./DataEntry"; // Import the DataEntry component

const BarangayData = ({ currentComponent, setCurrentComponent }) => {
  const [barangayData, setBarangayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    // Fetch data from the API
    axios
      .get("http://localhost:8000/api/barangay/data")
      .then((response) => {
        console.log("API Response:", response.data); // Debugging
        setBarangayData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err); // Debugging
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  // Filter data based on search input
  const filteredData = barangayData.filter((item) =>
    item.barangay_name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columns definition for the table
  const columns = [
    {
      title: "Barangay Name",
      dataIndex: "barangay_name",
      key: "barangay_name",
    },
    {
      title: "Total Backyard",
      dataIndex: "total_backyard",
      key: "total_backyard",
    },
    {
      title: "Total Commercial",
      dataIndex: "total_commercial",
      key: "total_commercial",
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
    },
  ];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // Export table data to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barangay Data");
    XLSX.writeFile(wb, "BarangayData.xlsx");
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ margin: "10px" }}>
      {/* Title and Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 0,
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            margin: 0,
            lineHeight: "1", // Ensures consistent alignment
          }}
        >
          Barangay Data
        </h2>
        <Space>
          <Input
            placeholder="Search Barangay"
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: 400,
              height: 35, // Ensure consistent height
              display: "flex",
              alignItems: "center", // Align content inside the input
            }}
          />
        </Space>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "15px",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        {/* Add New Entry Button */}
        <Button
          type="primary"
          onClick={showModal}
          style={{
            backgroundColor: "#6A9C89",
            borderColor: "#6A9C89",
          }}
          icon={<PlusOutlined />}
        >
          Add New Entry
        </Button>

        {/* Export and Filter Options */}
        <div style={{ display: "flex", gap: "10px" }}>
          <FilterSelect
            currentComponent={currentComponent}
            setCurrentComponent={setCurrentComponent}
          />
          <Button
            type="primary"
            onClick={handleExport}
            style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Spinner and Error Handling */}
      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}

      {/* Table */}
      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="barangay_name"
          pagination={false}
          style={{
            marginTop: "20px",
          }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    backgroundColor: "#6A9C89",
                    color: "white",
                  }}
                />
              ),
            },
          }}
        />
      )}
      {/* Modal for Data Entry */}
      <Modal
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null} // Remove default footer buttons
        width={800} // Optional: Adjust modal width
      >
        <DataEntry />
      </Modal>
    </div>
  );
};

export default BarangayData;
