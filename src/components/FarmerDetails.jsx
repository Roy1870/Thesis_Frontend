import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input, Space, Button, Modal } from "antd";
import { SearchOutlined, PlusOutlined, ClockCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import FilterSelect from "./FilterSelect";
import DataEntry from "./DataEntry";


const FarmerDetails = ({ currentComponent, setCurrentComponent }) => {
  const [farmerData, setFarmerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }
        const response = await axios.get("http://localhost:8000/api/farmers/details", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
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
    { title: "Farmer Name", dataIndex: "farmer_name", key: "farmer_name" },
    { title: "Barangay", dataIndex: "barangay", key: "barangay" },
    { title: "Contact", dataIndex: "contact", key: "contact" },
    { title: "Date Added", dataIndex: "added_date", key: "added_date" },
  ];

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = farmerData.filter((farmer) =>
    farmer.farmer_name.toLowerCase().includes(searchText.toLowerCase())
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: 0 }}>
        <h2 style={{ fontWeight: "bold", margin: 0, lineHeight: "1" }}>Inventory</h2>
        <Space>
          <Input
            placeholder="Search by Farmer Name"
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 400, height: 35, display: "flex", alignItems: "center" }}
            suffix={<SearchOutlined style={{ color: "#6A9C89" }} />}
          />
        </Space>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", marginBottom: "20px", gap: "10px" }}>
  <div style={{ display: "flex", gap: "10px" }}>
    {/* Switch to Recently Added component */}
    <Button
      type="default"
      icon={<ClockCircleOutlined />}
      style={{ borderColor: "#6A9C89", color: "#6A9C89" }}
      onClick={() => setCurrentComponent("RecentlyAdded")} // Handle button click
    >
      Recently Added
    </Button>

    {/* Show the Add New Entry modal */}
    <Button
      type="primary"
      onClick={showModal}
      style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }}
      icon={<PlusOutlined />}
    >
      Add New Entry
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
          style={{ marginTop: "20px" }}
          components={{
            header: {
              cell: (props) => (
                <th {...props} style={{ backgroundColor: "#6A9C89", color: "white" }} />
              ),
            },
          }}
        />
      )}

      <Modal visible={isModalVisible} onCancel={handleModalClose} footer={null} width={800}>
        <DataEntry />
      </Modal>
    </div>
  );
};

export default FarmerDetails;
