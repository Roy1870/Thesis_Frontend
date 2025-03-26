"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Spin,
  Alert,
  Input,
  Space,
  Button,
  Modal,
  Dropdown,
  Menu,
  Typography,
  Badge,
  Empty,
  Card,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  FilterOutlined,
  DatabaseOutlined,
  LoadingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import axios from "axios";
import DataEntry from "./DataEntry";

const { Title, Text } = Typography;

const Inventory = ({ currentComponent, setCurrentComponent }) => {
  const [farmerData, setFarmerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 10;

  // Color theme
  const colors = {
    primary: "#6A9C89",
    primaryLight: "#E9F2EF",
    primaryDark: "#5A8C79",
    background: "#FFFFFF",
    backgroundAlt: "#F9FAFB",
    border: "#EAECF0",
    text: "#344054",
    textLight: "#667085",
    textDark: "#101828",
    error: "#F04438",
    warning: "#F79009",
    success: "#12B76A",
    info: "#3E7BFA",
  };

  // Function to fetch data with pagination
  const fetchFarmerData = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        setError("Authorization token not found.");
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page,
        per_page: pageSize,
      });

      if (search) {
        params.append("search", search);
      }

      const response = await axios.get(
        `http://localhost:8000/api/farmers?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Laravel pagination returns data in a specific format
      setFarmerData(response.data.data); // The actual items are in the data property
      setTotalRecords(response.data.total); // Total number of records
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFarmerData(currentPage, searchText);
  }, [currentPage]); // Re-fetch when page changes

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchFarmerData(1, searchText);
    }, 500); // Wait 500ms after typing stops

    return () => clearTimeout(timer);
  }, [searchText]);

  // Handler functions for row actions
  const handleView = (farmer) => {
    setCurrentFarmer(farmer);
    setIsViewModalVisible(true);
  };

  const handleEdit = (farmer) => {
    setCurrentFarmer(farmer);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (farmerId) => {
    try {
      const authToken = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:8000/api/farmers/${farmerId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Refresh data after deletion
      fetchFarmerData(currentPage, searchText);
    } catch (err) {
      setError("Failed to delete farmer.");
    }
  };

  // Table columns including action buttons
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span
          style={{ fontWeight: 500, color: colors.textDark, fontSize: "14px" }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Contact Number",
      dataIndex: "contact_number",
      key: "contact_number",
      render: (text) => (
        <span style={{ fontSize: "14px", color: colors.text }}>{text}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "facebook_email",
      key: "facebook_email",
      responsive: ["md"],
      render: (text) => (
        <span style={{ fontSize: "14px", color: colors.text }}>{text}</span>
      ),
    },
    {
      title: "Home Address",
      dataIndex: "home_address",
      key: "home_address",
      responsive: ["lg"],
      render: (text) => (
        <span style={{ fontSize: "14px", color: colors.text }}>
          {text || "-"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: colors.info }}
              className="action-button"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: colors.warning }}
              className="action-button"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this farmer?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.farmer_id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                style: {
                  backgroundColor: colors.error,
                  borderColor: colors.error,
                },
              }}
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: colors.error }}
                className="action-button"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    // The useEffect with debounce will handle the actual search
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    // Refresh data after adding a new entry
    fetchFarmerData(currentPage, searchText);
  };

  const handleViewModalClose = () => {
    setIsViewModalVisible(false);
    setCurrentFarmer(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setCurrentFarmer(null);
    // Refresh data after editing
    fetchFarmerData(currentPage, searchText);
  };

  const menu = (
    <Menu>
      <Menu.Item key="all">All Types</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="grower">Grower</Menu.Item>
      <Menu.Item key="operator">Operator</Menu.Item>
      <Menu.Item key="raiser">Raiser</Menu.Item>
    </Menu>
  );

  // Function to render farmer details in view modal
  const renderFarmerDetails = () => {
    if (!currentFarmer) return null;

    return (
      <div style={{ fontSize: "14px" }}>
        <div style={{ marginBottom: "24px" }}>
          <Title
            level={5}
            style={{ marginBottom: "16px", color: colors.textDark }}
          >
            Personal Information
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "12px",
            }}
          >
            <Text strong style={{ color: colors.textLight }}>
              Name:
            </Text>
            <Text>{currentFarmer.name || "-"}</Text>

            <Text strong style={{ color: colors.textLight }}>
              Contact Number:
            </Text>
            <Text>{currentFarmer.contact_number || "-"}</Text>

            <Text strong style={{ color: colors.textLight }}>
              Email:
            </Text>
            <Text>{currentFarmer.facebook_email || "-"}</Text>

            <Text strong style={{ color: colors.textLight }}>
              Home Address:
            </Text>
            <Text>{currentFarmer.home_address || "-"}</Text>
          </div>
        </div>

        {currentFarmer.crops && currentFarmer.crops.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <Title
              level={5}
              style={{ marginBottom: "16px", color: colors.textDark }}
            >
              Crop Information
            </Title>
            {currentFarmer.crops.map((crop, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <Text strong style={{ color: colors.textLight }}>
                  Crop Type:
                </Text>
                <Text>{crop.crop_type || "-"}</Text>

                <Text strong style={{ color: colors.textLight }}>
                  Area:
                </Text>
                <Text>{crop.area || "-"}</Text>
              </div>
            ))}
          </div>
        )}

        {currentFarmer.rice && currentFarmer.rice.length > 0 && (
          <div>
            <Title
              level={5}
              style={{ marginBottom: "16px", color: colors.textDark }}
            >
              Rice Information
            </Title>
            {currentFarmer.rice.map((rice, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "12px",
                }}
              >
                <Text strong style={{ color: colors.textLight }}>
                  Area Type:
                </Text>
                <Text>{rice.area_type || "-"}</Text>

                <Text strong style={{ color: colors.textLight }}>
                  Size:
                </Text>
                <Text>{rice.size || "-"}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Custom pagination renderer
  const itemRender = (_, type, originalElement) => {
    if (type === "prev") {
      return (
        <Button
          type="text"
          size="small"
          icon={<LeftOutlined />}
          disabled={currentPage === 1}
          style={{
            color: currentPage === 1 ? colors.textLight : colors.primary,
            borderRadius: "4px",
            padding: "0 8px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      );
    }
    if (type === "next") {
      return (
        <Button
          type="text"
          size="small"
          icon={<RightOutlined />}
          disabled={currentPage === Math.ceil(totalRecords / pageSize)}
          style={{
            color:
              currentPage === Math.ceil(totalRecords / pageSize)
                ? colors.textLight
                : colors.primary,
            borderRadius: "4px",
            padding: "0 8px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      );
    }
    return originalElement;
  };

  return (
    <div
      style={{
        padding: "12px", // Reduced from 16px
        backgroundColor: colors.backgroundAlt,
        minHeight: "90vh", // Reduced from 100vh
        width: "100%", // Changed from max-width to width
        margin: "0 auto",
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: "8px",
          boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
          marginBottom: "12px", // Reduced from 16px
        }}
        bodyStyle={{ padding: "12px" }} // Added to make card content more compact
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                color: colors.textDark,
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              <DatabaseOutlined
                style={{ marginRight: "8px", color: colors.primary }}
              />
              Inventory Records
            </Title>
            <Text
              style={{
                color: colors.textLight,
                display: "block",
                marginTop: "4px",
                fontSize: "13px",
              }}
            >
              Manage and track your farmer inventory data
            </Text>
          </div>

          <Space wrap>
            <Input
              placeholder="Search by name or contact..."
              value={searchText}
              onChange={handleSearchChange}
              style={{
                width: 240,
                borderRadius: "6px",
                boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
              }}
              prefix={<SearchOutlined style={{ color: colors.textLight }} />}
            />
            <Dropdown overlay={menu} trigger={["click"]}>
              <Button
                icon={<FilterOutlined />}
                style={{
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
                }}
              >
                Filter
              </Button>
            </Dropdown>
          </Space>
        </div>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <Button
          type="primary"
          onClick={showModal}
          icon={<PlusOutlined />}
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderRadius: "6px",
            height: "36px",
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
            display: "flex",
            alignItems: "center",
          }}
        >
          Add New Entry
        </Button>

        <Badge
          count={totalRecords}
          style={{
            backgroundColor: colors.primary,
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
          }}
          overflowCount={999}
        >
          <div
            style={{
              padding: "0 8px",
              fontSize: "13px",
              color: colors.textLight,
            }}
          >
            Total Records
          </div>
        </Badge>
      </div>

      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.background,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title
            level={5}
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 600,
              color: colors.textDark,
            }}
          >
            Farmer Records
          </Title>

          <Text style={{ color: colors.textLight, fontSize: "13px" }}>
            Showing {farmerData.length} of {totalRecords} records
          </Text>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px 0",
              backgroundColor: colors.background,
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 32, color: colors.primary }}
                  spin
                />
              }
              tip={
                <span
                  style={{
                    marginTop: "12px",
                    color: colors.textLight,
                    fontSize: "13px",
                  }}
                >
                  Loading data...
                </span>
              }
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={farmerData}
            rowKey="farmer_id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRecords,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              style: { padding: "8px 16px" }, // Reduced vertical padding
              position: ["bottomCenter"],
              itemRender: itemRender,
              size: "small",
              simple: true,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: colors.textLight }}>
                      No records found
                    </span>
                  }
                  style={{ margin: "20px 0" }} // Reduced from 40px
                />
              ),
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "" : "ant-table-row-light"
            }
            size="small"
          />
        )}
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{
            marginTop: "12px",
            borderRadius: "6px",
            boxShadow: "0px 1px 2px rgba(16, 24, 40, 0.05)",
          }}
        />
      )}

      {/* Add New Farmer Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: colors.textDark,
              borderBottom: `1px solid ${colors.border}`,
              padding: "12px 16px",
              margin: "-20px -24px 16px",
            }}
          >
            <PlusOutlined
              style={{ marginRight: "8px", color: colors.primary }}
            />
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              Add New Farmer Entry
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{
          padding: "12px 16px", // Reduced from 16px 20px
          maxHeight: "70vh", // Reduced from 80vh
          overflow: "auto",
        }}
        maskStyle={{ backgroundColor: "rgba(16, 24, 40, 0.6)" }}
      >
        <DataEntry handleCancel={handleModalClose} />
      </Modal>

      {/* View Farmer Details Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: colors.textDark,
              borderBottom: `1px solid ${colors.border}`,
              padding: "12px 16px",
              margin: "-20px -24px 16px",
            }}
          >
            <EyeOutlined style={{ marginRight: "8px", color: colors.info }} />
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              Farmer Details
            </span>
          </div>
        }
        open={isViewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button
            key="close"
            onClick={handleViewModalClose}
            style={{ borderRadius: "6px" }}
          >
            Close
          </Button>,
        ]}
        width={600}
        style={{ top: 20 }}
        bodyStyle={{
          padding: "12px 16px", // Reduced from 16px 20px
          maxHeight: "70vh", // Reduced from 80vh
          overflow: "auto",
        }}
        maskStyle={{ backgroundColor: "rgba(16, 24, 40, 0.6)" }}
      >
        {renderFarmerDetails()}
      </Modal>

      {/* Edit Farmer Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: colors.textDark,
              borderBottom: `1px solid ${colors.border}`,
              padding: "12px 16px",
              margin: "-20px -24px 16px",
            }}
          >
            <EditOutlined
              style={{ marginRight: "8px", color: colors.warning }}
            />
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              Edit Farmer
            </span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{
          padding: "12px 16px", // Reduced from 16px 20px
          maxHeight: "70vh", // Reduced from 80vh
          overflow: "auto",
        }}
        maskStyle={{ backgroundColor: "rgba(16, 24, 40, 0.6)" }}
      >
        {currentFarmer && (
          <DataEntry
            handleCancel={handleEditModalClose}
            editMode={true}
            farmerData={currentFarmer}
          />
        )}
      </Modal>

      {/* Add custom styles for more refined table and action buttons */}
      <style jsx global>{`
        .ant-table {
          background: ${colors.background};
        }
        .ant-table-thead > tr > th {
          background-color: ${colors.backgroundAlt} !important;
          color: ${colors.textDark};
          font-weight: 600;
          font-size: 13px;
          padding: 10px 12px;
          border-bottom: 1px solid ${colors.border};
        }
        .ant-table-tbody > tr > td {
          padding: 10px 12px;
          border-bottom: 1px solid ${colors.border};
          font-size: 13px;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: ${colors.primaryLight} !important;
        }
        .ant-table-row-light {
          background-color: ${colors.backgroundAlt};
        }
        .ant-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-pagination-item {
          border-radius: 4px;
          font-size: 12px;
          min-width: 24px;
          height: 24px;
          line-height: 22px;
          margin: 0 4px;
        }
        .ant-pagination-item a {
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-pagination-item-active {
          border-color: ${colors.primary};
          background-color: ${colors.primaryLight};
        }
        .ant-pagination-item-active a {
          color: ${colors.primary};
          font-weight: 500;
        }
        .ant-pagination-prev,
        .ant-pagination-next {
          min-width: 24px;
          height: 24px;
          line-height: 22px;
          margin: 0 4px;
        }
        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-btn-primary {
          background-color: ${colors.primary};
          border-color: ${colors.primary};
        }
        .ant-btn-primary:hover {
          background-color: ${colors.primaryDark};
          border-color: ${colors.primaryDark};
        }
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 2px rgba(106, 156, 137, 0.2);
        }
        .ant-btn:focus,
        .ant-btn-primary:focus {
          border-color: ${colors.primary};
          box-shadow: 0 0 0 2px rgba(106, 156, 137, 0.2);
        }
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          padding: 0;
          margin: 0 2px;
        }
        .action-button:hover {
          background-color: ${colors.backgroundAlt};
        }
        .ant-table-small .ant-table-thead > tr > th {
          background-color: ${colors.backgroundAlt} !important;
        }
        .ant-pagination-simple .ant-pagination-simple-pager {
          margin-right: 0;
        }
        .ant-pagination-simple .ant-pagination-simple-pager input {
          border-radius: 4px;
          margin: 0 4px;
          padding: 0 4px;
          height: 24px;
          width: 40px;
        }
      `}</style>
    </div>
  );
};

export default Inventory;
