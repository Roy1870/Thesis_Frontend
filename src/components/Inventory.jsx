"use client";

import { useState, useEffect, useCallback } from "react";
import { farmerAPI } from "./services/api";
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Pagination,
  Spin,
  Alert,
  Card,
  Typography,
  Badge,
  Tag,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UserOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import EditFarmer from "./EditFarmer";
import ViewFarmer from "./ViewFarmer";

const { Title, Text } = Typography;

const Inventory = () => {
  console.log("InventoryModern component rendering");

  const [farmerData, setFarmerData] = useState([]);
  const [allFarmerData, setAllFarmerData] = useState([]); // Store all data for client-side filtering
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState(""); // For debounced search
  const [searchedColumn, setSearchedColumn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFarmer, setCurrentFarmer] = useState(null);

  // Theme colors
  const colors = {
    primary: "#6A9C89",
    secondary: "#E6F5E4",
    accent: "#4F6F7D",
    error: "#D32F2F",
    warning: "#FFA000",
    success: "#388E3C",
    textDark: "#333333",
    textLight: "#666666",
    border: "#E0E0E0",
    background: "#F5F7F9",
  };

  // Debounce search text to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch all data once on initial load
  useEffect(() => {
    fetchAllFarmerData();
  }, []);

  // Handle pagination and debounced search
  useEffect(() => {
    if (debouncedSearchText) {
      // If search is active, do client-side filtering
      filterFarmerData();
    } else {
      // Only fetch from API when not searching
      fetchFarmerData(currentPage);
    }
  }, [currentPage, pageSize, debouncedSearchText]);

  // Fetch all farmer data once for client-side filtering
  const fetchAllFarmerData = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getAllFarmers(1, 1000); // Get a large batch
      setAllFarmerData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching all data:", err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  // Client-side filtering function
  const filterFarmerData = useCallback(() => {
    if (!debouncedSearchText.trim()) {
      fetchFarmerData(currentPage);
      return;
    }

    setLoading(true);
    const searchLower = debouncedSearchText.toLowerCase().trim();

    // Filter from all data to ensure we catch everything
    const filtered = allFarmerData.filter(
      (farmer) =>
        (farmer.name && farmer.name.toLowerCase().includes(searchLower)) ||
        (farmer.contact_number &&
          farmer.contact_number.toLowerCase().includes(searchLower)) ||
        (farmer.facebook_email &&
          farmer.facebook_email.toLowerCase().includes(searchLower)) ||
        (farmer.home_address &&
          farmer.home_address.toLowerCase().includes(searchLower)) ||
        (farmer.barangay && farmer.barangay.toLowerCase().includes(searchLower))
    );

    // Paginate the filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);

    setFarmerData(paginatedResults);
    setTotalRecords(filtered.length);
    setLoading(false);
  }, [allFarmerData, debouncedSearchText, currentPage, pageSize]);

  const fetchFarmerData = async (page = 1, search = "") => {
    console.log("Fetching farmer data...");
    try {
      setLoading(true);

      // Only use API for non-search or initial load
      const response = await farmerAPI.getAllFarmers(page, pageSize, search);

      // Laravel pagination returns data in a specific format
      setFarmerData(response.data); // The actual items are in the data property
      setTotalRecords(response.total); // Total number of records
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, backgroundColor: colors.primary }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{ color: filtered ? colors.primary : undefined }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    setCurrentPage(1);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleDelete = async (farmerId) => {
    try {
      await farmerAPI.deleteFarmer(farmerId);

      // Refresh data after deletion
      fetchAllFarmerData(); // Refresh all data
      if (searchText) {
        filterFarmerData();
      } else {
        fetchFarmerData(currentPage);
      }
      message.success("Farmer deleted successfully");
    } catch (err) {
      message.error("Failed to delete farmer.");
    }
  };

  const handleView = (record) => {
    setCurrentFarmer(record);
    setIsViewMode(true);
  };

  const handleEdit = (record) => {
    setCurrentFarmer(record);
    setIsEditMode(true);

    // Listen for the editFarmer event from ViewFarmer component
    window.addEventListener(
      "editFarmer",
      (event) => {
        setCurrentFarmer(event.detail);
        setIsEditMode(true);
      },
      { once: true }
    );
  };

  const handleCloseView = () => {
    setIsViewMode(false);
    setCurrentFarmer(null);
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    setCurrentFarmer(null);
    // Refresh data after editing
    fetchAllFarmerData(); // Refresh all data
    if (searchText) {
      filterFarmerData();
    } else {
      fetchFarmerData(currentPage);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined style={{ marginRight: 8, color: colors.primary }} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "contact_number",
      key: "contact_number",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <PhoneOutlined style={{ marginRight: 8, color: colors.accent }} />
          <span>{text || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "facebook_email",
      key: "facebook_email",
      responsive: ["md"],
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <MailOutlined style={{ marginRight: 8, color: colors.accent }} />
          <span>{text || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Address",
      dataIndex: "home_address",
      key: "home_address",
      responsive: ["lg"],
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <HomeOutlined style={{ marginRight: 8, color: colors.accent }} />
          <span>{text || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Barangay",
      dataIndex: "barangay",
      key: "barangay",
      responsive: ["md"],
      render: (text) => (
        <Tag color={colors.primary} style={{ borderRadius: "4px" }}>
          {text || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: colors.primary }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: colors.warning }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this farmer?")
                ) {
                  handleDelete(record.farmer_id);
                }
              }}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // If in edit mode, show the edit page instead of the inventory list
  if (isEditMode && currentFarmer) {
    return (
      <EditFarmer
        farmer={currentFarmer}
        onClose={handleCloseEdit}
        colors={colors}
      />
    );
  }

  // If in view mode, show a detailed view of the farmer
  if (isViewMode && currentFarmer) {
    return (
      <ViewFarmer
        farmer={currentFarmer}
        onClose={handleCloseView}
        colors={colors}
      />
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: colors.background,
        minHeight: "100vh",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Card
        title={
          <Title level={4} style={{ margin: 0, fontSize: "18px" }}>
            Farmer Inventory
          </Title>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => (window.location.href = "/add-data")}
            style={{ backgroundColor: colors.primary }}
            size="middle"
          >
            Add New Farmer
          </Button>
        }
        style={{
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: 16,
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <Space
          style={{
            marginBottom: 16,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Search farmers"
              value={searchText}
              onChange={handleSearchInputChange}
              prefix={<SearchOutlined style={{ color: colors.primary }} />}
              style={{ width: 250 }}
              allowClear
            />
          </div>
          <Badge
            count={totalRecords}
            style={{ backgroundColor: colors.primary }}
          >
            <span style={{ padding: "0 8px" }}>Total Records</span>
          </Badge>
        </Space>

        {error && (
          <Alert message={error} type="error" style={{ marginBottom: 16 }} />
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={farmerData}
            rowKey="farmer_id"
            pagination={false}
            style={{ marginBottom: 16 }}
            bordered
            scroll={{ x: farmerData.length > 0 ? "max-content" : undefined }}
            size="small"
          />
        </Spin>

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={totalRecords}
          onChange={(page) => {
            console.log("Changing to page:", page);
            setCurrentPage(page);
          }}
          style={{ marginTop: 16, textAlign: "center" }}
          showSizeChanger={false}
        />
      </Card>
    </div>
  );
};

export default Inventory;
