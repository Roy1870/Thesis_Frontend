import { useState, useEffect } from "react";
import { Table, Spin, Alert, Input, Space, Button, Modal, Dropdown, Menu } from "antd";
import { SearchOutlined, PlusOutlined, AppstoreOutlined, ShopOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import DataEntry from "./DataEntry";

const Inventory = ({ currentComponent, setCurrentComponent }) => { 
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
      item.fname.toLowerCase().includes(searchText.toLowerCase()) ||
      item.lname.toLowerCase().includes(searchText.toLowerCase())
  );

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" >Grower</Menu.Item>
      <Menu.Item key="2" >Operator</Menu.Item>
      <Menu.Item key="3" >Raiser</Menu.Item>
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
            <Button 
              icon={<AppstoreOutlined />} 
              style={{ backgroundColor: "#6A9C89", color: "white", borderColor: "#6A9C89" }} 
            />
          </Dropdown>
        </Space>
      </div>

      <div style={{ display: "flex", justifyContent: "start", marginTop: "20px", gap: "10px" }}>
        <Button
          type="primary"
          onClick={showModal}
          style={{ backgroundColor: "#6A9C89", borderColor: "#6A9C89" }}
          icon={<PlusOutlined />}
        >
          Add New Entry
        </Button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {loading ? <Spin size="large" /> : (
          <>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="email"
              pagination={false}
              components={{
                header: {
                  cell: (props) => (
                    <th {...props} style={{ backgroundColor: "#6A9C89", color: "white" }} />
                  ),
                },
              }}
            />
          </>
        )}
      </div>

      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          style={{ marginTop: "15px" }}
        />
      )}

      <Modal visible={isModalVisible} onCancel={handleModalClose} footer={null} width={800}>
        <DataEntry />
      </Modal>
    </div>
  );
};

export default Inventory;