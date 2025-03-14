import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input, Space, Button, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons"; // Import icons
import axios from "axios";
import * as XLSX from "xlsx";
import FilterSelect from "./FilterSelect";
import DataEntry from "./DataEntry"; // Import the DataEntry component

const FarmerDetails = ({ currentComponent, setCurrentComponent }) => {
  const [farmerData, setFarmerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState(""); // For search functionality
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:8000/api/farmers/data",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        setFarmerData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data.");
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, []);

  const columns = [
    {
      title: "First Name",
      dataIndex: "fname",
      key: "fname",
    },
    {
      title: "Last Name",
      dataIndex: "lname",
      key: "lname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Home Address",
      dataIndex: "home_address",
      key: "home_address",
    },
    {
      title: "Farm Address",
      dataIndex: "farm_address",
      key: "farm_address",
    },
  ];

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = farmerData.filter((farmer) =>
    farmer.fname.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Farmers Data");
    XLSX.writeFile(wb, "FarmersData.xlsx");
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <div style={{ margin: "10px" }}>
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
            lineHeight: "1",
          }}
        >
          Inventory
        </h2>
        <Space>
          <Input
            placeholder="Search by Farmer Name"
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: 400,
              height: 35,
              display: "flex",
              alignItems: "center",
            }}
            suffix={<SearchOutlined style={{ color: "#6A9C89" }} />}
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

      {loading && <Spin size="large" />}
      {error && <Alert message={error} type="error" />}
      {!loading && !error && (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="farmer_name"
          pagination={false}
          style={{
            marginTop: "20px",
          }}
          components={{
            header: {
              cell: (props) => {
                return (
                  <th
                    {...props}
                    style={{
                      backgroundColor: "#6A9C89",
                      color: "white",
                    }}
                  />
                );
              },
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

export default FarmerDetails;
