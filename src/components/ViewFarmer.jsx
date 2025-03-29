"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Spin,
  Alert,
  Button,
  Table,
  Empty,
  Badge,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { farmerAPI, livestockAPI, operatorAPI } from "./services/api";
import EditFarmer from "./EditFarmer";

const { Title, Text } = Typography;

const ViewFarmer = ({ farmer, onClose, colors }) => {
  const [farmerData, setFarmerData] = useState(null);
  const [livestockRecords, setLivestockRecords] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [livestockLoading, setLivestockLoading] = useState(true);
  const [operatorLoading, setOperatorLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [cropDataType, setCropDataType] = useState("Crop"); // Default column title
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to fetch farmer details (declared here to be accessible in handleCloseEdit)
  const fetchFarmerDetails = async () => {
    try {
      setFetchLoading(true);

      const response = await farmerAPI.getFarmerById(farmer.farmer_id);

      // Determine the crop data type from the first crop item
      if (response.crops && response.crops.length > 0) {
        try {
          const firstCrop = response.crops[0];
          if (firstCrop.production_data) {
            const data = JSON.parse(firstCrop.production_data);
            if (data.month) {
              setCropDataType("Month");
            } else if (data.crop) {
              setCropDataType("Crop");
            }
          }
        } catch (e) {
          console.error("Error parsing crop data:", e);
        }
      }

      // Process the crops data to extract JSON values
      if (response.crops && response.crops.length > 0) {
        response.crops = response.crops.map((crop) => {
          if (crop.production_data) {
            try {
              const data = JSON.parse(crop.production_data);
              return {
                ...crop,
                crop_value: data.crop || null,
                month_value: data.month || null,
                quantity_value: data.quantity || null,
              };
            } catch (e) {
              return {
                ...crop,
                crop_value: null,
                month_value: null,
                quantity_value: null,
              };
            }
          }
          return crop;
        });
      }

      setFarmerData(response);
      setFetchLoading(false);
    } catch (err) {
      console.error("Error fetching farmer details:", err);
      setError(`Failed to fetch farmer details: ${err.message}`);
      setFetchLoading(false);
    }
  };

  // Fetch livestock records separately
  const fetchLivestockRecords = async () => {
    try {
      setLivestockLoading(true);

      // Get all livestock records
      const response = await livestockAPI.getAllLivestockRecords();

      // Filter records for this farmer
      const farmerLivestockRecords = response.filter(
        (record) => record.farmer_id === farmer.farmer_id
      );

      setLivestockRecords(farmerLivestockRecords);
      setLivestockLoading(false);
    } catch (err) {
      console.error("Error fetching livestock records:", err);
      setLivestockLoading(false);
    }
  };

  // Fetch operator data separately
  const fetchOperatorData = async () => {
    try {
      setOperatorLoading(true);

      // Get operators for this farmer using getOperatorById
      const response = await operatorAPI.getAllOperators();

      // Filter records for this farmer
      const Operator = response.filter(
        (Operator) => Operator.farmer_id === farmer.farmer_id
      );

      setOperatorData(Operator);
      setOperatorLoading(false);
    } catch (err) {
      console.error("Error fetching operator data:", err);
      setOperatorLoading(false);
    }
  };

  // Fetch the farmer data, livestock records, and operator data
  useEffect(() => {
    fetchFarmerDetails();
    fetchLivestockRecords();
    fetchOperatorData();
  }, [farmer.farmer_id]);

  const riceColumns = [
    {
      title: "Area Type",
      dataIndex: "area_type",
      key: "area_type",
    },
    {
      title: "Seed Type",
      dataIndex: "seed_type",
      key: "seed_type",
    },
    {
      title: "Area Harvested",
      dataIndex: "area_harvested",
      key: "area_harvested",
    },
    {
      title: "Production",
      dataIndex: "production",
      key: "production",
    },
    {
      title: "Average Yield",
      dataIndex: "ave_yield",
      key: "ave_yield",
    },
  ];

  const cropColumns = [
    {
      title: "Crop Type",
      dataIndex: "crop_type",
      key: "crop_type",
    },
    {
      title: "Variety/Clone",
      dataIndex: "variety_clone",
      key: "variety_clone",
    },
    {
      title: "Area (Hectare)",
      dataIndex: "area_hectare",
      key: "area_hectare",
    },
    {
      title: "Production Type",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: cropDataType,
      key: "crop_or_month",
      render: (_, record) => {
        return cropDataType === "Crop" ? record.crop_value : record.month_value;
      },
    },
    {
      title: "Quantity",
      key: "quantity",
      dataIndex: "quantity_value",
    },
  ];

  const livestockColumns = [
    {
      title: "Animal Type",
      dataIndex: "animal_type",
      key: "animal_type",
    },
    {
      title: "Subcategory",
      dataIndex: "subcategory",
      key: "subcategory",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Updated By",
      dataIndex: "updated_by",
      key: "updated_by",
    },
  ];

  const operatorColumns = [
    {
      title: "Fishpond Location",
      dataIndex: "fishpond_location",
      key: "fishpond_location",
    },
    {
      title: "Cultured Species",
      dataIndex: "cultured_species",
      key: "cultured_species",
    },
    {
      title: "Area (sqm)",
      dataIndex: "productive_area_sqm",
      key: "productive_area_sqm",
    },
    {
      title: "Stocking Density",
      dataIndex: "stocking_density",
      key: "stocking_density",
    },
    {
      title: "Production (kg)",
      dataIndex: "production_kg",
      key: "production_kg",
    },
    {
      title: "Status",
      dataIndex: "operational_status",
      key: "operational_status",
      render: (status) => (
        <Badge
          status={status === "Active" ? "success" : "default"}
          text={status}
        />
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
    },
  ];

  const handleEdit = (farmer) => {
    setIsEditMode(true);
  };

  const handleDelete = async (farmerId) => {
    try {
      await farmerAPI.deleteFarmer(farmerId);
      message.success("Farmer deleted successfully.");
      onClose();
    } catch (error) {
      message.error(`Failed to delete farmer: ${error.message}`);
    }
  };

  const handleCloseEdit = () => {
    setIsEditMode(false);
    // Refresh farmer data after editing
    fetchFarmerDetails();
    fetchLivestockRecords();
    fetchOperatorData();
  };

  // If in edit mode, show the edit page instead of the view
  if (isEditMode && farmerData) {
    return (
      <EditFarmer
        farmer={farmerData}
        onClose={handleCloseEdit}
        colors={colors}
      />
    );
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading farmer details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={onClose} type="primary">
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  // Check if rice, crop, livestock, and operator data exists
  const hasRice = farmerData?.rice && farmerData.rice.length > 0;
  const hasCrops = farmerData?.crops && farmerData.crops.length > 0;
  const hasLivestock = livestockRecords.length > 0;
  const hasOperators = operatorData.length > 0;

  return (
    <div className="min-h-[90vh] max-h-screen overflow-y-auto overflow-x-hidden">
      {/* Header with back button and action buttons */}
      <Card
        bordered={false}
        className="rounded-lg shadow-sm mb-3"
        bodyStyle={{ padding: "16px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          <Button icon={<ArrowLeftOutlined />} onClick={onClose}>
            Back
          </Button>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(farmerData)}
              className="inline-flex items-center rounded-md h-[34px] shadow-sm"
              style={{
                backgroundColor: colors.warning,
                borderColor: colors.warning,
              }}
            >
              <span className="ml-1">Edit</span>
            </Button>
            <Popconfirm
              title="Delete this farmer?"
              description="This action cannot be undone."
              onConfirm={() => {
                handleDelete(farmerData.farmer_id);
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                style: {
                  backgroundColor: colors.error,
                  borderColor: colors.error,
                },
              }}
              placement="bottomRight"
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                className="inline-flex items-center rounded-md h-[34px] shadow-sm"
              >
                <span className="ml-1">Delete</span>
              </Button>
            </Popconfirm>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex flex-wrap gap-4 mb-2">
          <Button
            type={activeTab === "info" ? "primary" : "default"}
            icon={<UserOutlined />}
            onClick={() => setActiveTab("info")}
            style={{
              backgroundColor: activeTab === "info" ? colors.primary : "",
              borderColor: activeTab === "info" ? colors.primary : "",
            }}
          >
            Farmer Information
          </Button>

          {hasCrops && (
            <Button
              type={activeTab === "crops" ? "primary" : "default"}
              icon={<InfoCircleOutlined />}
              onClick={() => setActiveTab("crops")}
              style={{
                backgroundColor: activeTab === "crops" ? colors.primary : "",
                borderColor: activeTab === "crops" ? colors.primary : "",
              }}
            >
              Crop Information
              <Badge
                count={farmerData.crops.length}
                className="ml-1.5"
                style={{
                  backgroundColor:
                    activeTab === "crops" ? "#fff" : colors.primary,
                  color: activeTab === "crops" ? colors.primary : "#fff",
                }}
              />
            </Button>
          )}

          {hasRice && (
            <Button
              type={activeTab === "rice" ? "primary" : "default"}
              icon={<InfoCircleOutlined />}
              onClick={() => setActiveTab("rice")}
              style={{
                backgroundColor: activeTab === "rice" ? colors.primary : "",
                borderColor: activeTab === "rice" ? colors.primary : "",
              }}
            >
              Rice Information
              <Badge
                count={farmerData.rice.length}
                className="ml-1.5"
                style={{
                  backgroundColor:
                    activeTab === "rice" ? "#fff" : colors.primary,
                  color: activeTab === "rice" ? colors.primary : "#fff",
                }}
              />
            </Button>
          )}

          {/* Only show livestock button if records exist */}
          {hasLivestock && (
            <Button
              type={activeTab === "livestock" ? "primary" : "default"}
              icon={<InfoCircleOutlined />}
              onClick={() => setActiveTab("livestock")}
              style={{
                backgroundColor:
                  activeTab === "livestock" ? colors.primary : "",
                borderColor: activeTab === "livestock" ? colors.primary : "",
              }}
            >
              Livestock Records
              <Badge
                count={livestockRecords.length}
                className="ml-1.5"
                style={{
                  backgroundColor:
                    activeTab === "livestock" ? "#fff" : colors.primary,
                  color: activeTab === "livestock" ? colors.primary : "#fff",
                }}
              />
            </Button>
          )}

          {/* Only show operator button if records exist */}
          {hasOperators && (
            <Button
              type={activeTab === "operator" ? "primary" : "default"}
              icon={<EnvironmentOutlined />}
              onClick={() => setActiveTab("operator")}
              style={{
                backgroundColor: activeTab === "operator" ? colors.primary : "",
                borderColor: activeTab === "operator" ? colors.primary : "",
              }}
            >
              Operator Information
              <Badge
                count={operatorData.length}
                className="ml-1.5"
                style={{
                  backgroundColor:
                    activeTab === "operator" ? "#fff" : colors.primary,
                  color: activeTab === "operator" ? colors.primary : "#fff",
                }}
              />
            </Button>
          )}
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "info" && (
        <Card
          bordered={false}
          className="rounded-lg shadow-sm mb-4"
          bodyStyle={{ padding: "16px" }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24} md={12}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <UserOutlined
                      style={{ marginRight: 8, color: colors.primary }}
                    />
                    <span>Personal Information</span>
                  </div>
                }
                style={{ borderRadius: 8, height: "100%" }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Name</Text>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {farmerData.name}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Contact Number</Text>
                  <div style={{ fontSize: 16 }}>
                    {farmerData.contact_number || "N/A"}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Email</Text>
                  <div style={{ fontSize: 16 }}>
                    {farmerData.facebook_email || "N/A"}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Barangay</Text>
                  <div>
                    <Tag
                      color={colors.primary}
                      style={{ borderRadius: "4px", marginTop: 4 }}
                    >
                      {farmerData.barangay || "N/A"}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24} md={12}>
              <Card
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <HomeOutlined
                      style={{ marginRight: 8, color: colors.primary }}
                    />
                    <span>Address Information</span>
                  </div>
                }
                style={{ borderRadius: 8, height: "100%" }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Home Address</Text>
                  <div style={{ fontSize: 16 }}>
                    {farmerData.home_address || "N/A"}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">Farm Address</Text>
                  <div style={{ fontSize: 16 }}>
                    {farmerData.farm_address || "N/A"}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Farm Location</Text>
                  <div style={{ fontSize: 16 }}>
                    {farmerData.farm_location_longitude &&
                    farmerData.farm_location_latitude
                      ? `${farmerData.farm_location_longitude}, ${farmerData.farm_location_latitude}`
                      : "N/A"}
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {activeTab === "rice" && (
        <Card
          title={
            <div className="flex items-center">
              <InfoCircleOutlined className="mr-2" />
              <span>Rice Information</span>
            </div>
          }
          bordered={false}
          className="rounded-lg shadow-sm mt-4"
          bodyStyle={{ padding: "0" }}
        >
          {hasRice ? (
            <Table
              columns={riceColumns}
              dataSource={farmerData.rice}
              rowKey="rice_id"
              pagination={false}
              size="small"
              scroll={{
                y: "calc(100vh - 300px)",
                x: farmerData.rice.length > 0 ? "max-content" : undefined,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No rice information available"
              className="py-10"
            />
          )}
        </Card>
      )}

      {activeTab === "crops" && (
        <Card
          title={
            <div className="flex items-center">
              <InfoCircleOutlined className="mr-2" />
              <span>Crop Information</span>
            </div>
          }
          bordered={false}
          className="rounded-lg shadow-sm mt-4"
          bodyStyle={{ padding: "0" }}
        >
          {hasCrops ? (
            <Table
              columns={cropColumns}
              dataSource={farmerData.crops}
              rowKey="crop_id"
              pagination={false}
              size="small"
              scroll={{
                y: "calc(100vh - 300px)",
                x: farmerData.crops.length > 0 ? "max-content" : undefined,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No crop information available"
              className="py-10"
            />
          )}
        </Card>
      )}

      {activeTab === "livestock" && (
        <Card
          title={
            <div className="flex items-center">
              <InfoCircleOutlined className="mr-2" />
              <span>Livestock Records</span>
            </div>
          }
          bordered={false}
          className="rounded-lg shadow-sm mt-4"
          bodyStyle={{ padding: "0" }}
        >
          {livestockLoading ? (
            <div className="py-10 flex justify-center">
              <Spin tip="Loading livestock records..." />
            </div>
          ) : hasLivestock ? (
            <Table
              columns={livestockColumns}
              dataSource={livestockRecords}
              rowKey={(record) =>
                `${record.animal_type}-${record.subcategory}-${
                  record.id || Math.random()
                }`
              }
              pagination={false}
              size="small"
              scroll={{
                y: "calc(100vh - 300px)",
                x: livestockRecords.length > 0 ? "max-content" : undefined,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No livestock records available"
              className="py-10"
            />
          )}
        </Card>
      )}

      {activeTab === "operator" && (
        <Card
          title={
            <div className="flex items-center">
              <EnvironmentOutlined className="mr-2 text-green-600" />
              <span>Operator Information</span>
            </div>
          }
          bordered={false}
          className="rounded-lg shadow-sm mt-4"
          bodyStyle={{ padding: "0" }}
        >
          {operatorLoading ? (
            <div className="py-10 flex justify-center">
              <Spin tip="Loading operator records..." />
            </div>
          ) : hasOperators ? (
            <Table
              columns={operatorColumns}
              dataSource={operatorData}
              rowKey={(record) =>
                record.operator_id || record.id || Math.random().toString()
              }
              pagination={false}
              size="small"
              scroll={{
                y: "calc(100vh - 300px)",
                x: operatorData.length > 0 ? "max-content" : undefined,
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No operator information available"
              className="py-10"
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default ViewFarmer;
