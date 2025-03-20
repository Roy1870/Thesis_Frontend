import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input, Space, Button, Modal, Dropdown, Menu } from "antd";
import { SearchOutlined, PlusOutlined, AppstoreOutlined } from "@ant-design/icons";
import axios from "axios";
import DataEntry from "./DataEntry";

const Inventory = ({ currentComponent, setCurrentComponent }) => {
  const [farmerData, setFarmerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");

        if (!authToken) {
          setError("Authorization token not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8000/api/farmers/data", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
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
    { title: "First Name", dataIndex: "fname", key: "fname" },
    { title: "Last Name", dataIndex: "lname", key: "lname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Home Address", dataIndex: "home_address", key: "home_address" },
    { title: "Farm Address", dataIndex: "farm_address", key: "farm_address" },
  ];

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = farmerData.filter(
    (item) =>
      item.fname?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.lname?.toLowerCase().includes(searchText.toLowerCase())
  );
  

  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < filteredData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">Grower</Menu.Item>
      <Menu.Item key="2">Operator</Menu.Item>
      <Menu.Item key="3">Raiser</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ margin: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontWeight: "bold", margin: 0 }}>Inventory Records</h2>
        <Space>
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            style={{ width: 300, height: 35 }}
            suffix={<SearchOutlined style={{ color: "#6A9C89" }} />}
          />
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<AppstoreOutlined />} style={{ backgroundColor: "#6A9C89", color: "white", borderColor: "#6A9C89" }} />
          </Dropdown>
        </Space>
      </div>

      <div style={{ display: "flex", justifyContent: "start", marginTop: "20px", gap: "10px" }}>
        <Button type="primary" onClick={showModal} style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }} icon={<PlusOutlined />}>Add New Entry</Button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? <Spin size="large" /> : (
          <>
            <Table columns={columns} dataSource={paginatedData} rowKey="email" pagination={false} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
              <Button onClick={handleNextPage} disabled={currentPage * pageSize >= filteredData.length}>Next</Button>
            </div>
          </>
        )}
      </div>

      {error && <Alert message={error} type="error" showIcon style={{ marginTop: "15px" }} />}

      <Modal
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        style={{ top: 20, overflow: 'hidden' }} // Added overflow: 'hidden'
      >
        <DataEntry handleCancel={handleModalClose} />
      </Modal>
    </div>
  );
};

export default Inventory;